'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Target, FileText, BarChart2, Bell, Rocket, ChevronRight,
  TrendingUp, Eye, Users, Star, Upload, Plus, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { FounderLayout } from '@/components/dashboard/FounderLayout';

function StatsGrid({ statsData }: { statsData: any }) {
  const stats = [
    { label: 'Investor Matches', value: statsData?.totalMatches?.toString() || '0', change: 'Live', icon: Target, color: '#0ea5e9' },
    { label: 'Profile Views', value: statsData?.profileViews?.toLocaleString() || '0', change: 'Total', icon: Eye, color: '#8b5cf6' },
    { label: 'Messages', value: '0', change: '0 unread', icon: MessageSquare, color: '#06b6d4' },
    { label: 'Funding Progress', value: 'Active', change: 'In progress', icon: TrendingUp, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}>
              <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color, width: 18, height: 18 }} />
            </div>
          </div>
          <div className="stat-number">{stat.value}</div>
          <p className="text-xs text-gray-500">{stat.label}</p>
          <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
        </motion.div>
      ))}
    </div>
  );
}

function RecentMatches({ matches }: { matches: any[] }) {
  const formatAmount = (num: number) => `$${(num / 1000000).toFixed(1)}M`;
  const getColor = (i: number) => ['#0ea5e9', '#8b5cf6', '#06b6d4', '#f59e0b'][i % 4];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg text-white">Top Investor Matches</h3>
        <Link href="/founder/dashboard/matches" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {matches.map((m, i) => (
          <motion.div
            key={m.investor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/3 transition-colors cursor-pointer group"
            style={{ border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: `${getColor(i)}25`, border: `1px solid ${getColor(i)}30` }}>
              {m.investor.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">{m.investor.name}</p>
                {m.investor.isVerified && <span className="badge badge-blue text-xs py-0.5">Verified</span>}
              </div>
              <p className="text-gray-500 text-xs">
                {m.investor.company || m.investor.designation || 'Angel Investor'} · 
                {(() => {
                  try {
                    const parsed = JSON.parse(m.investor.preferredSectors || '[]');
                    return Array.isArray(parsed) ? parsed[0] : '';
                  } catch { return 'Various'; }
                })()}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold gradient-text">{m.score}%</div>
              <div className="text-xs text-gray-500">match</div>
            </div>
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="text-xs text-gray-400">
                {formatAmount(m.investor.investmentCapacityMin)}–{formatAmount(m.investor.investmentCapacityMax)}
              </div>
              <div className="text-xs text-gray-600">capacity</div>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
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

function QuickActions() {
  const router = useRouter();
  const actions = [
    { icon: Upload, label: 'Update Pitch Deck', desc: 'Keep your deck fresh', color: '#8b5cf6', path: '/founder/dashboard/pitch' },
    { icon: Plus, label: 'Register for Event', desc: '3 upcoming events', color: '#0ea5e9', path: '/founder/dashboard/events' },
    { icon: Star, label: 'View Trust Score', desc: 'Score: 78/100', color: '#f59e0b', action: () => toast('Trust score coming soon!') },
    { icon: Users, label: 'Referral Program', desc: 'Earn rewards', color: '#10b981', action: () => toast('Referral program coming soon!') },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-lg text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button key={action.label} onClick={action.path ? () => router.push(action.path) : action.action}
            className="p-4 rounded-xl text-left transition-all duration-200 hover:scale-105"
            style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
            <action.icon className="w-5 h-5 mb-2" style={{ color: action.color }} />
            <p className="text-white text-sm font-semibold">{action.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FounderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

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

      // Fetch live data with auth headers
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
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(14,165,233,0.08))', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}>
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Update your pitch deck</p>
                <p className="text-gray-400 text-xs">Investors with matching criteria are 3x more likely to engage with a fresh deck.</p>
              </div>
              <button onClick={() => router.push('/founder/dashboard/pitch')} className="btn-primary text-xs py-2 px-4 flex-shrink-0">
                <span>Upload Deck</span>
              </button>
            </motion.div>

            {/* Recent Matches */}
            <RecentMatches matches={matches} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </FounderLayout>
  );
}
