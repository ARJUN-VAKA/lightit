'use client';

import { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 1503;

function getFrameUrl(index: number): string {
  const FRAMES_PER_SEQ = 501;
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

/**
 * Draw an image covering the canvas (object-fit: cover behaviour)
 */
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
  onFrame?: (frame: number) => void;
}

/**
 * CinematicCanvas
 * 
 * This component owns its own RAF loop and draws frames imperatively,
 * bypassing React's render cycle completely for maximum smoothness.
 * It reads scroll position itself every animation frame.
 */
export function CinematicCanvas({ containerRef, onProgress, onFrame }: CinematicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // ── Frame cache ──────────────────────────────────────────────
    const frames: (HTMLImageElement | null)[] = Array(TOTAL_FRAMES).fill(null);
    let loadedCount = 0;
    const CRITICAL = 40;
    const BATCH = 30;
    let cancelled = false;

    function loadImage(index: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (!cancelled) {
            frames[index] = img;
            loadedCount++;
          }
          resolve();
        };
        img.onerror = () => resolve(); // skip failed frames silently
        img.src = getFrameUrl(index);
      });
    }

    // Load first 40 frames immediately (critical path)
    const criticalPromises = Array.from({ length: CRITICAL }, (_, i) => loadImage(i));

    // Load rest in idle batches
    function loadRemainingIdle() {
      let next = CRITICAL;
      function doBatch() {
        if (cancelled) return;
        const end = Math.min(next + BATCH, TOTAL_FRAMES);
        const batch: Promise<void>[] = [];
        for (let i = next; i < end; i++) batch.push(loadImage(i));
        next = end;
        Promise.allSettled(batch).then(() => {
          if (!cancelled && next < TOTAL_FRAMES) {
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(doBatch, { timeout: 2000 });
            } else {
              setTimeout(doBatch, 50);
            }
          }
        });
      }
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doBatch, { timeout: 2000 });
      } else {
        setTimeout(doBatch, 100);
      }
    }

    // ── Canvas sizing ────────────────────────────────────────────
    let canvasW = 0;
    let canvasH = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap at 1.5x for perf
      canvasW = window.innerWidth;
      canvasH = window.innerHeight;
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      lastDrawn = -1; // force redraw
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── RAF draw loop ────────────────────────────────────────────
    let lastDrawn = -1;
    let rafId = 0;

    function tick() {
      if (cancelled) return;

      // Read scroll directly — no event listener needed
      const el = containerRef.current;
      let frameIndex = 0;
      let progress = 0;

      if (el) {
        const rect = el.getBoundingClientRect();
        const totalScrollable = el.offsetHeight - window.innerHeight;
        if (totalScrollable > 0) {
          const scrolled = -rect.top;
          progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
          frameIndex = Math.min(
            Math.floor(progress * (TOTAL_FRAMES - 1)),
            TOTAL_FRAMES - 1
          );
        }
      }

      // Only redraw when frame actually changes
      if (frameIndex !== lastDrawn) {
        let img = frames[frameIndex];

        // Fallback: find nearest loaded frame
        if (!img) {
          for (let i = 1; i <= 30; i++) {
            if (frameIndex - i >= 0 && frames[frameIndex - i]) {
              img = frames[frameIndex - i];
              break;
            }
            if (frameIndex + i < TOTAL_FRAMES && frames[frameIndex + i]) {
              img = frames[frameIndex + i];
              break;
            }
          }
        }

        if (img) {
          ctx!.fillStyle = '#000000';
          ctx!.fillRect(0, 0, canvasW, canvasH);
          drawImageCover(ctx!, img, canvasW, canvasH);
          lastDrawn = frameIndex;
        }

        onFrame?.(frameIndex);
        onProgress?.(progress);
      }

      rafId = requestAnimationFrame(tick);
    }

    // Start RAF loop after critical frames load
    Promise.allSettled(criticalPromises).then(() => {
      if (!cancelled) {
        tick();
        loadRemainingIdle();
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [containerRef, onProgress, onFrame]);

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
