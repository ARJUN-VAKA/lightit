'use client';
import { useState, useRef, useEffect } from 'react';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { Send, Search, Circle, ArrowLeft } from 'lucide-react';

const CONVERSATIONS = [
  {
    id: 1, name: 'Marcus Rivera', role: 'Apex Ventures', avatar: 'MR', color: '#0ea5e9', online: true,
    messages: [
      { from: 'them', text: 'Hi! I reviewed your pitch deck — very impressive traction. What\'s your current MRR?', time: '10:30 AM' },
      { from: 'me',   text: 'Thanks Marcus! We\'re at $45K MRR, growing 18% month-over-month.', time: '10:32 AM' },
      { from: 'them', text: 'Incredible. Would you be open to a quick 30-min call this week to discuss a potential investment?', time: '10:35 AM' },
    ],
  },
  {
    id: 2, name: 'Sarah Mitchell', role: 'Angel Investor', avatar: 'SM', color: '#8b5cf6', online: true,
    messages: [
      { from: 'them', text: 'I saw your profile on LightIt. The HealthTech angle is really compelling.', time: '9:15 AM' },
      { from: 'me',   text: 'Thank you! We\'re solving a real problem — mental health is severely underfunded.', time: '9:18 AM' },
    ],
  },
  {
    id: 3, name: 'Horizon Capital', role: 'VC Fund', avatar: 'HC', color: '#06b6d4', online: false,
    messages: [
      { from: 'them', text: 'Your AI matching score with our portfolio thesis is 87%. Let\'s chat?', time: 'Yesterday' },
    ],
  },
  {
    id: 4, name: 'James O\'Connor', role: 'Angel', avatar: 'JO', color: '#f59e0b', online: false,
    messages: [
      { from: 'them', text: 'Congrats on the Product Hunt launch! Bookmarked your pitch.', time: 'Mon' },
    ],
  },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const active = activeId ? convos.find(c => c.id === activeId)! : null;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeId, convos]);

  const send = () => {
    if (!input.trim() || !activeId) return;
    setConvos(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, { from: 'me', text: input.trim(), time: 'Now' }] }
        : c
    ));
    setInput('');

    // Simulate reply after 1.2s
    setTimeout(() => {
      const replies = [
        'Thanks for sharing! This is very helpful.',
        'Great point. I\'ll have my team review this.',
        'Looking forward to connecting further!',
        'Could you send over your financial model as well?',
      ];
      setConvos(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { from: 'me', text: input.trim(), time: 'Now' }, { from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: 'Now' }] }
          : c
      ));
    }, 1200);
  };

  const filtered = convos.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <FounderLayout title="Messages" subtitle="Encrypted investor conversations">
      <div className="flex gap-0 rounded-2xl overflow-hidden glass-card" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Sidebar */}
        <div className={`w-full md:w-72 flex-shrink-0 flex-col border-r ${active ? 'hidden md:flex' : 'flex'}`} style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" className="input-field pl-10 text-sm py-2" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <div key={c.id} onClick={() => setActiveId(c.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b ${activeId === c.id ? 'bg-primary/10' : 'hover:bg-foreground/5'}`}
                style={{ borderColor: 'var(--border)' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c.color, border: `1px solid ${c.color}40` }}>
                    {c.avatar}
                  </div>
                  {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-foreground text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-muted-foreground text-xs">{c.messages.at(-1)?.time}</p>
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{c.messages.at(-1)?.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex-col overflow-hidden ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <>
              {/* Chat header */}
              <div className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setActiveId(null)} className="md:hidden mr-2 p-2 -ml-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: active.color }}>
                  {active.avatar}
                </div>
                <div>
                  <p className="text-foreground font-semibold text-sm">{active.name}</p>
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    {active.online && <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />}
                    {active.online ? 'Online' : 'Offline'} · {active.role}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {active.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${msg.from === 'me'
                      ? 'text-white rounded-br-sm' : 'text-foreground rounded-bl-sm'}`}
                      style={msg.from === 'me'
                        ? { background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }
                        : { background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                      {msg.text}
                      <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Type a message…"
                    className="input-field flex-1 py-3"
                  />
                  <button onClick={send}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
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
    </FounderLayout>
  );
}
