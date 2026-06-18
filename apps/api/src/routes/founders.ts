import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireFounder, AuthRequest } from '../middleware/authenticate';
import { computeFounderMatches } from '../services/matchingEngine';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get founder profile
router.get('/profile', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({
      where: { userId: req.user!.id },
      include: {
        startup: { include: { documents: true } },
        badges: true,
      },
    });
    res.json({ success: true, data: founder });
  } catch (err) { next(err); }
});

// Update founder profile
router.put('/profile', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.update({
      where: { userId: req.user!.id },
      data: {
        name: req.body.name,
        phone: req.body.phone,
        bio: req.body.bio,
        linkedinUrl: req.body.linkedinUrl,
        twitterUrl: req.body.twitterUrl,
        location: req.body.location,
        country: req.body.country,
        avatar: req.body.avatar,
      },
    });
    res.json({ success: true, data: founder });
  } catch (err) { next(err); }
});

// Get investor matches for founder
router.get('/matches', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({ where: { userId: req.user!.id } });
    if (!founder) throw createError('Founder not found', 404);
    const matches = await computeFounderMatches(founder.id);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

// Get analytics
router.get('/analytics', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({
      where: { userId: req.user!.id },
      include: { startup: true },
    });

    // Return zero-state if founder hasn't created a startup yet
    if (!founder?.startup) {
      return res.json({
        success: true,
        data: { totalMatches: 0, profileViews: 0, analytics: [] },
      });
    }

    const [matchCount, viewCount, analytics] = await Promise.all([
      prisma.match.count({ where: { startupId: founder.startup.id } }),
      prisma.startup.findUnique({ where: { id: founder.startup.id }, select: { viewCount: true } }),
      prisma.analytics.findMany({
        where: { startupId: founder.startup.id },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalMatches: matchCount,
        profileViews: viewCount?.viewCount || 0,
        analytics,
      },
    });
  } catch (err) { next(err); }
});

export default router;
