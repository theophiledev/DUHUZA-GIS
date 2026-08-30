// Run with: node prisma/seed.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bentechrwanda.com' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@bentechrwanda.com',
      phone: '+250788100001',
      passwordHash,
      role: 'ADMIN',
      preferredLanguage: 'RW',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@duhuza.rw' },
    update: {},
    create: {
      name: 'Jean Claude Mugisha (Manager)',
      email: 'manager@duhuza.rw',
      phone: '+250788200002',
      passwordHash,
      role: 'MANAGER',
      preferredLanguage: 'EN',
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@duhuza.rw' },
    update: {},
    create: {
      name: 'Patrick Habimana (Licensed Surveyor & Agent)',
      email: 'agent@duhuza.rw',
      phone: '+250788300003',
      passwordHash,
      role: 'AGENT',
      preferredLanguage: 'RW',
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@duhuza.rw' },
    update: {},
    create: {
      name: 'Aline Uwase',
      email: 'client@duhuza.rw',
      phone: '+250788400004',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'EN',
    },
  });

  const clientTwo = await prisma.user.upsert({
    where: { email: 'employer@duhuza.rw' },
    update: {},
    create: {
      name: 'Diane Mukamana',
      email: 'employer@duhuza.rw',
      phone: '+250788500005',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'EN',
    },
  });

  const clientThree = await prisma.user.upsert({
    where: { email: 'applicant@duhuza.rw' },
    update: {},
    create: {
      name: 'Eric Niyonzima',
      email: 'applicant@duhuza.rw',
      phone: '+250788600006',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'RW',
    },
  });

  // Additional service provider users
  const electricianUser = await prisma.user.upsert({
    where: { email: 'electrician@duhuza.rw' },
    update: {},
    create: {
      name: 'Jean Baptiste Hakizimana (Master Electrician)',
      email: 'electrician@duhuza.rw',
      phone: '+250788700007',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'RW',
    },
  });

  const painterUser = await prisma.user.upsert({
    where: { email: 'painter@duhuza.rw' },
    update: {},
    create: {
      name: 'Emmanuel Mugabo (Modern Painting & Finishes)',
      email: 'painter@duhuza.rw',
      phone: '+250788800008',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'RW',
    },
  });

  const mechanicUser = await prisma.user.upsert({
    where: { email: 'mechanic@duhuza.rw' },
    update: {},
    create: {
      name: 'Claude Nshimiyimana (Auto Diagnostic Specialist)',
      email: 'mechanic@duhuza.rw',
      phone: '+250788900009',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'RW',
    },
  });

  const cateringUser = await prisma.user.upsert({
    where: { email: 'catering@duhuza.rw' },
    update: {},
    create: {
      name: 'Chef Sandrine Umutoni (Gourmet Catering)',
      email: 'catering@duhuza.rw',
      phone: '+250788110010',
      passwordHash,
      role: 'CLIENT',
      preferredLanguage: 'EN',
    },
  });

  console.log('Seeded Users: Admin, Manager, Agent/Surveyor, Clients, and Trade Service Providers');

  // Clean old listings & media to prevent duplicates when re-seeding
  await prisma.listingMedia.deleteMany({});
  await prisma.listingTranslation.deleteMany({});
  await prisma.listingAttribute.deleteMany({});
  await prisma.listingStatusHistory.deleteMany({});
  await prisma.listingFieldVisibility.deleteMany({});
  await prisma.listing.deleteMany({});

  // 2. Listings with Rich Multi-Angle Sample Media Galleries
  const listingsData = [
    {
      agentId: agent.id,
      category: 'HOUSE',
      listingType: 'SALE',
      price: 240000000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9355,
      publicLng: 30.1042,
      district: 'Gasabo',
      sector: 'Nyarutarama',
      cell: 'Kangondo',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Modern 4-Bedroom Luxury Villa with Garden & Pool in Nyarutarama',
            description: 'Stunning 4-bedroom villa featuring modern architecture, expansive glass balconies, open-concept living lounge, high-end quartz island kitchen, private swimming pool, manicured lawn garden, and paved parking for 4 cars.',
          },
          {
            languageCode: 'RW',
            title: 'Inzu nziza y\'akataraboneka y\'ibyumba 4 ifite pisine i Nyarutarama',
            description: 'Inzu y\'akataraboneka ifite ibyumba 4, ubwogero 4, salon nini igaragara neza, igikoni kigezweho, pisine yo kogeramo, ubusitani bwiza cyane, na parikingi y\'imodoka 4.',
          },
          {
            languageCode: 'SW',
            title: 'Nyumba ya kisasa ya kifahari yenye vyumba 4 na bwawa Nyarutarama',
            description: 'Nyumba ya kifahari yenye vyumba 4 vya kulala, bustani nzuri, bwawa la kuogelea, maegesho ya magari 4 na jiko la kisasa lililo na vifaa vyote.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'bedrooms', value: '4' },
          { key: 'bathrooms', value: '4.5' },
          { key: 'land_size_sqm', value: '750' },
          { key: 'furnished', value: 'Furnished' },
          { key: 'pool', value: 'Private Pool' },
          { key: 'parking', value: '4 Cars' },
        ],
      },
      media: {
        create: [
          { url: '/images/house_kigali_modern.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/house_living_room.jpg', type: 'photo', sortOrder: 1, isPublic: true },
          { url: '/images/house_modern_kitchen.jpg', type: 'photo', sortOrder: 2, isPublic: true },
          { url: '/images/house_master_bedroom.jpg', type: 'photo', sortOrder: 3, isPublic: true },
          { url: '/images/house_garden_pool.jpg', type: 'photo', sortOrder: 4, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'HOUSE',
      listingType: 'RENT',
      price: 1800000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9542,
      publicLng: 30.0863,
      district: 'Gasabo',
      sector: 'Kimihurura',
      cell: 'Kimihurura',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Executive 3-Bedroom Serviced Apartment with Panoramic Balcony View',
            description: 'Fully furnished executive apartment located in prime Kimihurura. Features spacious open living room, scenic balcony overlooking Kigali rolling hills, 24/7 security, backup generator, high-speed WiFi, and shared pool.',
          },
          {
            languageCode: 'RW',
            title: 'Aparitoma nziza yo gukodesha ifite ibikoresho byose i Kimihurura',
            description: 'Aparitoma yuzuye ibikoresho byose i Kimihurura. Ifite salon nziza irunguruka imisozi ya Kigali, umutekano w\'amasaha 24, moteri y\'amashanyarazi na interineti yihuta.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'bedrooms', value: '3' },
          { key: 'bathrooms', value: '2' },
          { key: 'area', value: '180 m²' },
          { key: 'furnished', value: 'Fully Furnished' },
          { key: 'generator', value: 'Automatic Backup' },
        ],
      },
      media: {
        create: [
          { url: '/images/apartment_kigali.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/apartment_interior.jpg', type: 'photo', sortOrder: 1, isPublic: true },
          { url: '/images/house_modern_kitchen.jpg', type: 'photo', sortOrder: 2, isPublic: true },
          { url: '/images/house_master_bedroom.jpg', type: 'photo', sortOrder: 3, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'LAND',
      listingType: 'SALE',
      price: 45000000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -2.0124,
      publicLng: 30.1345,
      district: 'Kicukiro',
      sector: 'Kagarama',
      cell: 'Muyange',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Surveyed Residential Plot (800 m²) with Clean UPI Title in Kagarama',
            description: 'Prime titled land plot zoned R1A for residential villa construction. Fully surveyed with verified GIS cadastral boundaries, water & electricity connected on site, gentle gradient, and mountain views.',
          },
          {
            languageCode: 'RW',
            title: 'Ikibanza cyapimwe gifite UPI (800 m²) i Kagarama',
            description: 'Ikibanza cyapimwe neza gifite ibyangombwa bya UPI. Kirimo amazi n\'amashanyarazi, kiberanye no kubaka inzu yo guturamo mu gace keza.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'land_size_sqm', value: '800' },
          { key: 'zoning', value: 'R1A Residential' },
          { key: 'title_deed', value: 'Clean Freehold UPI' },
          { key: 'topography', value: 'Gentle Slope' },
        ],
      },
      media: {
        create: [
          { url: '/images/land_parcel_rwanda.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/gis_satellite_cadastral.jpg', type: 'photo', sortOrder: 1, isPublic: true },
          { url: '/images/gis_field_surveyor.jpg', type: 'photo', sortOrder: 2, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'LAND',
      listingType: 'SALE',
      price: 120000000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.5032,
      publicLng: 29.6341,
      district: 'Musanze',
      sector: 'Kinigi',
      cell: 'Nyonirima',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Scenic 5-Hectare Farm & Eco-Lodge Estate near Volcanoes National Park',
            description: 'Expansive 5-hectare agricultural and hospitality zoned property in Kinigi Musanze. Spectacular unobstructed views of the Virunga Volcanoes, rich volcanic soil, road access, and verified cadastral demarcations.',
          },
          {
            languageCode: 'RW',
            title: 'Ubutaka bw\'ubuhinzi n\'ubukerarugendo bwa hegitari 5 i Kinigi Musanze',
            description: 'Ubutaka bunini bwa hegitari 5 buherereye munsi y\'ibirunga bya Musanze. Bubereye ubuhinzi bw\'icyayi, ibirayi cyangwa kubaka hoteli n\'amacumbi y\'abakerarugendo.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'land_size_sqm', value: '50000' },
          { key: 'zoning', value: 'A1 Agricultural / Eco-Tourism' },
          { key: 'views', value: 'Virunga Volcanoes' },
          { key: 'access_road', value: 'Paved + Murram' },
        ],
      },
      media: {
        create: [
          { url: '/images/farmland_hills_rwanda.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/gis_satellite_cadastral.jpg', type: 'photo', sortOrder: 1, isPublic: true },
          { url: '/images/gis_drone_mapping.jpg', type: 'photo', sortOrder: 2, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'LAND',
      listingType: 'SALE',
      price: 165000000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.6834,
      publicLng: 29.2612,
      district: 'Rubavu',
      sector: 'Gisenyi',
      cell: 'Rubavu',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Prime Lake Kivu Waterfront Plot (1,800 m²) with Private Shoreline Access',
            description: 'Rare waterfront parcel directly on the shores of Lake Kivu in Gisenyi. Ideal for luxury holiday villa, boutique lakeside lodge, or private retreat. Clean title deed and full cadastral boundary coordinates.',
          },
          {
            languageCode: 'RW',
            title: 'Ikibanza cy\'akataraboneka ku nkombe y\'Ikiyaga cya Kivu (1,800 m²) i Gisenyi',
            description: 'Ikibanza cyiza cyane gikora ku mazi y\'Ikiyaga cya Kivu mu Mujyi wa Gisenyi. Kiberanye no kubaka inzu y\'ibiruhuko cyangwa hoteli nziza cyane.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'land_size_sqm', value: '1800' },
          { key: 'zoning', value: 'Tourism & Waterfront Residential' },
          { key: 'waterfront', value: 'Direct Lake Access' },
        ],
      },
      media: {
        create: [
          { url: '/images/lake_kivu_waterfront.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/land_parcel_rwanda.jpg', type: 'photo', sortOrder: 1, isPublic: true },
          { url: '/images/gis_gnss_receiver.jpg', type: 'photo', sortOrder: 2, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'HOUSE',
      listingType: 'RENT',
      price: 3500000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9445,
      publicLng: 30.0620,
      district: 'Nyarugenge',
      sector: 'Nyarugenge',
      cell: 'Kiyovu',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Grade-A Commercial Office Floor (450 m²) in Kigali CBD Plaza',
            description: 'Premium modern office space in Kigali financial district. Features high-speed fiber optic internet, central HVAC air conditioning, 24/7 security access control, underground parking, and panoramic city views.',
          },
          {
            languageCode: 'RW',
            title: 'Ibiro bigezweho byo gukodesha (450 m²) mu Mujyi wa Kigali rwagati',
            description: 'Ibiro byiza cyane kandi bigezweho mu mutima w\'ubucuruzi wa Kigali. Birimo interineti yihuta, ubushyuhe bugengwa, umutekano w\'amasaha 24, na parikingi ihagije.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'floor_area_sqm', value: '450' },
          { key: 'building_class', value: 'Grade A' },
          { key: 'parking_spaces', value: '12 dedicated' },
          { key: 'elevators', value: '3 High-speed' },
        ],
      },
      media: {
        create: [
          { url: '/images/office_commercial_kigali.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/commercial_kigali.jpg', type: 'photo', sortOrder: 1, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'HOUSE',
      listingType: 'RENT',
      price: 5200000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9680,
      publicLng: 30.1520,
      district: 'Gasabo',
      sector: 'Ndera',
      cell: 'Masoro',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Modern 1,200 m² Logistics & Industrial Warehouse in Masoro SEZ',
            description: 'State-of-the-art industrial storage and distribution warehouse in Kigali Special Economic Zone. Features 9-meter clear ceiling heights, 4 hydraulic loading bays, heavy-duty concrete slab, 3-phase industrial power, and administrative offices.',
          },
          {
            languageCode: 'RW',
            title: 'Ububiko bunini bugezweho (1,200 m²) mu gace k\'inganda i Masoro',
            description: 'Ububiko bunini kandi bugezweho buherereye mu gace kahariwe inganda (Special Economic Zone). Bufite aho amakamyo apakirira, amashanyarazi y\'inganda n\'ibiro by\'abakozi.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'warehouse_sqm', value: '1200' },
          { key: 'ceiling_height', value: '9 meters' },
          { key: 'loading_docks', value: '4 hydraulic bays' },
          { key: 'power_supply', value: '3-Phase 100kVA' },
        ],
      },
      media: {
        create: [
          { url: '/images/warehouse_logistics.jpg', type: 'photo', sortOrder: 0, isPublic: true },
          { url: '/images/truck_transport.jpg', type: 'photo', sortOrder: 1, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'VEHICLE',
      listingType: 'RENT',
      price: 85000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9441,
      publicLng: 30.0619,
      district: 'Nyarugenge',
      sector: 'Nyarugenge',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Toyota RAV4 4x4 Automatic (Daily / Weekly Rental)',
            description: 'Reliable all-wheel-drive Toyota RAV4 in excellent condition. Ideal for Kigali commuting, countryside trips, and safari tours. Comprehensive insurance and 24/7 roadside assistance included.',
          },
          {
            languageCode: 'RW',
            title: 'Imodoka ya Toyota RAV4 4x4 yo gukodesha ku munsi',
            description: 'Imodoka ikora neza cyane ya RAV4 4x4, ikoresha lisansi nkeya, ifite ubwishingizi bwuzuye, ibereye ingendo za Kigali n\'intara.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'transmission', value: 'Automatic' },
          { key: 'fuel', value: 'Petrol' },
          { key: 'seats', value: '5' },
          { key: 'drive', value: 'AWD / 4x4' },
        ],
      },
      media: {
        create: [
          { url: '/images/car_suv_rental.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'VEHICLE',
      listingType: 'RENT',
      price: 150000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9530,
      publicLng: 30.0920,
      district: 'Gasabo',
      sector: 'Remera',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Toyota Land Cruiser Prado TX 4x4 Luxury SUV (Safari & VIP)',
            description: 'Prestigious 7-seater Toyota Land Cruiser Prado TX. Equipped with heavy-duty 4WD suspension, leather interior, sunroof, dual climate control, and high ground clearance for national parks and VIP delegations.',
          },
          {
            languageCode: 'RW',
            title: 'Toyota Land Cruiser Prado TX 4x4 y\'akataraboneka yo gukodesha',
            description: 'Imodoka nziza cyane ya Prado TX y\'imyanya 7, ifite intebe z\'uruhu, ubwishingizi bwuzuye, ikomeye cyane kandi ibereye abashyitsi bakomeye no gusura pariki z\'u Rwanda.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'transmission', value: 'Automatic' },
          { key: 'fuel', value: 'Diesel Turbo' },
          { key: 'seats', value: '7' },
          { key: 'features', value: 'Leather, Sunroof, 4x4 Low/High' },
        ],
      },
      media: {
        create: [
          { url: '/images/car_land_cruiser.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'VEHICLE',
      listingType: 'RENT',
      price: 65000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9420,
      publicLng: 30.0880,
      district: 'Gasabo',
      sector: 'Kacyiru',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Smart City Electric Vehicle (EV) Daily Eco-Rental with Free Charging',
            description: '100% electric modern city car with 350km battery range per charge. Zero emissions, ultra-quiet, smart touchscreen with GPS navigation, and complimentary charging at Kigali green mobility hubs.',
          },
          {
            languageCode: 'RW',
            title: 'Imodoka y\'amashanyarazi (EV) yo gukodesha idakoresha lisansi',
            description: 'Imodoka y\'akataraboneka ikoresha amashanyarazi gusa. Irangeza ibirometero 350 yuzuye, ntiyanduza ikirere, kandi ikongerwamo amashanyarazi ku buntu mu mujyi.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'motor', value: '100% Electric (Zero Emission)' },
          { key: 'range', value: '350 km per charge' },
          { key: 'seats', value: '5' },
        ],
      },
      media: {
        create: [
          { url: '/images/car_ev_kigali.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'VEHICLE',
      listingType: 'RENT',
      price: 180000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9750,
      publicLng: 30.1120,
      district: 'Kicukiro',
      sector: 'Gikondo',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'Commercial Cargo Transport Truck (5-Tonne Payload with Driver)',
            description: 'Reliable 5-tonne commercial flatbed truck available for cargo logistics, house relocations, construction materials delivery, and regional goods distribution across Rwanda.',
          },
          {
            languageCode: 'RW',
            title: 'Ikamyo yo gutwara imizigo (Toni 5) ifite n\'umushoferi',
            description: 'Ikamyo ikomeye itwara toni 5 z\'imizigo, ibikoresho by\'ubwubatsi, cyangwa kwimura inzu n\'ibicuruzwa mu Rwanda hose.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'payload', value: '5 Tonnes' },
          { key: 'driver', value: 'Professional Driver Included' },
        ],
      },
      media: {
        create: [
          { url: '/images/truck_transport.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
    {
      agentId: agent.id,
      category: 'MOTORCYCLE',
      listingType: 'RENT',
      price: 25000,
      currency: 'RWF',
      status: 'PUBLISHED',
      publicLat: -1.9600,
      publicLng: 30.0600,
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
      translations: {
        create: [
          {
            languageCode: 'EN',
            title: 'TVS Apache RTR 200 Motorcycle for Daily City Commute',
            description: 'Fuel-efficient sporty motorcycle in prime mechanical order. Low fuel consumption, twin disc brakes, safety helmet included, ideal for swift urban navigation.',
          },
          {
            languageCode: 'RW',
            title: 'Moto ya TVS Apache 200 yo gukodesha ku munsi',
            description: 'Moto ikora neza cyane idatwara lisansi nyinshi. Ifite feri zikomeye na kasike y\'umutekano.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'engine', value: '200cc' },
          { key: 'fuel_consumption', value: '2.5L / 100km' },
        ],
      },
      media: {
        create: [
          { url: '/images/motorcycle_rental.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
  ];

  for (const item of listingsData) {
    await prisma.listing.create({ data: item });
  }

  console.log(`Seeded ${listingsData.length} multi-angle Property & Vehicle Listings with sample media`);

  // 3. GIS Requests
  await prisma.gisRequest.deleteMany({});
  await prisma.gisRequest.create({
    data: {
      clientId: client.id,
      parcelLat: -1.9482,
      parcelLng: 30.1265,
      purpose: 'Cadastral Boundary Demarcation & Title Transfer Survey for Plot 412A (Gasabo/Ndera)',
      status: 'COMPLETED',
      assignedAgentId: agent.id,
      reportUrl: '/images/gis_sample_report_preview.jpg',
      boundaryGeoJson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              upi: '1/02/08/04/412A',
              area_sqm: 1250,
              perimeter_m: 145,
              zoning: 'R2-Low Density Residential',
              surveyor: 'Patrick Habimana (Reg #RW-SURV-2024-88)',
              surveyDate: '2026-03-12',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [30.1260, -1.9478],
                  [30.1272, -1.9479],
                  [30.1270, -1.9488],
                  [30.1258, -1.9486],
                  [30.1260, -1.9478],
                ],
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.gisRequest.create({
    data: {
      clientId: client.id,
      parcelLat: -1.9950,
      parcelLng: 30.0820,
      purpose: 'Topographical Contour & 3D Slope Analysis for Commercial Warehouse (Kicukiro/Gahanga)',
      status: 'IN_PROGRESS',
      assignedAgentId: agent.id,
      reportUrl: '/images/gis_topo_contours.jpg',
      boundaryGeoJson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              upi: '1/03/11/02/109B',
              area_sqm: 3400,
              status: 'GNSS Field Data Collected - Processing Cadastral Plan',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [30.0810, -1.9940],
                  [30.0835, -1.9942],
                  [30.0832, -1.9960],
                  [30.0808, -1.9958],
                  [30.0810, -1.9940],
                ],
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.gisRequest.create({
    data: {
      clientId: client.id,
      parcelLat: -2.1540,
      parcelLng: 30.2210,
      purpose: 'Subdivision and Master Planning Survey for 5-Hectare Farm Plot (Bugesera/Nyamata)',
      status: 'REQUESTED',
    },
  });

  await prisma.gisRequest.create({
    data: {
      clientId: client.id,
      parcelLat: -1.6834,
      parcelLng: 29.2612,
      purpose: 'Drone Aerial Orthophoto & Topo Survey for Lake Kivu Resort (Rubavu/Gisenyi)',
      status: 'COMPLETED',
      assignedAgentId: agent.id,
      reportUrl: '/images/gis_sample_report_preview.jpg',
    },
  });

  console.log('Seeded GIS Requests with GeoJSON boundaries and sample survey reports');

  // 4. Jobs
  const sampleJobs = [
    {
      title: 'Frontend Developer - React and TypeScript',
      description: 'Build accessible, responsive interfaces for a growing Rwanda-based property technology platform. Two years of React experience and strong TypeScript fundamentals are preferred.',
      location: 'Kigali, Gasabo',
      salaryRange: '800,000 - 1,200,000 RWF/month',
      deadline: new Date('2026-10-15T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Land Survey Technician',
      description: 'Support cadastral boundary surveys, GNSS field data collection, and preparation of GIS deliverables for residential and commercial land projects.',
      location: 'Kigali and Eastern Province',
      salaryRange: '600,000 - 900,000 RWF/month',
      deadline: new Date('2026-09-30T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Customer Support and Listings Coordinator',
      description: 'Help customers publish accurate property and marketplace listings, respond to support requests, and coordinate verification with field teams.',
      location: 'Kigali, Nyarugenge',
      salaryRange: '450,000 - 650,000 RWF/month',
      deadline: new Date('2026-09-20T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Agribusiness Operations Intern',
      description: 'Assist with supplier coordination, field records, and market research for agricultural products moving through Rwanda supply chains.',
      location: 'Huye, Southern Province',
      salaryRange: '150,000 RWF/month stipend',
      deadline: new Date('2026-09-10T23:59:59.000Z'),
      status: 'PENDING_REVIEW',
    },
    {
      title: 'Digital Marketing Specialist',
      description: 'Plan and deliver campaigns that help Rwandan customers discover trusted properties, local services, and marketplace opportunities through digital channels.',
      location: 'Kigali, Kicukiro',
      salaryRange: '700,000 - 1,000,000 RWF/month',
      deadline: new Date('2026-10-05T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Operations and Partnerships Manager',
      description: 'Build relationships with property agents, surveyors, service providers, and local institutions while improving marketplace operations across Rwanda.',
      location: 'Kigali, Nyarugenge',
      salaryRange: '1,200,000 - 1,800,000 RWF/month',
      deadline: new Date('2026-10-25T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Graphic Design and Content Intern',
      description: 'Create clear, engaging visual content for property campaigns, service providers, social media, and customer education materials.',
      location: 'Kigali, Gasabo',
      salaryRange: '200,000 RWF/month stipend',
      deadline: new Date('2026-09-28T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
    {
      title: 'Field Logistics Coordinator',
      description: 'Coordinate survey appointments, route planning, equipment handoffs, and field-team communication for land and property assignments.',
      location: 'Kigali and nationwide',
      salaryRange: '550,000 - 800,000 RWF/month',
      deadline: new Date('2026-10-12T23:59:59.000Z'),
      status: 'PUBLISHED',
    },
  ];

  const seededJobs = [];
  for (const sampleJob of sampleJobs) {
    const existingJob = await prisma.job.findFirst({
      where: { title: sampleJob.title, employerId: clientTwo.id },
    });
    const job = existingJob || await prisma.job.create({
      data: { employerId: clientTwo.id, ...sampleJob },
    });
    seededJobs.push(job);
  }

  const firstPublishedJob = seededJobs.find((job) => job.status === 'PUBLISHED');
  if (firstPublishedJob) {
    const existingApplication = await prisma.jobApplication.findFirst({
      where: { jobId: firstPublishedJob.id, clientId: clientThree.id },
    });
    if (!existingApplication) {
      await prisma.jobApplication.create({
        data: {
          jobId: firstPublishedJob.id,
          clientId: clientThree.id,
          cvUrl: 'https://example.com/demo-eric-niyonzima-cv.pdf',
          status: 'submitted',
        },
      });
    }
  }

  console.log('Seeded Jobs and sample application');

  // 5. Market Items with Rich Sample Media
  await prisma.marketItemMedia.deleteMany({});
  await prisma.marketItem.deleteMany({});

  const marketItemsData = [
    {
      sellerId: client.id,
      category: 'Electronics',
      title: 'Apple MacBook Pro M3 (16GB RAM, 512GB SSD) & iPhone Bundle',
      description: 'Barely used M3 MacBook Pro in pristine space grey condition, complete with original box, fast charger, and matching accessories.',
      price: 1850000,
      currency: 'RWF',
      district: 'Gasabo',
      sector: 'Kacyiru',
      status: 'PUBLISHED',
      isPromoted: true,
      media: {
        create: [
          { url: '/images/market_electronics.jpg', sortOrder: 0 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Electronics',
      title: 'Flagship 5G Smartphone 256GB with Quad Ultra-HD Camera',
      description: 'Brand new in sealed box flagship smartphone. Features 6.7-inch AMOLED 120Hz display, 256GB storage, 5000mAh battery with 67W fast charging, and 1-year official warranty.',
      price: 680000,
      currency: 'RWF',
      district: 'Nyarugenge',
      sector: 'Nyarugenge',
      status: 'PUBLISHED',
      isPromoted: true,
      media: {
        create: [
          { url: '/images/market_smartphone.jpg', sortOrder: 0 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Solar & Energy',
      title: '5kW Hybrid Solar Home Power System with Lithium Battery & High-Efficiency Panels',
      description: 'Complete all-in-one solar backup energy system. Includes 5kW pure sine hybrid inverter, 48V 100Ah LiFePO4 lithium battery, 8x 450W monocrystalline solar panels, and mounting hardware.',
      price: 3400000,
      currency: 'RWF',
      district: 'Gasabo',
      sector: 'Remera',
      status: 'PUBLISHED',
      isPromoted: true,
      media: {
        create: [
          { url: '/images/market_solar_system.jpg', sortOrder: 0 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Furniture',
      title: 'Handcrafted Modern Hardwood Living Room Sofa & Coffee Table Set',
      description: 'Solid mahogany wood frame with high-density foam cushions and water-resistant fabric. Includes 3-seater sofa, 2 accent armchairs, and matching live-edge coffee table.',
      price: 650000,
      currency: 'RWF',
      district: 'Kicukiro',
      sector: 'Niboye',
      status: 'PUBLISHED',
      media: {
        create: [
          { url: '/images/market_furniture.jpg', sortOrder: 0 },
          { url: '/images/house_living_room.jpg', sortOrder: 1 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Art & Crafts',
      title: 'Authentic Rwandan Handcrafted Imigongo Geometric Wall Art & Agaseke Baskets Set',
      description: 'Exquisite traditional Rwandan Imigongo pattern wall art panel handcrafted with organic natural pigments, accompanied by two fine handwoven Agaseke peace baskets.',
      price: 85000,
      currency: 'RWF',
      district: 'Gasabo',
      sector: 'Kimihurura',
      status: 'PUBLISHED',
      isPromoted: true,
      media: {
        create: [
          { url: '/images/market_crafts_art.jpg', sortOrder: 0 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Construction',
      title: 'Certified High-Tensile TMT Steel Rebars (12mm/16mm) & Premium Cement Pallets',
      description: 'RSB certified high-tensile construction steel rebars and 42.5N grade Portland cement pallets. Direct factory pricing with site delivery available across Kigali and provinces.',
      price: 950000,
      currency: 'RWF',
      district: 'Gasabo',
      sector: 'Gisozi',
      status: 'PUBLISHED',
      media: {
        create: [
          { url: '/images/market_construction.jpg', sortOrder: 0 },
        ],
      },
    },
    {
      sellerId: client.id,
      category: 'Produce',
      title: 'Single-Origin Rwandan Arabica Bourbon Coffee & Organic Highland Tea Gift Box',
      description: 'Freshly roasted high-altitude specialty Arabica Bourbon beans from Huye Mountain cooperative (Cupping Score 88+) paired with organic Silver Needle green tea.',
      price: 25000,
      currency: 'RWF',
      district: 'Nyarugenge',
      sector: 'Muhima',
      status: 'PUBLISHED',
      media: {
        create: [
          { url: '/images/market_agro_products.jpg', sortOrder: 0 },
          { url: '/images/market_produce.jpg', sortOrder: 1 },
        ],
      },
    },
  ];

  for (const marketItem of marketItemsData) {
    await prisma.marketItem.create({ data: marketItem });
  }

  console.log(`Seeded ${marketItemsData.length} Marketplace Items with sample media`);

  // 6. Service Providers
  await prisma.serviceProvider.deleteMany({});

  const providersData = [
    {
      userId: agent.id,
      category: 'GIS & Land Surveying',
      description: 'Licensed professional land surveyor accredited by RLMUA. Specializing in GPS RTK cadastral boundary demarcation, drone aerial mapping, contour topographic surveys, and subdivision plans.',
      coverageDistrict: 'Kigali & Nationwide',
      coverageSector: 'All Sectors',
      rateInfo: 'Starting at 150,000 RWF per parcel survey',
      status: 'PUBLISHED',
      isPromoted: true,
    },
    {
      userId: electricianUser.id,
      category: 'Electrician & Solar',
      description: 'Certified master electrician with 10+ years experience in commercial & domestic wiring, 3-phase distribution boards, solar inverter systems, and backup generator changeover panels.',
      coverageDistrict: 'Kigali (Gasabo, Kicukiro, Nyarugenge)',
      coverageSector: 'All Sectors',
      rateInfo: 'Inspection from 25,000 RWF',
      status: 'PUBLISHED',
      isPromoted: true,
    },
    {
      userId: painterUser.id,
      category: 'Painting & Decorating',
      description: 'Expert interior and exterior architectural painting, decorative plastering, moisture-proofing, and high-end modern residential finishes.',
      coverageDistrict: 'Kigali & Southern Province',
      coverageSector: 'All Sectors',
      rateInfo: '3,500 RWF / m²',
      status: 'PUBLISHED',
      isPromoted: false,
    },
    {
      userId: mechanicUser.id,
      category: 'Automotive & Mechanic',
      description: 'Specialized mobile vehicle diagnostics, engine overhauls, electronic ECU programming, suspension repairs, and pre-purchase vehicle technical inspections.',
      coverageDistrict: 'Kigali & Eastern Province',
      coverageSector: 'All Sectors',
      rateInfo: 'Diagnostic scan from 20,000 RWF',
      status: 'PUBLISHED',
      isPromoted: false,
    },
    {
      userId: cateringUser.id,
      category: 'Catering & Events',
      description: 'Bespoke corporate event catering, private chef dining experiences, wedding banquets, and cocktail party hors d\'oeuvres with Rwandan and international cuisine.',
      coverageDistrict: 'Nationwide',
      coverageSector: 'All Sectors',
      rateInfo: 'From 12,000 RWF per guest plate',
      status: 'PUBLISHED',
      isPromoted: true,
    },
  ];

  for (const provider of providersData) {
    await prisma.serviceProvider.create({ data: provider });
  }

  console.log(`Seeded ${providersData.length} Verified Service Providers`);
  console.log('Seeding completed successfully with all rich sample media!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
