'use client';

import { useEffect, useRef, useState } from 'react';

// Pure CSS/Canvas 3D fallback — no Three.js dependency issues
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Nodes
    const NODES = [
      { x: 0.5, y: 0.5, r: 18, color: '#8b5cf6', type: 'hub' },
      { x: 0.2, y: 0.3, r: 10, color: '#0ea5e9', type: 'investor' },
      { x: 0.75, y: 0.25, r: 9, color: '#0ea5e9', type: 'investor' },
      { x: 0.15, y: 0.65, r: 11, color: '#38bdf8', type: 'investor' },
      { x: 0.8, y: 0.6, r: 9, color: '#0ea5e9', type: 'investor' },
      { x: 0.55, y: 0.82, r: 8, color: '#06b6d4', type: 'investor' },
      { x: 0.3, y: 0.78, r: 10, color: '#0ea5e9', type: 'investor' },
      { x: 0.85, y: 0.35, r: 9, color: '#a78bfa', type: 'founder' },
      { x: 0.22, y: 0.5, r: 8, color: '#c084fc', type: 'founder' },
      { x: 0.7, y: 0.75, r: 9, color: '#a78bfa', type: 'founder' },
      { x: 0.4, y: 0.15, r: 8, color: '#c084fc', type: 'founder' },
    ];

    const CONNECTIONS = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10],[1,7],[2,4],[3,8]];

    // Particles
    const PARTICLES: { x: number; y: number; vy: number; vx: number; r: number; alpha: number; color: string }[] = [];
    for (let i = 0; i < 120; i++) {
      PARTICLES.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: -Math.random() * 0.0004 - 0.0001,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6',
      });
    }

    let t = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      t += 0.008;

      ctx.clearRect(0, 0, w, h);

      // Parallax offset from mouse
      const mx = (mouseRef.current.x - 0.5) * 20;
      const my = (mouseRef.current.y - 0.5) * 15;

      // Update & draw particles
      PARTICLES.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < 0 || p.x > 1) p.vx *= -1;

        ctx.beginPath();
        ctx.arc(p.x * w + mx * 0.3, p.y * h + my * 0.3, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(t * 2 + p.x * 10) * 0.2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw connections
      CONNECTIONS.forEach(([a, b]) => {
        const na = NODES[a], nb = NODES[b];
        const ax = na.x * w + Math.sin(t * 0.7 + a) * 8 + mx;
        const ay = na.y * h + Math.cos(t * 0.8 + a) * 6 + my;
        const bx = nb.x * w + Math.sin(t * 0.7 + b) * 8 + mx;
        const by = nb.y * h + Math.cos(t * 0.8 + b) * 6 + my;

        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, 'rgba(59,130,246,0.15)');
        grad.addColorStop(1, 'rgba(139,92,246,0.08)');

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4 + Math.sin(t * 1.5 + a) * 0.15;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Draw nodes
      NODES.forEach((node, i) => {
        const x = node.x * w + Math.sin(t * 0.7 + i * 1.2) * 8 + mx;
        const y = node.y * h + Math.cos(t * 0.8 + i * 1.1) * 6 + my;
        const pulse = 1 + Math.sin(t * 1.5 + i) * 0.08;

        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, node.r * 3.5 * pulse);
        gradient.addColorStop(0, node.color + '40');
        gradient.addColorStop(0.5, node.color + '15');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, node.r * 3.5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        const coreGrad = ctx.createRadialGradient(x - node.r * 0.3, y - node.r * 0.3, 0, x, y, node.r * pulse);
        coreGrad.addColorStop(0, '#fff5');
        coreGrad.addColorStop(0.3, node.color);
        coreGrad.addColorStop(1, node.color + 'aa');
        ctx.beginPath();
        ctx.arc(x, y, node.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}
