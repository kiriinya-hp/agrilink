import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Truck, Users, ShoppingBag } from 'lucide-react';

// 4 Full-Screen High-Definition Agribusiness Imagery Themes
// Structured in an automatic supply-chain sequence:
// Step 1: Crops Growing -> Step 2: Farmers Harvesting -> Step 3: Wholesale Buyers Purchasing -> Step 4: Transporters Delivering
const FULLSCREEN_SCENES = [
  {
    id: 'crops',
    step: '01',
    stage: 'Farm Cultivation',
    title: 'Fertile Crop Fields',
    subtitle: 'Healthy crops across Kenya: Kiambu, Meru, Nakuru & Rift Valley',
    tag: 'Crops & Farmland',
    icon: Sprout,
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&auto=format&fit=crop&q=90',
  },
  {
    id: 'farmers',
    step: '02',
    stage: 'Harvesting',
    title: 'Farmers in the Farm',
    subtitle: 'Dedicated farmers harvesting Grade-A organic vegetables & produce',
    tag: 'Farmers at Work',
    icon: Users,
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1920&auto=format&fit=crop&q=90',
  },
  {
    id: 'buyers',
    step: '03',
    stage: 'B2B Trade',
    title: 'Commercial Buyers Purchasing',
    subtitle: 'Supermarkets, retailers and bulk buyers purchasing direct from farmers',
    tag: 'B2B Market Trade',
    icon: ShoppingBag,
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&auto=format&fit=crop&q=90',
  },
  {
    id: 'transporters',
    step: '04',
    stage: 'Cold-Chain Delivery',
    title: 'Transporters & Logistics Cargo',
    subtitle: 'Verified carriers delivering fresh produce securely with OTP confirmation',
    tag: 'Logistics & Transit',
    icon: Truck,
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&auto=format&fit=crop&q=90',
  }
];

const SCENE_DURATION_MS = 5000;

export default function AuthAnimatedBackground() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const canvasRef = useRef(null);

  // Automatic continuous deterministic loop: 0 -> 1 -> 2 -> 3 -> 0... (not changed manually)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % FULLSCREEN_SCENES.length);
    }, SCENE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  // Lightweight particle supply chain network simulation
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

    const nodeCount = Math.min(30, Math.floor((width * height) / 38000));
    const colors = ['#10b981', '#34d399', '#f59e0b', '#38bdf8', '#ffffff'];

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.35 + 0.2
      });
    }

    const packets = [];
    const maxPackets = 6;

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
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const maxDist = 120;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.7;
            ctx.stroke();

            if (packets.length < maxPackets && Math.random() < 0.002) {
              packets.push({
                fromX: n1.x,
                fromY: n1.y,
                toX: n2.x,
                toY: n2.y,
                progress: 0,
                speed: 0.015,
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
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 6;
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
      {/* LAYER 1: BRIGHT & VIVID FULLSCREEN BACKGROUND IMAGES         */}
      {/* ============================================================ */}
      {FULLSCREEN_SCENES.map((scene, idx) => {
        const isActive = idx === activeSceneIndex;
        return (
          <div
            key={scene.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={scene.url}
              alt={scene.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-[5000ms] ease-out brightness-95 contrast-105"
              style={{ transform: isActive ? 'scale(1.05)' : 'scale(1.0)' }}
            />
          </div>
        );
      })}

      {/* ============================================================ */}
      {/* LAYER 2: LIGHT CINEMATIC TINT (Maximum photo visibility)     */}
      {/* ============================================================ */}
      {/* Light overall veil to keep photos bright and clear */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* Very gentle gradient at edges only so the center photos shine */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/35" />

      {/* ============================================================ */}
      {/* LAYER 3: LIGHT PARTICLE MESH                                 */}
      {/* ============================================================ */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-35" />

      {/* ============================================================ */}
      {/* LAYER 4: AUTOMATIC SUPPLY CHAIN STAGE BADGE (TOP LEFT)       */}
      {/* ============================================================ */}
      <div className="hidden md:block absolute top-6 left-6 z-10 transition-all duration-500">
        <div className="flex items-center gap-3 bg-slate-950/75 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <activeScene.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                Stage {activeScene.step} · {activeScene.stage}
              </span>
            </div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              {activeScene.title}
            </h3>
            <p className="text-[10px] text-slate-300">
              {activeScene.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 5: AUTOMATIC LOOP TIMELINE INDICATOR (BOTTOM CENTER)   */}
      {/* Displays the automatic progression: Crops -> Farmers ->     */}
      {/* Buyers -> Transporters without any manual clicking needed   */}
      {/* ============================================================ */}
      <div className="absolute bottom-5 inset-x-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 sm:gap-6">
          {FULLSCREEN_SCENES.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            const IconComp = scene.icon;
            return (
              <div
                key={scene.id}
                className={`flex items-center gap-1.5 transition-all duration-500 ${
                  isActive
                    ? 'text-white scale-105 font-bold'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-colors ${
                    isActive ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/50' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] hidden sm:inline">{scene.tag}</span>

                {/* Progress bar inside active item */}
                {isActive && (
                  <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden ml-1 hidden sm:block">
                    <div className="h-full bg-emerald-400 animate-[progress_5s_linear_infinite]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[9px] text-slate-300/80 mt-1 font-mono tracking-wider">
          Auto-looping Agribusiness Supply Chain · Stage {activeScene.step} of 04
        </span>
      </div>
    </div>
  );
}
