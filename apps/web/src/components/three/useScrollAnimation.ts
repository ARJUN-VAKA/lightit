'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 1503;

interface UseScrollAnimationOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollAnimation({ containerRef }: UseScrollAnimationOptions) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);

  useEffect(() => {
    function computeProgress() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      // How far the container top is above viewport top
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      const target = Math.floor(progress * (TOTAL_FRAMES - 1));

      setScrollProgress(progress);
      targetFrameRef.current = target;
    }

    function onScroll() {
      computeProgress();
    }

    // Smooth lerp loop for buttery-smooth frame transitions
    function tick() {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      if (current !== target) {
        // Snap directly for responsive feel (no lag)
        currentFrameRef.current = target;
        setFrameIndex(target);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    computeProgress(); // Initial computation
    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  return { frameIndex, scrollProgress };
}
