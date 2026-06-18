'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, TrendingUp, Megaphone, Calendar,
  Shield, LogOut, Zap, Bell, Search, Check, X, AlertTriangle, Activity,
  DollarSign, Eye, UserCheck, RefreshCw, Plus, Edit2, Trash2, Mail,
  BadgeCheck, Settings, Send, ChevronDown, ChevronUp, Star, Award,
  BarChart2, MessageSquare, Filter
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

const API = process.env.NEXT_PUBLIC_API_URL;
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ─── Nav Config ──────────────────────────────────────────────────────────────
const NAV = [
  { icon: LayoutDashboard, label: 'Overview',     id: 'overview' },
  { icon: Users,           label: 'Users',        id: 'users' },
  { icon: Building2,       label: 'Startups',     id: 'startups' },
  { icon: UserCheck,       label: 'Investors',    id: 'investors' },
  { icon: Megaphone,       label: 'Advertisements', id: 'ads' },
  { icon: Calendar,        label: 'Events',       id: 'events' },
  { icon: DollarSign,      label: 'Pricing',      id: 'pricing' },
  { icon: Mail,            label: 'Inbox',        id: 'inbox' },
  { icon: Shield,          label: 'Security',     id: 'security' },
];

const BADGE_TYPES = ['VERIFIED_INVESTOR', 'TOP_INVESTOR', 'EARLY_ADOPTER', 'ANGEL_INVESTOR', 'VC_PARTNER', 'ACTIVE_INVESTOR'];
const AD_TYPES    = ['BANNER', 'SIDEBAR', 'HERO', 'FEED_INLINE', 'FOOTER', 'EVENT_SPOTLIGHT'];
const AD_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED'];
const EVENT_TYPES = ['PITCH_COMPETITION', 'NETWORKING', 'WORKSHOP', 'CONFERENCE', 'DEMO_DAY', 'HACKATHON'];

