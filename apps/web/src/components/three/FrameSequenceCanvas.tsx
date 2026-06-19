'use client';

import { useEffect, useRef } from 'react';

// ─── No image helpers needed for video ─────────────────────────────────────

// ─── Props ──────────────────────────────────────────────────────────────────
interface CinematicCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onProgress?: (p: number) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function CinematicCanvas({ containerRef, onProgress }: CinematicCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    // Load video as a Blob to prevent HTTP Range Request stuttering on Vercel
    async function loadVideoBlob() {
      try {
        const resp = await fetch('/hero-sequence.mp4');
        if (!resp.ok) throw new Error('Network response was not ok');
        const blob = await resp.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        video!.src = objectUrl;
        video!.load();
      } catch (err) {
        console.error('Failed to load video blob:', err);
      }
    }
    loadVideoBlob();

    // ── Scroll state ────────────────────────────────────────────────────────
    let scrollY       = window.scrollY;
    let containerTop  = 0;
    let containerH    = 0;

    function updateContainerMetrics() {
      const el = containerRef.current;
      if (!el) return;
      containerTop = el.getBoundingClientRect().top + window.scrollY;
      containerH   = el.offsetHeight;
    }
    updateContainerMetrics();

    function onScroll() { scrollY = window.scrollY; }
    window.addEventListener('scroll', onScroll, { passive: true });

    function onResize() { updateContainerMetrics(); }
    window.addEventListener('resize', onResize, { passive: true });

    // ── RAF loop ────────────────────────────────────────────────────────────
    let rafId = 0;
    let currentProgress = 0;
    let targetProgress = 0;

    function tick() {
      if (cancelled) return;

      const totalScrollable = containerH - window.innerHeight;

      if (totalScrollable > 0) {
        const scrolled = scrollY - containerTop;
        targetProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      }

      // Smooth interpolation (LERP) for buttery smooth scrubbing
      currentProgress += (targetProgress - currentProgress) * 0.08;
      
      if (Math.abs(targetProgress - currentProgress) < 0.0001) {
        currentProgress = targetProgress;
      }

      // Scrub the video
      if (video!.duration && !isNaN(video!.duration)) {
        video!.currentTime = currentProgress * video!.duration;
      }

      onProgress?.(currentProgress);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [containerRef, onProgress]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
