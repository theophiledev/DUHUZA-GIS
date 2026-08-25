const { z } = require('zod');
const prisma = require('../config/db');

// GIS module (Phase 2 — FR23-FR25)
// Clients request parcel surveys; managers assign agents/surveyors.

const createRequestSchema = z.object({
  parcelLat: z.number().min(-90).max(90),
  parcelLng: z.number().min(-180).max(180),
  purpose: z.string().min(5),
});

async function createGisRequest(req, res) {
  const parsed = createRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const request = await prisma.gisRequest.create({
    data: {
      clientId: req.user.id,
      ...parsed.data,
      status: 'REQUESTED',
    },
  });

  return res.status(201).json(request);
}

async function myGisRequests(req, res) {
  const requests = await prisma.gisRequest.findMany({
    where: { clientId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(requests);
}

async function getGisRequest(req, res) {
  const request = await prisma.gisRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: 'GIS request not found' });

  const isOwner = request.clientId === req.user.id;
  const isAssignee = request.assignedAgentId === req.user.id;
  const isStaff = ['MANAGER', 'ADMIN'].includes(req.user.role);

  if (!isOwner && !isAssignee && !isStaff) {
    return res.status(403).json({ error: 'Not authorized to view this request' });
  }

  return res.json(request);
}

// Assigned agent/surveyor updates progress (FR25)
const updateProgressSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  reportUrl: z.string().url().optional(),
  boundaryGeoJson: z.any().optional(),
});

async function updateAssignedRequest(req, res) {
  const request = await prisma.gisRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: 'GIS request not found' });
  if (request.assignedAgentId !== req.user.id) {
    return res.status(403).json({ error: 'Not assigned to this request' });
  }

  const parsed = updateProgressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.gisRequest.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(updated);
}

async function myAssignedRequests(req, res) {
  const requests = await prisma.gisRequest.findMany({
    where: { assignedAgentId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(requests);
}

module.exports = {
  createGisRequest,
  myGisRequests,
  getGisRequest,
  updateAssignedRequest,
  myAssignedRequests,
};
