const { z } = require('zod');
const prisma = require('../config/db');
const { sendSubmissionReceivedEmail } = require('../utils/emailService');

// Jobs module (Phase 3 — FR26-FR28)
// Clients post jobs; managers approve; other clients apply.

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

async function createJob(req, res) {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { deadline, ...rest } = parsed.data;
  const job = await prisma.job.create({
    data: {
      employerId: req.user.id,
      ...rest,
      deadline: deadline ? new Date(deadline) : undefined,
      status: 'PENDING_REVIEW',
    },
  });

  // Dispatch receipt email
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user && user.email) {
    sendSubmissionReceivedEmail({
      to: user.email,
      name: user.name,
      itemType: 'Job Vacancy',
      itemTitle: job.title,
    }).catch((err) => console.error('[JobsController] Failed to send receipt email:', err.message));
  }

  return res.status(201).json(job);
}

async function myJobs(req, res) {
  const jobs = await prisma.job.findMany({
    where: { employerId: req.user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(jobs);
}

async function searchJobs(req, res) {
  const { location, page = '1', pageSize = '20' } = req.query;

  const where = {
    status: 'PUBLISHED',
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
  };

  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const jobs = await prisma.job.findMany({
    where,
    include: { employer: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });

  return res.json(jobs);
}

async function getPublicJob(req, res) {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { employer: { select: { id: true, name: true } } },
  });
  if (!job || job.status !== 'PUBLISHED') return res.status(404).json({ error: 'Job not found' });
  return res.json(job);
}

const applySchema = z.object({
  cvUrl: z.string().url().optional(),
});

async function applyToJob(req, res) {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.status !== 'PUBLISHED') return res.status(404).json({ error: 'Job not found' });
  if (job.employerId === req.user.id) {
    return res.status(409).json({ error: 'Cannot apply to your own job posting' });
  }

  const existing = await prisma.jobApplication.findFirst({
    where: { jobId: job.id, clientId: req.user.id },
  });
  if (existing) return res.status(409).json({ error: 'Already applied to this job' });

  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const application = await prisma.jobApplication.create({
    data: {
      jobId: job.id,
      clientId: req.user.id,
      cvUrl: parsed.data.cvUrl,
    },
  });

  return res.status(201).json(application);
}

async function myApplications(req, res) {
  const applications = await prisma.jobApplication.findMany({
    where: { clientId: req.user.id },
    include: { job: true },
    orderBy: { appliedAt: 'desc' },
  });
  return res.json(applications);
}

module.exports = {
  createJob,
  myJobs,
  searchJobs,
  getPublicJob,
  applyToJob,
  myApplications,
};
