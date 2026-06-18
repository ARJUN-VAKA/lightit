import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// Get matches for investor
router.get('/investor', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) return res.status(404).json({ success: false, message: 'Not found' });

    const matches = await prisma.match.findMany({
      where: { investorId: investor.id },
      include: { startup: { include: { founder: true } } },
      orderBy: { score: 'desc' },
    });

    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

// Get matches for founder
router.get('/founder', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({
      where: { userId: req.user!.id },
      include: { startup: true },
    });
    if (!founder?.startup) return res.json({ success: true, data: [] });

    const matches = await prisma.match.findMany({
      where: { startupId: founder.startup.id },
      include: { investor: true },
      orderBy: { score: 'desc' },
    });

    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
});

// Update match status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const match = await prisma.match.update({
      where: { id: String(req.params.id) },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: match });
  } catch (err) { next(err); }
});

export default router;