// ─── Reusable Components ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-white font-display">{value}</div>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    SUSPENDED: 'bg-red-500/15 text-red-400 border-red-500/20',
    INACTIVE: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    DRAFT: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    PAUSED: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    EXPIRED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    UPCOMING: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    LIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    ENDED: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    UNREAD: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    READ: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    REPLIED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
      {status}
    </span>
  );
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        style={{ background: 'rgba(10,10,26,0.98)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display font-bold text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ─── Overview Panel ──────────────────────────────────────────────────────────
function OverviewPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`, getHeaders())
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { stats, monthlyRevenue, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Users"        value={stats.totalUsers}      color="#0ea5e9" />
        <StatCard icon={Building2}   label="Total Startups"     value={stats.totalStartups}   color="#8b5cf6" sub={`${stats.pendingStartups} pending`} />
        <StatCard icon={UserCheck}   label="Investors"          value={stats.totalInvestors}  color="#06b6d4" />
        <StatCard icon={DollarSign}  label="Total Revenue"      value={`$${(stats.totalRevenue||0).toLocaleString()}`} color="#10b981" />
        <StatCard icon={BarChart2}   label="Total Matches"      value={stats.totalMatches}    color="#f59e0b" />
        <StatCard icon={Megaphone}   label="Pending Ads"        value={stats.pendingAds||0}   color="#f97316" />
        <StatCard icon={Mail}        label="Unread Messages"    value={stats.unreadContacts||0} color="#ec4899" />
        <StatCard icon={Activity}    label="Founders"           value={stats.totalFounders}   color="#a78bfa" />
      </div>

      {monthlyRevenue?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-lg text-white mb-4">Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#4b5563" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {recentActivity?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-lg text-white mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-white/3 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-300 flex-1">{log.action} — {log.resource}</span>
                <span className="text-xs text-gray-600">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users Panel ─────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [deepDiveId, setDeepDiveId] = useState<string | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<any>(null);

  const fetchUsers = useCallback(() => {
    const params: any = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    setLoading(true);
    axios.get(`${API}/admin/users`, { ...getHeaders(), params })
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API}/admin/users/${id}/status`, { status }, getHeaders());
      toast.success(`User ${status.toLowerCase()}`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, getHeaders());
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Delete failed'); }
  };

  const openDeepDive = async (id: string) => {
    setDeepDiveId(id);
    setDeepDiveData(null);
    try {
      const res = await axios.get(`${API}/admin/users/${id}/full-profile`, getHeaders());
      setDeepDiveData(res.data.data);
    } catch { toast.error('Failed to fetch profile'); setDeepDiveId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-9 py-2.5 text-sm w-full" placeholder="Search by email..."
            value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
        </div>
        <select className="input-field py-2.5 text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="FOUNDER">Founders</option>
          <option value="INVESTOR">Investors</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button className="btn-secondary text-sm py-2.5" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-white/2 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{u.founder?.name || u.investor?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs font-medium text-blue-400">{u.role}</span></td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDeepDive(u.id)} className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {u.status === 'ACTIVE'
                      ? <button onClick={() => updateStatus(u.id, 'SUSPENDED')} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">Suspend</button>
                      : <button onClick={() => updateStatus(u.id, 'ACTIVE')} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">Activate</button>
                    }
                    <button onClick={() => deleteUser(u.id)} className="text-xs px-2.5 py-1 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-gray-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deepDiveId} onClose={() => setDeepDiveId(null)} title="Admin Deep Dive">
        {!deepDiveData ? <div className="py-10 text-center text-gray-500">Loading full profile...</div> : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{deepDiveData.founder?.name || deepDiveData.investor?.name || 'Admin User'}</h3>
                <p className="text-sm text-gray-400">{deepDiveData.email} • {deepDiveData.role}</p>
              </div>
              <StatusBadge status={deepDiveData.status} />
            </div>

            {deepDiveData.founder && (
              <div className="bg-white/5 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Startup & Documents</h4>
                {!deepDiveData.founder.startup ? <p className="text-xs text-gray-500">No startup profile.</p> :
                  (
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <p className="font-semibold text-white text-sm">{deepDiveData.founder.startup.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{deepDiveData.founder.startup.sector} • {deepDiveData.founder.startup.stage} • ${deepDiveData.founder.startup.fundingRequired} required</p>
                      {deepDiveData.founder.startup.documents?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {deepDiveData.founder.startup.documents.map((d: any) => (
                            <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline block">• {d.name} ({d.type})</a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
              </div>
            )}

            {deepDiveData.investor && (
              <div className="bg-white/5 p-4 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Investor Details & Matches</h4>
                <p className="text-xs text-gray-400">Total Invested: ${deepDiveData.investor.totalInvested} • Count: {deepDiveData.investor.investmentCount}</p>
                {deepDiveData.investor.matches.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs font-semibold text-gray-300">Top Matches:</p>
                    {deepDiveData.investor.matches.map((m: any) => (
                      <div key={m.id} className="text-xs bg-black/30 p-2 rounded border border-white/5 flex justify-between">
                        <span className="text-gray-300">{m.startup?.name}</span>
                        <span className="text-blue-400">{Math.round(m.score)}% Match</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Login Sessions</h4>
              {deepDiveData.sessions.length === 0 ? <p className="text-xs text-gray-500">No sessions logged.</p> :
                deepDiveData.sessions.map((s: any) => (
                  <p key={s.id} className="text-xs text-gray-400">• {new Date(s.createdAt).toLocaleString()} from {s.ipAddress} ({s.device})</p>
                ))
              }
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sent Messages (Last 10)</h4>
              {deepDiveData.sentMessages?.length === 0 ? <p className="text-xs text-gray-500">No messages.</p> :
                deepDiveData.sentMessages?.map((m: any) => (
                  <p key={m.id} className="text-xs text-gray-400 truncate">[{new Date(m.createdAt).toLocaleDateString()}] {m.content}</p>
                ))
              }
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Startups Panel ──────────────────────────────────────────────────────────
function StartupsPanel() {
  const [startups, setStartups] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    const params: any = {};
    if (filter === 'pending') params.approved = 'false';
    if (filter === 'approved') params.approved = 'true';
    setLoading(true);
    axios.get(`${API}/admin/startups`, { ...getHeaders(), params })
      .then(r => setStartups(r.data.data || []))
      .catch(() => toast.error('Failed to load startups'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = async (id: string, isApproved: boolean) => {
    try {
      await axios.patch(`${API}/admin/startups/${id}/approve`, { isApproved }, getHeaders());
      toast.success(isApproved ? 'Startup approved!' : 'Startup rejected');
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}>
            {f}
          </button>
        ))}
        <button className="ml-auto btn-secondary text-sm py-2" onClick={fetch}><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Startup', 'Founder', 'Sector / Stage', 'Funding', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading...</td></tr>
            ) : startups.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No startups found</td></tr>
            ) : startups.map(s => (
              <tr key={s.id} className="hover:bg-white/2 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-40">{s.tagline || s.description?.slice(0, 50)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-300">{s.founder?.name}</p>
                  <p className="text-xs text-gray-600">{s.founder?.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{s.sector} · {s.stage}</td>
                <td className="px-4 py-3 text-sm text-gray-300">${(s.fundingRequired / 1000000).toFixed(1)}M</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${s.isApproved ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'}`}>
                    {s.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!s.isApproved && (
                      <button onClick={() => approve(s.id, true)} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-1">
                        <Check className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {s.isApproved && (
                      <button onClick={() => approve(s.id, false)} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-1">
                        <X className="w-3 h-3" /> Revoke
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Investors Panel ─────────────────────────────────────────────────────────
function InvestorsPanel() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [badgeModal, setBadgeModal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/admin/investors`, getHeaders())
      .then(r => setInvestors(r.data.data || []))
      .catch(() => toast.error('Failed to load investors'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleVerify = async (inv: any) => {
    try {
      await axios.patch(`${API}/admin/investors/${inv.id}/verify`, { isVerified: !inv.isVerified }, getHeaders());
      toast.success(inv.isVerified ? 'Verification removed' : 'Investor verified!');
      fetch();
    } catch { toast.error('Action failed'); }
  };

  const assignBadge = async (investorId: string, badgeType: string) => {
    try {
      await axios.post(`${API}/admin/investors/${investorId}/badges`, { badgeType }, getHeaders());
      toast.success(`Badge "${badgeType}" assigned!`);
      fetch();
      setBadgeModal(null);
    } catch { toast.error('Failed to assign badge'); }
  };

  const removeBadge = async (investorId: string, badgeType: string) => {
    try {
      await axios.delete(`${API}/admin/investors/${investorId}/badges/${badgeType}`, getHeaders());
      toast.success('Badge removed');
      fetch();
    } catch { toast.error('Failed to remove badge'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">{investors.length} Investors</h3>
        <button className="btn-secondary text-sm py-2" onClick={fetch}><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> :
        investors.map(inv => (
          <div key={inv.id} className="glass-card p-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                {inv.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold">{inv.name}</p>
                  {inv.isVerified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
                  {inv.badges?.map((b: any) => (
                    <span key={b.id} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">
                      <Star className="w-3 h-3" /> {b.badgeType.replace(/_/g, ' ')}
                      <button onClick={() => removeBadge(inv.id, b.badgeType)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500">{inv.user?.email} · {inv.company || inv.designation || 'Angel Investor'}</p>
                <p className="text-xs text-gray-600 mt-0.5">{inv._count?.matches || 0} matches · {inv._count?.watchlist || 0} watchlist</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setBadgeModal(inv)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Badges
                </button>
                <button onClick={() => toggleVerify(inv)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${inv.isVerified ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                  {inv.isVerified ? <><X className="w-3.5 h-3.5" /> Unverify</> : <><Check className="w-3.5 h-3.5" /> Verify</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge Modal */}
      <Modal open={!!badgeModal} onClose={() => setBadgeModal(null)} title={`Assign Badge — ${badgeModal?.name}`}>
        <div className="grid grid-cols-2 gap-3">
          {BADGE_TYPES.map(bt => {
            const has = badgeModal?.badges?.some((b: any) => b.badgeType === bt);
            return (
              <button key={bt} onClick={() => has ? removeBadge(badgeModal.id, bt) : assignBadge(badgeModal.id, bt)}
                className={`p-3 rounded-xl text-sm font-medium text-left transition-all border ${has ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/3 text-gray-400 border-white/8 hover:border-purple-500/30 hover:text-purple-300'}`}>
                <Award className="w-4 h-4 mb-1" />
                {bt.replace(/_/g, ' ')}
                {has && <span className="ml-2 text-xs">(remove)</span>}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

// ─── Advertisements Panel ────────────────────────────────────────────────────
function AdsPanel() {
  const [ads, setAds] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [editAd, setEditAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', imageUrl: '', linkUrl: '', adType: 'BANNER',
    startDate: '', endDate: '', budget: '', cpm: '', targetSectors: '[]', targetCountries: '[]',
  });

  const fetch = useCallback(() => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    axios.get(`${API}/admin/ads`, { ...getHeaders(), params })
      .then(r => setAds(r.data.data || []))
      .catch(() => toast.error('Failed to load ads'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateAd = async (id: string, data: any) => {
    try {
      await axios.put(`${API}/admin/ads/${id}`, data, getHeaders());
      toast.success('Ad updated!');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await axios.delete(`${API}/admin/ads/${id}`, getHeaders());
      toast.success('Ad deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const createAd = async () => {
    try {
      await axios.post(`${API}/admin/ads`, form, getHeaders());
      toast.success('Ad created!');
      setCreateModal(false);
      setForm({ title: '', description: '', imageUrl: '', linkUrl: '', adType: 'BANNER', startDate: '', endDate: '', budget: '', cpm: '', targetSectors: '[]', targetCountries: '[]' });
      fetch();
    } catch { toast.error('Create failed'); }
  };

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="input-field py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {AD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-secondary text-sm py-2" onClick={fetch}><RefreshCw className="w-4 h-4" /></button>
        <button onClick={() => setCreateModal(true)} className="ml-auto btn-primary text-sm py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Ad
        </button>
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> :
        ads.length === 0 ? <div className="text-center py-10 text-gray-500">No advertisements found</div> :
        ads.map(ad => (
          <div key={ad.id} className="glass-card p-5">
            <div className="flex items-start gap-4 flex-wrap">
              {ad.imageUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-white font-semibold">{ad.title}</p>
                  <StatusBadge status={ad.status} />
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">{ad.adType}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{ad.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  <span>👁 {ad.impressions?.toLocaleString() || 0} impr.</span>
                  <span>🖱 {ad.clicks || 0} clicks</span>
                  <span>💰 ${ad.budget || 0} budget</span>
                  <span>📊 ${ad.cpm || 0} CPM</span>
                  <span>{new Date(ad.startDate).toLocaleDateString()} → {new Date(ad.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {/* Status control */}
                <select value={ad.status} onChange={e => updateAd(ad.id, { status: e.target.value })}
                  className="input-field text-xs py-1.5">
                  {AD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* Type/placement control */}
                <select value={ad.adType} onChange={e => updateAd(ad.id, { adType: e.target.value })}
                  className="input-field text-xs py-1.5">
                  {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setEditAd(ad)} className="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">
                    <Edit2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Ad Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Advertisement">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title"><input className="input-field py-2 text-sm" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Ad title" /></FormField>
          <FormField label="Ad Type">
            <select className="input-field py-2 text-sm" value={form.adType} onChange={e => f('adType', e.target.value)}>
              {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Image URL"><input className="input-field py-2 text-sm" value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://..." /></FormField>
          <FormField label="Link URL"><input className="input-field py-2 text-sm" value={form.linkUrl} onChange={e => f('linkUrl', e.target.value)} placeholder="https://..." /></FormField>
          <FormField label="Start Date"><input type="datetime-local" className="input-field py-2 text-sm" value={form.startDate} onChange={e => f('startDate', e.target.value)} /></FormField>
          <FormField label="End Date"><input type="datetime-local" className="input-field py-2 text-sm" value={form.endDate} onChange={e => f('endDate', e.target.value)} /></FormField>
          <FormField label="Budget (USD)"><input type="number" className="input-field py-2 text-sm" value={form.budget} onChange={e => f('budget', e.target.value)} placeholder="500" /></FormField>
          <FormField label="CPM Rate (USD)"><input type="number" className="input-field py-2 text-sm" value={form.cpm} onChange={e => f('cpm', e.target.value)} placeholder="5" /></FormField>
          <div className="col-span-2">
            <FormField label="Description"><textarea className="input-field py-2 text-sm w-full h-16 resize-none" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Ad description" /></FormField>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={createAd} className="btn-primary flex-1">Create Ad</button>
        </div>
      </Modal>

      {/* Edit Ad Modal */}
      <Modal open={!!editAd} onClose={() => setEditAd(null)} title="Edit Advertisement">
        {editAd && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="CPM Rate">
                <input type="number" className="input-field py-2 text-sm" defaultValue={editAd.cpm}
                  onChange={e => setEditAd((p: any) => ({ ...p, cpm: e.target.value }))} />
              </FormField>
              <FormField label="Budget">
                <input type="number" className="input-field py-2 text-sm" defaultValue={editAd.budget}
                  onChange={e => setEditAd((p: any) => ({ ...p, budget: e.target.value }))} />
              </FormField>
              <FormField label="Status">
                <select className="input-field py-2 text-sm" defaultValue={editAd.status}
                  onChange={e => setEditAd((p: any) => ({ ...p, status: e.target.value }))}>
                  {AD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Placement">
                <select className="input-field py-2 text-sm" defaultValue={editAd.adType}
                  onChange={e => setEditAd((p: any) => ({ ...p, adType: e.target.value }))}>
                  {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditAd(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { updateAd(editAd.id, { status: editAd.status, adType: editAd.adType, cpm: editAd.cpm, budget: editAd.budget }); setEditAd(null); }} className="btn-primary flex-1">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Events Panel ─────────────────────────────────────────────────────────────
function EventsPanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [notifyEventId, setNotifyEventId] = useState<string | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const emptyForm = {
    title: '', description: '', eventType: 'PITCH_COMPETITION',
    startDate: '', endDate: '', registrationDeadline: '',
    location: '', isVirtual: true, founderFee: '0', investorFee: '0',
    maxParticipants: '', prizePool: '0', coverImageUrl: '', streamUrl: '',
  };
  const [form, setForm] = useState(emptyForm);

  const fetch = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/admin/events`, getHeaders())
      .then(r => setEvents(r.data.data || []))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const createEvent = async () => {
    if (!form.title || !form.startDate || !form.endDate || !form.registrationDeadline) {
      toast.error('Title, dates and registration deadline are required'); return;
    }
    try {
      await axios.post(`${API}/admin/events`, form, getHeaders());
      toast.success('Event created!');
      setCreateModal(false);
      setForm(emptyForm);
      fetch();
    } catch { toast.error('Create failed'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API}/admin/events/${id}`, { status }, getHeaders());
      toast.success('Status updated');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await axios.delete(`${API}/admin/events/${id}`, getHeaders());
      toast.success('Event deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API}/admin/events/${editEvent.id}`, editEvent, getHeaders());
      toast.success('Event updated!');
      setEditEvent(null);
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const notifyAttendees = async () => {
    if (!notifyMessage.trim()) { toast.error('Message cannot be empty'); return; }
    try {
      await axios.post(`${API}/events/${notifyEventId}/notify`, { message: notifyMessage }, getHeaders());
      toast.success('Notification sent to all attendees!');
      setNotifyEventId(null);
      setNotifyMessage('');
    } catch { toast.error('Failed to send notification'); }
  };

  const EventForm = ({ data, onChange }: any) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><FormField label="Title"><input className="input-field py-2 text-sm w-full" value={data.title||''} onChange={e => onChange('title', e.target.value)} placeholder="Event title" /></FormField></div>
      <div className="col-span-2"><FormField label="Description"><textarea className="input-field py-2 text-sm w-full h-20 resize-none" value={data.description||''} onChange={e => onChange('description', e.target.value)} placeholder="Event description" /></FormField></div>
      <FormField label="Event Type">
        <select className="input-field py-2 text-sm" value={data.eventType||'PITCH_COMPETITION'} onChange={e => onChange('eventType', e.target.value)}>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </FormField>
      <FormField label="Cover Image URL"><input className="input-field py-2 text-sm" value={data.coverImageUrl||''} onChange={e => onChange('coverImageUrl', e.target.value)} placeholder="https://..." /></FormField>
      <FormField label="Start Date"><input type="datetime-local" className="input-field py-2 text-sm" value={data.startDate||''} onChange={e => onChange('startDate', e.target.value)} /></FormField>
      <FormField label="End Date"><input type="datetime-local" className="input-field py-2 text-sm" value={data.endDate||''} onChange={e => onChange('endDate', e.target.value)} /></FormField>
      <FormField label="Registration Deadline"><input type="datetime-local" className="input-field py-2 text-sm" value={data.registrationDeadline||''} onChange={e => onChange('registrationDeadline', e.target.value)} /></FormField>
      <FormField label="Location"><input className="input-field py-2 text-sm" value={data.location||''} onChange={e => onChange('location', e.target.value)} placeholder="City, Country or Online" /></FormField>
      <FormField label="Founder Fee (USD)"><input type="number" className="input-field py-2 text-sm" value={data.founderFee||0} onChange={e => onChange('founderFee', e.target.value)} /></FormField>
      <FormField label="Investor Fee (USD)"><input type="number" className="input-field py-2 text-sm" value={data.investorFee||0} onChange={e => onChange('investorFee', e.target.value)} /></FormField>
      <FormField label="Prize Pool (USD)"><input type="number" className="input-field py-2 text-sm" value={data.prizePool||0} onChange={e => onChange('prizePool', e.target.value)} /></FormField>
      <FormField label="Max Participants"><input type="number" className="input-field py-2 text-sm" value={data.maxParticipants||''} onChange={e => onChange('maxParticipants', e.target.value)} placeholder="Unlimited" /></FormField>
      <FormField label="Stream URL"><input className="input-field py-2 text-sm" value={data.streamUrl||''} onChange={e => onChange('streamUrl', e.target.value)} placeholder="https://youtube.com/..." /></FormField>
      <FormField label="Virtual Event">
        <select className="input-field py-2 text-sm" value={String(data.isVirtual ?? true)} onChange={e => onChange('isVirtual', e.target.value === 'true')}>
          <option value="true">Yes (Virtual)</option>
          <option value="false">No (In-Person)</option>
        </select>
      </FormField>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">{events.length} Events</h3>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm py-2" onClick={fetch}><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setCreateModal(true)} className="btn-primary text-sm py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> :
        events.length === 0 ? <div className="text-center py-10 text-gray-500">No events. Create one above!</div> :
        events.map(ev => (
          <div key={ev.id} className="glass-card p-5">
            <div className="flex items-start gap-4 flex-wrap">
              {ev.coverImageUrl && (
                <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <img src={ev.coverImageUrl} alt={ev.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-white font-semibold">{ev.title}</p>
                  <StatusBadge status={ev.status} />
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">{ev.eventType?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap mt-1">
                  <span>📅 {new Date(ev.startDate).toLocaleDateString()} → {new Date(ev.endDate).toLocaleDateString()}</span>
                  <span>👥 {ev._count?.registrations || 0}{ev.maxParticipants ? `/${ev.maxParticipants}` : ''} registered</span>
                  {ev.prizePool > 0 && <span>🏆 ${ev.prizePool?.toLocaleString()} prize</span>}
                  {ev.founderFee > 0 && <span>💰 ${ev.founderFee} founder fee</span>}
                  {ev.investorFee > 0 && <span>💰 ${ev.investorFee} investor fee</span>}
                  <span>{ev.isVirtual ? '🌐 Virtual' : `📍 ${ev.location}`}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <select value={ev.status} onChange={e => updateStatus(ev.id, e.target.value)} className="input-field text-xs py-1.5">
                  {['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setNotifyEventId(ev.id)}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> Notify
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditEvent({ ...ev, startDate: ev.startDate?.slice(0,16), endDate: ev.endDate?.slice(0,16), registrationDeadline: ev.registrationDeadline?.slice(0,16) })}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center justify-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => deleteEvent(ev.id)} className="text-xs py-1.5 px-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Event">
        <EventForm data={form} onChange={f} />
        <div className="flex gap-3 mt-6">
          <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={createEvent} className="btn-primary flex-1">Create Event</button>
        </div>
      </Modal>

      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event">
        {editEvent && (
          <>
            <EventForm data={editEvent} onChange={(k: string, v: any) => setEditEvent((p: any) => ({ ...p, [k]: v }))} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditEvent(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveEdit} className="btn-primary flex-1">Save Changes</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!notifyEventId} onClose={() => setNotifyEventId(null)} title="Notify Attendees">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Send an email/notification to all registered attendees of this event.</p>
          <textarea 
            className="input-field w-full h-32" 
            placeholder="Type your message here..."
            value={notifyMessage}
            onChange={e => setNotifyMessage(e.target.value)}
          />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setNotifyEventId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={notifyAttendees} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Pricing & Settings Panel ─────────────────────────────────────────────────
function PricingPanel() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/admin/config`, getHeaders())
      .then(r => setConfigs(r.data.data || []))
      .catch(() => toast.error('Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const updates = Object.entries(edited).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) { toast('No changes to save'); return; }
    setSaving(true);
    try {
      await axios.put(`${API}/admin/config`, { updates }, getHeaders());
      toast.success('Settings saved!');
      setEdited({});
      const r = await axios.get(`${API}/admin/config`, getHeaders());
      setConfigs(r.data.data || []);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const groups = [
    { label: '💳 Subscription Pricing', keys: ['subscription_monthly_price', 'subscription_quarterly_price', 'subscription_annual_price'] },
    { label: '📣 Advertisement Rates', keys: ['ad_default_cpm', 'ad_min_budget'] },
    { label: '📅 Event Defaults', keys: ['event_founder_fee_default', 'event_investor_fee_default'] },
    { label: '⚙️ Platform', keys: ['platform_name'] },
  ];

  const getConfig = (key: string) => configs.find(c => c.key === key);
  const getValue = (key: string) => edited[key] ?? getConfig(key)?.value ?? '';

  if (loading) return <div className="text-center py-10 text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {groups.map(g => (
        <div key={g.label} className="glass-card p-6 space-y-4">
          <h3 className="font-display font-bold text-white">{g.label}</h3>
          {g.keys.map(key => {
            const cfg = getConfig(key);
            if (!cfg) return null;
            const isChanged = edited[key] !== undefined && edited[key] !== cfg.value;
            return (
              <div key={key} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-300">{cfg.label}</label>
                  <p className="text-xs text-gray-600">{key}</p>
                </div>
                <div className="relative">
                  <input
                    className={`input-field py-2 text-sm w-36 text-right ${isChanged ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                    value={getValue(key)}
                    onChange={e => setEdited(p => ({ ...p, [key]: e.target.value }))}
                  />
                  {isChanged && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-deep-black" />}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex items-center justify-between">
        {Object.keys(edited).length > 0 && (
          <p className="text-sm text-blue-400">{Object.keys(edited).length} unsaved change{Object.keys(edited).length > 1 ? 's' : ''}</p>
        )}
        <button onClick={save} disabled={saving} className="btn-primary ml-auto flex items-center gap-2">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>
    </div>
  );
}

// ─── Inbox Panel ─────────────────────────────────────────────────────────────
function InboxPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: '', body: '', roles: [] as string[] });
  const [typeFilter, setTypeFilter] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    const params: any = {};
    if (typeFilter) params.type = typeFilter;
    axios.get(`${API}/admin/inbox`, { ...getHeaders(), params })
      .then(r => setMessages(r.data.data || []))
      .catch(() => toast.error('Failed to load inbox'))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const markStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${API}/admin/inbox/${id}`, { status }, getHeaders());
      toast.success('Updated');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.body) { toast.error('Title and body required'); return; }
    try {
      const r = await axios.post(`${API}/admin/notifications/broadcast`, broadcast, getHeaders());
      toast.success(r.data.message);
      setBroadcastModal(false);
      setBroadcast({ title: '', body: '', roles: [] });
    } catch { toast.error('Broadcast failed'); }
  };

  const toggleRole = (role: string) => {
    setBroadcast(p => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select className="input-field py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="GENERAL">General</option>
          <option value="AD_REQUEST">Ad Request</option>
          <option value="PARTNERSHIP">Partnership</option>
        </select>
        <button className="btn-secondary text-sm py-2" onClick={fetch}><RefreshCw className="w-4 h-4" /></button>
        <button onClick={() => setBroadcastModal(true)} className="ml-auto btn-primary text-sm py-2 flex items-center gap-2">
          <Send className="w-4 h-4" /> Broadcast
        </button>
      </div>

      <div className="space-y-2">
        {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> :
        messages.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Mail className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500">Inbox is empty</p>
          </div>
        ) : messages.map(msg => (
          <div key={msg.id} className={`glass-card overflow-hidden transition-all ${msg.status === 'UNREAD' ? 'border-blue-500/20' : ''}`}
            style={msg.status === 'UNREAD' ? { borderColor: 'rgba(59,130,246,0.2)' } : {}}>
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.status === 'UNREAD' ? 'bg-blue-500' : 'bg-gray-600'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${msg.status === 'UNREAD' ? 'text-white' : 'text-gray-400'}`}>{msg.subject}</p>
                  <StatusBadge status={msg.status} />
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{msg.type}</span>
                </div>
                <p className="text-xs text-gray-500">{msg.name} · {msg.email} · {new Date(msg.createdAt).toLocaleString()}</p>
              </div>
              {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
            <AnimatePresence>
              {expanded === msg.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap mb-4">{msg.message}</p>
                    <div className="flex gap-2">
                      {msg.status === 'UNREAD' && (
                        <button onClick={() => markStatus(msg.id, 'READ')} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors">Mark Read</button>
                      )}
                      {msg.status !== 'REPLIED' && (
                        <button onClick={() => markStatus(msg.id, 'REPLIED')} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">Mark Replied</button>
                      )}
                      <button onClick={() => markStatus(msg.id, 'CLOSED')} className="text-xs px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-gray-500/20 transition-colors">Close</button>
                      <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Reply via Email
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal open={broadcastModal} onClose={() => setBroadcastModal(false)} title="Broadcast Notification">
        <div className="space-y-4">
          <FormField label="Title"><input className="input-field py-2 text-sm w-full" value={broadcast.title} onChange={e => setBroadcast(p => ({ ...p, title: e.target.value }))} placeholder="Notification title" /></FormField>
          <FormField label="Message"><textarea className="input-field py-2 text-sm w-full h-24 resize-none" value={broadcast.body} onChange={e => setBroadcast(p => ({ ...p, body: e.target.value }))} placeholder="Notification message..." /></FormField>
          <FormField label="Send To (leave empty = all users)">
            <div className="flex gap-3">
              {['FOUNDER', 'INVESTOR'].map(role => (
                <button key={role} onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors ${broadcast.roles.includes(role) ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/3 text-gray-400 border-white/8'}`}>
                  {role}
                </button>
              ))}
            </div>
          </FormField>
          <div className="flex gap-3">
            <button onClick={() => setBroadcastModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={sendBroadcast} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Broadcast
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Security Panel ───────────────────────────────────────────────────────────
function SecurityPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/admin/security/logs`, getHeaders())
      .then(r => setLogs(r.data.data || []))
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold">Audit Log</h3>
          <button onClick={() => setLoading(true)} className="btn-secondary text-sm py-1.5"><RefreshCw className="w-4 h-4" /></button>
        </div>
        <div className="divide-y divide-white/3">
          {loading ? <div className="text-center py-10 text-gray-500">Loading...</div> :
          logs.length === 0 ? <div className="text-center py-10 text-gray-500">No logs found</div> :
          logs.map(log => (
            <div key={log.id} className="px-4 py-3 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500/60 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-300 font-medium">{log.action}</span>
                  <span className="text-gray-600 mx-2">·</span>
                  <span className="text-sm text-gray-500">{log.resource}{log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ''}</span>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <div>{log.user?.email || 'System'}</div>
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) { router.replace('/auth/admin'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'ADMIN') { router.replace('/auth/admin'); return; }
      setAdminUser(parsed);
    } catch { router.replace('/auth/admin'); }
  }, [router]);

  useEffect(() => {
    // Poll unread inbox count
    if (!adminUser) return;
    axios.get(`${API}/admin/inbox`, { ...getHeaders(), params: { status: 'UNREAD' } })
      .then(r => setUnreadCount(r.data.data?.length || 0))
      .catch(() => {});
  }, [adminUser]);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/admin';
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'users':     return <UsersPanel />;
      case 'startups':  return <StartupsPanel />;
      case 'investors': return <InvestorsPanel />;
      case 'ads':       return <AdsPanel />;
      case 'events':    return <EventsPanel />;
      case 'pricing':   return <PricingPanel />;
      case 'inbox':     return <InboxPanel />;
      case 'security':  return <SecurityPanel />;
      default:          return <OverviewPanel />;
    }
  };

  if (!adminUser) return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-deep-black">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-card-bg border-r border-white/5">
        <div className="flex items-center gap-2 p-5 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">Admin</span>
          <span className="ml-auto badge badge-purple text-xs py-0.5 px-1.5">Pro</span>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`sidebar-item w-full mb-0.5 relative ${activeNav === item.id ? 'active' : ''}`}>
              <item.icon style={{ width: 16, height: 16 }} />
              <span className="text-sm">{item.label}</span>
              {item.id === 'inbox' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>A</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Super Admin</p>
              <p className="text-gray-500 text-[10px] truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleSignOut}>
            <LogOut style={{ width: 16, height: 16 }} />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-deep-black/90 backdrop-blur-xl">
          <div>
            <h1 className="text-white font-display font-bold text-lg capitalize">{activeNav === 'overview' ? 'Dashboard Overview' : NAV.find(n => n.id === activeNav)?.label}</h1>
            <p className="text-gray-500 text-xs">LightIt Admin Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 text-gray-400 hover:text-white" onClick={() => setActiveNav('inbox')}>
              <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />}
            </button>
          </div>
        </div>

        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}
