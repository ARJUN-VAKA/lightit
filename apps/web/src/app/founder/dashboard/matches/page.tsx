'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { MessageSquare, ChevronRight, Star, Check, Filter, Search, MapPin, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [contacted, setContacted] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches/founder');
        setMatches(res.data.data || []);
      } catch {
        toast.error('Failed to load investor matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filtered = matches.filter(match => {
    const inv = match.investor;
    if (!inv) return false;
    const invType = inv.type || 'VC Fund';
    const passesFilter = filter === 'All' || invType === filter;
    const passesSearch = (inv.name || '').toLowerCase().includes(search.toLowerCase()) || 
                         (inv.sectors || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    return passesFilter && passesSearch;
  });

  const handleContact = (id: string, name: string) => {
    if (contacted.includes(id)) { toast('Already sent — check Messages!'); return; }
    setContacted(p => [...p, id]);
    toast.success(`Connection request sent to ${name}! 🚀`);
  };

  return (
    <FounderLayout title="Investor Matches" subtitle={loading ? "Finding investors..." : `${matches.length} investors matched to your profile`}>
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or sector…"
            className="input-field pl-11 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'VC Fund', 'Angel', 'Micro VC', 'Corporate VC'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-red-600/20 text-red-400 border border-red-600/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading AI Matches...</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((match, i) => {
          const inv = match.investor;
          const invType = inv.type || 'VC Fund';
          const color = match.score > 90 ? '#b1a7a6' : match.score > 80 ? '#e5383b' : '#f59e0b';

          return (
          <motion.div key={match.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5 group">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: `${color}25`, border: `1px solid ${color}40` }}>
                {inv.name?.substring(0, 2).toUpperCase() || 'IN'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-white text-base">{inv.name}</h3>
                  {inv.isVerified && <Check className="w-3.5 h-3.5 text-red-400" />}
                  <span className="badge badge-blue text-xs">{invType}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{inv.location || 'Global'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold font-display gradient-text">{Math.round(match.score)}%</div>
                <div className="text-xs text-gray-500">match</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4">{inv.bio || 'Investing in early stage disruptive startups.'}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {(inv.sectors || []).map((s: string) => <span key={s} className="badge badge-purple text-xs">{s}</span>)}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white font-bold text-sm">{inv.investmentCount || 0}</div>
                <div className="text-gray-500 text-xs">Portfolio</div>
              </div>
              <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white font-bold text-sm">{inv.totalInvested ? `$${inv.totalInvested}` : 'Undisclosed'}</div>
                <div className="text-gray-500 text-xs">Total Invested</div>
              </div>
              <div className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-white font-bold text-sm">${inv.minTicket || '50K'}</div>
                <div className="text-gray-500 text-xs">Min ticket</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleContact(inv.id, inv.name)}
                className={`btn-primary flex-1 text-xs py-2.5 ${contacted.includes(inv.id) ? 'opacity-70' : ''}`}>
                <span className="flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {contacted.includes(inv.id) ? 'Request Sent ✓' : 'Connect'}
                </span>
              </button>
              <button onClick={() => toast('Full profile coming soon!')} className="btn-secondary text-xs py-2.5 px-4">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
          );
        })}
      </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-white font-semibold">No matches found</p>
          <p className="text-gray-500 text-sm mt-1">Try a different search or filter</p>
        </div>
      )}
    </FounderLayout>
  );
}
