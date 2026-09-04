const { z } = require('zod');
const prisma = require('../config/db');
const { sendStatusUpdateEmail } = require('../utils/emailService');

const LISTING_INCLUDE = {
  translations: true,
  media: true,
  attributes: true,
  fieldVisibility: true,
  agent: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
  statusHistory: {
    include: { changedBy: { select: { id: true, name: true, role: true } } },
    orderBy: { changedAt: 'desc' },
  },
};

// FR8: queue of pending listings — FULL fields, manager/admin only
async function pendingQueue(req, res) {
  const listings = await prisma.listing.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
  return res.json(listings);
}

// FR9: approve — optional approval comment (allows manager to provide feedback)
const approveSchema = z.object({ comment: z.string().optional() });
async function approveListing(req, res) {
  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: LISTING_INCLUDE,
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'PENDING_REVIEW') return res.status(409).json({ error: 'Not pending review' });

  const updated = await changeStatus(listing, 'PUBLISHED', req.user.id, parsed.data.comment || null);

  // Send status email notification to agent
  if (updated.agent && updated.agent.email) {
    const title = updated.translations?.[0]?.title || `Property Listing #${updated.id.slice(0, 8)}`;
    sendStatusUpdateEmail({
      to: updated.agent.email,
      name: updated.agent.name,
      itemType: 'Property Listing',
      itemTitle: title,
      newStatus: 'PUBLISHED',
      comment: parsed.data.comment || null,
    }).catch((err) => console.error('[ManagerController] Failed to send approval email:', err.message));
  }

  return res.json(updated);
}

// FR9: reject — comment required (BR6)
const rejectSchema = z.object({ comment: z.string().min(3) });
async function rejectListing(req, res) {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Rejection comment is required (BR6)' });

  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: LISTING_INCLUDE,
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'PENDING_REVIEW') return res.status(409).json({ error: 'Not pending review' });

  const updated = await changeStatus(listing, 'REJECTED', req.user.id, parsed.data.comment);

  // Send status email notification to agent
  if (updated.agent && updated.agent.email) {
    const title = updated.translations?.[0]?.title || `Property Listing #${updated.id.slice(0, 8)}`;
    sendStatusUpdateEmail({
      to: updated.agent.email,
      name: updated.agent.name,
      itemType: 'Property Listing',
      itemTitle: title,
      newStatus: 'REJECTED',
      comment: parsed.data.comment,
    }).catch((err) => console.error('[ManagerController] Failed to send rejection email:', err.message));
  }

  return res.json(updated);
}

// FR10: change status of any published listing (sold/rented/withdrawn/expired)
const statusChangeSchema = z.object({
  status: z.enum(['SOLD', 'RENTED', 'WITHDRAWN', 'EXPIRED', 'PUBLISHED']),
  comment: z.string().optional(),
});
async function changeListingStatus(req, res) {
  const parsed = statusChangeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const updated = await changeStatus(listing, parsed.data.status, req.user.id, parsed.data.comment || null);
  return res.json(updated);
}

// FR11: reassign to a different agent
const reassignSchema = z.object({ newAgentId: z.string().uuid() });
async function reassignListing(req, res) {
  const parsed = reassignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const newAgent = await prisma.user.findUnique({ where: { id: parsed.data.newAgentId } });
  if (!newAgent || newAgent.role !== 'AGENT') return res.status(400).json({ error: 'Target user is not an agent' });

  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: { agentId: newAgent.id },
    include: LISTING_INCLUDE,
  });
  return res.json(updated);
}

// FR9 (edit-then-approve) / full manager edit of any listing
async function managerEditListing(req, res) {
  const { attributes, translations, mediaUrls, ...rest } = req.body;
  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: rest,
    include: LISTING_INCLUDE,
  });
  return res.json(updated);
}

// Shared helper — FR12: every status change logged (who, when, old→new, reason)
async function changeStatus(listing, newStatus, changedById, comment) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.listing.update({ where: { id: listing.id }, data: { status: newStatus } });
    await tx.listingStatusHistory.create({
      data: { listingId: listing.id, changedById, oldStatus: listing.status, newStatus, comment },
    });
    return tx.listing.findUnique({ where: { id: listing.id }, include: LISTING_INCLUDE });
  });
}

// ---------------------------------------------------------------
// MARKET / SERVICES approval (BR12 — same gate as property, FR35/FR39)
// ---------------------------------------------------------------

async function pendingMarketQueue(req, res) {
  const items = await prisma.marketItem.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      media: true,
      seller: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(items);
}

