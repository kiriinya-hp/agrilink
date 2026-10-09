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
  Film
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageContext';
import { CurrencyUnitBar } from './CurrencyUnitContext';

export default function MobileToolsSheetModal({
  isOpen,
  onClose,
  user,
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
  onReplayIntro
}) {
  if (!isOpen) return null;

  const tools = [
    {
      id: 'crop-doctor',
      title: 'AI Crop Doctor',
      desc: 'Instant leaf pest & disease scanner',
      icon: Leaf,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      badge: 'Popular',
      badgeColor: 'bg-emerald-600 text-white',
      onClick: onOpenCropDoctor
    },
    {
      id: 'ai-negotiator',
      title: 'AI Deal Maker',
      desc: 'Autonomous price discovery & bids',
      icon: Bot,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      badge: 'Autonomous',
      badgeColor: 'bg-purple-600 text-white',
      onClick: onOpenAiNegotiation
    },
    {
      id: 'satellite-ndvi',
      title: 'Satellite NDVI',
      desc: 'Sentinel-2 crop health & moisture',
      icon: Radio,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
      badge: 'Radar',
      badgeColor: 'bg-teal-600 text-white',
      onClick: onOpenSatelliteScanner
    },
    {
      id: 'freight-quote',
      title: 'Freight Calculator',
      desc: 'Instant road mileage & corridor rates',
      icon: Truck,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      badge: 'Logistics',
      badgeColor: 'bg-amber-600 text-white',
      onClick: onOpenFreightCalculator
    },
    {
      id: 'chama-pool',
      title: 'Chama Cooperative',
      desc: 'Bulk harvest aggregation pooling',
      icon: Handshake,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      badge: 'Community',
      badgeColor: 'bg-indigo-600 text-white',
      onClick: onOpenChamaPool
    },
    {
      id: 'market-alerts',
      title: 'SMS & WhatsApp Alerts',
      desc: 'Instant price drop & harvest notifications',
      icon: Bell,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50 border-sky-200',
      badge: 'Real-time',
      badgeColor: 'bg-sky-600 text-white',
      onClick: onOpenAlerts
    },
    {
      id: 'ussd-gateway',
      title: 'USSD *384*50#',
      desc: 'Feature phone offline access simulator',
      icon: Smartphone,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50 border-amber-200',
      badge: 'Offline',
      badgeColor: 'bg-amber-700 text-white',
      onClick: onOpenUssd
    },
    {
      id: 'price-predictor',
      title: 'Price Forecaster',
      desc: '7-day wholesale commodity market AI',
      icon: TrendingUp,
      iconColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50 border-emerald-200',
      badge: 'AI Model',
      badgeColor: 'bg-emerald-700 text-white',
      onClick: onOpenPricePredictor
    },
    ...(onReplayIntro ? [{
      id: 'intro-video',
      title: 'Play Intro Video',
      desc: 'Mazao Hub ecosystem visual walkthrough',
      icon: Film,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      badge: 'Cinematic',
      badgeColor: 'bg-amber-600 text-white',
      onClick: onReplayIntro
    }] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Panel */}
      <div className="relative w-full sm:max-w-xl max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 border border-slate-200 animate-in slide-in-from-bottom duration-300">
        
        {/* Mobile Pull Handle Indicator */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Mazao Hub Smart Hub
              </h3>
              <p className="text-[11px] text-slate-500">
                AI Agricultural Engines & Commercial SCM Tools
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
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Quick Financial Shortcuts Bar */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
            <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>Quick Account Actions</span>
              <span className="text-emerald-600 font-bold">Escrow Protected</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onOpenTopUp}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Wallet className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Top Up</span>
              </button>

              <button
                type="button"
                onClick={onOpenWithdraw}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px]">Withdraw</span>
              </button>

              <button
                type="button"
                onClick={onOpenProfile}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors"
              >
                <User className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-[11px]">Profile</span>
              </button>
            </div>
          </div>

          {/* Tools Grid (2 Columns) */}
          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2.5">
              Available Agribusiness Intelligence Tools
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={tool.onClick}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-left transition-all hover:border-slate-300 hover:shadow-xs group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${tool.bgColor} flex items-center justify-center shrink-0 border`}>
                      <IconComponent className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {tool.title}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${tool.badgeColor} shrink-0`}>
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug truncate mt-0.5">
                        {tool.desc}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regional Settings Bar: Language & Currency */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
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
