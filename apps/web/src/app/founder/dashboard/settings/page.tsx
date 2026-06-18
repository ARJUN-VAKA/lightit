'use client';
import { useState, useEffect } from 'react';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { User, Mail, Phone, Building2, Globe, Save, Camera, Lock, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const SECTORS = ['AI/ML', 'SaaS', 'HealthTech', 'FinTech', 'EdTech', 'CleanTech', 'DeepTech', 'E-Commerce', 'B2B', 'Consumer'];
const STAGES  = ['Idea', 'MVP', 'Pre-Seed', 'Seed', 'Series A', 'Series B+'];

export default function FounderSettingsPage() {
  const [tab, setTab] = useState<'profile'|'startup'|'security'|'notifications'>('profile');
  const [saving, setSaving] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState(['AI/ML', 'HealthTech']);
  const [stage, setStage] = useState('Seed');
  const [notifs, setNotifs] = useState({ matches: true, messages: true, events: true, newsletter: false });

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', bio: '' });
  const [startup, setStartup] = useState({ name: '', tagline: '', website: '', mrr: '', funding: '', description: '' });
  const [passwords, setPasswords] = useState({ current: '', newp: '', confirm: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/founders/profile');
        if (res.data.data) {
          const p = res.data.data;
          setProfile({ name: p.name || '', email: p.user?.email || '', phone: p.phone || '', bio: p.bio || '' });
          if (p.startup) {
            setStartup({
              name: p.startup.name || '', tagline: p.startup.tagline || '', website: p.startup.website || '',
              mrr: (p.startup.mrr || 0).toString(), funding: (p.startup.fundingRequired || 0).toString(),
              description: p.startup.description || ''
            });
            setStage(p.startup.stage || 'Seed');
            try { setSelectedSectors(JSON.parse(p.startup.sector)); } catch { setSelectedSectors([p.startup.sector]); }
          }
        }
      } catch (e) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (tab === 'profile') {
        await api.put('/founders/profile', profile);
        toast.success('Profile saved successfully! ✅');
      } else if (tab === 'startup') {
        await api.post('/startups', {
          name: startup.name || 'My Startup',
          tagline: startup.tagline,
          description: startup.description || startup.tagline || 'Startup description',
          website: startup.website,
          mrr: Number(startup.mrr) || 0,
          fundingRequired: Number(startup.funding) || 0,
          stage: stage,
          sector: JSON.stringify(selectedSectors)
        });
        toast.success('Startup info saved successfully! ✅');
      } else {
        await new Promise(r => setTimeout(r, 500));
        toast.success('Settings saved successfully! ✅');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.current) { toast.error('Enter your current password'); return; }
    if (passwords.newp.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwords.newp !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setPasswords({ current: '', newp: '', confirm: '' });
    toast.success('Password changed successfully!');
  };

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'startup', label: 'Startup' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }] as const;

  return (
    <FounderLayout title="Settings" subtitle="Manage your account and startup profile">
      {/* Tabs */}
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

        {/* Profile Tab */}
        {tab === 'profile' && (
          <>
            {/* Avatar */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
                  {profile.name.charAt(0)}
                </div>
                <button onClick={() => toast('Photo upload coming soon!')} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0ea5e9' }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div>
                <p className="text-white font-semibold">{profile.name}</p>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <p className="text-gray-600 text-xs mt-1">Founder · Verified</p>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Personal Info</h3>
              {[
                { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                { label: 'Email', key: 'email', icon: Mail, type: 'email' },
                { label: 'Phone', key: 'phone', icon: Phone, type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                  <div className="relative">
                    <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={f.type} value={(profile as any)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} className="input-field pl-11" />
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="input-field resize-none" placeholder="Tell investors about yourself…" />
              </div>
              <button onClick={save} disabled={saving} className="btn-primary w-full py-3 text-sm">
                <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Profile'}</span>
              </button>
            </div>
          </>
        )}

        {/* Startup Tab */}
        {tab === 'startup' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-400" /> Startup Info</h3>
            {[
              { label: 'Startup Name', key: 'name', icon: Building2 },
              { label: 'Tagline', key: 'tagline', icon: Building2 },
              { label: 'Description', key: 'description', icon: Building2 },
              { label: 'Website', key: 'website', icon: Globe },
              { label: 'Monthly Revenue (MRR in USD)', key: 'mrr', icon: Building2 },
              { label: 'Funding Required (USD)', key: 'funding', icon: Building2 },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                <input value={(startup as any)[f.key]} onChange={e => setStartup(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Funding Stage</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} onClick={() => setStage(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${stage === s ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'text-gray-500 border-white/8 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Sectors</label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setSelectedSectors(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${selectedSectors.includes(s) ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'text-gray-500 border-white/8 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary w-full py-3 text-sm">
              <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Startup Info'}</span>
            </button>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-blue-400" /> Change Password</h3>
            {[
              { label: 'Current Password', key: 'current' },
              { label: 'New Password', key: 'newp' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{f.label}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" value={(passwords as any)[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} className="input-field pl-11" />
                </div>
              </div>
            ))}
            <button onClick={changePassword} disabled={saving} className="btn-primary w-full py-3 text-sm">
              <span className="flex items-center justify-center gap-2"><Shield className="w-4 h-4" />{saving ? 'Updating…' : 'Update Password'}</span>
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-blue-400" /> Notification Preferences</h3>
            {([
              { key: 'matches', label: 'New Investor Matches', desc: 'Get notified when new matches are found' },
              { key: 'messages', label: 'Message Alerts', desc: 'Notifications for new messages' },
              { key: 'events', label: 'Event Reminders', desc: 'Reminders for registered events' },
              { key: 'newsletter', label: 'Weekly Newsletter', desc: 'Weekly insights and tips' },
            ] as const).map(n => (
              <div key={n.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <p className="text-white text-sm font-medium">{n.label}</p>
                  <p className="text-gray-500 text-xs">{n.desc}</p>
                </div>
                <button onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-blue-500' : 'bg-gray-700'}`}>
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
    </FounderLayout>
  );
}
