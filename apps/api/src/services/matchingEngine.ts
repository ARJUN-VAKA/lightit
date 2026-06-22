import { prisma } from '../lib/prisma';
import { setCache, getCache } from '../lib/redis';

const WEIGHTS = {
  sector: 0.25,
  funding: 0.15,
  stage: 0.10,
  location: 0.08,
  riskAppetite: 0.07,
  behavior: 0.08,
  textRelevance: 0.08,
  traction: 0.08,
  founderQuality: 0.06,
  marketPotential: 0.05,
};

const STAGE_RANK: Record<string, number> = {
  IDEA: 1, PRE_SEED: 2, SEED: 3, SERIES_A: 4, SERIES_B: 5, GROWTH: 6, IPO_READY: 7,
};

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const set1 = new Set(a.map((s) => s.toLowerCase().trim()));
  const set2 = new Set(b.map((s) => s.toLowerCase().trim()));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return (intersection.size / union.size) * 100;
}

function textRelevanceScore(
  startupDescription: string,
  startupSectors: string[],
  investorBio: string,
  investorSectors: string[]
): number {
  const desc = (startupDescription || '').toLowerCase();
  const bio = (investorBio || '').toLowerCase();

  let score = 0;
  let totalChecks = 0;

  const keywordMap: Record<string, string[]> = {
    'AI/ML': ['artificial intelligence', 'machine learning', 'deep learning', 'neural', 'nlp', 'computer vision', 'ai', 'ml', 'llm', 'gpt', 'transformer', 'tensor', 'pytorch', 'model training', 'algorithm'],
    'SaaS': ['saas', 'subscription', 'cloud', 'platform', 'multi-tenant', 'software as a service', 'b2b', 'b2c saas'],
    'FinTech': ['fintech', 'financial', 'payment', 'banking', 'blockchain', 'crypto', 'lending', 'insurance', 'wealth', 'trading', 'payments', 'remittance'],
    'HealthTech': ['health', 'healthcare', 'medical', 'clinical', 'patient', 'therapy', 'wellness', 'mental health', 'hospital', 'diagnostics', 'telehealth'],
    'CleanTech': ['clean', 'energy', 'solar', 'wind', 'carbon', 'sustainability', 'climate', 'renewable', 'green', 'environmental', 'net zero'],
    'EdTech': ['education', 'learning', 'training', 'student', 'course', 'academic', 'skill', 'classroom', 'e-learning', 'edtech'],
    'DeepTech': ['hardware', 'robotics', 'quantum', 'biotech', 'semiconductor', 'computing', 'manufacturing', 'patent', 'r&d', 'research'],
  };

  const startupKeywords = new Set<string>();
  for (const sector of startupSectors) {
    const sectorWords = keywordMap[sector] || [];
    for (const kw of sectorWords) {
      if (desc.includes(kw)) startupKeywords.add(kw);
    }
  }

  for (const sector of investorSectors) {
    const sectorWords = keywordMap[sector] || [];
    for (const kw of sectorWords) {
      if (bio.includes(kw)) {
        if (startupKeywords.has(kw)) {
          score += 15;
        }
        totalChecks++;
      }
    }
  }

  if (investorSectors.length > 0 && startupSectors.length > 0) {
    const sectorOverlap = startupSectors.filter(s =>
      investorSectors.some(is => is.toLowerCase() === s.toLowerCase())
    );
    if (sectorOverlap.length > 0) {
      score += sectorOverlap.length * 10;
    }
  }

  if (desc && bio) {
    const descWords = new Set(desc.split(/\W+/).filter(w => w.length > 3));
    const bioWords = new Set(bio.split(/\W+/).filter(w => w.length > 3));
    const commonWords = [...descWords].filter(w => bioWords.has(w)).length;
    const totalUnique = new Set([...descWords, ...bioWords]).size;
    if (totalUnique > 0) {
      score += (commonWords / totalUnique) * 30;
    }
  }

  return Math.min(100, Math.round(score));
}

