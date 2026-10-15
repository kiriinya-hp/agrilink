import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ArrowRight, 
  X, 
  Leaf, 
  ShieldCheck, 
  DollarSign, 
  Award, 
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function KilimoVisionScanner({ isOpen, onClose, onApplyToListing }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cropHint, setCropHint] = useState('Auto-Detect');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerScan = async () => {
    if (!selectedImage) {
      setError('Tafadhali chagua au piga picha ya zao lako kwanza (Please capture or select a photo first).');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/vision-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropHint,
          imageBase64: selectedImage.slice(0, 500) // sample signature
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze crop image');
      }

      setScanResult(data);
    } catch (err) {
      console.error('Vision scan error:', err);
      setError(err.message || 'Scan failed. Please check connection and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSpeakAdvice = () => {
    if (!scanResult) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const text = `${scanResult.diagnosis}. ${scanResult.swahiliAdvice || scanResult.englishAdvice}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUseInListing = () => {
    if (!scanResult) return;
    if (onApplyToListing) {
      onApplyToListing({
        cropName: scanResult.cropName,
        qualityGrade: scanResult.qualityGrade,
        suggestedPriceKes: scanResult.pricing?.recommendedPriceKes || 85,
        notes: `Kilimo Vision Inspected: ${scanResult.diagnosis} (${scanResult.qualityGrade})`
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Kilimo Vision AI</h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Multimodal SCM
                </span>
              </div>
              <p className="text-xs text-slate-400">Instant Crop Disease Pathology & Export Grade Quality Assessment</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Select Commodity / Crop:
              </label>
              <select 
                value={cropHint}
                onChange={(e) => setCropHint(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Auto-Detect">Auto-Detect Crop</option>
                <option value="Tomatoes">Tomatoes (Nyanya)</option>
                <option value="Maize">Maize (Mahindi)</option>
                <option value="Irish Potatoes">Irish Potatoes (Viazi Mviringo)</option>
                <option value="Avocados">Avocados (Parachichi)</option>
                <option value="Cabbage">Cabbage / Sukuma Wiki</option>
              </select>
            </div>

            <div className="flex items-end gap-2 pt-5">
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-200 transition-colors"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Snap / Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Viewfinder / Preview Box */}
          <div className="relative aspect-video max-h-72 w-full bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 overflow-hidden flex items-center justify-center group">
            {selectedImage ? (
              <>
                <img 
                  src={selectedImage} 
                  alt="Crop sample" 
                  className="w-full h-full object-contain"
                />
                
                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                  </div>

                  {/* Scanning Laser Animation */}
                  {isScanning && (
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                  )}

                  <div className="flex justify-between items-end">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Tap to Take or Upload Crop Photo</p>
                <p className="text-xs text-slate-400 mt-1">Leaves, fruits, tubers, or harvested crates</p>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          {selectedImage && !scanResult && (
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyzing Pathology & Caliber...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Crop Quality & Diseases Now</span>
                </>
              )}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display Card */}
          {scanResult && (
            <div className="space-y-4 pt-1 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
                
                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{scanResult.cropName}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      scanResult.qualityGrade === 'GRADE_A' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : scanResult.qualityGrade === 'GRADE_B'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {scanResult.qualityGrade === 'GRADE_A' ? '🌟 Grade A (Export Quality)' : scanResult.qualityGrade}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-mono font-bold text-emerald-400">{scanResult.confidenceScore}%</span>
                  </div>
                </div>

                {/* Diagnosis & Pathology */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Pathology Diagnosis:</span>
                    <button
                      onClick={handleSpeakAdvice}
                      className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Sikiliza ushauri (Listen)"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Nyamaza (Stop)' : 'Sikiliza (Listen Audio)'}</span>
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {scanResult.healthStatus === 'HEALTHY' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <span>{scanResult.diagnosis}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{scanResult.description}</p>
                </div>

                {/* Fair Pricing Card */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recommended Fair Market Rate:</span>
                    <div className="text-lg font-black text-emerald-400 flex items-baseline gap-1 mt-0.5">
                      <span>KES {scanResult.pricing?.recommendedPriceKes}</span>
                      <span className="text-xs font-normal text-slate-400">/ kg</span>
                      <span className="text-[11px] text-slate-500 ml-2 font-normal">
                        (Range: KES {scanResult.pricing?.rangeKes?.min} - {scanResult.pricing?.rangeKes?.max})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">USD Equivalent</span>
                    <span className="text-sm font-bold text-slate-200">${scanResult.pricing?.approxUsdPerKg} / kg</span>
                  </div>
                </div>

                {/* Agronomic Recommendations (Kiswahili & English) */}
                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-1">
                    <span className="font-bold text-emerald-400 block">🇰🇪 Ushauri wa Kilimo (Swahili):</span>
                    <p className="text-slate-200 leading-relaxed">{scanResult.swahiliAdvice}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs space-y-1">
                    <span className="font-bold text-slate-300 block">🇬🇧 Commercial Protocol (English):</span>
                    <p className="text-slate-300 leading-relaxed">{scanResult.englishAdvice}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60">
                  <button
                    onClick={handleUseInListing}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <span>Use in Produce Listing (Pre-fill Form)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setScanResult(null);
                      setSelectedImage(null);
                    }}
                    className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Scan Another
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
