import React, { useEffect, useRef } from 'react';
import { Sprout, Truck, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AuthAnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes definition
    const nodeCount = Math.min(45, Math.floor((width * height) / 25000));
    const colors = [
      '#10b981', // Emerald - Farmer
      '#34d399', // Mint - Fresh produce
      '#f59e0b', // Amber - Escrow money
      '#38bdf8', // Blue - Logistics truck
      '#14b8a6'  // Teal - Direct Market
    ];

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.5 + 0.3
      });
    }

    // Packet pulses that travel along lines between nodes
    const packets = [];
    const maxPackets = 12;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.baseAlpha;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Draw connections
      const maxDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Randomly spawn pulses on existing connections
            if (packets.length < maxPackets && Math.random() < 0.003) {
              packets.push({
                fromX: n1.x,
                fromY: n1.y,
                toX: n2.x,
                toY: n2.y,
                progress: 0,
                speed: 0.015 + Math.random() * 0.015,
                color: n1.color
              });
            }
          }
        }
      }

      // 3. Update & render traveling packets (representing escrow orders & produce batches)
      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(p, 1);
          continue;
        }

        const currX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
        const currY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;

        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Canvas Interactive Supply Chain Network */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* 2. Soft Ambient Glowing Aurora Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[110px] animate-pulse-soft" />
      <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[130px] animate-pulse-soft" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse-soft" />

      {/* 3. Flowing SVG Supply Chain Highways */}
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M -100 200 C 300 100, 500 500, 1200 350 S 1800 600, 2200 450"
          fill="none"
          stroke="url(#emeraldGradient)"
          strokeWidth="2"
          className="animate-dash-flow"
        />
        <path
          d="M -50 650 C 400 750, 700 250, 1300 400 S 1700 150, 2200 300"
          fill="none"
          stroke="url(#amberGradient)"
          strokeWidth="1.5"
          className="animate-dash-flow"
        />
        <defs>
          <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Strategic Floating Agribusiness Feature Badges (Visible on Laptops & Desktops) */}
      <div className="hidden xl:block">
        {/* Top-Left: Direct Farm Gate Sourcing */}
        <div className="absolute top-16 left-12 animate-float-slow">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-emerald-500/30 px-4 py-2.5 rounded-2xl shadow-xl shadow-emerald-950/40">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">Farm Gate Direct</span>
              </div>
              <p className="text-[10px] text-slate-300">Grade-A produce from Kiambu, Meru & Nakuru</p>
            </div>
          </div>
        </div>

        {/* Top-Right: Smart Escrow Protection */}
        <div className="absolute top-20 right-12 animate-float-reverse">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-xl shadow-amber-950/40">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">100% Escrow Protected</span>
              </div>
              <p className="text-[10px] text-slate-300">Funds locked until buyer inspects quality</p>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Real-time Cold Fleet Carrier */}
        <div className="absolute bottom-16 left-12 animate-float-reverse">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-sky-500/30 px-4 py-2.5 rounded-2xl shadow-xl shadow-sky-950/40">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-sky-300 tracking-wide uppercase">Freight & Cold Chain</span>
              </div>
              <p className="text-[10px] text-slate-300">3-Tonne & 5-Tonne carriers with OTP dispatch</p>
            </div>
          </div>
        </div>

        {/* Bottom-Right: M-Pesa Disbursal */}
        <div className="absolute bottom-20 right-12 animate-float-slow">
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-emerald-500/30 px-4 py-2.5 rounded-2xl shadow-xl shadow-emerald-950/40">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-emerald-300 tracking-wide uppercase">Safaricom M-Pesa Live</span>
              </div>
              <p className="text-[10px] text-slate-300">Instant atomic disbursal directly to farmer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
