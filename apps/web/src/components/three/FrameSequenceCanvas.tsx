'use client';

import { useEffect, useRef } from 'react';

// ─── Constants ──────────────────────────────────────────────────────────────
const TOTAL_FILES   = 1503;  // actual PNG files on disk
const FRAME_STEP    = 1;     // use every frame for maximum smoothness
const EFF_FRAMES    = Math.ceil(TOTAL_FILES / FRAME_STEP); // 1503
const FILES_PER_SEQ = 501;

const CACHE_AHEAD  = 80;   // decode this many frames ahead of playhead
const CACHE_BEHIND = 25;   // keep this many frames behind

// ─── URL builder ───────────────────────────────────────────────────────────
function getFrameUrl(effectiveIndex: number): string {
  const actualIndex = effectiveIndex * FRAME_STEP;
  let seq: number, frame: number;
  if (actualIndex < FILES_PER_SEQ) {
    seq = 0; frame = actualIndex + 1;
  } else if (actualIndex < FILES_PER_SEQ * 2) {
    seq = 1; frame = (actualIndex - FILES_PER_SEQ) + 1;
  } else {
    seq = 2; frame = (actualIndex - FILES_PER_SEQ * 2) + 1;
  }
  return `/frames0${seq}/frame_${String(frame).padStart(5, '0')}.png`;
}

// ─── Cover-crop helper ──────────────────────────────────────────────────────
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap | HTMLImageElement,
  cw: number, ch: number
) {
  const iw = img instanceof ImageBitmap ? img.width  : img.naturalWidth;
  const ih = img instanceof ImageBitmap ? img.height : img.naturalHeight;
  const ir = iw / ih;
  const cr = cw / ch;
  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (ir > cr) { sw = ih * cr; sx = (iw - sw) / 2; }
  else         { sh = iw / cr; sy = (ih - sh) / 2; }
  ctx.drawImage(img as CanvasImageSource, sx, sy, sw, sh, 0, 0, cw, ch);
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface CinematicCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onProgress?: (p: number) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export function CinematicCanvas({ containerRef, onProgress }: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let cancelled = false;

    // ── Frame cache: Map<effectiveIndex, ImageBitmap> ─────────────────────
    const cache   = new Map<number, ImageBitmap>();
    const loading = new Set<number>();

    async function loadFrame(idx: number) {
      if (idx < 0 || idx >= EFF_FRAMES) return;
      if (cache.has(idx) || loading.has(idx)) return;
      loading.add(idx);
      try {
        const resp = await fetch(getFrameUrl(idx));
        if (!resp.ok || cancelled) { loading.delete(idx); return; }
        const blob   = await resp.blob();
        const bitmap = await createImageBitmap(blob);
        if (!cancelled) cache.set(idx, bitmap);
      } catch { /* ignore failed frames */ }
      loading.delete(idx);
    }

    function evict(pivot: number) {
      for (const key of cache.keys()) {
        if (key < pivot - CACHE_BEHIND || key > pivot + CACHE_AHEAD) {
          cache.get(key)?.close();   // free GPU memory
          cache.delete(key);
        }
      }
    }

    let lastPreload = -999;
    function preloadAround(idx: number) {
      if (Math.abs(idx - lastPreload) < 5) return;
      lastPreload = idx;
      evict(idx);
      for (let i = idx; i <= Math.min(idx + CACHE_AHEAD, EFF_FRAMES - 1); i++) loadFrame(i);
      for (let i = idx - 1; i >= Math.max(idx - CACHE_BEHIND, 0); i--)        loadFrame(i);
    }

    // ── Preload first chunk immediately ───────────────────────────────────
    for (let i = 0; i < Math.min(CACHE_AHEAD, EFF_FRAMES); i++) loadFrame(i);

    // ── Canvas sizing ─────────────────────────────────────────────────────
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let cw = 0, ch = 0;

    function resize() {
      cw = window.innerWidth;
      ch = window.innerHeight;
      canvas!.width  = cw * DPR;
      canvas!.height = ch * DPR;
      canvas!.style.width  = `${cw}px`;
      canvas!.style.height = `${ch}px`;
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      lastDrawn = -1;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Scroll state: update via passive listener, read in RAF ────────────
    // This avoids getBoundingClientRect() in the RAF loop (no layout thrash)
    let scrollY       = window.scrollY;
    let containerTop  = 0;
    let containerH    = 0;

    function updateContainerMetrics() {
      const el = containerRef.current;
      if (!el) return;
      // getBoundingClientRect + scrollY = absolute top
      containerTop = el.getBoundingClientRect().top + window.scrollY;
      containerH   = el.offsetHeight;
    }
    updateContainerMetrics();

    function onScroll() { scrollY = window.scrollY; }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Recalculate container position on resize (layout may shift)
    function onResize() {
      resize();
      updateContainerMetrics();
    }
    window.addEventListener('resize', onResize, { passive: true });

    // ── RAF loop: only reads refs, no layout APIs ─────────────────────────
    let lastDrawn = -1;
    let rafId = 0;

    function tick() {
      if (cancelled) return;

      const totalScrollable = containerH - window.innerHeight;
      let progress = 0;
      let frameIdx = 0;

      if (totalScrollable > 0) {
        const scrolled = scrollY - containerTop;
        progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
        frameIdx = Math.min(Math.floor(progress * (EFF_FRAMES - 1)), EFF_FRAMES - 1);
      }

      preloadAround(frameIdx);

      if (frameIdx !== lastDrawn) {
        let bmp = cache.get(frameIdx);

        // Nearest-neighbour fallback
        if (!bmp) {
          for (let i = 1; i <= CACHE_BEHIND; i++) {
            if (cache.has(frameIdx - i)) { bmp = cache.get(frameIdx - i); break; }
            if (cache.has(frameIdx + i)) { bmp = cache.get(frameIdx + i); break; }
          }
        }

        if (bmp) {
          ctx!.fillStyle = '#000';
          ctx!.fillRect(0, 0, cw, ch);
          drawCover(ctx!, bmp, cw, ch);
          lastDrawn = frameIdx;
        }

        onProgress?.(progress);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      // Free all GPU bitmaps
      for (const bmp of cache.values()) bmp.close();
      cache.clear();
    };
  }, [containerRef, onProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
