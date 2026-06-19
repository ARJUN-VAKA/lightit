'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, ChevronDown } from 'lucide-react';
import { FrameSequenceCanvas } from './FrameSequenceCanvas';
import { useFrameLoader } from './useFrameLoader';
import { useScrollAnimation } from './useScrollAnimation';

// ─── Scene definitions ────────────────────────────────────────
const SCENES = [
  {
    range: [0, 0.33] as [number, number],
    headline: 'Ideas Begin With\nA Spark',
    subtext: 'Every great innovation starts with a single idea.',
    accent: '#0ea5e9',
  },
  {
    range: [0.33, 0.66] as [number, number],
    headline: 'Every Vision Needs\nMomentum',
    subtext: 'The right support turns potential into progress.',
    accent: '#8b5cf6',
  },
  {
    range: [0.66, 1] as [number, number],
    headline: 'Where Ideas\nMeet Capital',
    subtext: 'Connecting founders and investors through intelligent matching.',
    accent: '#06b6d4',
  },
];

// ─── Reduced motion static fallback ──────────────────────────
function StaticFallbackHero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050505 0%, #0a0a2e 50%, #050505 100%)' }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        <HeroContent />
      </div>
    </section>
  );
}

// ─── Shared hero CTA content ──────────────────────────────────
function HeroContent() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <span className="badge badge-blue text-xs uppercase tracking-widest">
          AI-Powered Matchmaking Platform
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-none tracking-tight"
        style={{ color: '#ffffff' }}
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
        className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.65)' }}
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
          </span>
        </Link>
        <Link href="/auth/investor/register" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
          <TrendingUp className="w-5 h-5" />
          I'm an Investor
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {[
          { value: '10,000+', label: 'Founders' },
          { value: '2,500+', label: 'Investors' },
          { value: '$2.4B+', label: 'Funding Matched' },
          { value: '94%', label: 'Match Accuracy' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl sm:text-3xl font-bold font-display gradient-text">{stat.value}</div>
            <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </>
  );
}

// ─── Scene text overlay ───────────────────────────────────────
function SceneOverlay({
  progress,
}: {
  progress: number;
}) {
  // Which scene is active?
  const sceneIndex = SCENES.findIndex(
    (s) => progress >= s.range[0] && progress < s.range[1]
  );
  const activeScene = sceneIndex >= 0 ? SCENES[sceneIndex] : null;

  // Logo visible at the very end (85%+)
  const logoVisible = progress >= 0.85;

  // Scene text visible: not during the very start (< 0.02) and not in logo zone
  const sceneTextVisible = progress > 0.02 && progress < 0.82 && activeScene !== null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-4">
      {/* Scene headline & subtext */}
      <AnimatePresence mode="wait">
        {sceneTextVisible && activeScene && (
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl"
          >
            {/* Accent line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-0.5 mx-auto mb-6 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${activeScene.accent}, transparent)` }}
            />

            {/* Headline */}
            <h2
              className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 leading-tight tracking-tight whitespace-pre-line"
              style={{
                color: '#ffffff',
                textShadow: `0 0 60px ${activeScene.accent}40, 0 2px 20px rgba(0,0,0,0.8)`,
              }}
            >
              {activeScene.headline}
            </h2>

            {/* Subtext */}
            <p
              className="text-base sm:text-lg md:text-xl leading-relaxed font-light"
              style={{
                color: 'rgba(255,255,255,0.65)',
                textShadow: '0 1px 10px rgba(0,0,0,0.8)',
              }}
            >
              {activeScene.subtext}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo reveal at end */}
      <AnimatePresence>
        {logoVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Logo icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex items-center justify-center mb-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                  boxShadow: '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(14,165,233,0.3)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-8 h-8 text-white"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div
                className="font-display font-bold text-5xl sm:text-6xl md:text-7xl tracking-tight mb-3"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                }}
              >
                LIGHTIT
              </div>
              <p
                className="text-sm sm:text-base tracking-[0.25em] uppercase font-light"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Where Ideas Meet Capital
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Loading bar ──────────────────────────────────────────────
function LoadingBar({ loaded, total }: { loaded: number; total: number }) {
  const pct = Math.round((loaded / total) * 100);
  if (pct >= 100) return null;
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-0.5"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <motion.div
        className="h-full"
        style={{
          background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6)',
          width: `${pct}%`,
        }}
        transition={{ ease: 'linear' }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export function ScrollAnimationHero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { frames, loadedCount, totalFrames, isReady } = useFrameLoader();
  const { frameIndex, scrollProgress } = useScrollAnimation({ containerRef });

  // Show hero content after critical frames are ready
  useEffect(() => {
    if (isReady) setShowHero(true);
  }, [isReady]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return <StaticFallbackHero />;
  }

  return (
    <>
      {/* Loading progress bar */}
      <LoadingBar loaded={loadedCount} total={totalFrames} />

      {/*
        Scroll zone: 500vh tall.
        The sticky inner holds the canvas + text at 100vh.
        After scrolling through, the page content flows normally.
      */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: '500vh' }}
      >
        {/* Sticky canvas wrapper — stays fixed during scroll through */}
        <div
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: '100vh' }}
        >
          {/* Dark background fallback while frames load */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #050505 0%, #0a0a2e 50%, #050505 100%)',
            }}
          />

          {/* Ambient glow blobs that animate with scroll */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 2),
            }}
          >
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: '40vw',
                height: '40vw',
                top: '10%',
                left: '5%',
                background: 'radial-gradient(circle, rgba(14,165,233,0.15), transparent)',
              }}
            />
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: '30vw',
                height: '30vw',
                bottom: '10%',
                right: '5%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent)',
              }}
            />
          </motion.div>

          {/* Frame canvas */}
          {showHero && (
            <FrameSequenceCanvas
              frameIndex={frameIndex}
              frames={frames}
              className="z-10"
            />
          )}

          {/* Subtle vignette overlay */}
          <div
            className="absolute inset-0 z-15 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* Scene text overlays */}
          {scrollProgress > 0 && (
            <SceneOverlay progress={scrollProgress} />
          )}

          {/* Initial hero CTA — visible only at 0% scroll */}
          <AnimatePresence>
            {scrollProgress < 0.04 && showHero && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-20 flex items-center justify-center"
              >
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
                  <HeroContent />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll hint — visible only at start */}
          <AnimatePresence>
            {scrollProgress < 0.05 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scene progress dots */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-none">
            {SCENES.map((scene, i) => {
              const isActive = scrollProgress >= scene.range[0] && scrollProgress < scene.range[1];
              return (
                <motion.div
                  key={i}
                  animate={{
                    scale: isActive ? 1 : 0.6,
                    opacity: isActive ? 1 : 0.3,
                    backgroundColor: isActive ? scene.accent : 'rgba(255,255,255,0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-2 h-2 rounded-full"
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