async function approveMarketItem(req, res) {
  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const item = await prisma.marketItem.update({ 
    where: { id: req.params.id }, 
    data: { status: 'PUBLISHED', approvalComment: parsed.data.comment || null },
    include: {
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  if (item.seller && item.seller.email) {
    sendStatusUpdateEmail({
      to: item.seller.email,
      name: item.seller.name,
      itemType: 'Marketplace Item',
      itemTitle: item.title,
      newStatus: 'PUBLISHED',
      comment: parsed.data.comment || null,
    }).catch((err) => console.error('[ManagerController] Failed to send market approval email:', err.message));
  }

  return res.json(item);
}

async function rejectMarketItem(req, res) {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Rejection comment is required (BR6)' });
  
  const item = await prisma.marketItem.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', approvalComment: parsed.data.comment },
    include: {
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  if (item.seller && item.seller.email) {
    sendStatusUpdateEmail({
      to: item.seller.email,
      name: item.seller.name,
      itemType: 'Marketplace Item',
      itemTitle: item.title,
      newStatus: 'REJECTED',
      comment: parsed.data.comment,
    }).catch((err) => console.error('[ManagerController] Failed to send market rejection email:', err.message));
  }

  return res.json(item);
}

async function pendingServicesQueue(req, res) {
  const providers = await prisma.serviceProvider.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(providers);
}

async function approveServiceProvider(req, res) {
  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const provider = await prisma.serviceProvider.update({ 
    where: { id: req.params.id }, 
    data: { status: 'PUBLISHED', approvalComment: parsed.data.comment || null },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (provider.user && provider.user.email) {
    sendStatusUpdateEmail({
      to: provider.user.email,
      name: provider.user.name,
      itemType: 'Service Provider Profile',
      itemTitle: `${provider.user.name} (${provider.category})`,
      newStatus: 'PUBLISHED',
      comment: parsed.data.comment || null,
    }).catch((err) => console.error('[ManagerController] Failed to send service approval email:', err.message));
  }

  return res.json(provider);
}

async function rejectServiceProvider(req, res) {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Rejection comment is required (BR6)' });

  const provider = await prisma.serviceProvider.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', approvalComment: parsed.data.comment },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (provider.user && provider.user.email) {
    sendStatusUpdateEmail({
      to: provider.user.email,
      name: provider.user.name,
      itemType: 'Service Provider Profile',
      itemTitle: `${provider.user.name} (${provider.category})`,
      newStatus: 'REJECTED',
      comment: parsed.data.comment,
    }).catch((err) => console.error('[ManagerController] Failed to send service rejection email:', err.message));
  }

  return res.json(provider);
}

// ---------------------------------------------------------------
// GIS approval & assignment (Phase 2 — FR24-FR25)
// ---------------------------------------------------------------

async function pendingGisQueue(req, res) {
  const requests = await prisma.gisRequest.findMany({
    where: { status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
      assignedAgent: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(requests);
}

const assignGisSchema = z.object({ agentId: z.string().uuid() });
async function assignGisRequest(req, res) {
  const parsed = assignGisSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const agent = await prisma.user.findUnique({ where: { id: parsed.data.agentId } });
  if (!agent || agent.role !== 'AGENT') return res.status(400).json({ error: 'Target user is not an agent' });

  const request = await prisma.gisRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: 'GIS request not found' });

  const updated = await prisma.gisRequest.update({
    where: { id: req.params.id },
    data: { assignedAgentId: agent.id, status: 'ASSIGNED' },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      assignedAgent: { select: { id: true, name: true, phone: true, email: true } },
    },
  });

  // Notify assigned agent & client via email if email exists
  if (agent.email) {
    sendStatusUpdateEmail({
      to: agent.email,
      name: agent.name,
      itemType: 'Cadastral Survey Assignment',
      itemTitle: `GIS Mission: ${updated.purpose}`,
      newStatus: 'ASSIGNED',
      comment: `You have been assigned to survey coordinates (${updated.parcelLat}, ${updated.parcelLng}) for client ${updated.client?.name || 'Client'}.`,
    }).catch((err) => console.error('[ManagerController] Failed to send GIS assignment email:', err.message));
  }

  return res.json(updated);
}

// ---------------------------------------------------------------
// Jobs approval (Phase 3 — FR26)
// ---------------------------------------------------------------

async function pendingJobsQueue(req, res) {
  const jobs = await prisma.job.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      employer: { select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(jobs);
}

async function approveJob(req, res) {
  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'PENDING_REVIEW') return res.status(409).json({ error: 'Not pending review' });

  const updated = await prisma.job.update({ 
    where: { id: req.params.id }, 
    data: { status: 'PUBLISHED', approvalComment: parsed.data.comment || null },
    include: {
      employer: { select: { id: true, name: true, email: true } },
    },
  });

  if (updated.employer && updated.employer.email) {
    sendStatusUpdateEmail({
      to: updated.employer.email,
      name: updated.employer.name,
      itemType: 'Job Vacancy',
      itemTitle: updated.title,
      newStatus: 'PUBLISHED',
      comment: parsed.data.comment || null,
    }).catch((err) => console.error('[ManagerController] Failed to send job approval email:', err.message));
  }

  return res.json(updated);
}

async function rejectJob(req, res) {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Rejection comment is required (BR6)' });

  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'PENDING_REVIEW') return res.status(409).json({ error: 'Not pending review' });

  const updated = await prisma.job.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', approvalComment: parsed.data.comment },
    include: {
      employer: { select: { id: true, name: true, email: true } },
    },
  });

  if (updated.employer && updated.employer.email) {
    sendStatusUpdateEmail({
      to: updated.employer.email,
      name: updated.employer.name,
      itemType: 'Job Vacancy',
      itemTitle: updated.title,
      newStatus: 'REJECTED',
      comment: parsed.data.comment,
    }).catch((err) => console.error('[ManagerController] Failed to send job rejection email:', err.message));
  }

  return res.json(updated);
}

module.exports = {
  pendingQueue,
  approveListing,
  rejectListing,
  changeListingStatus,
  reassignListing,
  managerEditListing,
  pendingMarketQueue,
  approveMarketItem,
  rejectMarketItem,
  pendingServicesQueue,
  approveServiceProvider,
  rejectServiceProvider,
  pendingGisQueue,
  assignGisRequest,
  pendingJobsQueue,
  approveJob,
  rejectJob,
};
