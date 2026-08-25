const { z } = require('zod');
const prisma = require('../config/db');

// A Client "upgrades" their own account to a service provider — still
// self-serve (FR38), still goes through manager approval (BR12).

const registerSchema = z.object({
  category: z.string().min(2),
  description: z.string().min(10),
  rateInfo: z.string().optional(),
  coverageDistrict: z.string().optional(),
  coverageSector: z.string().optional(),
});

async function registerAsProvider(req, res) {
  const existing = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
  if (existing) return res.status(409).json({ error: 'You already have a service provider profile' });

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const provider = await prisma.serviceProvider.create({
    data: { userId: req.user.id, ...parsed.data, status: 'PENDING_REVIEW' },
  });

  return res.status(201).json(provider);
}

async function myProviderProfile(req, res) {
  const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
  if (!provider) return res.status(404).json({ error: 'No provider profile yet' });
  return res.json(provider);
}

const updateSchema = registerSchema.partial();
async function updateOwnProviderProfile(req, res) {
  const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
  if (!provider) return res.status(404).json({ error: 'No provider profile yet' });
  if (provider.status === 'PUBLISHED') {
    return res.status(409).json({ error: 'Editing a published profile requires manager re-approval — resubmit via support for now' });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.serviceProvider.update({
    where: { userId: req.user.id },
    data: { ...parsed.data, status: 'PENDING_REVIEW' },
  });
  return res.json(updated);
}

// PUBLIC: search providers by category/location
async function searchProviders(req, res) {
  const { category, district } = req.query;

  const providers = await prisma.serviceProvider.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category && { category }),
      ...(district && { coverageDistrict: district }),
    },
    include: { user: { select: { id: true, name: true } } }, // never include phone here
    orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
  });

  return res.json(providers);
}

async function getPublicProvider(req, res) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!provider || provider.status !== 'PUBLISHED') return res.status(404).json({ error: 'Provider not found' });
  return res.json(provider);
}

async function getProviderWhatsappLink(req, res) {
  const provider = await prisma.serviceProvider.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!provider || provider.status !== 'PUBLISHED') return res.status(404).json({ error: 'Provider not found' });
  if (!provider.user.phone) return res.status(422).json({ error: 'Provider has no phone on file' });

  const phoneDigits = provider.user.phone.replace(/[^\d]/g, '');
  const message = encodeURIComponent(`Hi, I'd like to book your ${provider.category} service.`);
  return res.json({ url: `${process.env.WHATSAPP_LINK_BASE}/${phoneDigits}?text=${message}` });
}

module.exports = {
  registerAsProvider,
  myProviderProfile,
  updateOwnProviderProfile,
  searchProviders,
  getPublicProvider,
  getProviderWhatsappLink,
};
