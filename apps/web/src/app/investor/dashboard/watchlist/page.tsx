'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Bookmark, MapPin, TrendingUp, Target, MessageSquare, Check, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL = [
  { id: 1, name: 'NeuroSync AI', tagline: 'Personalized mental health AI assistant', sector: ['AI/ML', 'HealthTech'], stage: 'Seed', funding: '$3M', avatar: 'NS', color: '#8b5cf6', readiness: 88, verified: true, mrr: '$45K', growth: '+18%', savedOn: '2 days ago' },
  { id: 2, name: 'GreenLedger', tagline: 'Carbon accounting platform for enterprises', sector: ['CleanTech', 'SaaS'], stage: 'Series A', funding: '$8M', avatar: 'GL', color: '#10b981', readiness: 92, verified: true, mrr: '$120K', growth: '+24%', savedOn: '5 days ago' },
  { id: 3, name: 'MedFlow AI', tagline: 'AI-powered diagnostics for rural healthcare', sector: ['HealthTech', 'AI/ML'], stage: 'Seed', funding: '$4M', avatar: 'MF', color: '#ec4899', readiness: 85, verified: true, mrr: '$30K', growth: '+22%', savedOn: '1 week ago' },
  { id: 4, name: 'TechVault', tagline: 'AI-powered cybersecurity for SMBs', sector: ['AI/ML', 'SaaS'], stage: 'Pre-Seed', funding: '$1.5M', avatar: 'TV', color: '#0ea5e9', readiness: 75, verified: false, mrr: '$8K', growth: '+31%', savedOn: '2 weeks ago' },
];

export default function WatchlistPage() {
  const [items, setItems] = useState(INITIAL);
  const [contacted, setContacted] = useState<number[]>([]);

  const remove = (id: number, name: string) => {
    setItems(p => p.filter(i => i.id !== id));
    toast(`${name} removed from watchlist`);
  };

  return (
    <InvestorLayout title="Watchlist" subtitle={`${items.length} startups saved`}>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <Bookmark className="w-14 h-14 text-gray-700 mx-auto mb-5" />
          <p className="text-white font-semibold text-xl">Your watchlist is empty</p>
          <p className="text-gray-500 text-sm mt-2 mb-6">Save startups from Discover or AI Picks to track them here</p>
          <a href="/investor/dashboard/discover" className="btn-primary text-sm py-3 px-6"><span>Browse Startups</span></a>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              layout exit={{ opacity: 0, x: -40 }} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `${s.color}25`, border: `1px solid ${s.color}40` }}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-display font-bold text-white">{s.name}</h3>
                    {s.verified && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className="badge badge-blue text-xs">{s.stage}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{s.tagline}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.sector.map(sec => <span key={sec} className="badge badge-purple text-xs">{sec}</span>)}
                  </div>
                </div>
                <div className="hidden md:flex gap-4 text-xs text-gray-500 flex-shrink-0 text-right">
                  <div><p className="text-white font-semibold">{s.mrr}</p><p>MRR</p></div>
                  <div><p className="text-emerald-400 font-semibold">{s.growth}</p><p>Growth</p></div>
                  <div><p className="text-white font-semibold">{s.readiness}%</p><p>Readiness</p></div>
                  <div><p className="text-white font-semibold">{s.funding}</p><p>Seeking</p></div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button onClick={() => { setContacted(p => [...p, s.id]); toast.success(`Connection request sent to ${s.name}!`); }}
                    className={`btn-primary text-xs py-2 px-4 ${contacted.includes(s.id) ? 'opacity-70' : ''}`}>
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{contacted.includes(s.id) ? 'Sent ✓' : 'Connect'}</span>
                  </button>
                  <button onClick={() => remove(s.id, s.name)} className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-600">
                <span>Saved {s.savedOn}</span>
                <div className="w-36">
                  <div className="progress-bar h-1.5">
                    <div className="progress-bar-fill" style={{ width: `${s.readiness}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </InvestorLayout>
  );
}
