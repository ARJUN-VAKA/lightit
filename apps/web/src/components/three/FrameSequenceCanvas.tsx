'use client';

import { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 1503;
const FRAMES_PER_SEQ = 501;

// Window cache: only keep this many frames loaded at once around current position
const CACHE_WINDOW = 60;   // keep 60 frames total (30 ahead, 30 behind)
const PRELOAD_AHEAD = 30;  // preload 30 frames ahead
const PRELOAD_BEHIND = 30; // keep 30 frames behind

function getFrameUrl(index: number): string {
  let seq: number;
  let frame: number;
  if (index < FRAMES_PER_SEQ) {
    seq = 0;
    frame = index + 1;
  } else if (index < FRAMES_PER_SEQ * 2) {
    seq = 1;
    frame = (index - FRAMES_PER_SEQ) + 1;
  } else {
    seq = 2;
    frame = (index - FRAMES_PER_SEQ * 2) + 1;
  }
  const padded = String(frame).padStart(5, '0');
  return `/frames0${seq}/frame_${padded}.png`;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = canvasW / canvasH;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgAspect > canvasAspect) {
    sw = img.naturalHeight * canvasAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / canvasAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}

interface CinematicCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onProgress?: (progress: number) => void;
}

export function CinematicCanvas({ containerRef, onProgress }: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // ── Windowed cache: Map<index, HTMLImageElement> ──────────────
    const cache = new Map<number, HTMLImageElement>();
    const loading = new Set<number>(); // prevent duplicate loads
    let cancelled = false;

    function evictCache(currentIndex: number) {
      // Remove frames far from the current position
      for (const [key] of cache) {
        if (key < currentIndex - PRELOAD_BEHIND || key > currentIndex + PRELOAD_AHEAD) {
          cache.delete(key);
        }
      }
    }

    function loadFrame(index: number): void {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (cache.has(index) || loading.has(index)) return;
      loading.add(index);
      const img = new Image();
      img.onload = () => {
        if (!cancelled) {
          cache.set(index, img);
        }
        loading.delete(index);
      };
      img.onerror = () => loading.delete(index);
      img.src = getFrameUrl(index);
    }

    function preloadAround(index: number) {
      // Evict old frames first to free memory
      evictCache(index);
      // Load window around current frame
      for (let i = index; i <= Math.min(index + PRELOAD_AHEAD, TOTAL_FRAMES - 1); i++) {
        loadFrame(i);
      }
      for (let i = index - 1; i >= Math.max(index - PRELOAD_BEHIND, 0); i--) {
        loadFrame(i);
      }
    }

    // ── Canvas sizing ─────────────────────────────────────────────
    let canvasW = 0;
    let canvasH = 0;
    let lastDrawn = -1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      if (!canvas) return;
      canvasW = window.innerWidth;
      canvasH = window.innerHeight;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn = -1;
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Preload first 30 frames immediately ───────────────────────
    for (let i = 0; i < Math.min(PRELOAD_AHEAD, TOTAL_FRAMES); i++) {
      loadFrame(i);
    }

    // ── RAF draw loop ─────────────────────────────────────────────
    let rafId = 0;
    let lastPreloadIndex = -1;

    function tick() {
      if (cancelled) return;

      const el = containerRef.current;
      let frameIndex = 0;
      let progress = 0;

      if (el) {
        const scrolled = -el.getBoundingClientRect().top;
        const totalScrollable = el.offsetHeight - window.innerHeight;
        if (totalScrollable > 0) {
          progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
          frameIndex = Math.min(
            Math.floor(progress * (TOTAL_FRAMES - 1)),
            TOTAL_FRAMES - 1
          );
        }
      }

      // Only preload when we move significantly (every 5 frames)
      if (Math.abs(frameIndex - lastPreloadIndex) >= 5) {
        preloadAround(frameIndex);
        lastPreloadIndex = frameIndex;
      }

      if (frameIndex !== lastDrawn) {
        let img = cache.get(frameIndex);

        // Nearest loaded fallback
        if (!img) {
          for (let i = 1; i <= PRELOAD_BEHIND; i++) {
            if (cache.has(frameIndex - i)) { img = cache.get(frameIndex - i); break; }
            if (cache.has(frameIndex + i)) { img = cache.get(frameIndex + i); break; }
          }
        }

        if (img) {
          ctx!.fillStyle = '#000';
          ctx!.fillRect(0, 0, canvasW, canvasH);
          drawImageCover(ctx!, img, canvasW, canvasH);
          lastDrawn = frameIndex;
        }

        onProgress?.(progress);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      cache.clear();
      loading.clear();
    };
  }, [containerRef, onProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
