const { toPublicListing, ALWAYS_PRIVATE_FIELDS } = require('../src/utils/fieldVisibility');

describe('fieldVisibility — toPublicListing()', () => {
  const baseListing = {
    id: 'listing-1',
    category: 'HOUSE',
    listingType: 'SALE',
    price: 50000000,
    currency: 'RWF',
    district: 'Kigali',
    sector: 'Gasabo',
    cell: 'Remera',
    publicLat: -1.95,
    publicLng: 30.1,
    createdAt: new Date('2026-01-01'),
    privateLat: -1.9499,
    privateLng: 30.1001,
    ownerName: 'Jean Uwimana',
    ownerPhone: '+250788123456',
    internalNotes: 'Gate code 4421',
    agentId: 'agent-uuid',
    translations: [{ languageCode: 'RW', title: 'Inzu', description: 'Inzu nziza' }],
    media: [{ url: 'https://example.com/photo.jpg', type: 'photo', isPublic: true }],
    attributes: [{ key: 'bedrooms', value: '3' }],
    fieldVisibility: [],
  };

  it('never exposes ALWAYS_PRIVATE_FIELDS on public output', () => {
    const publicListing = toPublicListing(baseListing, 'RW');

    for (const field of ALWAYS_PRIVATE_FIELDS) {
      expect(publicListing).not.toHaveProperty(field);
    }
    expect(publicListing).not.toHaveProperty('internalNotes');
  });

  it('includes safe public fields and translation', () => {
    const publicListing = toPublicListing(baseListing, 'RW');

    expect(publicListing.id).toBe('listing-1');
    expect(publicListing.title).toBe('Inzu');
    expect(publicListing.publicLat).toBe(-1.95);
    expect(publicListing.attributes.bedrooms).toBe('3');
  });

  it('respects manager field overrides (FR14) but BR3 blocks private GPS override', () => {
    const withOverrides = {
      ...baseListing,
      fieldVisibility: [
        { fieldName: 'ownerPhone', isPublic: true },
        { fieldName: 'privateLat', isPublic: true },
      ],
    };

    const publicListing = toPublicListing(withOverrides, 'RW');

    expect(publicListing).not.toHaveProperty('ownerPhone');
    expect(publicListing).not.toHaveProperty('privateLat');
  });
});
