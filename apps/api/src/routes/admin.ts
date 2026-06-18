import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authenticate';

const router = Router();

// ─── Dashboard Overview ────────────────────────────────────────────────────────
router.get('/dashboard', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [
      totalUsers, totalFounders, totalInvestors, totalStartups,
      pendingStartups, totalMatches, totalRevenue, recentActivity,
      pendingAds, unreadContacts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.founder.count(),
      prisma.investor.count(),
      prisma.startup.count(),
      prisma.startup.count({ where: { isApproved: false } }),
      prisma.match.count(),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.advertisement.count({ where: { status: 'DRAFT' } }),
      prisma.contactRequest.count({ where: { status: 'UNREAD' } }),
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const revenueByMonth: Record<string, number> = {};
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 7);
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (p.amount || 0);
    }
    const monthlyRevenue = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month: `${month}-01`, revenue }));

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalFounders, totalInvestors, totalStartups,
          pendingStartups, totalMatches, pendingAds, unreadContacts,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        monthlyRevenue,
        recentActivity,
      },
    });
  } catch (err) { next(err); }
});

// ─── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) where.email = { contains: search as string };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { founder: { select: { name: true } }, investor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (err) { next(err); }
});

router.patch('/users/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: String(req.params.id) }, data: { status: req.body.status } });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.delete('/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

// Deep Dive Full Profile for Admin
router.get('/users/:id/full-profile', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      include: {
        founder: {
          include: {
            startup: {
              include: {
                documents: true,
                matches: { take: 5, include: { investor: true } }
              }
            }
          }
        },
        investor: {
          include: {
            matches: { take: 5, include: { startup: true } },
            ndas: { include: { founder: { include: { startup: true } } } },
            badges: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Log this admin action in AuditLog for security tracking
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_DEEP_DIVE',
        resource: 'User',
        resourceId: user.id,
        metadata: { details: `Admin ${req.user!.email} viewed full profile of ${user.email}` },
      }
    });

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// ─── Startups ──────────────────────────────────────────────────────────────────
router.get('/startups', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { approved, search } = req.query;
    const where: any = {};
    if (approved !== undefined) where.isApproved = approved === 'true';
    if (search) where.name = { contains: search as string };
    const startups = await prisma.startup.findMany({
      where,
      include: { founder: { select: { name: true, user: { select: { email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: startups });
  } catch (err) { next(err); }
});

router.patch('/startups/:id/approve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const startup = await prisma.startup.update({
      where: { id: String(req.params.id) },
      data: { isApproved: req.body.isApproved },
    });
    res.json({ success: true, data: startup });
  } catch (err) { next(err); }
});

// ─── Investors ─────────────────────────────────────────────────────────────────
router.get('/investors', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { verified, search } = req.query;
    const where: any = {};
    if (verified !== undefined) where.isVerified = verified === 'true';
    if (search) where.name = { contains: search as string };
    const investors = await prisma.investor.findMany({
      where,
      include: {
        user: { select: { email: true, status: true, createdAt: true } },
        badges: true,
        _count: { select: { matches: true, watchlist: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: investors });
  } catch (err) { next(err); }
});

router.patch('/investors/:id/verify', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const investor = await prisma.investor.update({
      where: { id: String(req.params.id) },
      data: { isVerified: req.body.isVerified },
    });
    res.json({ success: true, data: investor });
  } catch (err) { next(err); }
});

// Assign badge to investor
router.post('/investors/:id/badges', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const badge = await prisma.investorBadge.upsert({
      where: { investorId_badgeType: { investorId: String(req.params.id), badgeType: req.body.badgeType } },
      update: {},
      create: { investorId: String(req.params.id), badgeType: req.body.badgeType },
    });
    res.json({ success: true, data: badge });
  } catch (err) { next(err); }
});

// Remove badge from investor
router.delete('/investors/:id/badges/:badgeType', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.investorBadge.delete({
      where: { investorId_badgeType: { investorId: String(req.params.id), badgeType: String(req.params.badgeType) } },
    });
    res.json({ success: true, message: 'Badge removed' });
  } catch (err) { next(err); }
});

// ─── Events ────────────────────────────────────────────────────────────────────
router.get('/events', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: { _count: { select: { registrations: true } } },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
});

router.post('/events', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const {
      title, description, eventType, startDate, endDate, registrationDeadline,
      location, isVirtual, founderFee, investorFee, maxParticipants, prizePool,
      coverImageUrl, streamUrl, sponsorLogos,
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType: eventType || 'PITCH_COMPETITION',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: new Date(registrationDeadline),
        location: location || '',
        isVirtual: isVirtual ?? true,
        founderFee: Number(founderFee) || 0,
        investorFee: Number(investorFee) || 0,
        maxParticipants: maxParticipants ? Number(maxParticipants) : null,
        prizePool: Number(prizePool) || 0,
        coverImageUrl: coverImageUrl || null,
        streamUrl: streamUrl || null,
        sponsorLogos: sponsorLogos || '[]',
        status: 'UPCOMING',
      },
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
});

router.put('/events/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate, registrationDeadline, ...rest } = req.body;
    const event = await prisma.event.update({
      where: { id: String(req.params.id) },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(registrationDeadline && { registrationDeadline: new Date(registrationDeadline) }),
        ...(rest.founderFee !== undefined && { founderFee: Number(rest.founderFee) }),
        ...(rest.investorFee !== undefined && { investorFee: Number(rest.investorFee) }),
        ...(rest.maxParticipants !== undefined && { maxParticipants: Number(rest.maxParticipants) }),
        ...(rest.prizePool !== undefined && { prizePool: Number(rest.prizePool) }),
      },
    });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
});

