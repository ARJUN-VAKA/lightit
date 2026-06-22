import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { getDeepAIMatchAnalysis, computeInvestorRecommendations, computeFounderMatches } from '../services/matchingEngine';

const router = Router();

router.get('/analyze', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const role = req.user!.role as 'FOUNDER' | 'INVESTOR';
    const analysis = await getDeepAIMatchAnalysis(req.user!.id, role);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'No analysis available. Ensure profile is complete.' });
    }
    res.json({ success: true, data: analysis });
  } catch (err) { next(err); }
});

router.post('/refresh', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const role = req.user!.role as 'FOUNDER' | 'INVESTOR';

    if (role === 'FOUNDER') {
      const founder = await prisma.founder.findUnique({ where: { userId: req.user!.id } });
      if (!founder) return res.status(404).json({ success: false, message: 'Founder not found' });
      await computeFounderMatches(founder.id);
    } else {
      const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
      if (!investor) return res.status(404).json({ success: false, message: 'Investor not found' });
      await computeInvestorRecommendations(investor.id);
    }

    const analysis = await getDeepAIMatchAnalysis(req.user!.id, role);
    res.json({ success: true, data: analysis, message: 'AI matchmaking refreshed!' });
  } catch (err) { next(err); }
});

export default router;
