const { z } = require('zod');
const prisma = require('../config/db');
const { toPublicListing } = require('../utils/fieldVisibility');
const { jitterCoordinates } = require('../utils/jitterLocation');

const LISTING_INCLUDE = {
  translations: true,
  media: true,
  attributes: true,
  fieldVisibility: true,
  statusHistory: {
    select: { id: true, oldStatus: true, newStatus: true, comment: true, changedAt: true },
    orderBy: { changedAt: 'desc' },
  },
};

// ---------------------------------------------------------------
// AGENT: create draft (FR4)
// ---------------------------------------------------------------
const createListingSchema = z.object({
  category: z.enum(['HOUSE', 'LAND', 'VEHICLE', 'MOTORCYCLE']),
  listingType: z.enum(['SALE', 'RENT']),
  price: z.number().nonnegative().optional(),
  currency: z.string().default('RWF'),
  privateLat: z.number(),
  privateLng: z.number(),
  district: z.string().optional(),
  sector: z.string().optional(),
  cell: z.string().optional(),
  village: z.string().optional(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  internalNotes: z.string().optional(),
  attributes: z.record(z.string()).optional(), // e.g. { bedrooms: "3" }
  translations: z
    .array(z.object({ languageCode: z.enum(['EN', 'RW', 'SW']), title: z.string(), description: z.string() }))
    .min(1), // BR9: at least one language required
  mediaUrls: z.array(z.string().url()).min(1),
});

async function createListing(req, res) {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const { publicLat, publicLng } = jitterCoordinates(d.privateLat, d.privateLng);

  const listing = await prisma.listing.create({
    data: {
      agentId: req.user.id, // always the logged-in agent — never client-supplied
      category: d.category,
      listingType: d.listingType,
      price: d.price,
      currency: d.currency,
      status: 'DRAFT',
      privateLat: d.privateLat,
      privateLng: d.privateLng,
      publicLat,
      publicLng,
      district: d.district,
      sector: d.sector,
      cell: d.cell,
      village: d.village,
      ownerName: d.ownerName,
      ownerPhone: d.ownerPhone,
      internalNotes: d.internalNotes,
      attributes: { create: Object.entries(d.attributes || {}).map(([key, value]) => ({ key, value })) },
      translations: { create: d.translations },
      media: { create: d.mediaUrls.map((url, i) => ({ url, sortOrder: i })) },
    },
    include: LISTING_INCLUDE,
  });

  return res.status(201).json(listing);
}

// ---------------------------------------------------------------
// AGENT: submit for review (FR5)
// ---------------------------------------------------------------
async function submitListing(req, res) {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.agentId !== req.user.id) return res.status(403).json({ error: 'Not your listing' }); // FR4a / BR10
  if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
    return res.status(409).json({ error: `Cannot submit from status ${listing.status}` });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const l = await tx.listing.update({
      where: { id: listing.id },
      data: { status: 'PENDING_REVIEW' },
    });
    await tx.listingStatusHistory.create({
      data: {
        listingId: listing.id,
        changedById: req.user.id,
        oldStatus: listing.status,
        newStatus: 'PENDING_REVIEW',
      },
    });
    return l;
  });

  return res.json(updated);
}

// ---------------------------------------------------------------
// AGENT: "My Listings" — scoped server-side to own account (FR4a, BR10)
// ---------------------------------------------------------------
async function myListings(req, res) {
  const listings = await prisma.listing.findMany({
    where: { agentId: req.user.id }, // hard filter — never trust a client-supplied agentId
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return res.json(listings);
}

// ---------------------------------------------------------------
// AGENT: edit own draft/rejected listing (FR6)
// ---------------------------------------------------------------
async function updateOwnListing(req, res) {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.agentId !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
    return res.status(409).json({ error: 'Editing requires manager re-approval once submitted' });
  }

  const parsed = createListingSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const data = { ...d };
  delete data.attributes;
  delete data.translations;
  delete data.mediaUrls;

  if (d.privateLat != null && d.privateLng != null) {
    const { publicLat, publicLng } = jitterCoordinates(d.privateLat, d.privateLng);
    data.publicLat = publicLat;
    data.publicLng = publicLng;
  }

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data,
    include: LISTING_INCLUDE,
  });

  return res.json(updated);
}

// ---------------------------------------------------------------
// PUBLIC: search/filter — returns PUBLIC fields only (FR15-FR19)
// ---------------------------------------------------------------
async function searchListings(req, res) {
  const { category, listingType, minPrice, maxPrice, district, sector, cell, village, sort, page = '1', pageSize = '20' } = req.query;
  const lang = (req.query.lang || 'EN').toUpperCase();

  const where = {
    status: 'PUBLISHED', // BR2 — never return unpublished listings publicly
    ...(category && { category }),
    ...(listingType && { listingType }),
    ...(district && { district }),
    ...(sector && { sector }),
    ...(cell && { cell }),
    ...(village && { village }),
    ...((minPrice || maxPrice) && {
      price: { ...(minPrice && { gte: Number(minPrice) }), ...(maxPrice && { lte: Number(maxPrice) }) },
    }),
  };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' };

  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const listings = await prisma.listing.findMany({ where, include: LISTING_INCLUDE, orderBy, take, skip });

  // NOTE: for true geo radius search ("near me"), replace this findMany
  // with a raw SQL query using ST_DWithin on public_geog — see
  // prisma/POSTGIS_NOTE.sql. Prisma doesn't support PostGIS functions
  // natively, so use prisma.$queryRaw for that endpoint.

  return res.json(listings.map((l) => toPublicListing(l, lang)));
}

async function getPublicListing(req, res) {
  const lang = (req.query.lang || 'EN').toUpperCase();
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id }, include: LISTING_INCLUDE });
  if (!listing || listing.status !== 'PUBLISHED') return res.status(404).json({ error: 'Listing not found' });
  return res.json(toPublicListing(listing, lang));
}

// ---------------------------------------------------------------
// WhatsApp deep link (FR20-FR22) — never exposes raw agent phone in JSON,
// only builds the wa.me redirect and logs the click.
// ---------------------------------------------------------------
async function getWhatsappLink(req, res) {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { agent: true },
  });
  if (!listing || listing.status !== 'PUBLISHED') return res.status(404).json({ error: 'Listing not found' });
  if (!listing.agent.phone) return res.status(422).json({ error: 'Agent has no phone on file' });

  await prisma.whatsappClickLog.create({
    data: { listingId: listing.id, clientIpHash: hashIp(req.ip) },
  });

  const message = encodeURIComponent(`Hi, I'm interested in listing #${listing.id.slice(0, 8)} on your platform.`);
  const phoneDigits = listing.agent.phone.replace(/[^\d]/g, '');
  const url = `${process.env.WHATSAPP_LINK_BASE}/${phoneDigits}?text=${message}`;

  return res.json({ url });
}

function hashIp(ip) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(ip)).digest('hex');
}

module.exports = {
  createListing,
  submitListing,
  myListings,
  updateOwnListing,
  searchListings,
  getPublicListing,
  getWhatsappLink,
};
