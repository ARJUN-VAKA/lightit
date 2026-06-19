'use client';

import { useEffect, useRef, useState } from 'react';

export interface FrameLoaderState {
  frames: (HTMLImageElement | null)[];
  loadedCount: number;
  totalFrames: number;
  isReady: boolean; // true once first batch is loaded
}

const TOTAL_FRAMES = 1503;
const FRAMES_PER_SEQ = 501;
const CRITICAL_BATCH = 40; // load synchronously before painting
const IDLE_BATCH_SIZE = 30;

function getFrameUrl(index: number): string {
  // index 0-362
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function useFrameLoader(): FrameLoaderState {
  const [loadedCount, setLoadedCount] = useState(0);
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    Array(TOTAL_FRAMES).fill(null)
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCriticalBatch() {
      const promises = Array.from({ length: CRITICAL_BATCH }, (_, i) =>
        loadImage(getFrameUrl(i))
          .then((img) => {
            if (!cancelled) {
              framesRef.current[i] = img;
              setLoadedCount((c) => c + 1);
            }
          })
          .catch(() => {
            // frame failed to load – leave as null
          })
      );
      await Promise.allSettled(promises);
      if (!cancelled) setIsReady(true);
    }

    function loadRemainingIdle() {
      let nextIndex = CRITICAL_BATCH;

      function loadBatch(deadline?: IdleDeadline) {
        if (cancelled) return;
        let count = 0;
        while (
          nextIndex < TOTAL_FRAMES &&
          (count < IDLE_BATCH_SIZE || (deadline && deadline.timeRemaining() > 0))
        ) {
          const i = nextIndex;
          nextIndex++;
          count++;
          loadImage(getFrameUrl(i))
            .then((img) => {
              if (!cancelled) {
                framesRef.current[i] = img;
                setLoadedCount((c) => c + 1);
              }
            })
            .catch(() => {});
        }

        if (nextIndex < TOTAL_FRAMES && !cancelled) {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(loadBatch, { timeout: 2000 });
          } else {
            setTimeout(() => loadBatch(), 100);
          }
        }
      }

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(loadBatch, { timeout: 2000 });
      } else {
        setTimeout(() => loadBatch(), 200);
      }
    }

    loadCriticalBatch().then(() => {
      if (!cancelled) loadRemainingIdle();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    frames: framesRef.current,
    loadedCount,
    totalFrames: TOTAL_FRAMES,
    isReady,
  };
}
