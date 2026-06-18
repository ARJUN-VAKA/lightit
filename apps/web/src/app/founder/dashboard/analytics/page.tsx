'use client';
import { motion } from 'framer-motion';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { TrendingUp, Eye, Users, MessageSquare, Target, Star } from 'lucide-react';

const WEEKLY = [32, 48, 41, 67, 85, 72, 91];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];
const VIEWS =  [120, 198, 165, 310, 425, 618];

function MiniBar({ values, color = '#0ea5e9' }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1 h-20">
      {values.map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.5 }}
          className="flex-1 rounded-t-sm" style={{ background: color, opacity: 0.6 + (i / values.length) * 0.4 }} />
      ))}
    </div>
  );
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 90}`).join(' ');
  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="#0ea5e9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <polygon points={`0,100 ${pts} 100,100`} fill="url(#lineGrad)" />
      </svg>
      <div className="flex justify-between mt-1">
        {labels.map(l => <span key={l} className="text-gray-600 text-xs">{l}</span>)}
      </div>
    </div>
  );
}

const STATS = [
  { label: 'Profile Views', value: '1,284', change: '+23%', icon: Eye, color: '#0ea5e9' },
  { label: 'Investor Matches', value: '24', change: '+8', icon: Target, color: '#8b5cf6' },
  { label: 'Messages', value: '12', change: '3 unread', icon: MessageSquare, color: '#06b6d4' },
  { label: 'Trust Score', value: '78', change: '+5 pts', icon: Star, color: '#f59e0b' },
];

const SECTORS = [
  { name: 'AI/ML', pct: 42, color: '#0ea5e9' },
  { name: 'HealthTech', pct: 28, color: '#8b5cf6' },
  { name: 'SaaS', pct: 20, color: '#06b6d4' },
  { name: 'Other', pct: 10, color: '#374151' },
];

export default function AnalyticsPage() {
  return (
    <FounderLayout title="Analytics" subtitle="Performance insights for your startup profile">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <span className="text-emerald-400 text-xs font-medium">{s.change}</span>
            </div>
            <div className="stat-number text-2xl">{s.value}</div>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Views Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">Profile Views — Last 6 Months</h3>
            <span className="badge badge-blue text-xs">+52% YoY</span>
          </div>
          <LineChart values={VIEWS} labels={MONTHS} />
        </div>

        {/* Sector Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">Investor Sector Interest</h3>
          <div className="space-y-3">
            {SECTORS.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{s.name}</span><span className="text-white font-semibold">{s.pct}%</span></div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-1">Weekly Activity</h3>
          <p className="text-gray-500 text-xs mb-4">Investor interactions this week</p>
          <MiniBar values={WEEKLY} />
          <div className="flex justify-between mt-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d} className="text-gray-600 text-xs">{d}</span>)}
          </div>
        </div>

        {/* Recent Events */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: 'Apex Ventures viewed your pitch deck', time: '2h ago', color: '#0ea5e9' },
              { text: 'New match: Sarah Mitchell (91% match)', time: '5h ago', color: '#8b5cf6' },
              { text: 'Your profile appeared in 47 investor searches', time: 'Yesterday', color: '#06b6d4' },
              { text: 'Trust score increased by 5 points', time: '2 days ago', color: '#f59e0b' },
              { text: 'Horizon Capital saved your startup', time: '3 days ago', color: '#10b981' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{item.text}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FounderLayout>
  );
}
