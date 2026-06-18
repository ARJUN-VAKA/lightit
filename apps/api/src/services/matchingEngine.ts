import { prisma } from '../lib/prisma';
import { setCache, getCache } from '../lib/redis';

// ─────────────────────────────────────────────────────────────
// Matching Weights (must sum to 1.0)
// ─────────────────────────────────────────────────────────────
const WEIGHTS = {
  sector: 0.35,
  funding: 0.20,
  stage: 0.15,
  location: 0.10,
  riskAppetite: 0.10,
  behavior: 0.10,
};

// ─────────────────────────────────────────────────────────────
// Sector Match (Jaccard Similarity)
// ─────────────────────────────────────────────────────────────
function sectorMatch(startupSectors: string[], investorSectors: string[]): number {
  if (!startupSectors.length || !investorSectors.length) return 0;
  const set1 = new Set(startupSectors.map((s) => s.toLowerCase()));
  const set2 = new Set(investorSectors.map((s) => s.toLowerCase()));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return (intersection.size / union.size) * 100;
}

// ─────────────────────────────────────────────────────────────
// Funding Match (Overlap ratio)
// ─────────────────────────────────────────────────────────────
function fundingMatch(
  required: number,
  investorMin: number,
  investorMax: number
): number {
  if (required >= investorMin && required <= investorMax) return 100;
  if (required < investorMin) {
    const ratio = required / investorMin;
    return Math.max(0, ratio * 70);
  }
  // required > investorMax
  const overRatio = investorMax / required;
  return Math.max(0, overRatio * 50);
}

// ─────────────────────────────────────────────────────────────
// Stage Match
// ─────────────────────────────────────────────────────────────
const STAGE_RANK: Record<string, number> = {
  IDEA: 1, PRE_SEED: 2, SEED: 3, SERIES_A: 4, SERIES_B: 5, GROWTH: 6, IPO_READY: 7,
};

function stageMatch(startupStage: string, investorStages: string[]): number {
  if (investorStages.includes('ANY')) return 100;
  if (investorStages.includes(startupStage)) return 100;
  const startupRank = STAGE_RANK[startupStage] || 0;
  const closestDistance = Math.min(
    ...investorStages.map((s) => Math.abs((STAGE_RANK[s] || 0) - startupRank))
  );
  return Math.max(0, 100 - closestDistance * 25);
}

// ─────────────────────────────────────────────────────────────
// Location Match
// ─────────────────────────────────────────────────────────────
function locationMatch(startupCountry: string | null, investorLocations: string[]): number {
  if (!startupCountry || !investorLocations.length) return 50; // neutral
  const country = startupCountry.toLowerCase();
  if (investorLocations.some((loc) => loc.toLowerCase() === country)) return 100;
  if (investorLocations.some((loc) => loc.toLowerCase() === 'worldwide')) return 80;
  return 20;
}

// ─────────────────────────────────────────────────────────────
// Risk Appetite Match
// ─────────────────────────────────────────────────────────────
const RISK_RANK: Record<string, number> = {
  CONSERVATIVE: 1, MODERATE: 2, AGGRESSIVE: 3,
};

function riskMatch(startupStage: string, investorRisk: string): number {
  // Early stage needs aggressive investors
  const stageRank = STAGE_RANK[startupStage] || 3;
  const riskRank = RISK_RANK[investorRisk] || 2;

  // Earlier stage = needs more aggressive investors
  const idealRisk = stageRank <= 2 ? 3 : stageRank <= 4 ? 2 : 1;
  const diff = Math.abs(riskRank - idealRisk);
  return Math.max(0, 100 - diff * 40);
}

// ─────────────────────────────────────────────────────────────
// Behavior Score (from platform interactions)
// ─────────────────────────────────────────────────────────────
async function behaviorScore(startupId: string, investorId: string): Promise<number> {
  // Check for previous watchlist, profile views, event co-attendance
  const [watchlistItem] = await Promise.all([
    prisma.watchlistItem.findUnique({ where: { investorId_startupId: { investorId, startupId } } }),
  ]);

  let score = 50; // base neutral
  if (watchlistItem) score += 30;
  return Math.min(100, score);
}

// ─────────────────────────────────────────────────────────────
// Generate Match Reasons
// ─────────────────────────────────────────────────────────────
function generateMatchReasons(scores: {
  sector: number;
  funding: number;
  stage: number;
  location: number;
  riskAppetite: number;
}): string[] {
  const reasons: string[] = [];
  if (scores.sector >= 70) reasons.push('Strong sector alignment with investor portfolio');
  if (scores.funding >= 80) reasons.push('Funding requirement fits investor capacity');
  if (scores.stage >= 80) reasons.push('Startup stage matches investor preference');
  if (scores.location >= 80) reasons.push('Geographic preference match');
  if (scores.riskAppetite >= 70) reasons.push('Risk appetite compatible with startup stage');
  if (scores.sector >= 50 && scores.funding >= 50) reasons.push('Well-rounded match across key criteria');
  return reasons.length > 0 ? reasons : ['Potential opportunity based on portfolio diversity'];
}

// ─────────────────────────────────────────────────────────────
// Generate Conversation Starters
// ─────────────────────────────────────────────────────────────
function generateConversationStarters(startupName: string, sectors: string[]): string[] {
  return [
    `I noticed ${startupName} is disrupting the ${sectors[0] || 'industry'} space. What's your biggest competitive advantage?`,
    `What's your current MRR and growth rate over the last 3 months?`,
    `What would the funding be used for and what milestones would it unlock?`,
    `Who are your key team members and what makes them uniquely qualified?`,
  ];
}