function tractionScore(startup: {
  fundingRequired: number;
  fundingRaised: number;
  teamSize: number;
  fundingReadyScore: number;
  mrr: number | null;
  arr: number | null;
  stage: string;
}): number {
  let score = 0;

  const stageRank = STAGE_RANK[startup.stage] || 3;

  if (startup.mrr && startup.mrr > 0) {
    if (startup.mrr >= 100000) score += 30;
    else if (startup.mrr >= 50000) score += 25;
    else if (startup.mrr >= 10000) score += 20;
    else if (startup.mrr >= 1000) score += 10;
    else score += 5;
  } else if (stageRank <= 2) {
    score += 10;
  }

  if (startup.arr && startup.arr > 0) {
    if (startup.arr >= 1000000) score += 20;
    else if (startup.arr >= 500000) score += 15;
    else if (startup.arr >= 100000) score += 10;
    else if (startup.arr >= 10000) score += 5;
  } else if (stageRank <= 2) {
    score += 5;
  }

  if (startup.fundingRaised > 0) {
    if (startup.fundingRaised >= 2000000) score += 15;
    else if (startup.fundingRaised >= 500000) score += 12;
    else if (startup.fundingRaised >= 100000) score += 8;
    else score += 5;
  }

  if (startup.teamSize >= 20) score += 15;
  else if (startup.teamSize >= 10) score += 12;
  else if (startup.teamSize >= 5) score += 8;
  else if (startup.teamSize >= 3) score += 5;
  else score += 2;

  score += (startup.fundingReadyScore || 0) * 0.2;

  return Math.min(100, Math.round(score));
}

function marketPotentialScore(
  startup: {
    stage: string;
    fundingRequired: number;
    revenueModel: string | null;
    sector: string[];
    valuation: number | null;
  }
): number {
  let score = 50;

  const stageRank = STAGE_RANK[startup.stage] || 3;

  if (startup.fundingRequired >= 5000000) score += 15;
  else if (startup.fundingRequired >= 1000000) score += 10;
  else if (startup.fundingRequired >= 250000) score += 5;

  const highGrowthSectors = ['AI/ML', 'SaaS', 'FinTech', 'HealthTech', 'DeepTech'];
  const sectorNames = Array.isArray(startup.sector)
    ? startup.sector.map(s => s.toLowerCase())
    : [];
  if (sectorNames.some(s => highGrowthSectors.some(h => h.toLowerCase() === s))) {
    score += 10;
  }

  if (startup.valuation && startup.valuation >= 10000000) score += 15;
  else if (startup.valuation && startup.valuation >= 1000000) score += 8;

  if (startup.revenueModel) {
    const model = startup.revenueModel.toLowerCase();
    if (model.includes('subscription') || model.includes('saas')) score += 10;
    else if (model.includes('marketplace')) score += 8;
    else if (model.includes('freemium')) score += 5;
  }

  if (stageRank === 3 || stageRank === 4) score += 5;

  return Math.min(100, Math.round(score));
}

function founderQualityScore(founder: {
  trustScore: number;
  profileComplete: number;
  name?: string | null;
}): number {
  let score = 0;
  score += (founder.trustScore || 0) * 0.5;
  score += (founder.profileComplete || 0) * 0.3;

  if (founder.trustScore >= 90) score += 10;
  else if (founder.trustScore >= 70) score += 5;

  if (founder.profileComplete >= 80) score += 10;
  else if (founder.profileComplete >= 50) score += 5;

  return Math.min(100, Math.round(score));
}

function sectorMatch(startupSectors: string[], investorSectors: string[]): number {
  return jaccardSimilarity(startupSectors, investorSectors);
}

function fundingMatch(
  required: number,
  investorMin: number,
  investorMax: number
): number {
  if (required >= investorMin && required <= investorMax) return 100;
  if (required < investorMin) {
    const ratio = required / investorMin;
    return Math.max(0, Math.round(ratio * 70));
  }
  const overRatio = investorMax / required;
  return Math.max(0, Math.round(overRatio * 50));
}

