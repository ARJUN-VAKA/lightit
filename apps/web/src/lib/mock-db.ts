/**
 * In-memory mock database for LightIt demo mode.
 * Uses globalThis so data survives Next.js hot-reloads in dev.
 */

export interface MockUser {
  id: string;
  email: string;
  password: string; // plain text for demo only
  role: 'FOUNDER' | 'INVESTOR' | 'ADMIN';
  name: string;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  createdAt: string;
  // Founder extras
  startup?: {
    name: string;
    sector: string[];
    stage: string;
    fundingRequired: number;
    mrr: number;
    arr: number;
    fundingReadyScore: number;
    tagline: string;
    location: string;
  };
  // Investor extras
  investmentCapacityMin?: number;
  investmentCapacityMax?: number;
  preferredSectors?: string[];
  totalInvested?: number;
  investmentCount?: number;
  trustScore?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __lightit_users: Map<string, MockUser> | undefined;
}

function initDb(): Map<string, MockUser> {
  const db = new Map<string, MockUser>();

  // ── Seed: Admin ───────────────────────────────────────────
  db.set('admin@lightit.io', {
    id: 'admin-001',
    email: 'admin@lightit.io',
    password: 'Admin@LightIt2025!',
    role: 'ADMIN',
    name: 'LightIt Admin',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  });

  // ── Seed: Demo Founder ────────────────────────────────────
  db.set('founder@demo.com', {
    id: 'founder-001',
    email: 'founder@demo.com',
    password: 'Founder@Demo2025!',
    role: 'FOUNDER',
    name: 'Sarah Chen',
    phone: '+1-555-0100',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    startup: {
      name: 'NeuroSync AI',
      tagline: 'Personalized mental health AI for everyone',
      sector: ['AI/ML', 'HealthTech', 'SaaS'],
      stage: 'SEED',
      fundingRequired: 3_000_000,
      mrr: 45_000,
      arr: 540_000,
      fundingReadyScore: 88,
      location: 'San Francisco, CA',
    },
  });

  // ── Seed: Demo Investor ───────────────────────────────────
  db.set('investor@demo.com', {
    id: 'investor-001',
    email: 'investor@demo.com',
    password: 'Investor@Demo2025!',
    role: 'INVESTOR',
    name: 'Marcus Rivera',
    company: 'Apex Ventures',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    investmentCapacityMin: 1_000_000,
    investmentCapacityMax: 15_000_000,
    preferredSectors: ['AI/ML', 'SaaS', 'HealthTech', 'FinTech'],
    totalInvested: 84_000_000,
    investmentCount: 28,
    trustScore: 97,
  });

  return db;
}

export function getMockDb(): Map<string, MockUser> {
  if (!globalThis.__lightit_users) {
    globalThis.__lightit_users = initDb();
  }
  return globalThis.__lightit_users;
}

/** Create a lightweight demo JWT (base64 encoded, NOT secure — demo only) */
export function createDemoToken(user: MockUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return `demo.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;
}

/** Decode a demo token back to payload */
export function decodeDemoToken(token: string): { id: string; email: string; role: string; name: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'demo') return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
