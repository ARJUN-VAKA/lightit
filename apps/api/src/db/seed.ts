import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding LightIt database...');

  // Create Admin
  const adminHash = await bcrypt.hash('Admin@LightIt2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lightit.io' },
    update: {},
    create: {
      email: 'admin@lightit.io',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create demo Founder
  const founderHash = await bcrypt.hash('Founder@Demo2025!', 12);
  const founderUser = await prisma.user.upsert({
    where: { email: 'founder@demo.com' },
    update: {},
    create: {
      email: 'founder@demo.com',
      passwordHash: founderHash,
      role: 'FOUNDER',
      status: 'ACTIVE',
      emailVerified: true,
      founder: {
        create: {
          name: 'Sarah Chen',
          phone: '+1-555-0100',
          bio: 'Serial entrepreneur, ex-Google AI researcher. Building the future of mental health tech.',
          location: 'San Francisco',
          country: 'US',
          trustScore: 92,
          profileComplete: 95,
          startup: {
            create: {
              name: 'NeuroSync AI',
              tagline: 'Personalized mental health AI for everyone',
              description: 'NeuroSync AI uses advanced machine learning to provide personalized mental health support, therapy scheduling, and crisis intervention at scale.',
              sector: JSON.stringify(['AI/ML', 'HealthTech', 'SaaS']),
              stage: 'SEED',
              fundingRequired: 3000000,
              teamSize: 8,
              website: 'https://neurosync.ai',
              country: 'US',
              location: 'San Francisco, CA',
              fundingReadyScore: 88,
              isApproved: true,
              mrr: 45000,
              arr: 540000,
            },
          },
        },
      },
    },
  });
  console.log('✅ Demo Founder created:', founderUser.email);

  // Create demo Investor
  const investorHash = await bcrypt.hash('Investor@Demo2025!', 12);
  const investorUser = await prisma.user.upsert({
    where: { email: 'investor@demo.com' },
    update: {},
    create: {
      email: 'investor@demo.com',
      passwordHash: investorHash,
      role: 'INVESTOR',
      status: 'ACTIVE',
      emailVerified: true,
      investor: {
        create: {
          name: 'Marcus Rivera',
          company: 'Apex Ventures',
          designation: 'Managing Partner',
          bio: 'Stage-agnostic investor with focus on AI, SaaS, and HealthTech. 15+ years in VC.',
          location: 'New York',
          country: 'US',
          investmentCapacityMin: 1000000,
          investmentCapacityMax: 15000000,
          preferredSectors: JSON.stringify(['AI/ML', 'SaaS', 'HealthTech', 'FinTech']),
          preferredLocations: JSON.stringify(['US', 'UK', 'Canada', 'India']),
          preferredStages: JSON.stringify(['SEED', 'SERIES_A']),
          riskAppetite: 'AGGRESSIVE',
          investmentCount: 28,
          totalInvested: 84000000,
          trustScore: 97,
          profileComplete: 98,
          isVerified: true,
        },
      },
    },
  });
  console.log('✅ Demo Investor created:', investorUser.email);

  // Create upcoming events
  await prisma.event.createMany({
    data: [
      {
        title: 'Global Pitch Day 2025',
        description: 'The world\'s largest virtual startup pitch competition. 200+ startups, 100+ investors, $500K in prizes.',
        eventType: 'PITCH_COMPETITION',
        status: 'UPCOMING',
        isVirtual: true,
        startDate: new Date('2025-07-20T09:00:00Z'),
        endDate: new Date('2025-07-20T18:00:00Z'),
        registrationDeadline: new Date('2025-07-10T23:59:59Z'),
        founderFee: 99,
        investorFee: 0,
        prizePool: 500000,
        maxParticipants: 200,
        sponsorLogos: '[]',
      },
      {
        title: 'CleanTech Summit 2025',
        description: 'Showcasing the next generation of climate and sustainability startups.',
        eventType: 'DEMO_DAY',
        status: 'UPCOMING',
        isVirtual: false,
        location: 'San Francisco, CA',
        startDate: new Date('2025-08-05T10:00:00Z'),
        endDate: new Date('2025-08-05T17:00:00Z'),
        registrationDeadline: new Date('2025-07-25T23:59:59Z'),
        founderFee: 199,
        investorFee: 0,
        prizePool: 250000,
        maxParticipants: 50,
        sponsorLogos: '[]',
      },
    ],
  });
  console.log('✅ Events seeded');

  // Create sample ads
  await prisma.advertisement.create({
    data: {
      title: 'Scale Your Startup with AWS',
      description: '$5,000 in AWS credits for LightIt startups',
      imageUrl: 'https://via.placeholder.com/1200x400/050505/0ea5e9?text=AWS+for+Startups',
      linkUrl: 'https://aws.amazon.com/startups',
      adType: 'HOMEPAGE_BANNER',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: 10000,
      targetSectors: '[]',
      targetCountries: '[]',
    },
  });
  console.log('✅ Sample ads created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Admin:    admin@lightit.io / Admin@LightIt2025!');
  console.log('   Founder:  founder@demo.com / Founder@Demo2025!');
  console.log('   Investor: investor@demo.com / Investor@Demo2025!');
}

seed()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
