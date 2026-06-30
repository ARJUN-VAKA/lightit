'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Check, Zap, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 0, period: 'Free', color: '#6b7280', icon: Star,
    features: ['5 startup views/month', '2 connection requests', 'Basic AI matches', 'Community access'],
    notIncluded: ['Unlimited deal flow', 'Priority matching', 'Direct messaging', 'Analytics dashboard', 'Event access'],
  },
  {
    id: 'pro', name: 'Pro', price: 299, period: '/month', color: '#e5383b', icon: Zap, popular: true,
    features: ['Unlimited startup views', '20 connection requests/month', 'Advanced AI picks', 'Full analytics', 'Message founders', '5 events/year'],
    notIncluded: ['White-glove sourcing', 'Dedicated manager', 'LP-level reports'],
  },
  {
    id: 'premium', name: 'Premium', price: 999, period: '/month', color: '#f59e0b', icon: Crown,
    features: ['Everything in Pro', 'Unlimited connections', 'White-glove deal sourcing', 'Dedicated account manager', 'LP-level portfolio reports', 'Unlimited events', 'Early access to new startups', 'Priority customer support'],
    notIncluded: [],
  },
];

export default function SubscriptionPage() {
  const [current, setCurrent] = useState('pro');
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly');

  const upgrade = (planId: string) => {
    if (planId === current) { toast('You are already on this plan!'); return; }
    if (planId === 'starter') { toast.error('Please contact support to downgrade.'); return; }
    toast.success(`Upgrading to ${planId === 'premium' ? 'Premium' : 'Pro'}! Redirecting to checkout… 💳`);
    setTimeout(() => setCurrent(planId), 1500);
  };

  return (
    <InvestorLayout title="Subscription" subtitle="Manage your plan and billing">
      {/* Current plan banner */}
      <div className="flex items-center gap-4 p-5 rounded-2xl mb-8"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #660708, #a4161a)' }}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Current Plan: <span className="gradient-text">Pro</span></p>
          <p className="text-gray-400 text-sm">Next billing: July 17, 2025 · $299/month</p>
        </div>
        <button onClick={() => toast('Billing portal opening…')} className="btn-secondary text-sm py-2 px-4">Manage Billing</button>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
        <button onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
          className={`w-12 h-6 rounded-full relative transition-all ${billing === 'annual' ? 'bg-red-600' : 'bg-gray-700'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${billing === 'annual' ? 'left-6' : 'left-0.5'}`} />
        </button>
        <span className={`text-sm font-medium ${billing === 'annual' ? 'text-white' : 'text-gray-500'}`}>
          Annual <span className="badge badge-green text-xs ml-1">Save 20%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const isCurrent = plan.id === current;
          const price = billing === 'annual' && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 relative ${plan.popular ? 'ring-2 ring-red-600/50' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #660708, #a4161a)' }}>
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-red-400 border border-red-600/40" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  Current Plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}20` }}>
                  <plan.icon style={{ width: 20, height: 20, color: plan.color }} />
                </div>
                <div>
                  <h3 className="text-white font-bold font-display text-lg">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold font-display text-white">{plan.price === 0 ? 'Free' : `$${price}`}</span>
                {plan.price > 0 && <span className="text-gray-500 text-sm">{billing === 'annual' ? '/month, billed annually' : plan.period}</span>}
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="w-4 h-4 flex-shrink-0 text-center text-gray-700 text-xs mt-0.5">✕</span>
                    <span className="text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => upgrade(plan.id)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  isCurrent ? 'text-red-400 border border-red-600/30 cursor-default' :
                  plan.id === 'premium' ? 'text-white' : 'btn-secondary'
                }`}
                style={plan.id === 'premium' && !isCurrent ? { background: 'linear-gradient(135deg, #f59e0b, #ef4444)' } : {}}>
                {isCurrent ? '✓ Active Plan' : plan.id === 'starter' ? 'Downgrade' : `Upgrade to ${plan.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Usage stats */}
      <div className="glass-card p-6 mt-8">
        <h3 className="font-display font-bold text-white mb-5">This Month's Usage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Startups Viewed', used: 74, total: 'Unlimited' },
            { label: 'Connections Sent', used: 12, total: 20 },
            { label: 'Events Registered', used: 2, total: 5 },
            { label: 'AI Picks Reviewed', used: 48, total: 'Unlimited' },
          ].map(u => (
            <div key={u.label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-2xl font-bold text-white font-display">{u.used}</p>
              <p className="text-gray-500 text-xs mt-1">{u.label}</p>
              {typeof u.total === 'number' && (
                <div className="mt-2">
                  <div className="progress-bar h-1.5"><div className="progress-bar-fill" style={{ width: `${(u.used/u.total)*100}%` }} /></div>
                  <p className="text-gray-600 text-xs mt-1">{u.used}/{u.total}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </InvestorLayout>
  );
}
