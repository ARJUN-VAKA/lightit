import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireFounder, AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all approved startups (public discovery)
router.get('/', async (req, res, next) => {
  try {
    const { sector, stage, minFunding, maxFunding, country, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isApproved: true };
    if (sector) where.sector = { contains: sector as string };
    if (stage) where.stage = stage;
    if (country) where.country = { contains: country as string, mode: 'insensitive' };
    if (minFunding) where.fundingRequired = { gte: Number(minFunding) };
    if (maxFunding) where.fundingRequired = { ...where.fundingRequired, lte: Number(maxFunding) };
    if (search) where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];

    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        include: { founder: { select: { name: true, avatar: true, trustScore: true } } },
        orderBy: [{ isSponsored: 'desc' }, { fundingReadyScore: 'desc' }],
        skip,
        take: Number(limit),
      }),
      prisma.startup.count({ where }),
    ]);

    res.json({
      success: true,
      data: startups,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
});

// Get single startup
router.get('/:id', async (req, res, next) => {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: String(req.params.id) },
      include: {
        founder: { include: { user: { select: { email: true } } } },
        documents: true,
      },
    });
    if (!startup) throw createError('Startup not found', 404);

    // Increment view count
    await prisma.startup.update({ where: { id: String(req.params.id) }, data: { viewCount: { increment: 1 } } });

    res.json({ success: true, data: startup });
  } catch (err) { next(err); }
});

// Create/update startup (founder only)
router.post('/', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({ where: { userId: req.user!.id } });
    if (!founder) throw createError('Founder not found', 404);

    const startup = await prisma.startup.upsert({
      where: { founderId: founder.id },
      update: req.body,
      create: { ...req.body, founderId: founder.id },
    });

    res.json({ success: true, data: startup });
  } catch (err) { next(err); }
});

// Update startup
router.put('/:id', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const startup = await prisma.startup.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: startup });
  } catch (err) { next(err); }
});

// Add document to data room
router.post('/:id/documents', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const startup = await prisma.startup.findUnique({ where: { id: String(req.params.id) } });
    if (!startup) throw createError('Startup not found', 404);
    
    // Verify ownership
    const founder = await prisma.founder.findUnique({ where: { userId: req.user!.id } });
    if (startup.founderId !== founder?.id) throw createError('Unauthorized', 403);

    const doc = await prisma.startupDocument.create({
      data: {
        startupId: startup.id,
        name: req.body.name,
        url: req.body.url,
        size: req.body.size || 0,
        type: req.body.type || 'DOCUMENT'
      }
    });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
});

// Delete document from data room
router.delete('/:id/documents/:docId', authenticate, requireFounder, async (req: AuthRequest, res, next) => {
  try {
    const startup = await prisma.startup.findUnique({ where: { id: String(req.params.id) } });
    const founder = await prisma.founder.findUnique({ where: { userId: req.user!.id } });
    if (startup?.founderId !== founder?.id) throw createError('Unauthorized', 403);

    await prisma.startupDocument.delete({ where: { id: String(req.params.docId) } });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
});

export default router;

