'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Zap, TrendingUp, Shield, Users, Target, ChevronRight,
  Star, ArrowRight, Check, Brain, Globe, Award, MessageSquare,
  BarChart2, Lock, Rocket, Building2, ChevronDown, Play
} from 'lucide-react';

// Dynamic import for Three.js (no SSR)
const HeroCanvas = dynamic(() => import('@/components/three/HeroCanvas').then(m => m.HeroCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-radial from-blue-950/20 to-transparent" />,
});

// ─── Reusable Components ──────────────────────────────────────

const FadeUp = ({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const GlassCard = ({ children, className = '', hover = true }: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <motion.div
    whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
    className={`glass-card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

// ─── Navbar ───────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">LightIt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing', 'Events'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="nav-link">
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/investor" className="btn-ghost text-sm">Investor Login</Link>
            <Link href="/auth/founder" className="btn-primary text-sm px-5 py-2.5">
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-6 h-0.5 bg-current mb-1.5 transition-all" style={{ transform: menuOpen ? 'rotate(45deg) translate(2px, 4px)' : '' }} />
            <div className="w-6 h-0.5 bg-current mb-1.5" style={{ opacity: menuOpen ? 0 : 1 }} />
            <div className="w-6 h-0.5 bg-current" style={{ transform: menuOpen ? 'rotate(-45deg) translate(2px, -4px)' : '' }} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden py-4 border-t border-white/5"
          >
            <div className="flex flex-col gap-3">
              {['Features', 'How It Works', 'Pricing', 'Events'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 py-2 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
              <Link href="/auth/founder" className="btn-primary text-sm mt-2">
                <span>Get Started Free</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-black">
      {/* 3D Canvas */}
      <HeroCanvas />

      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="badge badge-blue text-xs uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            AI-Powered Matchmaking Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-none tracking-tight"
        >
          Where{' '}
          <span className="gradient-text">Startups</span>
          <br />
          Meet{' '}
          <span className="gradient-text">Investors</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          LightIt uses advanced AI to connect high-potential founders with the right investors —
          intelligently, instantly, and securely.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth/founder/register" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
            <span className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              I'm a Founder
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link href="/auth/investor/register" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
            <TrendingUp className="w-5 h-5" />
            I'm an Investor
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-10 border-t border-white/5"
        >
          {[
            { value: '10,000+', label: 'Founders' },
            { value: '2,500+', label: 'Investors' },
            { value: '$2.4B+', label: 'Funding Matched' },
            { value: '94%', label: 'Match Accuracy' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-display gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-gray-600 cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest">Explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Our proprietary algorithm analyzes 6 key compatibility factors to deliver 94% accurate investor-founder matches.',
    color: '#0ea5e9',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Communication',
    description: 'End-to-end encrypted messaging with typing indicators, read receipts, file sharing and meeting requests.',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    icon: Shield,
    title: 'Bank-grade Security',
    description: 'AES-256 encryption, 2FA, NDA management, and GDPR compliance ensure your sensitive data stays protected.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-teal-500/10',
  },
  {
    icon: Award,
    title: 'Pitch Competitions',
    description: 'Participate in live pitch events, win prizes, and get discovered by top-tier investors through our events platform.',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: BarChart2,
    title: 'Deep Analytics',
    description: 'Track profile views, investor interest, match statistics, and funding readiness scores in real-time.',
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-500/10',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Connect with investors and founders across 150+ countries with location-aware matching preferences.',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-green-500/10',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 relative section-bg-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge badge-purple mb-4">Platform Features</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-4">
            Everything you need to{' '}
            <span className="gradient-text">raise & invest</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A complete ecosystem for startup funding — from discovery to deal close.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FadeUp key={feature.title} delay={i * 0.08}>
              <div
                className={`glass-card p-8 h-full bg-gradient-to-br ${feature.gradient} group cursor-default`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────
function HowItWorksSection() {
  const founderSteps = [
    { step: '01', title: 'Create your startup profile', desc: 'Share your vision, sector, funding needs, and upload your pitch deck.' },
    { step: '02', title: 'Get AI-matched', desc: 'Our engine analyzes compatibility and surfaces your top investor matches instantly.' },
    { step: '03', title: 'Connect & pitch', desc: 'Chat directly with matched investors, share decks, and schedule meetings.' },
    { step: '04', title: 'Close your round', desc: 'Move from introduction to term sheet with built-in NDA and document management.' },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative section-bg-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge badge-cyan mb-4">How It Works</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-4">
            From idea to <span className="gradient-text">funded</span> in days
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {founderSteps.map((step, i) => (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className="flex gap-5 group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center neon-border-blue font-display font-bold text-sm gradient-text group-hover:scale-105 transition-transform">
                    {step.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-display font-semibold text-lg text-white mb-1">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* AI Match Visualization */}
          <FadeUp delay={0.3}>
            <div className="glass-card p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

              <div className="relative">
                <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest">AI Match Found</p>

                {/* Match visualization */}
                <div className="flex items-center justify-center gap-6 mb-8">
                  {/* Founder */}
                  <div className="text-center">
                    <motion.div
                      animate={{ boxShadow: ['0 0 10px rgba(139,92,246,0.4)', '0 0 30px rgba(139,92,246,0.8)', '0 0 10px rgba(139,92,246,0.4)'] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-700/30 border border-purple-500/30 flex items-center justify-center mx-auto mb-3"
                    >
                      <Rocket className="w-7 h-7 text-purple-400" />
                    </motion.div>
                    <p className="text-xs text-gray-500">Founder</p>
                    <p className="text-sm font-semibold text-white">TechVault AI</p>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="w-20 h-20 rounded-full border-2 border-blue-500/50 flex items-center justify-center mx-auto relative"
                      style={{ background: 'conic-gradient(#0ea5e9 95%, rgba(255,255,255,0.08) 0)' }}
                    >
                      <div className="absolute inset-1 rounded-full bg-card-bg flex items-center justify-center">
                        <span className="text-xl font-bold font-display gradient-text">95%</span>
                      </div>
                    </motion.div>
                    <p className="text-xs text-gray-500 mt-2">Match Score</p>
                  </div>

                  {/* Investor */}
                  <div className="text-center">
                    <motion.div
                      animate={{ boxShadow: ['0 0 10px rgba(14,165,233,0.4)', '0 0 30px rgba(14,165,233,0.8)', '0 0 10px rgba(14,165,233,0.4)'] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 border border-blue-500/30 flex items-center justify-center mx-auto mb-3"
                    >
                      <Building2 className="w-7 h-7 text-blue-400" />
                    </motion.div>
                    <p className="text-xs text-gray-500">Investor</p>
                    <p className="text-sm font-semibold text-white">Apex Ventures</p>
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-2 text-left">
                  {[
                    'Strong sector alignment (AI / SaaS)',
                    'Funding range: $2M — perfectly matched',
                    'Seed stage preferred by investor',
                  ].map((reason, i) => (
                    <motion.div
                      key={reason}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + i * 0.15 }}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {reason}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ──────────────────────────────────────────
const PLANS = [
  {
    name: 'Monthly',
    price: '$99',
    period: '/month',
    features: ['Unlimited startup discovery', 'AI recommendations', 'Advanced filters', 'Priority messaging', 'Event access'],
    cta: 'Start Monthly',
    popular: false,
  },
  {
    name: 'Quarterly',
    price: '$249',
    period: '/quarter',
    features: ['Everything in Monthly', 'Early access opportunities', 'Startup analytics', 'Deal flow alerts', 'Priority support'],
    cta: 'Start Quarterly',
    popular: true,
  },
  {
    name: 'Annual',
    price: '$799',
    period: '/year',
    features: ['Everything in Quarterly', 'Dedicated success manager', 'Custom deal alerts', 'Investor profile boost', 'API access'],
    cta: 'Start Annual',
    popular: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge badge-gold mb-4">For Investors</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-4">
            Invest in <span className="gradient-text">the right deals</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Premium subscription plans for serious investors looking for quality deal flow.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <div className={`glass-card p-8 relative ${plan.popular ? 'border-blue-500/40 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-blue text-xs px-4">Most Popular</span>
                  </div>
                )}
                <h3 className="font-display font-bold text-xl text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold font-display gradient-text">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/investor/register"
                  className={plan.popular ? 'btn-primary w-full flex' : 'btn-secondary w-full flex'}
                >
                  <span className="flex-1 text-center">{plan.cta}</span>
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3} className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            <span className="text-emerald-400 font-medium">Founders join free.</span> Only investors pay for premium access.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Founder, NeuroSync AI',
    avatar: 'SC',
    color: '#8b5cf6',
    text: 'LightIt matched me with my Series A lead investor in under 72 hours. The AI understood exactly what kind of investor my startup needed.',
    raised: '$4.2M raised',
  },
  {
    name: 'Marcus Rivera',
    role: 'Partner, Apex Ventures',
    avatar: 'MR',
    color: '#0ea5e9',
    text: "The deal flow quality is exceptional. We've invested in 12 startups we discovered on LightIt in the past year alone.",
    raised: '12 investments',
  },
  {
    name: 'Priya Sharma',
    role: 'Founder, GreenLedger',
    avatar: 'PS',
    color: '#06b6d4',
    text: 'The pitch analyzer feature gave us a Funding Readiness Score that helped us fix our deck before approaching investors. Game-changer.',
    raised: '$1.8M raised',
  },
  {
    name: 'James O\'Connor',
    role: 'Angel Investor',
    avatar: 'JO',
    color: '#f59e0b',
    text: 'Best ROI on any platform subscription I\'ve had. Found 3 unicorn-potential startups in my first month.',
    raised: '$12M deployed',
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 relative section-bg-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <span className="badge badge-green mb-4">Success Stories</span>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-4">
            Trusted by <span className="gradient-text">thousands</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <div className="glass-card p-6 h-full flex flex-col gap-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: `${t.color}30`, border: `1px solid ${t.color}40` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
                <span className="badge badge-green text-xs self-start">{t.raised}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Events Preview ───────────────────────────────────────────
function EventsSection() {
  const events = [
    { title: 'Global Pitch Day 2025', date: 'July 20, 2025', type: 'Pitch Competition', prize: '$500K', spots: 48 },
    { title: 'CleanTech Summit', date: 'August 5, 2025', type: 'Demo Day', prize: '$250K', spots: 24 },
    { title: 'AI Founders Showcase', date: 'August 18, 2025', type: 'Networking', prize: '$100K', spots: 100 },
  ];

  return (
    <section id="events" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="badge badge-cyan mb-4">Upcoming Events</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl">
              Pitch. <span className="gradient-text">Win. Grow.</span>
            </h2>
          </div>
          <Link href="/events" className="btn-secondary text-sm px-5 py-2.5">
            View all events
          </Link>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <FadeUp key={event.title} delay={i * 0.1}>
              <div className="glass-card p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge badge-purple text-xs">{event.type}</span>
                  <span className="text-xs text-gray-500">{event.date}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-3">{event.title}</h3>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-gray-500">Prize Pool</p>
                    <p className="text-lg font-bold gradient-text-gold">{event.prize}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Open Spots</p>
                    <p className="text-lg font-bold text-white">{event.spots}</p>
                  </div>
                </div>
                <button className="btn-secondary w-full text-sm py-2.5">
                  Register Now
                </button>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────
const FAQS = [
  { q: 'How does the AI matching work?', a: 'Our proprietary algorithm scores compatibility across 6 factors: sector alignment (35%), funding match (20%), startup stage (15%), location (10%), risk appetite (10%), and behavioral signals (10%).' },
  { q: 'Is it free for founders?', a: 'Yes. Founders can create a profile, get matched, and communicate with investors completely free. Investors pay for premium access to our deal flow.' },
  { q: 'How secure is my data?', a: 'All messages are AES-256 encrypted end-to-end. We are GDPR compliant and offer NDA management for sensitive disclosures.' },
  { q: 'How long does it take to get matched?', a: 'Matching is instant. Once your profile is approved (usually within 24 hours), our AI surfaces your top investor matches immediately.' },
  { q: 'Can I use both Stripe and Razorpay?', a: 'Yes. Investors can pay via Stripe (international) or Razorpay (India). We support all major cards, UPI, and net banking.' },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
            Frequently <span className="gradient-text">asked</span>
          </h2>
        </FadeUp>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div
                className="glass-card overflow-hidden cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="flex items-center justify-between p-5">
                  <h3 className="font-semibold text-white text-sm sm:text-base">{faq.q}</h3>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, #0ea5e9)' }} />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <div className="glass-card p-12 sm:p-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-6">
              Ready to <span className="gradient-text">light it up?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join 12,500+ founders and investors already building the future together on LightIt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/founder/register" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Start as Founder — Free
                </span>
              </Link>
              <Link href="/auth/investor/register" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
                <Building2 className="w-5 h-5" />
                Investor Access
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">LightIt</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-powered platform connecting the world's most promising startups with visionary investors.
            </p>
          </div>

          {[
            { title: 'Platform', links: ['Founder Portal', 'Investor Portal', 'Events', 'Pricing', 'API'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Security', 'Cookie Policy'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-gradient mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} LightIt Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            SOC 2 · GDPR · ISO 27001 Compliant
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <EventsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
