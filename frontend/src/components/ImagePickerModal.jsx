import React, { useState, useRef, useCallback } from 'react';
import { Image, Check, Link, Sparkles, X, Camera, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// ─────────────────────────────────────────────
// PRESET CURATED CROP PHOTOS (verified images)
// ─────────────────────────────────────────────
const PRESET_CROPS = [
  { name: 'Roma Plum Tomatoes', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop' },
  { name: 'Red Bulb Onions', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop' },
  { name: 'Hass Avocados', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop' },
  { name: 'Shangi Irish Potatoes', category: 'TUBER', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop' },
  { name: 'White Maize Grains', category: 'CEREAL', url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop' },
  { name: 'Green Bell Peppers', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop' },
  { name: 'Fresh Cabbages', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?w=600&auto=format&fit=crop' },
  { name: 'Sweet Watermelons', category: 'HORTICULTURE', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop' },
  { name: 'Organic Carrots', category: 'TUBER', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop' },
  { name: 'Fresh Raw Cow Milk', category: 'DAIRY', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop' },
  { name: 'Fresh Pasteurized Goat Milk', category: 'DAIRY', url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop' },
  { name: 'Cultured Mala & Yoghurt', category: 'DAIRY', url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop' },
  { name: 'Friesian Dairy Cow (In-Calf)', category: 'LIVESTOCK', url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop' },
  { name: 'Ayrshire Breeding Heifer', category: 'LIVESTOCK', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop' },
  { name: 'Boer & Galla Dairy Goats', category: 'LIVESTOCK', url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&auto=format&fit=crop' },
  { name: 'Dorper Breeding Sheep', category: 'LIVESTOCK', url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&auto=format&fit=crop' },
  { name: 'Large White Breeding Pigs', category: 'LIVESTOCK', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop' },
  { name: 'Improved Kienyeji Chickens', category: 'POULTRY', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop' },
  { name: 'Commercial Broiler Chickens', category: 'POULTRY', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop' },
  { name: 'Fresh Farm Egg Trays (30 Pcs)', category: 'POULTRY', url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop' },
  { name: 'Day-Old Kienyeji Chicks', category: 'POULTRY', url: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=600&auto=format&fit=crop' },
  { name: 'Boma Rhodes Hay Bales', category: 'FODDER_FEEDS', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop' },
  { name: 'Lucerne (Alfalfa) Hay Bales', category: 'FODDER_FEEDS', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop' },
  { name: 'Inoculated Maize Silage Bags', category: 'FODDER_FEEDS', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop' },
  { name: 'High-Yield Dairy Meal Bags', category: 'FODDER_FEEDS', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop' },
  { name: 'Pure Grass-Fed Traditional Ghee', category: 'DAIRY', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop' },
  { name: 'Pure Boran Beef Bull', category: 'LIVESTOCK', url: 'https://feedmix.co.zw/wp-content/uploads/FeedMix-Beef-12-1024x683.jpg' },
  { name: 'Red Maasai Sheep', category: 'LIVESTOCK', url: 'https://cdn.creatures.com/ac6/82f/13b/7a866.jpeg' },
  { name: 'Kuroiler Mature Chickens', category: 'POULTRY', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop' },
  { name: 'Pasture Seed & Cane Molasses', category: 'FODDER_FEEDS', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop' },
];

// ─────────────────────────────────────────────
// Smart fuzzy match: suggest preset from crop name typed
// ─────────────────────────────────────────────
export function suggestPresetForCrop(cropName = '') {
  if (!cropName || cropName.trim().length < 3) return null;
  const tokens = cropName.toLowerCase().split(/[\s,]+/).filter(Boolean);
  let best = null;
  let bestScore = 0;
  for (const crop of PRESET_CROPS) {
    const hay = crop.name.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += tok.length;
    }
    if (score > bestScore) { bestScore = score; best = crop; }
  }
  return bestScore >= 4 ? best : null;
}

// ─────────────────────────────────────────────
// Compress image client-side before upload
// ─────────────────────────────────────────────
function compressImage(file, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
export default function ImagePickerModal({ currentUrl, onSelect, onClose, cropName = '' }) {
  const [selectedUrl, setSelectedUrl] = useState(currentUrl || PRESET_CROPS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState('preset');

  // Upload tab state
  const [uploadState, setUploadState] = useState('idle'); // idle | compressing | uploading | done | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Preset tab: auto-highlight best match when cropName is passed
  const suggested = suggestPresetForCrop(cropName);

  const handleApply = () => {
    onSelect(selectedUrl);
    onClose();
  };

  // ── Camera / Device Upload ──────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, HEIC, WEBP).');
      return;
    }
    // Validate size (raw, before compress — 20 MB ceiling)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File is too large. Please choose an image under 20 MB.');
      return;
    }

    setUploadError('');
    setUploadState('compressing');
    setUploadProgress(0);

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setUploadPreview(localUrl);

    try {
      // 1. Compress
      const blob = await compressImage(file);
      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);

      // 2. Upload to Firebase Storage
      setUploadState('uploading');
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `listings/${ts}_${safeName}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, blob, { contentType: 'image/jpeg' });

      uploadTask.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(pct);
        },
        (err) => {
          console.error('[Firebase Upload Error]', err);
          setUploadError(`Upload failed: ${err.message}. Try pasting a URL instead.`);
          setUploadState('error');
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setSelectedUrl(downloadUrl);
          setUploadPreview(downloadUrl);
          setUploadState('done');
          console.log(`[AgriShamba] Uploaded ${sizeMB}MB → ${downloadUrl}`);
        }
      );
    } catch (err) {
      console.error('[Upload Error]', err);
      setUploadError('Something went wrong during upload. Please try again.');
      setUploadState('error');
    }
  }, []);

  const triggerPicker = (capture) => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      if (capture) fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  // ── Render ───────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Image className="w-5 h-5 text-emerald-600" />
              Produce Photo Selector
            </h3>
            <p className="text-xs text-slate-500">
              Upload your own produce photo · pick from curated gallery · paste URL
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart suggestion banner */}
        {suggested && activeTab === 'preset' && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              Best match for <span className="font-bold">"{cropName}"</span>:{' '}
              <button
                type="button"
                className="underline font-bold text-emerald-700 hover:text-emerald-900"
                onClick={() => setSelectedUrl(suggested.url)}
              >
                {suggested.name}
              </button>
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mt-4 pb-2 flex-wrap">
          {[
            { key: 'upload', icon: <Camera className="w-3.5 h-3.5" />, label: '📷 Upload My Photo' },
            { key: 'preset', icon: <Sparkles className="w-3.5 h-3.5" />, label: `Crop Gallery (${PRESET_CROPS.length})` },
            { key: 'custom', icon: <Link className="w-3.5 h-3.5" />, label: 'Paste URL' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === key
                  ? key === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3">

          {/* ── TAB: Upload From Device ── */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => triggerPicker(true)}
                  className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all"
                >
                  <Camera className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">Take Photo</span>
                  <span className="text-[10px] text-blue-500">Open Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerPicker(false)}
                  className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all"
                >
                  <Upload className="w-8 h-8 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Pick from Gallery</span>
                  <span className="text-[10px] text-slate-400">JPG / PNG / HEIC</span>
                </button>
              </div>

              {/* Error */}
              {uploadError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{uploadError}</p>
                </div>
              )}

              {/* Progress */}
              {(uploadState === 'compressing' || uploadState === 'uploading') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      {uploadState === 'compressing' ? 'Compressing photo…' : `Uploading to AgriShamba…`}
                    </span>
                    {uploadState === 'uploading' && <span className="font-bold text-blue-600">{uploadProgress}%</span>}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: uploadState === 'compressing' ? '15%' : `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              {uploadPreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {uploadState === 'done' ? '✅ Upload complete — your photo is ready!' : 'Preview'}
                    </span>
                    {uploadState === 'done' && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Saved to AgriShamba Cloud
                      </span>
                    )}
                  </div>
                  <div className="h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={uploadPreview} alt="Your produce" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Upload tips */}
              {uploadState === 'idle' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                  <p className="text-[11px] font-bold text-amber-800">📸 Tips for a great produce photo:</p>
                  <ul className="text-[10px] text-amber-700 space-y-0.5 list-disc list-inside">
                    <li>Take in natural daylight (not dark room)</li>
                    <li>Show actual quantity — e.g. full crate, bag, or tray</li>
                    <li>Clean background helps buyers see quality clearly</li>
                    <li>Max file size: 20 MB (auto-compressed before upload)</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Curated Preset Gallery ── */}
          {activeTab === 'preset' && (
            <div className="grid grid-cols-3 gap-3">
              {PRESET_CROPS.map((crop) => {
                const isSelected = selectedUrl === crop.url;
                const isSuggested = suggested?.url === crop.url;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => setSelectedUrl(crop.url)}
                    className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-400'
                        : isSuggested
                        ? 'border-amber-400 ring-1 ring-amber-300'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-24 bg-slate-100 relative">
                      <img src={crop.url} alt={crop.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      {isSuggested && !isSelected && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5 shadow-md">
                          <span className="text-[8px] font-bold">MATCH</span>
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
          )}

          {/* ── TAB: Paste URL ── */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Online Image URL (HTTPS link from Google Photos, Cloudinary, Drive, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://images.example.com/my-harvest.jpg"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    if (e.target.value.startsWith('http')) setSelectedUrl(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
            disabled={uploadState === 'uploading' || uploadState === 'compressing'}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-colors"
          >
            {uploadState === 'uploading' || uploadState === 'compressing' ? 'Uploading…' : 'Apply Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
