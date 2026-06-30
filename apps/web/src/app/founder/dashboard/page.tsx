'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Target, FileText, BarChart2, Bell, Rocket, ChevronRight,
  TrendingUp, Eye, Users, Star, Upload, Plus, MessageSquare,
  AlertCircle, Lightbulb, Award, ArrowUpRight, Zap, Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { NetworkGraph } from '@/components/three/NetworkGraph';
import AIMatchmakingModal from '@/components/dashboard/AIMatchmakingModal';

function StatsGrid({ statsData }: { statsData: any }) {
  const stats = [
    { label: 'Investor Matches', value: statsData?.totalMatches || 0, change: '+3 this week', icon: Target, color: '#0ea5e9' },
    { label: 'Profile Views', value: statsData?.profileViews || 1284, change: '+18% vs last month', icon: Eye, color: '#8b5cf6' },
    { label: 'Messages', value: 7, change: '3 unread', icon: MessageSquare, color: '#06b6d4' },
    { label: 'Funding Progress', value: 35, suffix: '%', change: 'Milestone: Pitch Ready', icon: TrendingUp, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
              <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color, width: 18, height: 18 }} />
            </div>
            <span className="text-emerald-400 text-xs font-medium">{stat.change}</span>
          </div>
          <div className="stat-number text-2xl md:text-3xl">
            <AnimatedCounter
              end={typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0}
              suffix={stat.suffix || ''}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function RecentMatches({ matches }: { matches: any[] }) {
  const formatAmount = (num: number) => `$${(num / 1000000).toFixed(1)}M`;
  const getColor = (i: number) => ['#0ea5e9', '#8b5cf6', '#06b6d4', '#f59e0b'][i % 4];

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="font-display font-bold text-lg text-white">Top Investor Matches</h3>
        <Link href="/founder/dashboard/matches" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {matches.slice(0, 4).map((m, i) => (
          <motion.div
            key={m.investor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-white/3 transition-colors cursor-pointer group"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: `${getColor(i)}25`, border: `1px solid ${getColor(i)}30` }}>
              {m.investor.name?.substring(0, 2)?.toUpperCase() || 'IN'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm truncate">{m.investor.name}</p>
                {m.investor.isVerified && <span className="badge badge-blue text-xs py-0.5 hidden sm:inline">Verified</span>}
              </div>
              <p className="text-gray-500 text-xs truncate">
                {m.investor.company || m.investor.designation || 'Angel Investor'}
              </p>
            </div>
            <div className="text-center flex-shrink-0 px-2">
              <div className="text-lg font-bold gradient-text">{m.score}%</div>
              <div className="text-xs text-gray-500">match</div>
            </div>
            <div className="hidden lg:block text-right flex-shrink-0">
              <div className="text-xs text-gray-400">
                {formatAmount(m.investor.investmentCapacityMin)}–{formatAmount(m.investor.investmentCapacityMax)}
              </div>
              <div className="text-xs text-gray-600">capacity</div>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary text-xs py-1.5 px-3 flex-shrink-0 hidden sm:block"
              onClick={(e) => { e.stopPropagation(); toast.success(`Message requested to ${m.investor.name}`); }}
            >
              Message
            </button>
          </motion.div>
        ))}
        {matches.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No matches found yet.</p>}
      </div>
    </div>
  );
}

function QuickActions({ onOpenAI }: { onOpenAI?: () => void }) {
  const router = useRouter();
  const actions = [
    { icon: Upload, label: 'Update Pitch Deck', desc: 'Keep your deck fresh', path: '/founder/dashboard/pitch', variant: 'brutalist-purple' },
    { icon: Brain, label: 'AI Matchmaking', desc: 'Deep analysis & insights', action: onOpenAI, variant: 'brutalist-cyan' },
    { icon: Plus, label: 'Register for Event', desc: '3 upcoming events', path: '/founder/dashboard/events', variant: 'brutalist-blue' },
    { icon: Star, label: 'View Trust Score', desc: 'Score: 78/100', action: () => toast('Trust score coming soon!'), variant: 'brutalist-amber' },
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button key={action.label} onClick={action.path ? () => router.push(action.path) : action.action}
            className={`brutalist-button ${action.variant}`}>
            <div className="brutalist-icon-wrapper">
              <action.icon className="brutalist-icon" style={{ color: 'var(--btn-icon)' }} />
            </div>
            <div className="brutalist-text-wrapper">
              <span className="text-[11px] font-normal opacity-80">{action.label}</span>
              <span className="text-xs font-semibold leading-tight mt-0.5">{action.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SmartInsights() {
  const insights = [
    { icon: Lightbulb, label: 'Complete your team section', desc: 'Startups with complete teams get 2.4x more views', color: '#f59e0b' },
    { icon: Target, label: 'AI Match Tip', desc: 'Add more sectors to expand matching range', color: '#0ea5e9' },
    { icon: Award, label: 'Funding Milestone', desc: 'Update your funding status for better visibility', color: '#8b5cf6' },
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg text-white mb-4">Smart Insights</h3>
      <div className="space-y-3">
        {insights.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <button className="mt-4 w-full btn-secondary text-xs py-2.5">
        <Zap className="w-3.5 h-3.5" /> View All Insights
      </button>
    </div>
  );
}

function MatchQualityWidget() {
  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-display font-bold text-lg text-white mb-3">Match Network</h3>
      <NetworkGraph className="mb-3" />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Investors</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Startups</span>
        <span className="text-blue-400">Live</span>
      </div>
    </div>
  );
}

function sampleActivities() {
  const now = new Date();
  return [
    { id: '1', type: 'view', title: 'Profile Viewed', description: 'Marcus Rivera viewed your startup profile', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString() },
    { id: '2', type: 'match', title: 'New Match Found', description: '95% match with Apex Ventures', timestamp: new Date(now.getTime() - 5 * 3600000).toISOString() },
    { id: '3', type: 'message', title: 'Message Received', description: 'Sarah from TechFund asked about your traction', timestamp: new Date(now.getTime() - 24 * 3600000).toISOString() },
    { id: '4', type: 'connection', title: 'Connection Accepted', description: 'GreenCap Investments accepted your request', timestamp: new Date(now.getTime() - 48 * 3600000).toISOString() },
  ];
}

export default function FounderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.replace('/auth/founder');
      return;
    }
    
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'FOUNDER' && parsed.role !== 'ADMIN') {
        router.replace('/auth/founder');
        return;
      }
      setUser(parsed);

      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      if (parsed.role !== 'ADMIN') {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/founders/analytics`, authHeaders)
          .then(res => setAnalytics(res.data.data))
          .catch(err => console.error('Failed to fetch analytics', err));
          
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/founders/matches`, authHeaders)
          .then(res => setMatches(res.data.data))
          .catch(err => console.error('Failed to fetch matches', err));
      }

    } catch {
      router.replace('/auth/founder');
    }
  }, [router]);

  if (!user) return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <FounderLayout title="Dashboard" subtitle={`Welcome back, ${user.name}`}>
      <div className="space-y-6">
        
        {/* Metrics Overview */}
        <StatsGrid statsData={analytics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Action Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(14,165,233,0.08))', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}>
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Update your pitch deck</p>
                <p className="text-gray-400 text-xs">Investors with matching criteria are 3x more likely to engage with a fresh deck.</p>
              </div>
              <button onClick={() => router.push('/founder/dashboard/pitch')} className="btn-primary text-xs py-2 px-4 flex-shrink-0 w-full sm:w-auto">
                <span className="flex items-center justify-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload Deck</span>
              </button>
            </motion.div>

            {/* Recent Matches */}
            <RecentMatches matches={matches} />

            {/* Activity Timeline */}
            <ActivityTimeline activities={sampleActivities()} />
          </div>

          <div className="space-y-6">
            <QuickActions onOpenAI={() => setShowAIModal(true)} />
            <SmartInsights />
            <MatchQualityWidget />
          </div>
        </div>
      </div>

      <AIMatchmakingModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </FounderLayout>
  );
}
