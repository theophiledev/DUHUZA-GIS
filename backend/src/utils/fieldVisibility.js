/**
 * Field Visibility Engine
 * -----------------------
 * SRS refs: FR13, FR14, BR3, BR8, Section 10 "critical rule".
 *
 * This is the single place that decides what a CLIENT is allowed to
 * see about a listing. Every public-facing route MUST pass the raw
 * Prisma listing through `toPublicListing()` before calling res.json().
 * Never return a raw Prisma row directly on a public endpoint.
 */

// Default public fields per category (BR3: exact GPS/owner data is
// NEVER in this set, for any category).
const DEFAULT_PUBLIC_FIELDS = [
  'id',
  'category',
  'listingType',
  'price',
  'currency',
  'district',
  'sector',
  'cell',
  'village',
  'publicLat',
  'publicLng',
  'createdAt',
  // translations/media/attributes are handled separately below
];

// Fields that must NEVER be exposed publicly regardless of any
// manager override (defense in depth for BR3).
const ALWAYS_PRIVATE_FIELDS = new Set([
  'privateLat',
  'privateLng',
  'ownerName',
  'ownerPhone',
  'internalNotes',
  'agentId', // agent identity/contact only exposed via WhatsApp link, not raw
]);

/**
 * Applies FR14 manager overrides on top of the category default set.
 * `overrides` is the array of ListingFieldVisibility rows for this listing.
 */
function resolvePublicFieldSet(overrides = []) {
  const fieldSet = new Set(DEFAULT_PUBLIC_FIELDS);

  for (const o of overrides) {
    if (ALWAYS_PRIVATE_FIELDS.has(o.fieldName)) continue; // BR3 wins, no override possible
    if (o.isPublic) fieldSet.add(o.fieldName);
    else fieldSet.delete(o.fieldName);
  }

  return fieldSet;
}

/**
 * Converts a raw Prisma `Listing` (with relations included) into a
 * client-safe object. Call this for every listing returned from a
 * public endpoint (search results and detail view).
 *
 * @param {object} listing - Prisma listing row, with translations,
 *                            media, attributes, fieldVisibility included.
 * @param {string} lang - requested language code, e.g. 'EN' | 'RW' | 'SW'
 */
function toPublicListing(listing, lang = 'EN') {
  const fieldSet = resolvePublicFieldSet(listing.fieldVisibility);

  const safe = {};
  for (const field of fieldSet) {
    if (field in listing) safe[field] = listing[field];
  }

  // Translation with fallback (FR30)
  const translation =
    listing.translations.find((t) => t.languageCode === lang) ||
    listing.translations[0] || // fallback to whatever the agent provided first
    null;

  safe.title = translation?.title ?? null;
  safe.description = translation?.description ?? null;
  safe.isFallbackLanguage = translation ? translation.languageCode !== lang : false;
  safe.originalLanguage = translation?.languageCode ?? null;

  // Only public media
  safe.media = listing.media.filter((m) => m.isPublic).map((m) => ({ url: m.url, type: m.type }));

  // Attributes are generally safe (bedrooms, engine_cc, etc.) —
  // exclude any attribute key an agent/manager explicitly marked private
  const privateAttrKeys = new Set(
    listing.fieldVisibility.filter((o) => o.fieldName.startsWith('attr:') && !o.isPublic).map((o) => o.fieldName.slice(5))
  );
  safe.attributes = Object.fromEntries(
    listing.attributes.filter((a) => !privateAttrKeys.has(a.key)).map((a) => [a.key, a.value])
  );

  // WhatsApp contact is a generated link, never the raw phone number
  safe.whatsappLinkAvailable = true; // actual link built by listingController via /whatsapp-link route

  return safe;
}

/**
 * Full internal view for Agent (own listings only) / Manager / Admin —
 * includes private fields. Still strips fields the requester's role
 * shouldn't see if you extend roles later; for MVP, Agent/Manager/Admin
 * see everything on listings they're authorized to view.
 */
function toInternalListing(listing) {
  return listing; // relations already included by the caller's Prisma query
}

module.exports = { toPublicListing, toInternalListing, resolvePublicFieldSet, ALWAYS_PRIVATE_FIELDS };