function stageMatch(startupStage: string, investorStages: string[]): number {
  if (investorStages.includes('ANY')) return 100;
  if (investorStages.includes(startupStage)) return 100;
  const startupRank = STAGE_RANK[startupStage] || 0;
  const closestDistance = Math.min(
    ...investorStages.map((s) => Math.abs((STAGE_RANK[s] || 0) - startupRank))
  );
  return Math.max(0, 100 - closestDistance * 25);
}

function locationMatch(startupCountry: string | null, investorLocations: string[]): number {
  if (!startupCountry || !investorLocations.length) return 50;
  const country = startupCountry.toLowerCase();
  if (investorLocations.some((loc) => loc.toLowerCase() === country)) return 100;
  if (investorLocations.some((loc) => loc.toLowerCase() === 'worldwide')) return 80;
  return 20;
}

const RISK_RANK: Record<string, number> = {
  CONSERVATIVE: 1, MODERATE: 2, AGGRESSIVE: 3,
};

function riskMatch(startupStage: string, investorRisk: string): number {
  const stageRank = STAGE_RANK[startupStage] || 3;
  const riskRank = RISK_RANK[investorRisk] || 2;
  const idealRisk = stageRank <= 2 ? 3 : stageRank <= 4 ? 2 : 1;
  const diff = Math.abs(riskRank - idealRisk);
  return Math.max(0, 100 - diff * 40);
}

async function behaviorScore(
  startupId: string,
  investorId: string,
  founderId?: string
): Promise<{ score: number; signals: string[] }> {
  const signals: string[] = [];
  let score = 50;

  const [watchlistItem, profileView, eventOverlap, existingMatch] = await Promise.all([
    prisma.watchlistItem.findUnique({
      where: { investorId_startupId: { investorId, startupId } },
    }),
    prisma.analytics.findFirst({
      where: {
        startupId,
        profileViews: { gt: 0 },
      },
    }),
    founderId
      ? prisma.eventRegistration.findFirst({
          where: {
            investorId,
            founder: { id: founderId },
          },
        })
      : Promise.resolve(null),
    prisma.match.findUnique({
      where: { startupId_investorId: { startupId, investorId } },
    }),
  ]);

  if (watchlistItem) {
    score += 20;
    signals.push('Investor saved startup to watchlist');
  }

  if (profileView && profileView.profileViews > 5) {
    score += 10;
    signals.push('High profile view count from investor category');
  }

  if (eventOverlap) {
    score += 10;
    signals.push('Shared event participation');
  }

  if (existingMatch) {
    if (existingMatch.status === 'ACCEPTED') score += 15;
    else if (existingMatch.status === 'PENDING') score += 5;
    signals.push('Previous match interaction exists');
  }

  return { score: Math.min(100, Math.round(score)), signals };
}

function generateMatchReasons(scores: {
  sector: number;
  funding: number;
  stage: number;
  location: number;
  riskAppetite: number;
  textRelevance: number;
  traction: number;
  founderQuality: number;
  marketPotential: number;
}): string[] {
  const reasons: string[] = [];

  if (scores.sector >= 70) reasons.push('Strong sector alignment with investor portfolio');
  else if (scores.sector >= 40) reasons.push('Partial sector overlap — niche opportunity');

  if (scores.funding >= 80) reasons.push('Funding requirement fits investor capacity perfectly');
  else if (scores.funding >= 50) reasons.push('Funding range is within investor comfort zone');

  if (scores.stage >= 80) reasons.push('Startup stage matches investor preference');
  else if (scores.stage >= 50) reasons.push('Stage proximity acceptable to investor');

  if (scores.location >= 80) reasons.push('Geographic preference match');
  else if (scores.location >= 50) reasons.push('Location-neutral match');

  if (scores.riskAppetite >= 70) reasons.push('Risk appetite compatible with startup stage');

  if (scores.textRelevance >= 60) reasons.push('High topical relevance in description vs investor interests');

  if (scores.traction >= 70) reasons.push('Strong traction signals (MRR/growth metrics)');
  else if (scores.traction >= 40) reasons.push('Early but promising traction trajectory');

  if (scores.founderQuality >= 70) reasons.push('Experienced founder with strong profile');
  else if (scores.founderQuality >= 40) reasons.push('Founder has solid foundational credentials');

  if (scores.marketPotential >= 70) reasons.push('Operates in high-growth, high-opportunity market');

  const highScores = Object.entries(scores).filter(([_, v]) => v >= 60).length;
  if (highScores >= 5) reasons.push('Exceptional multi-dimensional match across key criteria');
  else if (highScores >= 3) reasons.push('Well-rounded match across several criteria');

  return reasons.length > 0 ? reasons : ['Potential opportunity based on portfolio diversity'];
}