// ─────────────────────────────────────────────────────────────
// Core: Calculate Single Match Score
// ─────────────────────────────────────────────────────────────
export async function calculateMatchScore(
  startup: {
    id: string;
    sector: string[];
    stage: string;
    fundingRequired: number;
    country: string | null;
    name: string;
  },
  investor: {
    id: string;
    preferredSectors: string[];
    preferredStages: string[];
    investmentCapacityMin: number;
    investmentCapacityMax: number;
    preferredLocations: string[];
    riskAppetite: string;
  }
) {
  let startupSectors: string[] = [];
  try { startupSectors = typeof startup.sector === 'string' ? JSON.parse(startup.sector) : startup.sector; } catch { startupSectors = [startup.sector as unknown as string]; }

  let investorSectors: string[] = [];
  try { investorSectors = typeof investor.preferredSectors === 'string' ? JSON.parse(investor.preferredSectors) : investor.preferredSectors; } catch { investorSectors = [investor.preferredSectors as unknown as string]; }

  let investorStages: string[] = [];
  try { investorStages = typeof investor.preferredStages === 'string' ? JSON.parse(investor.preferredStages) : investor.preferredStages; } catch { investorStages = [investor.preferredStages as unknown as string]; }

  let investorLocations: string[] = [];
  try { investorLocations = typeof investor.preferredLocations === 'string' ? JSON.parse(investor.preferredLocations) : investor.preferredLocations; } catch { investorLocations = [investor.preferredLocations as unknown as string]; }

  const scores = {
    sector: sectorMatch(startupSectors || [], investorSectors || []),
    funding: fundingMatch(
      startup.fundingRequired,
      investor.investmentCapacityMin,
      investor.investmentCapacityMax
    ),
    stage: stageMatch(startup.stage, investorStages || []),
    location: locationMatch(startup.country, investorLocations || []),
    riskAppetite: riskMatch(startup.stage, investor.riskAppetite),
    behavior: await behaviorScore(startup.id, investor.id),
  };

  const totalScore =
    scores.sector * WEIGHTS.sector +
    scores.funding * WEIGHTS.funding +
    scores.stage * WEIGHTS.stage +
    scores.location * WEIGHTS.location +
    scores.riskAppetite * WEIGHTS.riskAppetite +
    scores.behavior * WEIGHTS.behavior;

  return {
    score: Math.round(totalScore),
    sectorScore: Math.round(scores.sector),
    fundingScore: Math.round(scores.funding),
    stageScore: Math.round(scores.stage),
    locationScore: Math.round(scores.location),
    riskScore: Math.round(scores.riskAppetite),
    behaviorScore: Math.round(scores.behavior),
    matchReasons: generateMatchReasons(scores),
    suggestedStarters: generateConversationStarters(startup.name, startup.sector),
  };
}

// ─────────────────────────────────────────────────────────────
// Compute Matches for an Investor
// ─────────────────────────────────────────────────────────────
export async function computeInvestorRecommendations(investorId: string) {
  const cacheKey = `matches:investor:${investorId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const investor = await prisma.investor.findUnique({ where: { id: investorId } });
  if (!investor) throw new Error('Investor not found');

  const startups = await prisma.startup.findMany({
    where: { isApproved: true },
    select: {
      id: true,
      name: true,
      sector: true,
      stage: true,
      fundingRequired: true,
      country: true,
      tagline: true,
      logoUrl: true,
      foundingReadyScore: true,
      founder: { select: { name: true, trustScore: true } },
    } as any,
    take: 200,
  });

  const matchResults = await Promise.all(
    startups.map(async (startup: any) => {
      const matchData = await calculateMatchScore(startup, investor as any);
      return { startup, ...matchData };
    })
  );

  const sorted = matchResults
    .filter((m) => m.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  // Upsert matches into DB
  await Promise.all(
    sorted.map((m) =>
      prisma.match.upsert({
        where: { startupId_investorId: { startupId: m.startup.id, investorId } },
        update: {
          score: m.score,
          sectorScore: m.sectorScore,
          fundingScore: m.fundingScore,
          stageScore: m.stageScore,
          locationScore: m.locationScore,
          riskScore: m.riskScore,
          behaviorScore: m.behaviorScore,
          matchReasons: JSON.stringify(m.matchReasons),
          suggestedStarters: JSON.stringify(m.suggestedStarters),
        },
        create: {
          startupId: m.startup.id,
          investorId,
          score: m.score,
          sectorScore: m.sectorScore,
          fundingScore: m.fundingScore,
          stageScore: m.stageScore,
          locationScore: m.locationScore,
          riskScore: m.riskScore,
          behaviorScore: m.behaviorScore,
          matchReasons: JSON.stringify(m.matchReasons),
          suggestedStarters: JSON.stringify(m.suggestedStarters),
        },
      })
    )
  );

  await setCache(cacheKey, sorted, 3600); // Cache 1 hour
  return sorted;
}

// ─────────────────────────────────────────────────────────────
// Compute Matches for a Founder (reverse — which investors match)
// ─────────────────────────────────────────────────────────────
export async function computeFounderMatches(founderId: string) {
  const cacheKey = `matches:founder:${founderId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: { startup: true },
  });

  if (!founder?.startup) return [];

  const investors = await prisma.investor.findMany({
    where: { isVerified: true },
    take: 200,
  });

  const matchResults = await Promise.all(
    investors.map(async (investor) => {
      const matchData = await calculateMatchScore(founder.startup as any, investor as any);
      return { investor, ...matchData };
    })
  );

  const sorted = matchResults
    .filter((m) => m.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  await setCache(cacheKey, sorted, 3600);
  return sorted;
}
