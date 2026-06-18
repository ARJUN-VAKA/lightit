import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get chats for current user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id: userId, role } = req.user!;
    let chats;

    if (role === 'FOUNDER') {
      const founder = await prisma.founder.findUnique({ where: { userId } });
      chats = await prisma.chat.findMany({
        where: { founderId: founder!.id },
        include: {
          investor: { select: { name: true, avatar: true, company: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      const investor = await prisma.investor.findUnique({ where: { userId } });
      chats = await prisma.chat.findMany({
        where: { investorId: investor!.id },
        include: {
          founder: { select: { name: true, avatar: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    res.json({ success: true, data: chats });
  } catch (err) { next(err); }
});

// Get messages for a chat
router.get('/:chatId/messages', authenticate, async (req, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await prisma.message.findMany({
      where: { chatId: String(req.params.chatId), deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    });

    res.json({ success: true, data: messages.reverse() });
  } catch (err) { next(err); }
});

// Initiate chat (investor contacts founder via match)
router.post('/initiate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { matchId } = req.body;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { startup: { include: { founder: true } } },
    });

    if (!match) throw createError('Match not found', 404);

    const existingChat = await prisma.chat.findUnique({ where: { matchId } });
    if (existingChat) return res.json({ success: true, data: existingChat });

    const chat = await prisma.chat.create({
      data: {
        matchId,
        founderId: match.startup.founderId,
        investorId: match.investorId,
      },
    });

    // Update match status
    await prisma.match.update({ where: { id: matchId }, data: { status: 'CONNECTED' } });

    res.status(201).json({ success: true, data: chat });
  } catch (err) { next(err); }
});

export default router;


