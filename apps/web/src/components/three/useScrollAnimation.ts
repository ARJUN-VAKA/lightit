'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 1503;

interface UseScrollAnimationOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollAnimation({ containerRef }: UseScrollAnimationOptions) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Keep refs for the RAF loop so we never close over stale values
  const progressRef = useRef(0);
  const frameIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function computeProgress() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      progressRef.current = progress;
    }

    function tick() {
      computeProgress();

      const target = Math.floor(progressRef.current * (TOTAL_FRAMES - 1));
      if (target !== frameIndexRef.current) {
        frameIndexRef.current = target;
        setFrameIndex(target);
        setScrollProgress(progressRef.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // Kick off the RAF loop — it runs every frame regardless of scroll
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  return { frameIndex, scrollProgress };
}
