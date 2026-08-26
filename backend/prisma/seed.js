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

  console.log('Seeded Users: Admin, Manager, Agent/Surveyor, Client');

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

  console.log('Seeded additional demo users: Employer and Applicant');

  // 2. Listings
  const listing1 = await prisma.listing.create({
    data: {
      agentId: agent.id,
      category: 'HOUSE',
      listingType: 'SALE',
      price: 185000000,
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
            title: 'Modern 4-Bedroom Luxury Villa with Garden in Nyarutarama',
            description: 'Stunning 4-bedroom villa featuring modern architecture, expansive glass balconies, manicured lawn garden, paved parking for 4 cars, staff quarters, and high-end modern kitchen fittings.',
          },
          {
            languageCode: 'RW',
            title: 'Inzu nziza y\'akataraboneka y\'ibyumba 4 i Nyarutarama',
            description: 'Inzu y\'akataraboneka ifite ibyumba 4, ubwogero 4, ubusitani bwiza cyane, parikingi y\'imodoka 4, n\'igikoni kigezweho cyuzuye.',
          },
          {
            languageCode: 'SW',
            title: 'Nyumba ya kisasa ya kifahari yenye vyumba 4 Nyarutarama',
            description: 'Nyumba ya kifahari yenye vyumba 4 vya kulala, bustani nzuri, maegesho ya magari 4 na jiko la kisasa lililo na vifaa vyote.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'bedrooms', value: '4' },
          { key: 'bathrooms', value: '4' },
          { key: 'land_size_sqm', value: '650' },
          { key: 'furnished', value: 'Semi-Furnished' },
        ],
      },
      media: {
        create: [
          { url: '/images/house_kigali_modern.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
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
            title: 'Executive 3-Bedroom Serviced Apartment with Pool in Kimihurura',
            description: 'Fully furnished executive apartment located in prime Kimihurura. Includes access to swimming pool, 24/7 security, backup generator, high-speed WiFi, and panoramic city views.',
          },
          {
            languageCode: 'RW',
            title: 'Aparitoma nziza yo gukodesha ifite pisine i Kimihurura',
            description: 'Aparitoma yuzuye ibikoresho byose i Kimihurura. Ifite pisine, umutekano w\'amasaha 24, moteri y\'amashanyarazi na interineti yihuta.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'bedrooms', value: '3' },
          { key: 'bathrooms', value: '2' },
          { key: 'area', value: '180 m²' },
          { key: 'furnished', value: 'Furnished' },
        ],
      },
      media: {
        create: [
          { url: '/images/apartment_kigali.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
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
            title: 'Surveyed Residential Plot (800 m²) with UPI Title in Kagarama',
            description: 'Prime titled land plot zoned R1A for residential construction. Fully surveyed with verified GIS cadastral boundaries, water & electricity on site, and gentle slope.',
          },
          {
            languageCode: 'RW',
            title: 'Ikibanza cyapimwe gifite UPI (800 m²) i Kagarama',
            description: 'Ikibanza cyapimwe neza gifite ibyangombwa bya UPI. Kirimo amazi n\'amashanyarazi, kiberanye no kubaka inzu yo guturamo.',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'land_size_sqm', value: '800' },
          { key: 'zoning', value: 'R1A Residential' },
          { key: 'title_deed', value: 'Clean Freehold UPI' },
        ],
      },
      media: {
        create: [
          { url: '/images/land_parcel_rwanda.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
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
            description: 'Reliable all-wheel-drive Toyota RAV4 in excellent condition. Ideal for Kigali commuting, countryside trips, and safari tours. Comprehensive insurance included.',
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
        ],
      },
      media: {
        create: [
          { url: '/images/car_suv_rental.jpg', type: 'photo', sortOrder: 0, isPublic: true },
        ],
      },
    },
  });

  console.log('Seeded Properties & Vehicles');

  // 3. GIS Requests
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

  console.log('Seeded GIS Requests with GeoJSON boundaries');

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

  console.log('Seeded Jobs and one sample application');

  // 5. Market Items
  await prisma.marketItem.create({
    data: {
      sellerId: client.id,
      category: 'Electronics',
      title: 'Apple MacBook Pro M3 (16GB RAM, 512GB SSD) & iPhone Bundle',
      description: 'Barely used M3 MacBook Pro in pristine space grey condition, complete with original box and fast charger.',
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
  });

  await prisma.marketItem.create({
    data: {
      sellerId: client.id,
      category: 'Furniture',
      title: 'Handcrafted Modern Hardwood Living Room Sofa & Coffee Table Set',
      description: 'Solid mahogany wood frame with high-density foam cushions and water-resistant fabric.',
      price: 650000,
      currency: 'RWF',
      district: 'Kicukiro',
      sector: 'Niboye',
      status: 'PUBLISHED',
      media: {
        create: [
          { url: '/images/market_furniture.jpg', sortOrder: 0 },
        ],
      },
    },
  });

  await prisma.marketItem.create({
    data: {
      sellerId: client.id,
      category: 'Produce',
      title: 'Single-Origin Rwandan Arabica Bourbon Coffee Beans (Export Grade 1)',
      description: 'Freshly roasted high-altitude specialty coffee from Huye Mountain cooperative.',
      price: 12000,
      currency: 'RWF',
      district: 'Nyarugenge',
      sector: 'Muhima',
      status: 'PUBLISHED',
      media: {
        create: [
          { url: '/images/market_produce.jpg', sortOrder: 0 },
        ],
      },
    },
  });

  // 6. Service Providers
  await prisma.serviceProvider.upsert({
    where: { userId: agent.id },
    update: {},
    create: {
      userId: agent.id,
      category: 'GIS & Land Surveying',
      description: 'Licensed professional land surveyor accredited by RLMUA. Specializing in GPS RTK cadastral boundary demarcation, drone aerial mapping, and subdivision plans.',
      coverageDistrict: 'Kigali & Eastern Province',
      coverageSector: 'All Sectors',
      rateInfo: 'Starting at 150,000 RWF per parcel survey',
      status: 'PUBLISHED',
      isPromoted: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
