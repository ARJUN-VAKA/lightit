'use client';

import { useEffect, useRef } from 'react';

interface FrameSequenceCanvasProps {
  frameIndex: number;
  frames: (HTMLImageElement | null)[];
  className?: string;
}

export function FrameSequenceCanvas({
  frameIndex,
  frames,
  className = '',
}: FrameSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Resize canvas to fill viewport at device pixel ratio (capped at 2)
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx!.scale(dpr, dpr);
      lastFrameRef.current = -1; // force redraw
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Draw frame whenever frameIndex changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    if (frameIndex === lastFrameRef.current) return;

    const img = frames[frameIndex];
    if (!img) {
      // Frame not yet loaded — find the closest loaded frame nearby
      let fallback: HTMLImageElement | null = null;
      for (let i = 1; i <= 20; i++) {
        if (frames[frameIndex - i]) { fallback = frames[frameIndex - i]!; break; }
        if (frames[frameIndex + i]) { fallback = frames[frameIndex + i]!; break; }
      }
      if (!fallback) return;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawImageCover(ctx, fallback, window.innerWidth, window.innerHeight);
      return;
    }

    lastFrameRef.current = frameIndex;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawImageCover(ctx, img, window.innerWidth, window.innerHeight);
  }, [frameIndex, frames]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{
        pointerEvents: 'none',
        willChange: 'contents',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
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
    // Image is wider — crop sides
    sw = img.naturalHeight * canvasAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // Image is taller — crop top/bottom
    sh = img.naturalWidth / canvasAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}
