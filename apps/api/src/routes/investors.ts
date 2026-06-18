import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireInvestor, AuthRequest } from '../middleware/authenticate';
import { computeInvestorRecommendations } from '../services/matchingEngine';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get investor profile
router.get('/profile', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({
      where: { userId: req.user!.id },
      include: { subscription: true, badges: true },
    });
    res.json({ success: true, data: investor });
  } catch (err) { next(err); }
});

// Update investor profile
router.put('/profile', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.update({
      where: { userId: req.user!.id },
      data: {
        name: req.body.name,
        phone: req.body.phone,
        bio: req.body.bio,
        company: req.body.company,
        designation: req.body.designation,
        linkedinUrl: req.body.linkedinUrl,
        location: req.body.location,
        country: req.body.country,
        investmentCapacityMin: req.body.investmentCapacityMin,
        investmentCapacityMax: req.body.investmentCapacityMax,
        preferredSectors: req.body.preferredSectors,
        preferredLocations: req.body.preferredLocations,
        preferredStages: req.body.preferredStages,
        riskAppetite: req.body.riskAppetite,
        avatar: req.body.avatar,
      },
    });
    res.json({ success: true, data: investor });
  } catch (err) { next(err); }
});

// Get AI recommendations
router.get('/recommendations', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) throw createError('Investor not found', 404);
    const matches = await computeInvestorRecommendations(investor.id);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

// Watchlist - add
router.post('/watchlist/:startupId', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) throw createError('Investor not found', 404);
    const item = await prisma.watchlistItem.upsert({
      where: { investorId_startupId: { investorId: investor.id, startupId: String(req.params.startupId) } },
      update: { notes: req.body.notes },
      create: { investorId: investor.id, startupId: String(req.params.startupId), notes: req.body.notes },
    });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
});

// Watchlist - get
router.get('/watchlist', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) throw createError('Investor not found', 404);
    const items = await prisma.watchlistItem.findMany({
      where: { investorId: investor.id },
      include: { startup: { include: { founder: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

// Watchlist - remove
router.delete('/watchlist/:startupId', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) throw createError('Investor not found', 404);
    await prisma.watchlistItem.delete({
      where: { investorId_startupId: { investorId: investor.id, startupId: String(req.params.startupId) } },
    });
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) { next(err); }
});

export default router;


