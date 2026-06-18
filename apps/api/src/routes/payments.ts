import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, requireInvestor, AuthRequest } from '../middleware/authenticate';
import { createError } from '../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_prevent_startup_crash', { apiVersion: '2025-02-24.acacia' });

const router = Router();

const PLAN_PRICES: Record<string, number> = {
  MONTHLY: 99,
  QUARTERLY: 249,
  ANNUAL: 799,
};

// Create Stripe checkout session
router.post('/subscribe/stripe', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLAN_PRICES[plan]) throw createError('Invalid plan', 400);

    const investor = await prisma.investor.findUnique({ where: { userId: req.user!.id } });
    if (!investor) throw createError('Investor not found', 404);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `LightIt ${plan} Plan` },
          unit_amount: PLAN_PRICES[plan] * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/investor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/investor/subscription`,
      metadata: { investorId: investor.id, plan },
    });

    res.json({ success: true, data: { sessionUrl: session.url } });
  } catch (err) { next(err); }
});

// Stripe webhook
router.post('/webhook/stripe', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature']!;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { investorId, plan } = session.metadata!;

      const duration = plan === 'MONTHLY' ? 30 : plan === 'QUARTERLY' ? 90 : 365;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      const payment = await prisma.payment.create({
        data: {
          userId: investorId,
          amount: session.amount_total! / 100,
          currency: 'USD',
          gateway: 'STRIPE',
          gatewayPaymentId: session.payment_intent as string,
          status: 'COMPLETED',
        },
      });

      await prisma.subscription.upsert({
        where: { investorId },
        update: { plan: plan as any, status: 'ACTIVE', startDate: new Date(), endDate, paymentId: payment.id },
        create: {
          investorId,
          paymentId: payment.id,
          plan: plan as any,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
        },
      });
    }

    res.json({ received: true });
  } catch (err) { next(err); }
});

// Get subscription status
router.get('/subscription', authenticate, requireInvestor, async (req: AuthRequest, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({
      where: { userId: req.user!.id },
      include: { subscription: true },
    });
    res.json({ success: true, data: investor?.subscription });
  } catch (err) { next(err); }
});

export default router;
