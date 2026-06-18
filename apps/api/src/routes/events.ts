import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authenticate';

const router = Router();

// List events (public)
router.get('/', async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.eventType = type;

    const events = await prisma.event.findMany({
      where,
      include: { judges: true, _count: { select: { registrations: true } } },
      orderBy: { startDate: 'asc' },
    });

    res.json({ success: true, data: events });
  } catch (err) { next(err); }
});

// Get single event
router.get('/:id', async (req, res, next) => {
  if (req.params.id === 'my-registrations') return next(); // Skip if it's my-registrations
  try {
    const event = await prisma.event.findUnique({
      where: { id: String(req.params.id) },
      include: { judges: true, leaderboard: true, registrations: { take: 5 } },
    });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
});

// Get user's registrations
router.get('/my-registrations/list', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id: userId } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { founder: true, investor: true }
    });
    
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        OR: [
          { founderId: user?.founder?.id || 'none' },
          { investorId: user?.investor?.id || 'none' }
        ]
      }
    });
    
    res.json({ success: true, data: registrations.map(r => r.eventId) });
  } catch (err) { next(err); }
});

// Create event (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const event = await prisma.event.create({ data: req.body });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
});

// Register for event
router.post('/:id/register', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id: userId, role } = req.user!;
    const event = await prisma.event.findUnique({ where: { id: String(req.params.id) } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    let founderId, investorId;
    if (role === 'FOUNDER') {
      const founder = await prisma.founder.findUnique({ where: { userId } });
      founderId = founder!.id;
    } else if (role === 'INVESTOR') {
      const investor = await prisma.investor.findUnique({ where: { userId } });
      investorId = investor!.id;
    }

    // Check existing
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, OR: [{ founderId }, { investorId }] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    let registration;
    if (role === 'FOUNDER') {
      registration = await prisma.eventRegistration.create({
        data: { eventId: event.id, founderId: founderId!, role: 'founder' },
      });
    } else {
      registration = await prisma.eventRegistration.create({
        data: { eventId: event.id, investorId: investorId!, role: 'investor' },
      });
    }

    // Increment participant count
    await prisma.event.update({
      where: { id: event.id },
      data: { currentParticipants: { increment: 1 } },
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) { next(err); }
});

// Notify attendees (Admin)
router.post('/:id/notify', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const eventId = String(req.params.id);
    const { message, title } = req.body;
    
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: { 
        founder: { include: { user: true } }, 
        investor: { include: { user: true } } 
      }
    });

    const notifications = registrations.map(reg => {
      const userId = reg.founder?.user?.id || reg.investor?.user?.id;
      return {
        userId: userId!,
        title: title || 'Event Update',
        body: message,
        type: 'SYSTEM'
      };
    }).filter(n => n.userId);

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    res.json({ success: true, message: `Notified ${notifications.length} attendees` });
  } catch (err) { next(err); }
});

// Vote for startup at event
router.post('/:id/vote', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { startupId, score } = req.body;
    const eventId = String(req.params.id);
    const vote = await prisma.vote.upsert({
      where: { eventId_voterId_startupId: { eventId, voterId: req.user!.id, startupId } },
      update: { score },
      create: { eventId, voterId: req.user!.id, startupId, score },
    });
    res.json({ success: true, data: vote });
  } catch (err) { next(err); }
});

export default router;