router.delete('/events/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
});

// Event registrations
router.get('/events/:id/registrations', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const regs = await prisma.eventRegistration.findMany({
      where: { eventId: String(req.params.id) },
      include: {
        founder: { select: { name: true } },
        investor: { select: { name: true } },
      },
    });
    res.json({ success: true, data: regs });
  } catch (err) { next(err); }
});

router.patch('/events/registrations/:id/approve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const reg = await prisma.eventRegistration.update({
      where: { id: String(req.params.id) },
      data: { isApproved: req.body.isApproved },
    });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
});

// ─── Advertisements ────────────────────────────────────────────────────────────
router.get('/ads', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;
    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: ads });
  } catch (err) { next(err); }
});

router.post('/ads', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, imageUrl, linkUrl, adType, startDate, endDate, budget, cpm, targetSectors, targetCountries } = req.body;
    const ad = await prisma.advertisement.create({
      data: {
        title,
        description: description || '',
        imageUrl: imageUrl || '',
        linkUrl: linkUrl || '',
        adType: adType || 'BANNER',
        status: 'DRAFT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? Number(budget) : null,
        cpm: cpm ? Number(cpm) : null,
        targetSectors: targetSectors || '[]',
        targetCountries: targetCountries || '[]',
      },
    });
    res.status(201).json({ success: true, data: ad });
  } catch (err) { next(err); }
});

router.put('/ads/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate, budget, cpm, ...rest } = req.body;
    const ad = await prisma.advertisement.update({
      where: { id: String(req.params.id) },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(cpm !== undefined && { cpm: Number(cpm) }),
      },
    });
    res.json({ success: true, data: ad });
  } catch (err) { next(err); }
});

router.delete('/ads/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await prisma.advertisement.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'Ad deleted' });
  } catch (err) { next(err); }
});

// ─── Platform Config ───────────────────────────────────────────────────────────
const DEFAULT_CONFIG = [
  { key: 'subscription_monthly_price',  value: '99',  label: 'Monthly Subscription Price (USD)' },
  { key: 'subscription_quarterly_price', value: '249', label: 'Quarterly Subscription Price (USD)' },
  { key: 'subscription_annual_price',   value: '799', label: 'Annual Subscription Price (USD)' },
  { key: 'ad_default_cpm',              value: '5',   label: 'Default Ad CPM Rate (USD)' },
  { key: 'event_founder_fee_default',   value: '0',   label: 'Default Event Founder Fee (USD)' },
  { key: 'event_investor_fee_default',  value: '0',   label: 'Default Event Investor Fee (USD)' },
  { key: 'ad_min_budget',               value: '100', label: 'Minimum Ad Budget (USD)' },
  { key: 'platform_name',               value: 'LightIt', label: 'Platform Name' },
];

router.get('/config', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    // Seed defaults if not present
    for (const item of DEFAULT_CONFIG) {
      await prisma.platformConfig.upsert({
        where: { key: item.key },
        update: {},
        create: item,
      });
    }
    const configs = await prisma.platformConfig.findMany({ orderBy: { key: 'asc' } });
    res.json({ success: true, data: configs });
  } catch (err) { next(err); }
});

router.put('/config', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updates: { key: string; value: string }[] = req.body.updates;
    const results = await Promise.all(
      updates.map(({ key, value }) =>
        prisma.platformConfig.update({ where: { key }, data: { value } })
      )
    );
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// ─── Contact / Ad Requests Inbox ──────────────────────────────────────────────
router.get('/inbox', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    const messages = await prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});

router.patch('/inbox/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const msg = await prisma.contactRequest.update({
      where: { id: String(req.params.id) },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
});

// Public endpoint: submit a contact/ad request
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message, type } = req.body;
    if (!name || !email || !message) throw { status: 400, message: 'name, email and message are required' };
    const req2 = await prisma.contactRequest.create({
      data: { name, email, subject: subject || 'No subject', message, type: type || 'GENERAL' },
    });
    res.status(201).json({ success: true, data: req2 });
  } catch (err) { next(err); }
});

// ─── Broadcast Notification ────────────────────────────────────────────────────
router.post('/notifications/broadcast', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, body, type = 'ANNOUNCEMENT', roles } = req.body;
    if (!title || !body) throw { status: 400, message: 'title and body are required' };

    const where: any = {};
    if (roles && roles.length > 0) where.role = { in: roles };
    const users = await prisma.user.findMany({ where, select: { id: true } });

    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, type, title, body })),
    });

    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (err) { next(err); }
});

// ─── Revenue ───────────────────────────────────────────────────────────────────
router.get('/revenue', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const [subscriptionRevenue, adRevenue, payments] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'COMPLETED', subscription: { isNot: null } }, _sum: { amount: true } }),
      prisma.advertisement.aggregate({ _sum: { revenue: true } }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const revenueByMonth: Record<string, number> = {};
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 7);
      revenueByMonth[key] = (revenueByMonth[key] || 0) + (p.amount || 0);
    }

    res.json({
      success: true,
      data: {
        subscriptionRevenue: subscriptionRevenue._sum.amount || 0,
        adRevenue: adRevenue._sum.revenue || 0,
        totalRevenue: (subscriptionRevenue._sum.amount || 0) + (adRevenue._sum.revenue || 0),
        chart: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month: `${month}-01`, revenue })),
      },
    });
  } catch (err) { next(err); }
});

// ─── Security Logs ─────────────────────────────────────────────────────────────
router.get('/security/logs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
});

export default router;
