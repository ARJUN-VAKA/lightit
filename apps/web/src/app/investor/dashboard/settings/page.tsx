'use client';
import { useState } from 'react';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { User, Mail, Building2, Globe, Save, Camera, Lock, Bell, Shield, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTORS = ['AI/ML','SaaS','HealthTech','FinTech','EdTech','CleanTech','DeepTech','B2B','Consumer','E-Commerce'];
const STAGES  = ['Idea','Pre-Seed','Seed','Series A','Series B','Series C+'];

export default function InvestorSettingsPage() {
  const [tab, setTab] = useState<'profile'|'investment'|'security'|'notifications'>('profile');
  const [saving, setSaving] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState(['AI/ML','SaaS','HealthTech']);
  const [selectedStages, setSelectedStages] = useState(['Seed','Series A']);
  const [notifs, setNotifs] = useState({ matches: true, messages: true, events: true, newsletter: true });
  const [profile, setProfile] = useState({ name: 'Marcus Rivera', email: 'investor@demo.com', phone: '+1 555 0200', company: 'Apex Ventures', bio: 'Managing Partner at Apex Ventures. 15+ years investing in AI/ML and SaaS companies.', website: 'https://apexventures.vc' });
  const [investment, setInvestment] = useState({ minTicket: '1000000', maxTicket: '15000000', targetReturn: '10x', checkSize: '$1M–$15M' });
  const [passwords, setPasswords] = useState({ current: '', newp: '', confirm: '' });

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    toast.success('Settings saved! ✅');
  };

  const changePassword = async () => {
    if (!passwords.current) { toast.error('Enter current password'); return; }
    if (passwords.newp.length < 8) { toast.error('New password must be 8+ characters'); return; }
    if (passwords.newp !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setPasswords({ current: '', newp: '', confirm: '' });
    toast.success('Password updated!');
  };

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'investment', label: 'Investment Thesis' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }] as const;

  return (
    <InvestorLayout title="Settings" subtitle="Manage your investor profile and preferences">
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            style={tab === t.id ? { background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(59,130,246,0.3)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Profile */}
        {tab === 'profile' && (
          <>
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #a4161a, #e5383b)' }}>
                  {profile.name.charAt(0)}
                </div>
                <button onClick={() => toast('Photo upload coming soon!')} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#e5383b' }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div>
                <p className="text-white font-semibold">{profile.name}</p>
                <p className="text-gray-500 text-sm">{profile.company}</p>
                <span className="badge badge-gold text-xs mt-1">Premium Investor</span>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2"><User className="w-4 h-4 text-red-400" />Personal Info</h3>
              {[{ label: 'Full Name', key: 'name', icon: User }, { label: 'Email', key: 'email', icon: Mail }, { label: 'Phone', key: 'phone', icon: User }, { label: 'Company / Fund', key: 'company', icon: Building2 }, { label: 'Website', key: 'website', icon: Globe }].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={(profile as any)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} className="input-field pl-11" />
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="input-field resize-none" />
              </div>
              <button onClick={save} disabled={saving} className="btn-primary w-full py-3 text-sm">
                <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Profile'}</span>
              </button>
            </div>
          </>
        )}

        {/* Investment Thesis */}
        {tab === 'investment' && (
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-white font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-stone-400" />Investment Thesis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Min Ticket Size (USD)</label>
                <input value={investment.minTicket} onChange={e => setInvestment(p => ({ ...p, minTicket: e.target.value }))} type="number" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Max Ticket Size (USD)</label>
                <input value={investment.maxTicket} onChange={e => setInvestment(p => ({ ...p, maxTicket: e.target.value }))} type="number" className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Target Return Multiple</label>
              <input value={investment.targetReturn} onChange={e => setInvestment(p => ({ ...p, targetReturn: e.target.value }))} className="input-field" placeholder="e.g. 10x" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Preferred Sectors</label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setSelectedSectors(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedSectors.includes(s) ? 'bg-red-600/20 text-red-400 border-red-600/40' : 'text-gray-500 border-white/8 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Preferred Stages</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} onClick={() => setSelectedStages(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedStages.includes(s) ? 'bg-red-600/20 text-red-500 border-red-600/40' : 'text-gray-500 border-white/8 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary w-full py-3 text-sm">
              <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Investment Thesis'}</span>
            </button>
          </div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2"><Lock className="w-4 h-4 text-red-400" />Change Password</h3>
            {[{ label: 'Current Password', key: 'current' }, { label: 'New Password', key: 'newp' }, { label: 'Confirm New Password', key: 'confirm' }].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={(passwords as any)[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} className="input-field pl-11" />
                </div>
              </div>
            ))}
            <button onClick={changePassword} disabled={saving} className="btn-primary w-full py-3 text-sm">
              <span className="flex items-center justify-center gap-2"><Shield className="w-4 h-4" />{saving ? 'Updating…' : 'Update Password'}</span>
            </button>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-red-400" />Notifications</h3>
            {([{ key: 'matches', label: 'New Startup Matches', desc: 'When AI finds new matches for your thesis' }, { key: 'messages', label: 'Message Alerts', desc: 'Notifications for founder messages' }, { key: 'events', label: 'Event Reminders', desc: 'Reminders for registered events' }, { key: 'newsletter', label: 'Weekly Deal Flow', desc: 'Weekly curated startup digest' }] as const).map(n => (
              <div key={n.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div><p className="text-white text-sm font-medium">{n.label}</p><p className="text-gray-500 text-xs">{n.desc}</p></div>
                <button onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-red-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifs[n.key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
            <button onClick={save} disabled={saving} className="btn-primary w-full py-3 text-sm">
              <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Preferences'}</span>
            </button>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}
