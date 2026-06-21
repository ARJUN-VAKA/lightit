'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search, Bookmark, Brain, MessageSquare,
  Calendar, CreditCard, BarChart2, Settings, LogOut, Building2,
  ChevronRight, Bell, TrendingUp, Users, Target, Zap, Filter,
  Star, Eye, MapPin, Check, ArrowUpRight, Lightbulb, DollarSign,
  Activity, PieChart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { NetworkGraph } from '@/components/three/NetworkGraph';

const SECTORS = ['All', 'AI/ML', 'SaaS', 'FinTech', 'HealthTech', 'CleanTech', 'EdTech', 'DeepTech'];
const STAGES = ['All', 'Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B'];

function KPIRow() {
  const kpis = [
    { label: 'Startups Reviewed', value: 248, change: '+61 this month', icon: Target, color: '#0ea5e9' },
    { label: 'Active Connections', value: 14, change: '3 in diligence', icon: MessageSquare, color: '#8b5cf6' },
    { label: 'Watchlist', value: 31, change: '+8 this week', icon: Bookmark, color: '#06b6d4' },
    { label: 'AI Matches', value: 12, change: 'new this week', icon: Brain, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {kpis.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-4 md:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
            </div>
            <span className="text-emerald-400 text-xs font-medium">{s.change}</span>
          </div>
          <div className="stat-number text-2xl">
            <AnimatedCounter end={s.value} />
          </div>
          <p className="text-gray-500 text-xs mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function StartupCard({ startup }: { startup: any }) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-5 md:p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `${startup.color}25`, border: `1px solid ${startup.color}30` }}>
            {startup.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">{startup.name}</h3>
              {startup.verified && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {(() => {
                try {
                  const parsed = JSON.parse(startup.sector || '[]');
                  return (Array.isArray(parsed) ? parsed : []).slice(0, 2).map((s: string) => (
                    <span key={s} className="badge badge-blue text-xs py-0.5">{s}</span>
                  ));
                } catch { return null; }
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-xl font-bold font-display gradient-text">{startup.fundingReadyScore || 0}%</div>
            <div className="text-xs text-gray-500">score</div>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-xl transition-all ${saved ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white'}`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{startup.tagline || startup.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Target className="w-3.5 h-3.5 flex-shrink-0" />
          {startup.stage}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
          Seeking ${((startup.fundingRequired || 0) / 1000000).toFixed(1)}M
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {startup.location || 'Global'}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Eye className="w-3.5 h-3.5 flex-shrink-0" />
          {(startup.viewCount || 0).toLocaleString()} views
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Funding Readiness</span>
          <span>{startup.fundingReadyScore || 0}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${startup.fundingReadyScore || 0}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          className="btn-primary flex-1 text-xs py-2.5"
          onClick={() => toast.success(`Connection request sent to ${startup.name}!`)}
        >
          <span className="flex items-center justify-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Connect
          </span>
        </button>
        <button className="btn-secondary text-xs py-2.5 px-4">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function MarketTrends() {
  const trends = [
    { sector: 'AI/ML', deals: 142, growth: '+34%', color: '#0ea5e9' },
    { sector: 'HealthTech', deals: 98, growth: '+28%', color: '#10b981' },
    { sector: 'CleanTech', deals: 76, growth: '+42%', color: '#06b6d4' },
    { sector: 'FinTech', deals: 65, growth: '+12%', color: '#f59e0b' },
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg text-white mb-4">Market Trends</h3>
      <div className="space-y-3">
        {trends.map((t, i) => (
          <motion.div
            key={t.sector}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: `${t.color}08`, border: `1px solid ${t.color}15` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
              <span className="text-white text-sm font-medium">{t.sector}</span>
            </div>
            <div className="text-right">
              <span className="text-white text-sm font-semibold">{t.deals} deals</span>
              <span className="text-emerald-400 text-xs ml-2">{t.growth}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function sampleInvestorActivities() {
  const now = new Date();
  return [
    { id: '1', type: 'match', title: 'AI Match Found', description: 'NeuroSync AI matches your portfolio at 96%', timestamp: new Date(now.getTime() - 1 * 3600000).toISOString() },
    { id: '2', type: 'view', title: 'Startup Viewed', description: 'You viewed GreenLedger - Carbon accounting platform', timestamp: new Date(now.getTime() - 4 * 3600000).toISOString() },
    { id: '3', type: 'message', title: 'Message from Founder', description: 'Sarah from NeuroSync AI sent a pitch deck', timestamp: new Date(now.getTime() - 24 * 3600000).toISOString() },
    { id: '4', type: 'connection', title: 'New Connection', description: 'You connected with ClimaTechHub founders', timestamp: new Date(now.getTime() - 48 * 3600000).toISOString() },
  ];
}

export default function InvestorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeSector, setActiveSector] = useState('All');
  const [activeStage, setActiveStage] = useState('All');
  const [startups, setStartups] = useState<any[]>([]);

  const fetchStartups = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/startups`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStartups(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch startups', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.replace('/auth/investor');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'INVESTOR' && parsed.role !== 'ADMIN') {
        router.replace('/auth/investor');
        return;
      }
      setUser(parsed);
      fetchStartups();
    } catch {
      router.replace('/auth/investor');
    }
  }, [router]);

  const filteredStartups = startups.filter(s => {
    try {
      const parsed = JSON.parse(s.sector || '[]');
      const sectorMatch = activeSector === 'All' || (Array.isArray(parsed) && parsed.includes(activeSector));
      const stageMatch = activeStage === 'All' || s.stage === activeStage;
      return sectorMatch && stageMatch;
    } catch {
      return true;
    }
  });

  if (!user) return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <InvestorLayout title="Investor Dashboard" subtitle={"Welcome back, " + user.name}>
      <div className="space-y-6">
        {/* KPI Row */}
        <KPIRow />

        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(14,165,233,0.08))', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">3 new high-confidence matches found today</p>
            <p className="text-gray-400 text-xs">NeuroSync AI (96%), DataFusion (91%), ClimaTech (88%) match your investment criteria</p>
          </div>
          <Link href="/investor/dashboard/recommendations" className="btn-primary text-xs py-2 px-4 flex-shrink-0 w-full sm:w-auto">
            <span className="flex items-center justify-center gap-1.5"><Brain className="w-3.5 h-3.5" /> View AI Picks</span>
          </Link>
        </motion.div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Discover Startups */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-white">Discover Startups</h2>
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {SECTORS.map((sector) => (
                  <button key={sector} onClick={() => setActiveSector(sector)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeSector === sector
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'text-gray-500 border border-white/8 hover:text-white hover:border-white/20'
                    }`}>
                    {sector}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {STAGES.map((stage) => (
                  <button key={stage} onClick={() => setActiveStage(stage)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                      activeStage === stage
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                        : 'text-gray-600 border border-white/5 hover:text-gray-400'
                    }`}>
                    {stage}
                  </button>
                ))}
              </div>

              {filteredStartups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                  {filteredStartups.map((startup) => (
                    <StartupCard key={startup.id || startup.name} startup={{
                      ...startup,
                      avatar: startup.name?.substring(0, 2)?.toUpperCase() || 'ST',
                      color: '#8b5cf6',
                    }} />
                  ))}
                </div>
              ) : startups.length > 0 ? (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">No matching startups</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your sector or stage filters</p>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 text-sm mt-4">Loading startups...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <MarketTrends />
            <ActivityTimeline activities={sampleInvestorActivities()} />
            <div className="glass-card p-4 md:p-6">
              <h3 className="font-display font-bold text-lg text-white mb-3">Portfolio Overview</h3>
              <NetworkGraph />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Startups</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Your picks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
