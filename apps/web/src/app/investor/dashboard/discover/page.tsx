'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Search, Filter, MapPin, Eye, TrendingUp, Target, MessageSquare, Bookmark, Check, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const STARTUPS = [
  { id: 1, name: 'NeuroSync AI', tagline: 'Personalized mental health AI assistant', sector: ['AI/ML', 'HealthTech'], stage: 'Seed', funding: '$3M', score: 96, views: 2840, location: 'San Francisco, CA', avatar: 'NS', color: '#8b5cf6', readiness: 88, verified: true, mrr: '$45K', growth: '+18%', team: 4 },
  { id: 2, name: 'GreenLedger', tagline: 'Carbon accounting platform for enterprises', sector: ['CleanTech', 'SaaS'], stage: 'Series A', funding: '$8M', score: 89, views: 1923, location: 'London, UK', avatar: 'GL', color: '#10b981', readiness: 92, verified: true, mrr: '$120K', growth: '+24%', team: 12 },
  { id: 3, name: 'TechVault', tagline: 'AI-powered cybersecurity for SMBs', sector: ['AI/ML', 'SaaS'], stage: 'Pre-Seed', funding: '$1.5M', score: 83, views: 1102, location: 'Bangalore, IN', avatar: 'TV', color: '#0ea5e9', readiness: 75, verified: false, mrr: '$8K', growth: '+31%', team: 3 },
  { id: 4, name: 'EduBridge', tagline: 'Adaptive learning platform for K-12', sector: ['EdTech', 'SaaS'], stage: 'Seed', funding: '$2M', score: 79, views: 890, location: 'Austin, TX', avatar: 'EB', color: '#f59e0b', readiness: 71, verified: true, mrr: '$22K', growth: '+15%', team: 7 },
  { id: 5, name: 'ClimateTech Hub', tagline: 'Marketplace for carbon credit trading', sector: ['CleanTech', 'FinTech'], stage: 'Pre-Seed', funding: '$1M', score: 75, views: 654, location: 'Berlin, DE', avatar: 'CT', color: '#06b6d4', readiness: 65, verified: false, mrr: '$3K', growth: '+42%', team: 2 },
  { id: 6, name: 'MedFlow', tagline: 'AI diagnostic tool for rural healthcare', sector: ['HealthTech', 'AI/ML'], stage: 'Seed', funding: '$4M', score: 91, views: 2100, location: 'Nairobi, KE', avatar: 'MF', color: '#ec4899', readiness: 85, verified: true, mrr: '$30K', growth: '+22%', team: 6 },
];

const SECTORS = ['All', 'AI/ML', 'SaaS', 'HealthTech', 'CleanTech', 'FinTech', 'EdTech'];
const STAGES  = ['All', 'Idea', 'Pre-Seed', 'Seed', 'Series A'];

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [stage, setStage] = useState('All');
  const [saved, setSaved] = useState<number[]>([]);
  const [contacted, setContacted] = useState<number[]>([]);

  const filtered = STARTUPS.filter(s =>
    (sector === 'All' || s.sector.includes(sector)) &&
    (stage === 'All' || s.stage === stage) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.tagline.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <InvestorLayout title="Discover Startups" subtitle={`${STARTUPS.length} startups in your investment thesis`}>
      {/* Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search startups…" className="input-field pl-11 text-sm" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${sector === s ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
              {s}
            </button>
          ))}
          <span className="text-gray-700 mx-1">|</span>
          {STAGES.map(s => (
            <button key={s} onClick={() => setStage(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${stage === s ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4 }} className="glass-card p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `${s.color}25`, border: `1px solid ${s.color}40` }}>
                  {s.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-white text-sm">{s.name}</h3>
                    {s.verified && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {s.sector.slice(0, 2).map(sec => <span key={sec} className="badge badge-blue text-xs py-0.5">{sec}</span>)}
                  </div>
                </div>
              </div>
              <button onClick={() => { setSaved(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id]); toast(saved.includes(s.id) ? 'Removed from watchlist' : `${s.name} added to watchlist! 🔖`); }}
                className={`p-2 rounded-xl transition-all ${saved.includes(s.id) ? 'text-blue-400 bg-blue-500/15' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <Bookmark className={`w-4 h-4 ${saved.includes(s.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{s.tagline}</p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{s.stage}</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />Seeking {s.funding}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.location}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{s.views.toLocaleString()} views</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ label: 'MRR', val: s.mrr }, { label: 'Growth', val: s.growth }, { label: 'Team', val: `${s.team} ppl` }].map(m => (
                <div key={m.label} className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-white font-semibold text-xs">{m.val}</p>
                  <p className="text-gray-600 text-xs">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Readiness</span><span>{s.readiness}%</span></div>
              <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${s.readiness}%` }} /></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setContacted(p => [...p, s.id]); toast.success(`Connection request sent to ${s.name}!`); }}
                className={`btn-primary flex-1 text-xs py-2.5 ${contacted.includes(s.id) ? 'opacity-70' : ''}`}>
                <span className="flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />{contacted.includes(s.id) ? 'Sent ✓' : 'Connect'}
                </span>
              </button>
              <button onClick={() => toast('Full profile view coming soon!')} className="btn-secondary text-xs py-2.5 px-4">View</button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-white font-semibold">No startups found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </InvestorLayout>
  );
}
