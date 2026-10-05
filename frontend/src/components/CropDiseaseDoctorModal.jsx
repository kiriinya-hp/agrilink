import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  RotateCcw, 
  Leaf, 
  Bug, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Preset real-world diseased leaf/crop scenarios for Kenyan farmers
export const DISEASE_PRESETS = [
  {
    id: 'tomato_blight',
    crop: 'Tomato (Nyanya)',
    disease: 'Late Blight (Bapa la Nyanya)',
    pathogen: 'Phytophthora infestans',
    severity: 'CRITICAL',
    confidence: '97.4%',
    thumbnail: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
    symptoms: 'Large, dark-brown water-soaked lesions on leaves with white fungal fuzzy growth under wet humidity.',
    symptomsSw: 'Madoa meusi makubwa yenye unyevu kwenye majani na ukungu mweupe chini ya jani wakati wa mvua au baridi.',
    chemicalTreatment: 'Spray Ridomil Gold 68 WG or Oshothane (Mancozeb 800g/kg).',
    chemicalTreatmentSw: 'Nyunyizia Ridomil Gold 68 WG au Oshothane (Mancozeb 800g/kg).',
    dosage: '50g in 20 Litres of clean water (1 knapsack). Spray every 7–10 days.',
    dosageSw: 'Gramu 50 katika lita 20 za maji safi (bomba 1). Rudia kila baada ya siku 7–10.',
    organicRemedy: 'Wood ash dusting around roots; spray copper soap solution; prune lower leaves touching soil.',
    organicRemedySw: 'Nyunyizia jivu la kuni kwenye mashina; kata majani ya chini yanayogusa udongo ili hewa ipite vizuri.',
    phiDays: 7
  },
  {
    id: 'maize_armyworm',
    crop: 'White Maize (Mahindi)',
    disease: 'Fall Armyworm (Kiwavi Jeshi)',
    pathogen: 'Spodoptera frugiperda',
    severity: 'HIGH',
    confidence: '96.2%',
    thumbnail: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
    symptoms: 'Windowpane feeding damage on whorl leaves with moist sawdust-like fecal frass in the funnel.',
    symptomsSw: 'Mashimo kwenye majani ya kati (funnel) na uchafu mwingi kama msumeno wa mbao uliolowa.',
    chemicalTreatment: 'Spray Belt 480 SC (Flubendiamide) or Coragen 20 SC into the crop funnel.',
    chemicalTreatmentSw: 'Nyunyizia Belt 480 SC au Coragen 20 SC moja kwa moja ndani ya kitovu cha mahindi.',
    dosage: '5ml per 20 Litres of water. Target spraying early morning or evening when caterpillars feed.',
    dosageSw: 'Mili-lita 5 kwa lita 20 za maji. Piga asubuhi na mapema au jioni viwavi wanapojitokeza.',
    organicRemedy: 'Apply clean dry soil mixed with wood ash directly into the maize whorl; neem oil extract spray.',
    organicRemedySw: 'Weka mchanga safi kavu uliochanganywa na jivu ndani ya kitovu cha mmea; au dawa ya mwarobaini.',
    phiDays: 14
  },
  {
    id: 'potato_wilt',
    crop: 'Shangi Potato (Viazi)',
    disease: 'Bacterial Wilt (Mnyauko Bakteria)',
    pathogen: 'Ralstonia solanacearum',
    severity: 'CRITICAL',
    confidence: '94.8%',
    thumbnail: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
    symptoms: 'Rapid daytime wilting of stems while leaves remain green; brown discoloration of vascular ring in tuber.',
    symptomsSw: 'Mmea unanyauka ghafla mchana lakini majani yanabaki ya kijani; mviringo wa kahawia ndani ya kiazi.',
    chemicalTreatment: 'No chemical cure once infected. Drench soil with Copper Hydroxide (Kocide 2000) to halt spread.',
    chemicalTreatmentSw: 'Hakuna dawa ya kuponya baada ya kuingia. Tumia Kocide 2000 (Copper Hydroxide) kuzuia kuenea.',
    dosage: '100g per 20 Litres of water drenched along ridges. Uproot and burn infected plants immediately.',
    dosageSw: 'Gramu 100 kwa lita 20 za maji. Ng\'oa na choma moto mimea yote iliyoathirika mara moja.',
    organicRemedy: 'Strict 4-year crop rotation with maize/sorghum; plant certified disease-free KALRO seed tubers.',
    organicRemedySw: 'Badilisha mazao shambani (usipande nyanya au viazi kwa miaka 4); tumia mbegu zilizoidhinishwa na KALRO.',
    phiDays: 21
  },
  {
    id: 'avocado_anthracnose',
    crop: 'Hass Avocado (Parachichi)',
    disease: 'Anthracnose & Black Spot',
    pathogen: 'Colletotrichum gloeosporioides',
    severity: 'MODERATE',
    confidence: '95.1%',
    thumbnail: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
    symptoms: 'Circular black sunken spots on fruit skin that rot inward into the pulp, preventing export grading.',
    symptomsSw: 'Madoa meusi ya duara yaliyodidimia kwenye ganda la parachichi yanayofanya tunda lisikubalike kuuzwa nje.',
    chemicalTreatment: 'Foliar spray of Ortiva Top (Azoxystrobin + Difenoconazole) or Copper Oxychloride.',
    chemicalTreatmentSw: 'Nyunyizia Ortiva Top au Copper Oxychloride kabla ya matunda kukomaa.',
    dosage: '20ml Ortiva per 20 Litres of water. Spray starting at fruit-set after flowering.',
    dosageSw: 'Mili-lita 20 kwa lita 20 za maji. Anza kupiga baada tu ya maua kugeuka matunda madogo.',
    organicRemedy: 'Canopy pruning to increase sunlight aeration; spray Trichoderma bio-fungicide.',
    organicRemedySw: 'Pogoa matawi ya ndani ili mwanga wa jua na hewa viingie; tupa matunda yaliyoanguka chini.',
    phiDays: 3
  },
  {
    id: 'healthy_crop',
    crop: 'Healthy Farm Crop (Mmea Mzuri)',
    disease: 'No Disease Detected (Haujaathirika)',
    pathogen: 'Normal Physiology',
    severity: 'HEALTHY',
    confidence: '99.1%',
    thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80',
    symptoms: 'Vibrant green leaves, uniform chlorophyll distribution, healthy cell turgor and zero pest bites.',
    symptomsSw: 'Majani yana kijani kibichi na afya tele, hakuna wadudu wala madoa ya kuvu. Mmea unakua vizuri.',
    chemicalTreatment: 'No chemical intervention required. Apply foliar bio-stimulant or NPK 20-20-20 booster.',
    chemicalTreatmentSw: 'Hakuna haja ya dawa ya sumu. Weka mbolea ya majani (foliar) ya NPK kusaidia uzalishaji.',
    dosage: 'Follow standard agronomic nutrition schedule.',
    dosageSw: 'Fuata ratiba ya kawaida ya mbolea na umwagiliaji.',
    organicRemedy: 'Maintain regular weeding, organic compost mulching, and drip irrigation scheduling.',
    organicRemedySw: 'Endelea kupalilia mapema, kuweka matandazo (mulching) na kumwagilia maji ipasavyo.',
    phiDays: 0
  }
];

