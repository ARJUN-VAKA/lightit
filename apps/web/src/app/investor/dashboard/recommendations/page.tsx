'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Brain, Zap, TrendingUp, Target, MessageSquare, Bookmark, Check, Star, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const CONFIDENCE_COLORS: Record<string, string> = {
  'Very High': '#b1a7a6', 'High': '#e5383b', 'Medium-High': '#f59e0b', 'Medium': '#f59e0b'
};

export default function RecommendationsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches/investor');
      setMatches(res.data.data || []);
    } catch {
      toast.error('Failed to load AI matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
    toast.success('AI picks refreshed with latest data! ✨');
  };

  const visible = matches.filter(p => !hidden.includes(p.id));

  return (
    <InvestorLayout title="AI Picks" subtitle="Curated by our matching engine — updated daily">
      {/* Header banner */}
      <div className="flex items-center gap-4 p-5 rounded-2xl mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(14,165,233,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #a4161a, #e5383b)' }}>
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">🎯 {visible.length} high-confidence matches found</p>
          <p className="text-gray-400 text-sm">Our AI analyzed startups against your thesis — here are the best fits</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 btn-secondary text-sm py-2.5 px-4 flex-shrink-0">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading AI Matches...</div>
      ) : (
      <div className="space-y-5">
        {visible.map((pick, i) => {
          const confidence = pick.score > 90 ? 'Very High' : pick.score > 80 ? 'High' : 'Medium';
          const color = confidence === 'Very High' ? '#b1a7a6' : confidence === 'High' ? '#e5383b' : '#f59e0b';
          
          return (
          <motion.div key={pick.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-6">
            <div className="flex items-start gap-5">
              {/* Score */}
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <span className="text-xl font-bold font-display" style={{ color: color }}>{Math.round(pick.score)}%</span>
                  <span className="text-xs text-gray-500">match</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-white text-lg">{pick.startup?.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${CONFIDENCE_COLORS[confidence]}20`, color: CONFIDENCE_COLORS[confidence] }}>
                        {confidence}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{pick.startup?.tagline || pick.startup?.description?.substring(0, 100)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-purple text-xs">{pick.startup?.sector}</span>
                      <span className="badge badge-blue text-xs">{pick.startup?.stage}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setSaved(p => p.includes(pick.id) ? p.filter(x => x !== pick.id) : [...p, pick.id]); toast(saved.includes(pick.id) ? 'Removed from watchlist' : `${pick.startup?.name} saved!`); }}
                      className={`p-2 rounded-xl transition-all ${saved.includes(pick.id) ? 'text-red-400 bg-red-600/15' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                      <Bookmark className={`w-4 h-4 ${saved.includes(pick.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => setHidden(p => [...p, pick.id])} className="p-2 rounded-xl text-gray-600 hover:text-gray-400 hover:bg-white/5">✕</button>
                  </div>
                </div>

                {/* AI Reason */}
                {pick.reason && (
                <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                  <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{pick.reason}</p>
                </div>
                )}

                {/* Metrics & Actions */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex gap-4 text-xs text-gray-500">
                    {pick.startup?.mrr && <span>MRR: <strong className="text-white">${pick.startup?.mrr}</strong></span>}
                    <span>Readiness: <strong className="text-white">{pick.startup?.fundingReadyScore}%</strong></span>
                    <span>Seeking: <strong className="text-white">${pick.startup?.fundingRequired}</strong></span>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => toast.success(`Connection sent to ${pick.startup?.name}! 🚀`)} className="btn-primary text-xs py-2 px-4">
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Connect</span>
                    </button>
                    <button onClick={() => toast('Full profile view coming soon!')} className="btn-secondary text-xs py-2 px-4">View Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="text-center py-20">
          <Brain className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">All caught up!</p>
          <p className="text-gray-500 text-sm mt-2 mb-6">You've reviewed all AI picks. Refresh to load new recommendations.</p>
          <button onClick={refresh} className="btn-primary text-sm py-3 px-6"><span>Refresh AI Picks</span></button>
        </div>
      )}
    </InvestorLayout>
  );
}
