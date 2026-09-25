import React, { useEffect, useRef } from 'react';
import { Sprout, Truck, ShieldCheck, Zap } from 'lucide-react';

// Free high-quality Unsplash images — Kenyan agribusiness themed
const BG_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=85',
    label: 'Farmer in the field',
    position: 'top-0 left-0',
    size: 'w-80 h-64',
    rotate: '-rotate-2',
    delay: '0s'
  },
  {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=85',
    label: 'Fresh farm produce',
    position: 'top-0 right-0',
    size: 'w-72 h-60',
    rotate: 'rotate-2',
    delay: '1.5s'
  },
  {
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=85',
    label: 'Fruit and vegetable market',
    position: 'top-64 left-0',
    size: 'w-72 h-56',
    rotate: 'rotate-1',
    delay: '0.7s'
  },
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=85',
    label: 'Buyers at market',
    position: 'top-60 right-0',
    size: 'w-72 h-60',
    rotate: '-rotate-1',
    delay: '2.1s'
  },
  {
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=85',
    label: 'Logistics truck on road',
    position: 'bottom-0 left-0',
    size: 'w-80 h-60',
    rotate: '-rotate-2',
    delay: '1s'
  },
  {
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=85',
    label: 'Crops field',
    position: 'bottom-0 right-0',
    size: 'w-72 h-60',
    rotate: 'rotate-2',
    delay: '0.4s'
  }
];

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

    const nodeCount = Math.min(40, Math.floor((width * height) / 28000));
    const colors = ['#10b981', '#34d399', '#f59e0b', '#38bdf8', '#14b8a6'];

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }

    const packets = [];
    const maxPackets = 10;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

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
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const maxDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            if (packets.length < maxPackets && Math.random() < 0.002) {
              packets.push({ fromX: n1.x, fromY: n1.y, toX: n2.x, toY: n2.y, progress: 0, speed: 0.012 + Math.random() * 0.012, color: n1.color });
            }
          }
        }
      }

      for (let p = packets.length - 1; p >= 0; p--) {
        const pkt = packets[p];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) { packets.splice(p, 1); continue; }
        const currX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
        const currY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;
        ctx.beginPath();
        ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85;
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

      {/* ============================================================ */}
      {/* LAYER 1: REAL AGRIBUSINESS PHOTO COLLAGE (corners & edges)  */}
      {/* ============================================================ */}
      {BG_PHOTOS.map((photo, idx) => (
        <div
          key={idx}
          className={`absolute ${photo.position} ${photo.size} ${photo.rotate} animate-float-slow overflow-hidden rounded-2xl shadow-2xl border border-white/10`}
          style={{ animationDelay: photo.delay, opacity: 0.65 }}
        >
          <img
            src={photo.url}
            alt={photo.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Subtle inner shadow only at very bottom edge for blending */}
          <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 -40px 40px rgba(2,6,23,0.5)' }} />
        </div>
      ))}

      {/* ============================================================ */}
      {/* LAYER 2: CANVAS PARTICLE NETWORK (live data pulses)         */}
      {/* ============================================================ */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* ============================================================ */}
      {/* LAYER 3: AMBIENT GRADIENT OVERLAYS (depth & readability)    */}
      {/* ============================================================ */}
      {/* Mild center darkening — keeps the login card readable without hiding photos */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(2,6,23,0.35) 0%, transparent 100%)' }}
      />
      {/* Light edge vignette — just a hint, not a black wall */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(2,6,23,0.55) 100%)' }}
      />
      {/* Soft colored aurora glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/12 rounded-full blur-[100px] animate-pulse-soft" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-500/8 rounded-full blur-[120px] animate-pulse-soft" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-amber-500/8 rounded-full blur-[110px] animate-pulse-soft" />

      {/* ============================================================ */}
      {/* LAYER 4: FLOATING GLASSMORPHISM FEATURE BADGES              */}
      {/* ============================================================ */}
      <div className="hidden xl:block">
        {/* Top-Left: Farm Gate with mini crop image */}
        <div className="absolute top-16 left-12 animate-float-slow" style={{ animationDelay: '0s' }}>
          <div className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md border border-emerald-500/35 px-4 py-2.5 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&auto=format&fit=crop&q=80"
                alt="Farm crops"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">Farm Gate Direct</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">Grade-A produce from Kiambu,<br />Meru & Nakuru</p>
            </div>
          </div>
        </div>

        {/* Top-Right: Buyers with business image */}
        <div className="absolute top-20 right-12 animate-float-reverse" style={{ animationDelay: '1.2s' }}>
          <div className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md border border-amber-500/35 px-4 py-2.5 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1573497019236-61e7a0081f95?w=100&auto=format&fit=crop&q=80"
                alt="Business buyer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">Escrow Protected</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">Funds held securely until<br />buyer confirms quality</p>
            </div>
          </div>
        </div>

        {/* Bottom-Left: Transporter with truck image */}
        <div className="absolute bottom-16 left-12 animate-float-reverse" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md border border-sky-500/35 px-4 py-2.5 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-sky-500/40 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=100&auto=format&fit=crop&q=80"
                alt="Logistics truck"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Truck className="w-3 h-3 text-sky-400" />
                <span className="text-[11px] font-bold text-sky-300 tracking-wide uppercase">Cold-Chain Freight</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">3–5 tonne carriers with<br />live OTP dispatch system</p>
            </div>
          </div>
        </div>

        {/* Bottom-Right: M-Pesa with market people image */}
        <div className="absolute bottom-20 right-12 animate-float-slow" style={{ animationDelay: '1.8s' }}>
          <div className="flex items-center gap-3 bg-slate-900/75 backdrop-blur-md border border-emerald-500/35 px-4 py-2.5 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-500/40 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&auto=format&fit=crop&q=80"
                alt="Mobile payment"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300 tracking-wide uppercase">M-Pesa Instant Pay</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">Atomic disbursal directly<br />to farmer's M-Pesa wallet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