function generateConversationStarters(
  startupName: string,
  sectors: string[],
  founderName?: string
): string[] {
  const starters: string[] = [];
  starters.push(`I noticed ${startupName} is disrupting the ${sectors[0] || 'industry'} space. What's your biggest competitive advantage?`);
  if (founderName) {
    starters.push(`${founderName}, what inspired you to start ${startupName}?`);
  }
  starters.push(`What's your current MRR and growth rate over the last 3 months?`);
  starters.push(`What would the funding be used for and what milestones would it unlock?`);
  starters.push(`Who are your key team members and what makes them uniquely qualified?`);
  starters.push(`What is your go-to-market strategy and target customer acquisition cost?`);
  return starters;
}

function getConfidenceLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Very High';
  if (score >= 70) return 'High';
  if (score >= 55) return 'Medium-High';
  if (score >= 40) return 'Medium';
  if (score >= 25) return 'Low';
  return 'Very Low';
}

export async function calculateMatchScore(
  startup: {
    id: string;
    sector: string[];
    stage: string;
    fundingRequired: number;
    fundingRaised: number;
    country: string | null;
    name: string;
    description: string | null;
    tagline: string | null;
    teamSize: number | null;
    fundingReadyScore: number | null;
    mrr: number | null;
    arr: number | null;
    revenueModel: string | null;
    valuation: number | null;
  },
  investor: {
    id: string;
    preferredSectors: string[];
    preferredStages: string[];
    investmentCapacityMin: number;
    investmentCapacityMax: number;
    preferredLocations: string[];
    riskAppetite: string;
    bio: string | null;
    company: string | null;
    investmentCount: number | null;
    totalInvested: number | null;
  },
  founder?: {
    name: string | null;
    trustScore: number;
    profileComplete: number;
    bio: string | null;
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

  const description = startup.description || startup.tagline || '';

  const textScore = textRelevanceScore(
    description,
    startupSectors,
    investor.bio || investor.company || '',
    investorSectors
  );

  const founderQuality = founder
    ? founderQualityScore(founder)
    : 50;

  const traction = tractionScore({
    fundingRequired: startup.fundingRequired,
    fundingRaised: startup.fundingRaised || 0,
    teamSize: startup.teamSize || 1,
    fundingReadyScore: startup.fundingReadyScore || 0,
    mrr: startup.mrr,
    arr: startup.arr,
    stage: startup.stage,
  });

  const marketPotential = marketPotentialScore({
    stage: startup.stage,
    fundingRequired: startup.fundingRequired,
    revenueModel: startup.revenueModel,
    sector: startupSectors,
    valuation: startup.valuation,
  });

  const { score: behavior, signals: behaviorSignals } = await behaviorScore(
    startup.id,
    investor.id,
    (founder as any)?.id
  );

  const scores = {
    sector: sectorMatch(startupSectors, investorSectors),
    funding: fundingMatch(
      startup.fundingRequired,
      investor.investmentCapacityMin,
      investor.investmentCapacityMax
    ),
    stage: stageMatch(startup.stage, investorStages),
    location: locationMatch(startup.country, investorLocations),
    riskAppetite: riskMatch(startup.stage, investor.riskAppetite),
    behavior,
    textRelevance: textScore,
    traction,
    founderQuality,
    marketPotential,
  };

  const totalScore =
    scores.sector * WEIGHTS.sector +
    scores.funding * WEIGHTS.funding +
    scores.stage * WEIGHTS.stage +
    scores.location * WEIGHTS.location +
    scores.riskAppetite * WEIGHTS.riskAppetite +
    scores.behavior * WEIGHTS.behavior +
    scores.textRelevance * WEIGHTS.textRelevance +
    scores.traction * WEIGHTS.traction +
    scores.founderQuality * WEIGHTS.founderQuality +
    scores.marketPotential * WEIGHTS.marketPotential;

  const confidence = getConfidenceLabel(totalScore);
  const matchReasons = generateMatchReasons(scores);
  const suggestedStarters = generateConversationStarters(
    startup.name,
    startupSectors,
    founder?.name || undefined
  );

  return {
    score: Math.round(totalScore),
    confidence,
    sectorScore: Math.round(scores.sector),
    fundingScore: Math.round(scores.funding),
    stageScore: Math.round(scores.stage),
    locationScore: Math.round(scores.location),
    riskScore: Math.round(scores.riskAppetite),
    behaviorScore: Math.round(scores.behavior),
    textRelevanceScore: Math.round(scores.textRelevance),
    tractionScore: Math.round(scores.traction),
    founderQualityScore: Math.round(scores.founderQuality),
    marketPotentialScore: Math.round(scores.marketPotential),
    matchReasons,
    suggestedStarters,
    behaviorSignals,
    analysis: {
      sector: { score: Math.round(scores.sector), weight: WEIGHTS.sector, label: 'Sector Alignment' },
      funding: { score: Math.round(scores.funding), weight: WEIGHTS.funding, label: 'Funding Fit' },
      stage: { score: Math.round(scores.stage), weight: WEIGHTS.stage, label: 'Stage Match' },
      location: { score: Math.round(scores.location), weight: WEIGHTS.location, label: 'Location' },
      risk: { score: Math.round(scores.riskAppetite), weight: WEIGHTS.riskAppetite, label: 'Risk Compatibility' },
      textRelevance: { score: Math.round(scores.textRelevance), weight: WEIGHTS.textRelevance, label: 'Description Relevance' },
      traction: { score: Math.round(scores.traction), weight: WEIGHTS.traction, label: 'Traction & Metrics' },
      founderQuality: { score: Math.round(scores.founderQuality), weight: WEIGHTS.founderQuality, label: 'Founder Quality' },
      marketPotential: { score: Math.round(scores.marketPotential), weight: WEIGHTS.marketPotential, label: 'Market Potential' },
    },
  };
}

export async function computeInvestorRecommendations(investorId: string) {
  const cacheKey = `matches:investor:${investorId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const investor = await prisma.investor.findUnique({ where: { id: investorId } });
  if (!investor) throw new Error('Investor not found');

  const startups = await prisma.startup.findMany({
    where: { isApproved: true },
    include: {
      founder: {
        select: { id: true, name: true, trustScore: true, profileComplete: true, bio: true },
      },
    },
    take: 200,
  });

  const matchResults = await Promise.all(
    startups.map(async (startup) => {
      const matchData = await calculateMatchScore(
        startup as any,
        investor as any,
        startup.founder as any
      );
      return { startup, ...matchData };
    })
  );

  const sorted = matchResults
    .filter((m) => m.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

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

  await setCache(cacheKey, sorted, 3600);
  return sorted;
}

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
      const matchData = await calculateMatchScore(
        founder.startup as any,
        investor as any,
        founder as any
      );
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

export async function getDeepAIMatchAnalysis(
  userId: string,
  role: 'FOUNDER' | 'INVESTOR'
) {
  if (role === 'FOUNDER') {
    const founder = await prisma.founder.findUnique({
      where: { userId },
      include: {
        startup: true,
        badges: true,
      },
    });
    if (!founder?.startup) return null;

    const investors = await prisma.investor.findMany({
      where: { isVerified: true },
      take: 50,
    });

    const allMatches = await Promise.all(
      investors.map(async (investor) => {
        const matchData = await calculateMatchScore(
          founder.startup as any,
          investor as any,
          founder as any
        );
        return { investor, ...matchData };
      })
    );

    const sorted = allMatches
      .filter((m) => m.score >= 20)
      .sort((a, b) => b.score - a.score);

    const topMatch = sorted[0] || null;
    const avgScore = sorted.length > 0
      ? Math.round(sorted.reduce((sum, m) => sum + m.score, 0) / sorted.length)
      : 0;

    const confidenceDistribution = {
      exceptional: sorted.filter((m) => m.score >= 90).length,
      veryHigh: sorted.filter((m) => m.score >= 80 && m.score < 90).length,
      high: sorted.filter((m) => m.score >= 70 && m.score < 80).length,
      mediumHigh: sorted.filter((m) => m.score >= 55 && m.score < 70).length,
      medium: sorted.filter((m) => m.score >= 40 && m.score < 55).length,
      low: sorted.filter((m) => m.score < 40).length,
    };

    const sectorBreakdown: Record<string, { count: number; avgScore: number }> = {};
    sorted.forEach((m) => {
      const sectors = (m.investor as any).preferredSectors || '[]';
      let parsed: string[] = [];
      try { parsed = JSON.parse(sectors); } catch { parsed = [sectors]; }
      parsed.forEach((s) => {
        if (!sectorBreakdown[s]) sectorBreakdown[s] = { count: 0, avgScore: 0 };
        sectorBreakdown[s].count++;
        sectorBreakdown[s].avgScore += m.score;
      });
    });
    Object.keys(sectorBreakdown).forEach((s) => {
      sectorBreakdown[s].avgScore = Math.round(sectorBreakdown[s].avgScore / sectorBreakdown[s].count);
    });

    return {
      role: 'FOUNDER',
      totalMatches: sorted.length,
      averageScore: avgScore,
      topMatch: topMatch ? {
        name: (topMatch.investor as any).name,
        company: (topMatch.investor as any).company,
        score: topMatch.score,
        confidence: topMatch.confidence,
        matchReasons: topMatch.matchReasons,
      } : null,
      confidenceDistribution,
      sectorBreakdown,
      startupStrengths: generateStartupStrengths(founder.startup, sorted),
      suggestions: generateSuggestions(founder, sorted),
    };
  } else {
    const investor = await prisma.investor.findUnique({
      where: { userId },
      include: { badges: true },
    });
    if (!investor) return null;

    const startups = await prisma.startup.findMany({
      where: { isApproved: true },
      include: {
        founder: {
          select: { id: true, name: true, trustScore: true, profileComplete: true, bio: true },
        },
      },
      take: 50,
    });

    const allMatches = await Promise.all(
      startups.map(async (startup) => {
        const matchData = await calculateMatchScore(
          startup as any,
          investor as any,
          startup.founder as any
        );
        return { startup, ...matchData };
      })
    );

    const sorted = allMatches
      .filter((m) => m.score >= 20)
      .sort((a, b) => b.score - a.score);

    const topMatch = sorted[0] || null;
    const avgScore = sorted.length > 0
      ? Math.round(sorted.reduce((sum, m) => sum + m.score, 0) / sorted.length)
      : 0;

    const confidenceDistribution = {
      exceptional: sorted.filter((m) => m.score >= 90).length,
      veryHigh: sorted.filter((m) => m.score >= 80 && m.score < 90).length,
      high: sorted.filter((m) => m.score >= 70 && m.score < 80).length,
      mediumHigh: sorted.filter((m) => m.score >= 55 && m.score < 70).length,
      medium: sorted.filter((m) => m.score >= 40 && m.score < 55).length,
      low: sorted.filter((m) => m.score < 40).length,
    };

    const sectorBreakdown: Record<string, { count: number; avgScore: number }> = {};
    sorted.forEach((m) => {
      const startup = m.startup as any;
      let sectors: string[] = [];
      try { sectors = typeof startup.sector === 'string' ? JSON.parse(startup.sector) : startup.sector; } catch { sectors = [startup.sector]; }
      sectors.forEach((s) => {
        if (!sectorBreakdown[s]) sectorBreakdown[s] = { count: 0, avgScore: 0 };
        sectorBreakdown[s].count++;
        sectorBreakdown[s].avgScore += m.score;
      });
    });
    Object.keys(sectorBreakdown).forEach((s) => {
      sectorBreakdown[s].avgScore = Math.round(sectorBreakdown[s].avgScore / sectorBreakdown[s].count);
    });

    return {
      role: 'INVESTOR',
      totalMatches: sorted.length,
      averageScore: avgScore,
      topMatch: topMatch ? {
        name: (topMatch.startup as any).name,
        score: topMatch.score,
        confidence: topMatch.confidence,
        matchReasons: topMatch.matchReasons,
      } : null,
      confidenceDistribution,
      sectorBreakdown,
      suggestions: generateInvestorSuggestions(investor, sorted),
    };
  }
}

function generateStartupStrengths(startup: any, matches: any[]): string[] {
  const strengths: string[] = [];
  if (startup.fundingReadyScore >= 80) strengths.push('High funding readiness score');
  if (startup.mrr && startup.mrr > 0) strengths.push(`Generating $${(startup.mrr / 1000).toFixed(0)}K MRR`);
  if (startup.teamSize >= 5) strengths.push(`Team of ${startup.teamSize} members`);
  if (startup.description && startup.description.length > 100) strengths.push('Well-documented business with clear value proposition');

  const highMatchSectors = Object.entries(
    matches.reduce((acc: any, m: any) => {
      const inv = m.investor as any;
      let sectors: string[] = [];
      try { sectors = JSON.parse(inv.preferredSectors || '[]'); } catch { sectors = []; }
      sectors.forEach((s: string) => { acc[s] = (acc[s] || 0) + 1; });
      return acc;
    }, {})
  ).sort(([,a]: any, [,b]: any) => b - a).slice(0, 2);

  if (highMatchSectors.length > 0) {
    strengths.push(`Attracts interest from investors focused on ${highMatchSectors.map(([s]) => s).join(', ')}`);
  }

  return strengths;
}

function generateSuggestions(founder: any, matches: any[]): string[] {
  const suggestions: string[] = [];
  if (founder.profileComplete < 80) suggestions.push('Complete your profile to increase match visibility by up to 40%');
  if (founder.startup.fundingReadyScore < 70) suggestions.push('Improve your funding readiness score by updating traction metrics');
  if (!founder.startup.pitchDeckUrl) suggestions.push('Upload a pitch deck — startups with decks get 3x more investor interest');
  if (!founder.startup.mrr || founder.startup.mrr === 0) suggestions.push('Add revenue metrics to attract growth-stage investors');
  if (matches.length < 5) suggestions.push('Expand your sector tags to discover more potential investor matches');
  return suggestions;
}

function generateInvestorSuggestions(investor: any, matches: any[]): string[] {
  const suggestions: string[] = [];
  if (investor.profileComplete < 80) suggestions.push('Complete your investor profile to attract more relevant startups');
  if (matches.length < 10) suggestions.push('Broaden your sector preferences to discover more matching opportunities');
  const highScoreCount = matches.filter((m) => m.score >= 80).length;
  if (highScoreCount > 0) suggestions.push(`You have ${highScoreCount} high-confidence matches ready for review`);

  let sectors: string[] = [];
  try { sectors = JSON.parse(investor.preferredSectors || '[]'); } catch { sectors = []; }
  if (sectors.length < 3) suggestions.push('Adding more target sectors will improve match diversity');

  return suggestions;
}
