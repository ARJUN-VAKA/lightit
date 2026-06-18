import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get active ads by type (public)
router.get('/active', async (req, res, next) => {
  try {
    const { type } = req.query;
    const now = new Date();
    const where: any = {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    };
    if (type) where.adType = type;

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { impressions: 'desc' },
    });

    res.json({ success: true, data: ads });
  } catch (err) { next(err); }
});

// Track impression
router.post('/:id/impression', async (req, res, next) => {
  try {
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { impressions: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Track click
router.post('/:id/click', async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { clicks: { increment: 1 } },
    });
    res.json({ success: true, redirectUrl: ad.linkUrl });
  } catch (err) { next(err); }
});

// Admin: CRUD ads
router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: ads });
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.create({ data: req.body });
    res.status(201).json({ success: true, data: ad });
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const ad = await prisma.advertisement.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: ad });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.advertisement.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'Advertisement deleted' });
  } catch (err) { next(err); }
});

export default router;
