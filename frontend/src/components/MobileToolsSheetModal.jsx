import React from 'react';
import { 
  X, 
  Leaf, 
  Bot, 
  Radio, 
  Truck, 
  Handshake, 
  Bell, 
  Smartphone, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  User, 
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Film,
  Calculator,
  Wifi,
  Camera
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageContext';
import { CurrencyUnitBar } from './CurrencyUnitContext';

export default function MobileToolsSheetModal({
  isOpen,
  onClose,
  user,
  onOpenKilimoVision,
  onOpenCropDoctor,
  onOpenAiNegotiation,
  onOpenSatelliteScanner,
  onOpenFreightCalculator,
  onOpenChamaPool,
  onOpenAlerts,
  onOpenUssd,
  onOpenPricePredictor,
  onOpenTopUp,
  onOpenWithdraw,
  onOpenProfile,
  onReplayIntro,
  onOpenOfflineSync
}) {
  if (!isOpen) return null;

  const tools = [
    ...(onOpenKilimoVision ? [{
      id: 'kilimo-vision',
      title: 'Kilimo Vision AI',
      desc: 'Multimodal Disease & Grade Scanner',
      icon: Camera,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-950/40',
      borderColor: 'border-teal-500/40',
      badge: 'AI Vision',
      badgeColor: 'bg-teal-600 text-white',
      onClick: onOpenKilimoVision
    }] : []),

    ...(onOpenOfflineSync ? [{
      id: 'offline-sync',
      title: 'Rural Offline Hub',
      desc: 'Local cache & SMS fallback',
      icon: Wifi,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Offline Sync',
      badgeColor: 'bg-amber-600 text-white',
      onClick: onOpenOfflineSync
    }] : []),

    {
      id: 'crop-doctor',
      title: 'AI Crop Doctor',
      desc: 'Leaf pest & disease scanner',
      icon: Leaf,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'Popular',
      badgeColor: 'bg-emerald-600 text-white',
      onClick: onOpenCropDoctor
    },
    {
      id: 'ai-negotiator',
      title: 'AI Deal Maker',
      desc: 'Autonomous price & bids',
      icon: Bot,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badge: 'Smart Bot',
      badgeColor: 'bg-purple-600 text-white',
      onClick: onOpenAiNegotiation
    },
    {
      id: 'price-predictor',
      title: 'Price Forecaster',
      desc: '7-day commodity AI model',
      icon: TrendingUp,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'AI Model',
      badgeColor: 'bg-emerald-700 text-white',
      onClick: onOpenPricePredictor
    },
    {
      id: 'satellite-ndvi',
      title: 'Satellite NDVI',
      desc: 'Sentinel-2 crop health',
      icon: Radio,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      badge: 'Radar Audit',
      badgeColor: 'bg-teal-600 text-white',
      onClick: onOpenSatelliteScanner
    },
    {
      id: 'freight-quote',
      title: 'Freight Calculator',
      desc: 'Road mileage & rates',
      icon: Truck,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Logistics',
      badgeColor: 'bg-amber-600 text-white',
      onClick: onOpenFreightCalculator
    },
    {
      id: 'chama-pool',
      title: 'Chama Cooperative',
      desc: 'Bulk harvest pooling',
      icon: Handshake,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      badge: 'Group Pool',
      badgeColor: 'bg-indigo-600 text-white',
      onClick: onOpenChamaPool
    },
    {
      id: 'market-alerts',
      title: 'Price Alerts',
      desc: 'SMS & WhatsApp alerts',
      icon: Bell,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      badge: 'Live Feed',
      badgeColor: 'bg-sky-600 text-white',
      onClick: onOpenAlerts
    },
    {
      id: 'ussd-gateway',
      title: 'USSD *384*50#',
      desc: 'Feature phone offline access',
      icon: Smartphone,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Feature Phone',
      badgeColor: 'bg-amber-700 text-white',
      onClick: onOpenUssd
    },
    ...(onReplayIntro ? [{
      id: 'intro-video',
      title: 'Intro Video',
      desc: 'AgriShamba walkthrough',
      icon: Film,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      badge: 'Video Tour',
      badgeColor: 'bg-rose-500 text-white',
      onClick: onReplayIntro
    }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Bottom Sheet Panel â€” full height on mobile */}
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 border border-slate-200 animate-in slide-in-from-bottom duration-300"
           style={{ maxHeight: '92dvh' }}>
        
        {/* Mobile Pull Handle */}
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden shrink-0">
          <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                AgriShamba Smart Hub
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                AI Engines & SCM Tools
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-3.5 space-y-3">

          {/* Quick Financial Shortcuts */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
            <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2.5 flex items-center justify-between">
              <span>Quick Account Actions</span>
              <span className="text-emerald-600 font-bold text-[9px]">🔒 Escrow Protected</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onOpenTopUp}
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Wallet className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Top Up</span>
              </button>

              <button
                type="button"
                onClick={onOpenWithdraw}
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px]">Withdraw</span>
              </button>

              <button
                type="button"
                onClick={onOpenProfile}
                className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm transition-colors"
              >
                <User className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-[11px]">Profile</span>
              </button>
            </div>
          </div>

          {/* AI & SCM Tools Grid â€” 2 columns always */}
          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-500" />
              AI & Agribusiness Tools
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={tool.onClick}
                    className={`flex flex-col items-start gap-2 p-3 rounded-2xl bg-white active:scale-[0.97] border ${tool.borderColor} text-left transition-all hover:shadow-sm group cursor-pointer`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-9 h-9 rounded-xl ${tool.bgColor} flex items-center justify-center border ${tool.borderColor}`}>
                        <IconComponent className={`w-4.5 h-4.5 ${tool.iconColor}`} />
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <div className="min-w-0 w-full">
                      <span className="font-extrabold text-[11px] text-slate-900 leading-tight block">
                        {tool.title}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                        {tool.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language & Currency Settings */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 pb-1">
            <span className="text-[11px] font-bold text-slate-500">Preferences:</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <CurrencyUnitBar />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
