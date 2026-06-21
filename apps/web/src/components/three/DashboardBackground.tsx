'use client';

import { useRef, useEffect } from 'react';

export function DashboardBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const density = Math.min(1, w / 1920);
    const count = Math.floor((60 + Math.random() * 20) * density);
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; baseSize: number; alpha: number; targetAlpha: number;
      hue: number; sat: number; light: number;
      phase: number;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const isBright = Math.random() > 0.6;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: 0,
        baseSize: isBright ? 2.5 + Math.random() * 3 : 1.5 + Math.random() * 2,
        alpha: 0,
        targetAlpha: isBright ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.3,
        hue: isBright ? 190 + Math.random() * 50 : 210 + Math.random() * 60,
        sat: isBright ? 80 + Math.random() * 20 : 50 + Math.random() * 30,
        light: isBright ? 65 + Math.random() * 15 : 50 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.008;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        p.size += (p.baseSize + Math.sin(time * 2 + p.phase) * 0.5 - p.size) * 0.05;
        p.vx += (mx - 0.5) * 0.004 + Math.sin(time + p.phase) * 0.0008;
        p.vy += (my - 0.5) * 0.004 + Math.cos(time * 0.7 + p.phase) * 0.0008;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha * 0.3})`);
        grad.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180 * density + 40;
          if (dist < maxDist) {
            const strength = 1 - dist / maxDist;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(210, 70%, 65%, ${0.15 * strength * strength})`;
            ctx.lineWidth = 0.8 * strength + 0.2;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
