import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Check, ChevronDown, ChevronUp, Sliders } from 'lucide-react';

export const DASHBOARD_THEMES = [
  {
    id: 'farmers',
    title: 'Farmers & Shamba',
    titleSw: 'Wakulima & Mashamba',
    badge: '👨‍🌾 Farmers',
    description: 'Kenyan smallholders harvesting crops and tending fertile agricultural fields',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'crops',
    title: 'Fresh Crops & Harvest',
    titleSw: 'Mazao Safi ya Shamba',
    badge: '🌽 Crops',
    description: 'Vibrant vine tomatoes, ripe avocados, golden maize, onions and farm vegetables',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'drivers',
    title: 'Drivers & Logistics',
    titleSw: 'Madereva & Usafiri wa Mizigo',
    badge: '🚚 Drivers',
    description: 'Commercial refrigerated freight trucks and drivers navigating trade corridors',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'buyers',
    title: 'Buyers & Wholesale Market',
    titleSw: 'Wanunuzi & Soko la Jumla',
    badge: '🛒 Buyers',
    description: 'Bulk wholesale produce trade, agro-dealers, supermarkets and institutional buyers',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=150&q=80'
  }
];

export default function DashboardBackground({ activeTab = 'marketplace', language = 'en' }) {
  // Saved user preference (auto, farmers, crops, drivers, buyers)
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    return localStorage.getItem('mazaohub_bg_theme') || localStorage.getItem('agrilink_bg_theme') || localStorage.getItem('Mazao Hub_bg_theme') || 'auto';
  });

  // Opacity intensity: 'vivid' (more visible photo), 'balanced' (standard), 'subtle' (lightest)
  const [intensity, setIntensity] = useState(() => {
    return localStorage.getItem('mazaohub_bg_intensity') || localStorage.getItem('agrilink_bg_intensity') || localStorage.getItem('Mazao Hub_bg_intensity') || 'balanced';
  });

  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);

  // Persist preference
  useEffect(() => {
    localStorage.setItem('mazaohub_bg_theme', selectedThemeId);
  }, [selectedThemeId]);

  useEffect(() => {
    localStorage.setItem('mazaohub_bg_intensity', intensity);
  }, [intensity]);

  // Determine effective theme when 'auto' is selected
  const effectiveThemeId = React.useMemo(() => {
    if (selectedThemeId !== 'auto') {
      return selectedThemeId;
    }
    // Auto-map based on current user activeTab
    if (activeTab === 'farmer') return 'farmers';
    if (activeTab === 'logistics') return 'drivers';
    if (activeTab === 'orders') return 'buyers';
    return 'crops';
  }, [selectedThemeId, activeTab]);

  const currentTheme = DASHBOARD_THEMES.find(t => t.id === effectiveThemeId) || DASHBOARD_THEMES[1];

  // Scrim opacity styles based on intensity
  const getScrimStyles = () => {
    switch (intensity) {
      case 'vivid':
        return 'bg-gradient-to-b from-slate-900/40 via-slate-50/75 to-slate-100/85 backdrop-blur-[1px]';
      case 'subtle':
        return 'bg-gradient-to-b from-slate-900/60 via-slate-50/92 to-slate-50/96 backdrop-blur-[3px]';
      case 'balanced':
      default:
        return 'bg-gradient-to-b from-slate-900/50 via-slate-50/85 to-slate-100/90 backdrop-blur-[1.5px]';
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* FIXED VISUAL BACKGROUND LAYER                           */}
      {/* ======================================================== */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Scenic Photography Background with smooth cross-fade */}
        <div 
          key={currentTheme.id}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out transform scale-105"
          style={{ 
            backgroundImage: `url(${currentTheme.image})`,
            willChange: 'transform, opacity'
          }}
        />

        {/* High-Fidelity Glassmorphic Overlay for guaranteed text readability */}
        <div className={`absolute inset-0 transition-all duration-700 ${getScrimStyles()}`} />

        {/* Enterprise Decorative Radial Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      </div>

      {/* ======================================================== */}
      {/* SLEEK FLOATING THEME SELECTOR WIDGET                    */}
      {/* ======================================================== */}
      <aside 
        aria-label="Dashboard Visual Theme Controls"
        className="fixed bottom-[5.5rem] sm:bottom-4 left-3 sm:left-4 z-30 font-['Plus_Jakarta_Sans',sans-serif]"
      >
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl overflow-hidden transition-all duration-300">
          
          {/* Collapsed Bar / Header — appealing pill button */}
          <div 
            onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-emerald-50 transition-colors select-none group"
            title={language === 'sw' ? 'Badilisha Picha ya Mandhari ya Nyuma' : 'Customize Dashboard Agricultural Backdrop Photo'}
          >
            {/* Live thumbnail preview */}
            <div className="w-7 h-7 rounded-lg overflow-hidden border-2 border-emerald-500/50 shrink-0 relative shadow-sm">
              <img 
                src={currentTheme.thumbnail} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                <ImageIcon className="w-3 h-3 text-emerald-600" />
                <span className="group-hover:text-emerald-700 transition-colors">
                  {language === 'sw' ? 'Picha ya Nyuma' : 'Backdrop'}
                </span>
                {selectedThemeId === 'auto' && (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Auto
                  </span>
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5 leading-none">
                {currentTheme.badge}
              </span>
            </div>

            <div className="ml-1 w-5 h-5 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              {isWidgetExpanded 
                ? <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-emerald-600" /> 
                : <ChevronUp className="w-3 h-3 text-slate-500 group-hover:text-emerald-600" />
              }
            </div>
          </div>

          {/* Expanded Selector Drawer */}
          {isWidgetExpanded && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-3 min-w-[270px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  {language === 'sw' ? 'Chagua Mandhari' : 'Select Scenery Theme'}
                </span>
                
                {/* Auto Switcher Toggle */}
                <button
                  type="button"
                  onClick={() => setSelectedThemeId(selectedThemeId === 'auto' ? currentTheme.id : 'auto')}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all ${
                    selectedThemeId === 'auto'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                  title="Automatically change photo based on your current view"
                >
                  🔄 {language === 'sw' ? 'Badili Yenyewe' : 'Auto by Tab'}
                </button>
              </div>

              {/* 4 Thematic Image Cards */}
              <div className="grid grid-cols-2 gap-1.5">
                {DASHBOARD_THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id || (selectedThemeId === 'auto' && effectiveThemeId === theme.id);
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`relative group rounded-xl overflow-hidden border p-1 text-left transition-all ${
                        isSelected 
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/60' 
                          : 'border-slate-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div className="h-14 rounded-lg overflow-hidden relative">
                        <img 
                          src={theme.thumbnail} 
                          alt={theme.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-bold text-slate-800 truncate px-0.5">
                        {language === 'sw' ? theme.titleSw : theme.title}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Photo Opacity Control */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  {language === 'sw' ? 'Mwonekano' : 'Photo Contrast'}
                </span>
                <div className="flex gap-1">
                  {[
                    { id: 'vivid', label: language === 'sw' ? 'Wazi' : 'Vivid' },
                    { id: 'balanced', label: language === 'sw' ? 'Kawaida' : 'Balanced' },
                    { id: 'subtle', label: language === 'sw' ? 'Laini' : 'Subtle' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setIntensity(lvl.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                        intensity === lvl.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
