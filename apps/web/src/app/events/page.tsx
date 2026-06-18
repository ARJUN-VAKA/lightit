'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, CheckCircle, Rocket, Zap, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_EVENTS = [
  { id: 1, title: 'LightIt Demo Day — Summer 2025', date: 'Jul 15, 2025', time: '10:00 AM PST', location: 'San Francisco, CA + Virtual', type: 'Demo Day', audience: 'Founders', capacity: 200, registered: 147, color: '#0ea5e9', tag: 'Featured', desc: 'Present your startup live to 50+ top-tier investors. Apply to pitch or attend as an investor.' },
  { id: 2, title: 'AI & SaaS Founders Meetup', date: 'Jun 28, 2025', time: '6:00 PM EST', location: 'New York, NY', type: 'Networking', audience: 'Both', capacity: 80, registered: 74, color: '#8b5cf6', tag: 'Almost Full', desc: 'Intimate dinner event connecting AI/SaaS founders with Series A investors.' },
  { id: 3, title: 'Fundraising Masterclass: Seed to Series A', date: 'Jul 3, 2025', time: '2:00 PM EST', location: 'Virtual (Zoom)', type: 'Workshop', audience: 'Founders', capacity: 500, registered: 312, color: '#10b981', tag: 'Virtual', desc: 'Deep-dive workshop on term sheets, investor relations, and closing your round.' },
  { id: 4, title: 'Investor Summit 2025', date: 'Jul 10, 2025', time: '9:00 AM PST', location: 'San Francisco, CA', type: 'Summit', audience: 'Investors', capacity: 150, registered: 112, color: '#06b6d4', tag: 'Exclusive', desc: 'Exclusive summit for Premium investors. Meet 30+ curated founders and co-investors.' },
  { id: 5, title: 'HealthTech Innovation Summit', date: 'Jul 22, 2025', time: '9:00 AM EST', location: 'Boston, MA', type: 'Conference', audience: 'Both', capacity: 300, registered: 189, color: '#ec4899', tag: 'New', desc: 'Two-day summit for health startups, hospital systems, and health-focused VCs.' },
  { id: 6, title: 'Pitch Competition — $50K Prize', date: 'Aug 5, 2025', time: '11:00 AM PST', location: 'Los Angeles, CA', type: 'Competition', audience: 'Founders', capacity: 100, registered: 63, color: '#f59e0b', tag: 'Prize $50K', desc: 'Top 3 startups split a $50,000 cash prize. Apply to compete before Aug 1.' },
  { id: 7, title: 'CleanTech Deal Flow Forum', date: 'Aug 12, 2025', time: '9:00 AM PST', location: 'Seattle, WA', type: 'Conference', audience: 'Investors', capacity: 200, registered: 88, color: '#10b981', tag: 'New', desc: 'Deep-dive on ESG investing, carbon markets and CleanTech deal sourcing.' },
  { id: 8, title: 'Founder Office Hours with Top VCs', date: 'Jul 8, 2025', time: '3:00 PM EST', location: 'Virtual (Zoom)', type: 'Workshop', audience: 'Founders', capacity: 60, registered: 41, color: '#8b5cf6', tag: 'Virtual', desc: 'Direct 1-on-1 sessions with VC partners from top funds. Limited slots.' },
];

export default function EventsPublicPage() {
  const [registered, setRegistered] = useState<number[]>([]);
  const [filter, setFilter] = useState('All');
  const [audience, setAudience] = useState('All');
  const [search, setSearch] = useState('');

  const types = ['All','Demo Day','Networking','Workshop','Summit','Conference','Competition'];
  const filtered = ALL_EVENTS.filter(e =>
    (filter === 'All' || e.type === filter) &&
    (audience === 'All' || e.audience === audience || e.audience === 'Both') &&
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRegister = (id: number, title: string) => {
    if (registered.includes(id)) { toast('Already registered!'); return; }
    setRegistered(p => [...p, id]);
    toast.success(`Registered for "${title}"! 🎉`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5" style={{ background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">LightIt</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/founder" className="btn-secondary text-sm py-2 px-5">Founder Login</Link>
          <Link href="/auth/investor" className="btn-primary text-sm py-2 px-5"><span>Investor Login</span></Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-20 px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="badge badge-blue text-sm mb-4 inline-flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Upcoming Events 2025
          </span>
          <h1 className="font-display font-bold text-5xl text-white mt-2 mb-4">
            Where <span className="gradient-text">Founders</span> Meet <span className="gradient-text">Investors</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Pitch competitions, exclusive networking dinners, workshops and conferences — all curated for the startup ecosystem.
          </p>
          <div className="flex gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Users className="w-4 h-4" /> 2,400+ attendees this year
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Zap className="w-4 h-4" /> {ALL_EVENTS.length} events this season
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="input-field pl-12 text-sm" />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 flex-wrap">
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
            <span className="text-gray-700">|</span>
            {['All','Founders','Investors'].map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${audience === a ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ label: 'Events This Season', val: ALL_EVENTS.length }, { label: 'You Registered', val: registered.length }, { label: 'Total Attendees', val: '2,400+' }].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="stat-number text-2xl">{s.val}</div>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Event cards */}
        <div className="space-y-5">
          {filtered.map((ev, i) => {
            const isReg = registered.includes(ev.id);
            const pct = Math.round(ev.registered / ev.capacity * 100);
            return (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 text-center p-2 rounded-xl" style={{ background: `${ev.color}15`, border: `1px solid ${ev.color}30` }}>
                    <p className="text-xs font-medium" style={{ color: ev.color }}>{ev.date.split(' ')[0]}</p>
                    <p className="text-2xl font-bold text-white leading-none">{ev.date.split(' ')[1].replace(',', '')}</p>
                    <p className="text-xs text-gray-500">{ev.date.split(' ')[2]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-bold font-display text-lg">{ev.title}</h3>
                          <span className="badge badge-blue text-xs">{ev.tag}</span>
                          <span className="badge badge-purple text-xs">{ev.audience}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{ev.desc}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{ev.time}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ev.location}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{ev.registered}/{ev.capacity} registered</span>
                        </div>
                        <div className="mt-3 w-56">
                          <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct > 85 ? '#f59e0b' : undefined }} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{pct}% full · {ev.capacity - ev.registered} spots left</p>
                        </div>
                      </div>
                      <button onClick={() => handleRegister(ev.id, ev.title)}
                        className={`flex-shrink-0 ${isReg ? 'flex items-center gap-2 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl text-sm font-semibold' : 'btn-primary text-sm py-2.5 px-6'}`}>
                        {isReg ? <><CheckCircle className="w-4 h-4" /> Registered</> : <span>Register Free</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white font-semibold">No events found</p>
            <p className="text-gray-500 text-sm mt-1">Try different filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
