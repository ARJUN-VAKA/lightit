'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Calendar, MapPin, Users, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  location: string;
  isVirtual: boolean;
  capacity: number;
  currentParticipants: number;
  coverImageUrl?: string;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/events?status=UPCOMING'),
      api.get('/events/my-registrations/list')
    ]).then(([eventsRes, regRes]) => {
      setEvents(eventsRes.data.data);
      setRegistered(regRes.data.data);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load events');
    }).finally(() => setLoading(false));
  }, []);

  const types = ['All', 'PITCH_COMPETITION', 'NETWORKING', 'WORKSHOP', 'CONFERENCE', 'HACKATHON'];
  const filtered = events.filter(e => filter === 'All' || e.eventType === filter);

  const handleRegister = async (id: string, title: string) => {
    if (registered.includes(id)) { toast('You are already registered!'); return; }
    try {
      await api.post(`/events/${id}/register`);
      setRegistered(p => [...p, id]);
      setEvents(events.map(e => e.id === id ? { ...e, currentParticipants: e.currentParticipants + 1 } : e));
      toast.success(`Registered for "${title}"! Check your email for details. 🎉`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register');
    }
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = { PITCH_COMPETITION: '#e5383b', NETWORKING: '#a4161a', WORKSHOP: '#b1a7a6', CONFERENCE: '#660708', HACKATHON: '#f59e0b' };
    return colors[type] || '#e5383b';
  };

  return (
    <InvestorLayout title="Events" subtitle="Exclusive networking, showcases & summits">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === t ? 'bg-red-600/20 text-red-400 border border-red-600/40' : 'text-gray-500 border border-white/8 hover:text-white'}`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Events Available', val: events.length }, { label: 'Registered', val: registered.length }, { label: 'This Month', val: events.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).length }].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className="stat-number text-2xl">{s.val}</div>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 glass-card">No events found matching the filter.</div>
      ) : (
      <div className="space-y-4">
        {filtered.map((ev, i) => {
          const isReg = registered.includes(ev.id);
          const pct = Math.round(ev.currentParticipants / (ev.capacity || 1) * 100);
          const color = getEventColor(ev.eventType);
          const date = new Date(ev.startDate);
          
          return (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card p-6">
              <div className="flex items-start gap-5">
                {/* Date block */}
                <div className="flex-shrink-0 w-16 text-center p-2 rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <p className="text-xs font-medium uppercase" style={{ color }}>{date.toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-white leading-none mt-1">{date.getDate()}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-bold font-display">{ev.title}</h3>
                        <span className="badge badge-blue text-xs">{ev.eventType.replace('_', ' ')}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 max-w-2xl">{ev.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.isVirtual ? 'Virtual' : ev.location}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{ev.currentParticipants}/{ev.capacity || '∞'} registered</span>
                      </div>
                      {/* Capacity bar */}
                      <div className="mt-3 w-48">
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct > 80 ? '#f59e0b' : undefined }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{pct}% full</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => handleRegister(ev.id, ev.title)}
                        className={isReg ? 'flex items-center justify-center gap-2 text-red-400 border border-red-600/30 px-5 py-2.5 rounded-xl text-sm font-semibold w-full' : 'btn-primary text-sm py-2.5 px-5 w-full'}>
                        {isReg ? <><CheckCircle className="w-4 h-4" /> Registered</> : <span>Register Now</span>}
                      </button>
                      <button onClick={() => toast('Event details opening…')} className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </InvestorLayout>
  );
}
