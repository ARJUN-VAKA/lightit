'use client';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { TrendingUp, Target, MessageSquare, Bookmark, Brain, DollarSign } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];
const DEAL_FLOW = [18, 32, 28, 45, 61, 74];
const CONNECTIONS = [4, 7, 5, 11, 9, 14];

function LineChart({ values, color = '#e5383b', fill = 'rgba(14,165,233,0.15)' }: { values: number[]; color?: string; fill?: string }) {
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 88}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28">
      <defs><linearGradient id={`g${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
      <polygon points={`0,100 ${pts} 100,100`} fill={`url(#g${color})`}/>
    </svg>
  );
}

const PIPELINE = [
  { stage: 'Viewed', count: 248, color: '#374151' },
  { stage: 'Saved',  count: 31,  color: '#e5383b' },
  { stage: 'Connected', count: 14, color: '#a4161a' },
  { stage: 'Meeting', count: 6,  color: '#ba181b' },
  { stage: 'Due Diligence', count: 2, color: '#f59e0b' },
  { stage: 'Term Sheet', count: 1, color: '#b1a7a6' },
];

const SECTOR_DIST = [
  { name: 'AI/ML', pct: 38, color: '#a4161a' },
  { name: 'SaaS',  pct: 26, color: '#e5383b' },
  { name: 'HealthTech', pct: 20, color: '#660708' },
  { name: 'CleanTech',  pct: 10, color: '#b1a7a6' },
  { name: 'Other', pct: 6, color: '#374151' },
];

export default function InvestorAnalyticsPage() {
  return (
    <InvestorLayout title="Analytics" subtitle="Deal flow, pipeline and portfolio insights">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Startups Reviewed', value: '248', change: '+61 this month', icon: Target, color: '#e5383b' },
          { label: 'Active Connections', value: '14', change: '3 in diligence', icon: MessageSquare, color: '#a4161a' },
          { label: 'Watchlist', value: '31', change: '+8 this week', icon: Bookmark, color: '#ba181b' },
          { label: 'AI Recommendations', value: '96', change: 'avg match score', icon: Brain, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} />
              </div>
              <span className="text-red-400 text-xs font-medium">{s.change}</span>
            </div>
            <div className="stat-number text-2xl">{s.value}</div>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deal Flow chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">Deal Flow Volume</h3>
            <span className="badge badge-blue text-xs">+74% YoY</span>
          </div>
          <LineChart values={DEAL_FLOW} color="#e5383b" />
          <div className="flex justify-between mt-2">{MONTHS.map(m => <span key={m} className="text-gray-600 text-xs">{m}</span>)}</div>
        </div>

        {/* Connections chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">Founder Connections</h3>
            <span className="badge badge-purple text-xs">+55% YoY</span>
          </div>
          <LineChart values={CONNECTIONS} color="#a4161a" />
          <div className="flex justify-between mt-2">{MONTHS.map(m => <span key={m} className="text-gray-600 text-xs">{m}</span>)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment Pipeline Funnel */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">Investment Pipeline</h3>
          <div className="space-y-3">
            {PIPELINE.map((p, i) => {
              const widthPct = (p.count / PIPELINE[0].count) * 100;
              return (
                <div key={p.stage}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{p.stage}</span>
                    <span className="text-white font-semibold">{p.count}</span>
                  </div>
                  <div className="h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-lg flex items-center pl-2" style={{ background: p.color, opacity: 0.8 }}>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-white mb-5">Sector Focus</h3>
          <div className="space-y-3">
            {SECTOR_DIST.map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{s.name}</span><span className="text-white font-semibold">{s.pct}%</span></div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.7, delay: 0.2 }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-white/5">
            <h4 className="text-white text-sm font-semibold mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {[
                { t: 'Viewed 12 new AI/ML startups', time: '1h ago' },
                { t: 'NeuroSync AI match score updated to 96%', time: '3h ago' },
                { t: 'Sent connection request to GreenLedger', time: 'Yesterday' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  <div><p className="text-gray-400">{a.t}</p><p className="text-gray-600">{a.time}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