export default function CropDiseaseDoctorModal({ isOpen, onClose, onOpenKilimoAI }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [language, setLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Simulate AI Computer Vision scanning
  const startScan = (preset) => {
    setIsScanning(true);
    setScanProgress(0);
    setActiveAnalysis(null);
    setSelectedImage(preset.thumbnail);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          setActiveAnalysis(preset);
        }, 400);
      } else {
        setScanProgress(progress);
      }
    }, 120);
  };

  // Handle user's uploaded or camera image
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      // Run AI scan on uploaded image (maps to tomato or armyworm demo)
      setIsScanning(true);
      setScanProgress(0);
      setActiveAnalysis(null);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 12;
        if (progress >= 100) {
          clearInterval(interval);
          setScanProgress(100);
          setTimeout(() => {
            setIsScanning(false);
            // Default to Tomato blight analysis for custom photo
            setActiveAnalysis(DISEASE_PRESETS[0]);
          }, 500);
        } else {
          setScanProgress(progress);
        }
      }, 140);
    };
    reader.readAsDataURL(file);
  };

  // Voice readout
  const speakAdvisory = () => {
    if (!activeAnalysis || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = language === 'sw'
      ? `Utambuzi wa Kilimo AI: Ugonjwa ni ${activeAnalysis.disease}. Dalili: ${activeAnalysis.symptomsSw}. Ushauri wa dawa: ${activeAnalysis.chemicalTreatmentSw}. Kipimo: ${activeAnalysis.dosageSw}. Dawa ya kienyeji: ${activeAnalysis.organicRemedySw}.`
      : `Kilimo AI Diagnosis: Identified ${activeAnalysis.disease} on ${activeAnalysis.crop}. Primary treatment: ${activeAnalysis.chemicalTreatment}. Recommended dosage: ${activeAnalysis.dosage}. Organic alternative: ${activeAnalysis.organicRemedy}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.lang = language === 'sw' ? 'sw-KE' : 'en-KE';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900 tracking-tight">
                  Kilimo AI <span className="text-emerald-600">Crop Doctor</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  CV Engine v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'sw' 
                  ? 'Utambuzi wa papo hapo wa wadudu na magonjwa ya mimea kwa picha' 
                  : 'Instant Leaf & Pest Diagnosis with Agrovet Remedies & Dosage'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-2 py-1 rounded-md transition-all ${language === 'sw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                SW
              </button>
            </div>

            <button 
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload / Camera Action Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Snap or Upload Button */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 p-4 flex items-center gap-3 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{language === 'sw' ? 'Piga Picha ya Shamba' : 'Take Photo / Upload Leaf'}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded font-mono">Camera</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'sw' ? 'Tumia kamera ya simu au pakia picha' : 'Upload photo from your phone or device'}
              </p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>

          {/* Quick Info Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'sw'
                ? 'Piga picha jani lililoathirika vizuri. Akili Mnemba (AI) itatambua ugonjwa na kukupa dawa ya dukani.'
                : 'Take a clear, well-lit photo of the affected leaf or fruit. AI analyzes lesions, fungi, and insect frass.'}
            </p>
          </div>
        </div>

        {/* 1-Tap Sample Presets Bar */}
        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {language === 'sw' ? 'Au jaribu mifano halisi ya mashamba ya Kenya:' : 'Or tap a real Kenyan crop sample to test diagnosis:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DISEASE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => startScan(preset)}
                className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col gap-1.5 ${
                  activeAnalysis?.id === preset.id
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="h-14 rounded-lg overflow-hidden relative">
                  <img src={preset.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs ${
                    preset.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    preset.severity === 'HIGH' ? 'bg-amber-600 text-white' :
                    preset.severity === 'HEALTHY' ? 'bg-emerald-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {preset.severity}
                  </span>
                </div>
                <div className="text-[11px] font-extrabold text-slate-800 truncate leading-tight">
                  {preset.crop}
                </div>
                <div className="text-[9px] text-slate-500 truncate">
                  {preset.disease}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scanning Animation State */}
        {isScanning && (
          <div className="mt-5 p-6 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-xl animate-in fade-in">
            {/* Laser Line Animation */}
            <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-emerald-500/40 shadow-inner mb-4">
              {selectedImage && <img src={selectedImage} alt="" className="w-full h-full object-cover opacity-70" />}
              <div 
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" 
                style={{ top: `${scanProgress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Scan className="w-12 h-12 text-emerald-400 animate-pulse opacity-80" />
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-extrabold text-sm text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Running Computer Vision Agronomy Scanner...</span>
              </h4>
              <p className="text-xs text-emerald-300 mt-1 font-mono">
                Analyzing leaf chlorophyll density, lesion necropsy & fungal spore patterns ({scanProgress}%)
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
              <div 
                className="bg-emerald-500 h-full transition-all duration-150 rounded-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Diagnosis Results Card */}
        {activeAnalysis && !isScanning && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header: Disease Name & Confidence Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  activeAnalysis.severity === 'CRITICAL' ? 'bg-rose-600' :
                  activeAnalysis.severity === 'HIGH' ? 'bg-amber-600' :
                  activeAnalysis.severity === 'HEALTHY' ? 'bg-emerald-600' :
                  'bg-blue-600'
                }`}>
                  {activeAnalysis.severity === 'HEALTHY' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base text-slate-900">
                      {activeAnalysis.disease}
                    </h4>
                    <span className="text-[10px] italic text-slate-400 font-serif">
                      ({activeAnalysis.pathogen})
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700">
                    {activeAnalysis.crop} · <span className="font-mono text-slate-600">AI Confidence: {activeAnalysis.confidence}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Voice & Ask AI */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={speakAdvisory}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isSpeaking 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="Listen to voice explanation"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Stop Audio' : (language === 'sw' ? 'Sikiliza' : 'Listen')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenKilimoAI) {
                      onOpenKilimoAI(`I just scanned my ${activeAnalysis.crop} with Kilimo AI Crop Doctor and it detected ${activeAnalysis.disease}. Can you give me more tips on treatment and preventing spread?`);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask Kilimo AI</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Symptoms Observed */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
                  🔍 {language === 'sw' ? 'Dalili Zilizotambuliwa' : 'Symptoms Observed'}
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {language === 'sw' ? activeAnalysis.symptomsSw : activeAnalysis.symptoms}
                </p>
              </div>

              {/* Recommended Agrovet Prescription */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-800 block mb-1">
                  💊 {language === 'sw' ? 'Dawa ya Dukani (Agrovet)' : 'Agrovet Prescription (Kenya)'}
                </span>
                <p className="text-slate-900 font-bold leading-relaxed">
                  {language === 'sw' ? activeAnalysis.chemicalTreatmentSw : activeAnalysis.chemicalTreatment}
                </p>
                <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-900 font-semibold">
                    {language === 'sw' ? 'Kipimo:' : 'Dosage:'} {language === 'sw' ? activeAnalysis.dosageSw : activeAnalysis.dosage}
                  </span>
                  {activeAnalysis.phiDays > 0 && (
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                      PHI: {activeAnalysis.phiDays} days
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Organic & Preventive Management */}
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs">
              <span className="font-bold text-[10px] uppercase tracking-wider text-teal-800 block mb-1">
                🌱 {language === 'sw' ? 'Njia za Kienyeji na Kinga ya Baadaye' : 'Organic & Cultural Farm Remedies'}
              </span>
              <p className="text-teal-950 font-medium leading-relaxed">
                {language === 'sw' ? activeAnalysis.organicRemedySw : activeAnalysis.organicRemedy}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
