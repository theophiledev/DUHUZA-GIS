const { z } = require('zod');
const prisma = require('../config/db');
const { sendSubmissionReceivedEmail } = require('../utils/emailService');

// Market items are self-serve for ANY authenticated client (FR34) —
// unlike property, no Admin-created Agent account is required.
// They still go through the same approval gate as property (BR12).

const createMarketItemSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  currency: z.string().default('RWF'),
  district: z.string().optional(),
  sector: z.string().optional(),
  mediaUrls: z.array(z.string().url()).max(5).optional(),
});

async function createMarketItem(req, res) {
  const parsed = createMarketItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const item = await prisma.marketItem.create({
    data: {
      sellerId: req.user.id, // always the logged-in user, never client-supplied
      category: d.category,
      title: d.title,
      description: d.description,
      price: d.price,
      currency: d.currency,
      district: d.district,
      sector: d.sector,
      status: 'PENDING_REVIEW', // auto-submitted — no separate draft step for market (FR34/35)
      media: { create: (d.mediaUrls || []).map((url, i) => ({ url, sortOrder: i })) },
    },
    include: { media: true },
  });

  // Dispatch submission receipt email
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user && user.email) {
    sendSubmissionReceivedEmail({
      to: user.email,
      name: user.name,
      itemType: 'Marketplace Item',
      itemTitle: item.title,
    }).catch((err) => console.error('[MarketController] Failed to send receipt email:', err.message));
  }

  return res.status(201).json(item);
}

// Self-scoped, same pattern as property's myListings (FR4a/BR10 equivalent)
async function myMarketItems(req, res) {
  const items = await prisma.marketItem.findMany({
    where: { sellerId: req.user.id },
    include: { media: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(items);
}

// PUBLIC: search — only PUBLISHED items, no private fields exist on
// market items (seller identity is only revealed via WhatsApp link,
// same privacy pattern as property FR37).
async function searchMarketItems(req, res) {
  const { category, minPrice, maxPrice, district, page = '1', pageSize = '20' } = req.query;

  const where = {
    status: 'PUBLISHED',
    ...(category && { category }),
    ...(district && { district }),
    ...((minPrice || maxPrice) && {
      price: { ...(minPrice && { gte: Number(minPrice) }), ...(maxPrice && { lte: Number(maxPrice) }) },
    }),
  };

  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const items = await prisma.marketItem.findMany({
    where,
    include: { media: true, seller: { select: { id: true, name: true, phone: true } } },
    orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }], // promoted items surface first (FR43)
    take,
    skip,
  });

  // Strip seller.phone from the public response — contact goes through
  // the WhatsApp link endpoint only (FR37), never a raw phone field.
  const safe = items.map(({ seller, ...rest }) => rest);
  return res.json(safe);
}

async function getPublicMarketItem(req, res) {
  const item = await prisma.marketItem.findUnique({ where: { id: req.params.id }, include: { media: true } });
  if (!item || item.status !== 'PUBLISHED') return res.status(404).json({ error: 'Item not found' });
  return res.json(item);
}

async function getMarketItemWhatsappLink(req, res) {
  const item = await prisma.marketItem.findUnique({ where: { id: req.params.id }, include: { seller: true } });
  if (!item || item.status !== 'PUBLISHED') return res.status(404).json({ error: 'Item not found' });
  if (!item.seller.phone) return res.status(422).json({ error: 'Seller has no phone on file' });

  const phoneDigits = item.seller.phone.replace(/[^\d]/g, '');
  const message = encodeURIComponent(`Hi, is "${item.title}" still available?`);
  return res.json({ url: `${process.env.WHATSAPP_LINK_BASE}/${phoneDigits}?text=${message}` });
}

module.exports = { createMarketItem, myMarketItems, searchMarketItems, getPublicMarketItem, getMarketItemWhatsappLink };
