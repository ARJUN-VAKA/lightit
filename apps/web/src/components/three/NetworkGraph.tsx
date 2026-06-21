'use client';

import { useRef, useEffect } from 'react';

interface NetworkGraphProps {
  className?: string;
}

export function NetworkGraph({ className = '' }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 300;
    const h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const centerX = w / 2;
    const centerY = h / 2;
    const nodeCount = 12;
    const nodes: { x: number; y: number; r: number; color: string; vx: number; vy: number }[] = [];
    const colors = ['#0ea5e9', '#8b5cf6', '#06b6d4', '#10b981'];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const dist = 60 + Math.random() * 60;
      nodes.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        r: 4 + Math.random() * 4,
        color: colors[i % colors.length],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 20 || node.x > w - 20) node.vx *= -1;
        if (node.y < 20 || node.y > h - 20) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 300, display: 'block' }}
      />
    </div>
  );
}
