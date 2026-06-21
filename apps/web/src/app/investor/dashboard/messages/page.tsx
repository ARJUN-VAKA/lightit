'use client';
import { useState, useRef, useEffect } from 'react';
import { InvestorLayout } from '@/components/dashboard/InvestorLayout';
import { Send, Search, Circle, ArrowLeft } from 'lucide-react';

const CONVERSATIONS = [
  { id: 1, name: 'NeuroSync AI', role: 'Founder — Sarah Chen', avatar: 'NS', color: '#8b5cf6', online: true,
    messages: [
      { from: 'them', text: 'Hi Marcus! Thank you for expressing interest in NeuroSync. Our MRR just crossed $45K.', time: '11:00 AM' },
      { from: 'me',   text: 'Impressive traction! Our AI flagged you as a 96% match. Can you walk me through your go-to-market strategy?', time: '11:05 AM' },
      { from: 'them', text: 'Absolutely! We\'re going PLG-first targeting therapists, then expanding to enterprise hospitals in Q3.', time: '11:08 AM' },
    ]},
  { id: 2, name: 'GreenLedger', role: 'Founder — Priya Nair', avatar: 'GL', color: '#10b981', online: true,
    messages: [
      { from: 'them', text: 'Hi! We just closed 3 Fortune 500 pilots. Would love to discuss Series A terms.', time: '9:30 AM' },
      { from: 'me',   text: 'That\'s great! What are the pilot sizes and expected conversion timelines?', time: '9:45 AM' },
    ]},
  { id: 3, name: 'TechVault', role: 'Founder — Arjun Mehta', avatar: 'TV', color: '#0ea5e9', online: false,
    messages: [{ from: 'them', text: 'We saw your portfolio — Apex Ventures would be a perfect fit. Open to a call?', time: 'Yesterday' }]},
  { id: 4, name: 'MedFlow AI', role: 'Founder — Dr. Amara Osei', avatar: 'MF', color: '#ec4899', online: false,
    messages: [{ from: 'them', text: 'FDA clearance expected in 8 weeks. Would love your support for our seed round.', time: 'Mon' }]},
];

export default function InvestorMessagesPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const active = activeId ? convos.find(c => c.id === activeId)! : null;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeId, convos]);

  const send = () => {
    if (!input.trim() || !activeId) return;
    const msg = input.trim();
    setConvos(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, { from: 'me', text: msg, time: 'Now' }] } : c));
    setInput('');
    setTimeout(() => {
      const replies = ['Thank you for your interest!', 'Great question — let me pull up those numbers.', 'Absolutely, we can schedule a call this week.', 'Our deck has all those details — shall I send it over?'];
      setConvos(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, { from: 'me', text: msg, time: 'Now' }, { from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: 'Now' }] } : c));
    }, 1200);
  };

  return (
    <InvestorLayout title="Messages" subtitle="Encrypted founder conversations">
      <div className="flex gap-0 rounded-2xl overflow-hidden glass-card" style={{ height: 'calc(100vh - 180px)' }}>
        <div className={`w-full md:w-72 flex-shrink-0 flex-col border-r ${active ? 'hidden md:flex' : 'flex'}`} style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input-field pl-10 text-sm py-2" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
              <div key={c.id} onClick={() => setActiveId(c.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b ${activeId === c.id ? 'bg-primary/10' : 'hover:bg-foreground/5'}`}
                style={{ borderColor: 'var(--border)' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: c.color, border: `1px solid ${c.color}40` }}>{c.avatar}</div>
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><p className="text-foreground text-sm font-semibold truncate">{c.name}</p><p className="text-muted-foreground text-xs">{c.messages.at(-1)?.time}</p></div>
                  <p className="text-muted-foreground text-xs truncate">{c.messages.at(-1)?.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`flex-1 flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setActiveId(null)} className="md:hidden mr-2 p-2 -ml-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ background: active.color }}>{active.avatar}</div>
                <div>
                  <p className="text-foreground font-semibold text-sm">{active.name}</p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    {active.online && <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />}
                    {active.online ? 'Online' : 'Offline'} · {active.role}
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {active.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me' ? 'text-white rounded-br-sm' : 'text-foreground rounded-bl-sm'}`}
                      style={msg.from === 'me' ? { background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' } : { background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      {msg.text}<p className="text-xs mt-1 opacity-60">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-3">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message…" className="input-field flex-1 py-3" />
                  <button onClick={send} className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-muted-foreground text-xs mt-2 text-center">🔒 End-to-end encrypted</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </InvestorLayout>
  );
}
