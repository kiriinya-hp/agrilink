import React, { useState } from 'react';
import { Image, Check, Link, Sparkles, X } from 'lucide-react';

const PRESET_CROPS = [
  {
    name: 'Roma Plum Tomatoes',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
  },
  {
    name: 'Red Bulb Onions',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop'
  },
  {
    name: 'Hass Avocados',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop'
  },
  {
    name: 'Shangi Irish Potatoes',
    category: 'TUBER',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop'
  },
  {
    name: 'White Maize Grains',
    category: 'CEREAL',
    url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop'
  },
  {
    name: 'Green Bell Peppers',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop'
  },
  {
    name: 'Fresh Cabbages',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=600&auto=format&fit=crop'
  },
  {
    name: 'Sweet Watermelons',
    category: 'HORTICULTURE',
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop'
  },
  {
    name: 'Organic Carrots',
    category: 'TUBER',
    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop'
  }
];

export default function ImagePickerModal({ currentUrl, onSelect, onClose }) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || PRESET_CROPS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' or 'custom'

  const handleApply = () => {
    onSelect(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-600" />
              Produce Photo Selector
            </h3>
            <p className="text-xs text-slate-500">Pick from verified produce photos or paste your own custom image URL</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preset' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated Crop Gallery ({PRESET_CROPS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'custom' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            Paste Web Image URL
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3">
          {activeTab === 'preset' ? (
            <div className="grid grid-cols-3 gap-3">
              {PRESET_CROPS.map((crop) => {
                const isSelected = selectedUrl === crop.url;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => setSelectedUrl(crop.url)}
                    className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                      isSelected ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-24 bg-slate-100 relative">
                      <img src={crop.url} alt={crop.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{crop.name}</p>
                      <span className="text-[9px] font-medium text-slate-400">{crop.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Online Image URL (HTTPS link from Unsplash, Google Photos, Cloudinary, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://images.example.com/my-harvest.jpg"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (e.target.value.startsWith('http')) {
                      setSelectedUrl(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Live Preview */}
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-2">Live Preview on Marketplace:</span>
                <div className="h-44 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {selectedUrl ? (
                    <img
                      src={selectedUrl}
                      alt="Preview"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Enter a valid URL above to preview image</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Apply Image
          </button>
        </div>
      </div>
    </div>
  );
}
