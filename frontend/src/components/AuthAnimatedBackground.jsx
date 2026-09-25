import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Truck, ShieldCheck, Zap, Users, ShoppingBag } from 'lucide-react';

// 4 Full-Screen High-Definition Agribusiness Imagery Themes
const FULLSCREEN_SCENES = [
  {
    id: 'crops',
    title: 'Crops & Fertile Farmlands',
    subtitle: 'Kenya’s agricultural breadbasket — Kiambu, Meru, Nakuru & Rift Valley',
    tag: 'Fresh Harvests',
    icon: Sprout,
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/60',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'farmers',
    title: 'Farmers Working the Land',
    subtitle: 'Over 450+ verified smallholder farmers harvesting Grade-A organic produce',
    tag: 'Direct Producers',
    icon: Users,
    badgeColor: 'border-green-500/40 text-green-300 bg-green-950/60',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'buyers',
    title: 'Commercial Buyers & B2B Trading',
    subtitle: 'Supermarkets, hotels and food processors sourcing directly without middlemen',
    tag: 'Wholesale Commerce',
    icon: ShoppingBag,
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/60',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=85',
  },
  {
    id: 'transporters',
    title: 'Transporters & Logistics Cargo Fleets',
    subtitle: 'Temperature-controlled cold chain & freight transport across East Africa',
    tag: 'Fleet Carriers',
    icon: Truck,
    badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-950/60',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&auto=format&fit=crop&q=85',
  }
];

export default function AuthAnimatedBackground() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const canvasRef = useRef(null);

  // Auto-rotate full background scene every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % FULLSCREEN_SCENES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Canvas particle supply chain network simulation
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

    const nodeCount = Math.min(35, Math.floor((width * height) / 32000));
    const colors = ['#10b981', '#34d399', '#f59e0b', '#38bdf8', '#ffffff'];

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }

    const packets = [];
    const maxPackets = 8;

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
            const alpha = (1 - dist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            if (packets.length < maxPackets && Math.random() < 0.002) {
              packets.push({
                fromX: n1.x,
                fromY: n1.y,
                toX: n2.x,
                toY: n2.y,
                progress: 0,
                speed: 0.012 + Math.random() * 0.012,
                color: n1.color
              });
            }
          }
        }
      }

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
        ctx.arc(currX, currY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 8;
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

  const activeScene = FULLSCREEN_SCENES[activeSceneIndex];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

      {/* ============================================================ */}
      {/* LAYER 1: FULLSCREEN BACKGROUND IMAGES (CROSS-FADING)         */}
      {/* ============================================================ */}
      {FULLSCREEN_SCENES.map((scene, idx) => {
        const isActive = idx === activeSceneIndex;
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={scene.url}
              alt={scene.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out"
              style={{ transform: isActive ? 'scale(1.04)' : 'scale(1.0)' }}
            />
          </div>
        );
      })}

      {/* ============================================================ */}
      {/* LAYER 2: DARK CINEMATIC OVERLAYS FOR MAXIMUM READABILITY     */}
      {/* ============================================================ */}
      {/* Full screen dark tint overlay */}
      <div className="absolute inset-0 bg-slate-950/60 transition-opacity duration-700" />

      {/* Vertical gradient to emphasize center form & bottom controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />

      {/* Soft center glow for the form container */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(2,6,23,0.45) 0%, rgba(2,6,23,0.85) 100%)'
        }}
      />

      {/* ============================================================ */}
      {/* LAYER 3: INTERACTIVE CANVAS PARTICLE MESH                    */}
      {/* ============================================================ */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40" />

      {/* ============================================================ */}
      {/* LAYER 4: ACTIVE SCENE ANNOUNCEMENT BADGE (TOP LEFT)         */}
      {/* ============================================================ */}
      <div className="hidden md:block absolute top-6 left-6 z-10 transition-all duration-500">
        <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <activeScene.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                {activeScene.title}
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              {activeScene.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 5: INTERACTIVE SCENE CONTROLS (BOTTOM PILLS)          */}
      {/* ============================================================ */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center z-10 pointer-events-auto px-4">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto">
          {FULLSCREEN_SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            const IconComp = scene.icon;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{scene.tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
