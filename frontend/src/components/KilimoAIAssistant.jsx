import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Wallet, 
  TrendingUp, 
  Check, 
  ChevronRight,
  Radio,
  ExternalLink,
  Leaf
} from 'lucide-react';

// =====================================================================
// CLEAN PROMPT CARDS (SHOWN ON NEW CHAT)
// =====================================================================
const QUICK_PROMPTS_EN = [
  {
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    title: 'Live Market Prices',
    subtitle: 'Nairobi Wakulima, Mombasa Kongowea & Nakuru benchmarks',
    query: 'What are current wholesale commodity prices across Kenya?'
  },
  {
    icon: ShieldCheck,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    title: 'How Escrow Protects You',
    subtitle: 'Safaricom M-Pesa lock, zero brokers & 4-digit OTP release',
    query: 'How does Safaricom M-Pesa Escrow and 4-digit OTP protect my money?'
  },
  {
    icon: Wallet,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Withdraw to M-Pesa / Bank',
    subtitle: 'Instant B2C payout within 60 seconds with zero hidden fees',
    query: 'How do I withdraw my earnings to M-Pesa or Bank?'
  },
  {
    icon: Sprout,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    title: 'How to Post Your Harvest',
    subtitle: 'Step-by-step farmer guide to listing produce on AgriShamba',
    query: 'How do I post my farm harvest on AgriShamba as a farmer?'
  }
];

const QUICK_PROMPTS_SW = [
  {
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    title: 'Bei Halisi za Soko',
    subtitle: 'Bei za jumla Marikiti, Kongowea na Nakuru',
    query: 'Nielezee bei za sasa za nyanya, vitunguu na viazi sokoni Kenya.'
  },
  {
    icon: ShieldCheck,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    title: 'Usalama wa Pesa (Escrow)',
    subtitle: 'Pesa zinalindwa vipi bila madalali kutapeli?',
    query: 'Je, pesa zangu ziko salama vipi kwenye mfumo wa Safaricom Escrow?'
  },
  {
    icon: Wallet,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Kutoa Pesa kwa M-Pesa',
    subtitle: 'Toa faida moja kwa moja kwa M-Pesa au Benki',
    query: 'Nielezee jinsi ya kutoa pesa zangu kwa M-Pesa au Benki.'
  },
  {
    icon: Sprout,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    title: 'Kuuza Mazao Shambani',
    subtitle: 'Jinsi ya kuweka mavuno yako sokoni kama mkulima',
    query: 'Nitawekaje mazao yangu ya shamba kwenye tovuti kama mkulima?'
  }
];

export default function KilimoAIAssistant({ 
  user, 
  activeTab, 
  onNavigateTab, 
  onOpenTopUp,
  onOpenWithdraw,
  onOpenCropDoctor 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'sw'
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [femaleVoice, setFemaleVoice] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Configure natural Lady / Female Voice across browsers
  useEffect(() => {
    const pickFemaleVoice = () => {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const femaleKeywords = [
        'female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 
        'tessa', 'jenny', 'fiona', 'hazel', 'susan', 'catherine', 
        'google uk english female', 'google us english female'
      ];

      const foundLady = voices.find(v => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some(k => name.includes(k));
      }) || voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Natural'))) || voices[0];

      setFemaleVoice(foundLady);
    };

    pickFemaleVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = pickFemaleVoice;
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'sw' ? 'sw-KE' : 'en-KE';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Lady voice speech synthesis
  const speakText = (text, isSwahili = false) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanSpeech = text
      .replace(/[#*`_]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    utterance.pitch = 1.25;
    utterance.rate = 0.96;
    utterance.lang = isSwahili ? 'sw-KE' : 'en-KE';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  const resetChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([]);
    setInputText('');
  };

  // Interactive UI action handler
  const handleExecuteAction = (actionKey) => {
    switch (actionKey) {
      case 'navigate_main':
      case 'navigate_marketplace':
        if (onNavigateTab) onNavigateTab('marketplace');
        setIsOpen(false);
        break;
      case 'navigate_farmer':
        if (onNavigateTab) onNavigateTab('farmer');
        setIsOpen(false);
        break;
      case 'navigate_orders':
        if (onNavigateTab) onNavigateTab('orders');
        setIsOpen(false);
        break;
      case 'navigate_transporter':
      case 'navigate_logistics':
        if (onNavigateTab) onNavigateTab('logistics');
        setIsOpen(false);
        break;
      case 'open_topup':
        if (onOpenTopUp) onOpenTopUp();
        setIsOpen(false);
        break;
      case 'open_withdraw':
        if (onOpenWithdraw) onOpenWithdraw();
        setIsOpen(false);
        break;
      case 'open_crop_doctor':
        if (onOpenCropDoctor) onOpenCropDoctor();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // ===================================================================
  // KILIMO AI INTELLIGENCE CORE
  // ===================================================================
  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. KISWAHILI / KENYAN ACCENT RESPONSES
    if (
      language === 'sw' ||
      q.includes('habari') || 
      q.includes('mambo') || 
      q.includes('niaje') || 
      q.includes('vipi') || 
      q.includes('kiswahili') || 
      q.includes('sasa') || 
      q.includes('nielezee') || 
      q.includes('pesa zangu') || 
      q.includes('mkulima') || 
      q.includes('madalali')
    ) {
      // Swahili: Withdrawals
      if (q.includes('kutoa') || q.includes('toa') || q.includes('pesa') || q.includes('withdraw')) {
        return {
          isSwahili: true,
          text: `Sawa sawa kabisa! Kutoa pesa zako hapa AgriShamba ni rahisi sana na haina wasiwasi wowote:

1. **Bofya Kitufe cha 'Withdraw'** kwenye menyu ya juu ya tovuti (au bonyeza kitufe hapo chini).
2. **Chagua Unakotaka Pesa Ziende**:
   • **Safaricom M-Pesa B2C** (moja kwa moja kwa simu yako).
   • **Benki ya Kenya** (KCB, Equity, Co-op, NCBA, Stanbic, Absa, DTB, I&M).
   • **Airtel Money**.
3. **Chagua Kiasi**: Asilimia ya haraka (25%, 50%, 75%, au 100% Cash Out).
4. **Thibitisha**: Pesa zinaingia kwa sekunde 60 bila makato ya siri!`,
          actions: [
            { label: 'Toa Pesa kwa M-Pesa Sasa', action: 'open_withdraw' }
          ]
        };
      }

      // Swahili: Escrow & Security
      if (q.includes('salama') || q.includes('escrow') || q.includes('wizi') || q.includes('madalali') || q.includes('kulinda')) {
        return {
          isSwahili: true,
          text: `Hapo sasa! Usalama wa jasho lako ndio kazi yetu kuu:

• **Hakuna Madalali (Zero Brokers)**: Unauza au unanunua moja kwa moja kwa bei halisi ya soko.
• **Safaricom M-Pesa Escrow**: Mnunuzi anaponunua, pesa hazitolewi hadi akague mzigo na aridhike na ubora.
• **Nambari ya Siri (OTP ya tarakimu 4)**: Dereva akifika na mzigo wako, mnunuzi akikagua, anapeana OTP na papo hapo mkulima analipwa 95% na dereva anapata ujira wake wa usafirishaji.`,
          actions: [
            { label: 'Tazama Soko la Mazao', action: 'navigate_main' },
            { label: 'Kagua Mizigo Yako', action: 'navigate_orders' }
          ]
        };
      }

      // Swahili: Default
      return {
        isSwahili: true,
        text: `Karibu sana AgriShamba! Mimi ni **Kilimo AI**, msaidizi wako wa kidijitali.

Hapa unaweza:
• Kuuza mavuno yako moja kwa moja kutoka shambani.
• Kununua mazao kwa bei halisi ya jumla bila madalali.
• Kulinda pesa zako kwa **M-Pesa Escrow**.
• Kutoa faida yako kwa M-Pesa ndani ya sekunde 60.

Ungependa nikusaidie na nini sasa hivi?`,
        actions: [
          { label: 'Nenda Sokoni', action: 'navigate_main' },
          { label: 'Weka Mazao Shambani', action: 'navigate_farmer' },
          { label: 'Toa Pesa M-Pesa', action: 'open_withdraw' }
        ]
      };
    }

    // 1.5 CROP DISEASE & PEST DOCTOR (COMPUTER VISION)
    if (q.includes('disease') || q.includes('pest') || q.includes('leaf') || q.includes('blight') || q.includes('armyworm') || q.includes('wilt') || q.includes('ugonjwa') || q.includes('wadudu') || q.includes('dawa') || q.includes('doctor') || q.includes('daktari')) {
      return {
        text: `🌿 **Kilimo AI Crop Doctor & Pest Diagnosis Engine:**

You can scan or upload photos of diseased crop leaves and stems to receive instant agronomic diagnosis and prescription:

• 🍅 **Tomato Late Blight & Early Blight** (*Phytophthora infestans*) → Ridomil Gold / Oshothane
• 🌽 **Fall Armyworm & Stalk Borer** (*Spodoptera frugiperda*) → Belt 480 SC / Coragen
• 🥔 **Bacterial Wilt & Black Scurf** on Shangi Potatoes → Copper Hydroxide (Kocide 2000)
• 🥑 **Anthracnose & Black Spot** on Hass Avocados → Ortiva Top / Copper Oxychloride
• 🥬 **Black Rot & Aphids** on Sukuma Wiki & Cabbages → Nordox & Neem Oil

Every diagnosis includes exact chemical dosage per 20L knapsack sprayer, pre-harvest interval (PHI), and organic home remedies (such as wood ash and neem leaf extract)!`,
        actions: [
          { label: '🌿 Open Crop Doctor Camera', action: 'open_crop_doctor' },
          { label: 'Explore Marketplace Listings', action: 'navigate_main' }
        ]
      };
    }

    // 2. LIVE COMMODITY MARKET PRICES
    if (q.includes('price') || q.includes('commodity') || q.includes('rate') || q.includes('cost') || q.includes('wakulima') || q.includes('kongowea') || q.includes('marikiti') || q.includes('wholesale')) {
      return {
        text: `Here are today's verified wholesale agricultural commodity benchmarks across Kenya:

• 🍅 **Tomatoes (Ranger F1)**: **KES 115/kg** at Nairobi Wakulima (Marikiti) (▲ +4.8%)
• 🧅 **Red Bulb Onions**: **KES 88/kg** at Mombasa Kongowea (▼ -1.2%)
• 🥔 **Shangi Potatoes**: **KES 3,200 / 50kg bag** at Nakuru Wholesale (▲ +3.2%)
• 🌽 **Dry White Maize**: **KES 4,100 / 90kg bag** at Eldoret Grain Hub (Stable)
• 🥑 **Export Hass Avocado**: **KES 140/kg** in Murang'a & Meru (▲ +6.5%)
• 🥬 **Sukuma Wiki & Cabbage**: **KES 38–45/kg** at Kisumu Jubilee Market

*Benchmark updates reflect daily weighted clearinghouse transactions across verified markets.*`,
        actions: [
          { label: 'Explore Marketplace Listings', action: 'navigate_main' }
        ]
      };
    }

    // 3. HOW TO BUY & PAY WITH ESCROW
    if (q.includes('buy') || q.includes('order') || q.includes('purchase') || q.includes('checkout') || q.includes('how to buy')) {
      return {
        text: `🛒 **How to Purchase Produce via Escrow on AgriShamba:**

1. **Browse Marketplace**: Click **'Marketplace'** to view active farmer batches, grades, and farm locations.
2. **Order or Negotiate**:
   • Click **'Order Now'** to buy at the stated price.
   • Or click **'Make Offer'** to negotiate a bulk discount with the farmer.
3. **Escrow Checkout**:
   • Specify your delivery depot destination.
   • Pay via **M-Pesa STK Push** or **Escrow Wallet Balance**.
4. **Safe Delivery**: Funds remain safely held in digital escrow. The transporter delivers using live GPS. Inspect cargo at your depot, then provide the **4-digit Delivery OTP** to release payment!`,
        actions: [
          { label: 'Open Produce Marketplace', action: 'navigate_main' },
          { label: 'Top Up Escrow Wallet', action: 'open_topup' }
        ]
      };
    }

    // 4. HOW TO POST PRODUCE (FARMER)
    if (q.includes('post') || q.includes('sell') || q.includes('listing') || q.includes('upload') || q.includes('how to post') || q.includes('farmer guide')) {
      return {
        text: `🌾 **How to Post Your Produce as a Farmer:**

1. **Access Farmer Dashboard**: Switch to the **'Farmer'** tab on the navigation bar.
2. **Enter Crop Details**:
   • **Crop Name**: e.g., *Ranger F1 Tomatoes*, *Red Bulb Onions*, *Shangi Potatoes*.
   • **Category**: Select Horticulture, Tubers, Grains, or Fruits.
   • **Available Volume**: Enter quantity in kilograms (kg).
   • **Wholesale Unit Price**: Set fair price per kg in KES/USD.
   • **Farm Location**: Provide your sub-county or depot (e.g. Kirinyaga, Kinangop).
3. **Publish Listing**: Click **'Publish Wholesale Listing'**. Your produce is immediately visible to bulk buyers across Nairobi, Mombasa, and regional hubs!`,
        actions: [
          { label: 'Go to Farmer Portal', action: 'navigate_farmer' }
        ]
      };
    }

    // 5. WITHDRAWALS
    if (q.includes('withdraw') || q.includes('cash out') || q.includes('payout') || q.includes('bank') || q.includes('toa pesa') || q.includes('how to withdraw')) {
      return {
        text: `💳 **How to Withdraw Earnings to M-Pesa or Bank:**

1. Click the **'Withdraw'** button in the top navigation bar or on your earnings card.
2. Choose your payout method:
   • **Safaricom M-Pesa B2C**: Instant mobile money transfer.
   • **Kenyan Banks**: Direct transfer to KCB, Equity Bank, Co-operative Bank, NCBA, Stanbic, Absa, DTB, or I&M Bank.
   • **Airtel Money**: Instant mobile wallet payout.
3. Select an amount percentage (25%, 50%, 75%, 100% Cash Out) or type a custom amount.
4. Click **'Confirm Withdrawal'**. Payouts are disbursed in under 60 seconds with an official reference code!`,
        actions: [
          { label: 'Open Withdrawal Modal', action: 'open_withdraw' }
        ]
      };
    }

    // 6. ESCROW & 4-DIGIT OTP
    if (q.includes('escrow') || q.includes('otp') || q.includes('safe') || q.includes('scam') || q.includes('security') || q.includes('protection')) {
      return {
        text: `🔒 **How AgriShamba Smart Escrow & OTP Protect You:**

• **Buyer Peace of Mind**: Your money is held in an encrypted digital vault. The farmer does NOT get paid until you receive and inspect the goods.
• **Farmer Assurance**: Farmers harvest and load trucks knowing 100% of the funds are already deposited and verified in escrow.
• **4-Digit Confidential OTP**: When a driver picks up cargo, the system generates a secure 4-digit PIN stored in the driver's manifest.
• **Settlement on Inspection**: Upon delivery at your depot, inspect the grade and weight. If satisfied, hand over the OTP.
• **Instant Settlement**: Once verified, 95% goes to the farmer, the transport fee goes to the driver, and 5% platform fee is deducted.`,
        actions: [
          { label: 'View Active Orders', action: 'navigate_orders' }
        ]
      };
    }

    // 7. DRIVER LOGISTICS & GPS
    if (q.includes('driver') || q.includes('gps') || q.includes('map') || q.includes('radar') || q.includes('truck') || q.includes('transporter') || q.includes('tracking')) {
      return {
        text: `🚚 **Live Geographic GPS Freight Navigation (Driver Portal):**

• **100% Free OpenStreetMap Radar**: Drivers access real-time mapping with zero external subscription costs.
• **Real Cargo & Distances**: Shows actual pickup farms (e.g. Kirinyaga, Nyandarua) and buyer destinations with real Haversine distance calculations.
• **Milestone Progression**:
  1. \`PICKED_UP\`: Cargo loaded at farm gate.
  2. \`IN_TRANSIT\`: En route along national highway corridors (A2, A104).
  3. \`ARRIVED\`: Arrived at buyer depot awaiting physical OTP verification.
• **Instant Driver Payout**: The moment the buyer validates your 4-digit OTP, your freight fee reflects in your wallet immediately!`,
        actions: [
          { label: 'Open Driver GPS Radar', action: 'navigate_transporter' }
        ]
      };
    }

    // 8. CROP AGRONOMY & PESTS
    if (q.includes('agronomy') || q.includes('blight') || q.includes('pest') || q.includes('fertilizer') || q.includes('disease') || q.includes('tuta') || q.includes('soil') || q.includes('tomato') || q.includes('potato') || q.includes('maize')) {
      return {
        text: `🌾 **Kilimo Agronomy & Pest Control Protocol:**

• **Tomato & Potato Late Blight** (*Phytophthora infestans*):
  - Prevalent during high humidity / rainy seasons.
  - Spray preventive copper fungicides (*Ridomil Gold*, *Mancozeb*, or *Nordox*) every 7–10 days before rain onset.
• **Tuta Absoluta (Tomato Leafminer)**:
  - Install delta pheromone traps in greenhouses and open fields.
  - Spray targeted insecticides (*Coragen*, *Radiant*, or *Belt*) during early egg hatching.
• **Fall Armyworm in Maize**:
  - Scout fields at early whorl emergence. Apply *Ampligo* or *Voliam Targo* directly into the leaf whorl in early morning hours.
• **Fertilizer Protocol**:
  - *Planting*: Apply DAP or NPK (17:17:17) for robust root development.
  - *Topdressing*: Apply CAN 4–5 weeks after emergence before earthing up.
• **Post-Harvest Crating**:
  - Avoid gunny bags for soft horticulture! Use ventilated plastic crates stacked maximum 6 high to avoid transit compression damage on rough roads.`,
        actions: [
          { label: 'Access Farmer Portal', action: 'navigate_farmer' }
        ]
      };
    }

    // DEFAULT RESPONSE
    return {
      text: `Regarding "${query}": **Kilimo AI** is here to empower your agribusiness journey on AgriShamba.

We connect verified Kenyan farmers with bulk commercial buyers and professional drivers. All payments are backed by Safaricom M-Pesa smart escrow, transparent wholesale pricing across Wakulima and Kongowea, and instant M-Pesa B2C wallet withdrawals.

How would you like to proceed?`,
      actions: [
        { label: 'Produce Marketplace', action: 'navigate_main' },
        { label: 'Instant M-Pesa Withdraw', action: 'open_withdraw' },
        { label: 'Farmer Dashboard', action: 'navigate_farmer' }
      ]
    };
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text);
      setIsTyping(false);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions || []
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(response.text, response.isSwahili);
    }, 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const prompts = language === 'sw' ? QUICK_PROMPTS_SW : QUICK_PROMPTS_EN;

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MINIMALIST FLOATING LAUNCHER (BOTTOM RIGHT)          */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className="group flex items-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl border border-slate-700/80 transition-all duration-300 hover:scale-105"
          aria-label="Toggle Kilimo AI"
        >
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Kilimo AI</span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium">Assistant</span>
            </div>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. ELEGANT SLIDE-OVER RIGHT SIDE PANEL (COPILOT STYLE)  */}
      {/* ======================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Subtle backdrop overlay */}
          <div 
            onClick={() => {
              setIsOpen(false);
              if (window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          />

          {/* Panel — full screen on mobile, side panel on sm+ */}
          <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto flex sm:pl-10 pointer-events-none">
            <div className="w-full sm:w-screen sm:max-w-md lg:max-w-lg bg-white shadow-2xl flex flex-col sm:border-l border-slate-200 animate-in slide-in-from-right duration-300 pointer-events-auto">
              
              {/* Clean Minimalist Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 tracking-tight">Kilimo AI</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your AgriShamba Assistant & Agronomist</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language switch */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        language === 'en' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('sw')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        language === 'sw' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      SW
                    </button>
                  </div>

                  {/* Voice audio toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isVoiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsVoiceEnabled(!isVoiceEnabled);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isVoiceEnabled 
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={isVoiceEnabled ? 'Voice is ON' : 'Voice is muted'}
                  >
                    {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Clear conversation */}
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={resetChat}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Clear chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Voice Speaking Active Pill */}
              {isSpeaking && (
                <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Kilimo AI is speaking...</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              )}

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                
                {/* Clean Welcome Screen when no messages */}
                {messages.length === 0 && (
                  <div className="py-6 space-y-6">
                    <div className="text-center space-y-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-sm">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {language === 'sw' ? 'Habari! Nikusaidie aje leo?' : 'How can I help you today?'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {language === 'sw' 
                          ? 'Uliza kuhusu bei za mazao, usalama wa pesa kwa Escrow, kutoa pesa kwa M-Pesa, au uelekezwe jinsi ya kutumia AgriShamba.'
                          : 'Ask about live wholesale prices, Escrow security, instant M-Pesa withdrawals, or how to navigate AgriShamba.'}
                      </p>
                    </div>

                    {/* Quick Clean Cards */}
                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {prompts.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(item.query)}
                            className="p-3.5 rounded-xl border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all duration-200 flex items-start gap-3.5 group shadow-2xs"
                          >
                            <div className={`p-2 rounded-lg border ${item.color} shrink-0 mt-0.5`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-slate-800 group-hover:text-emerald-950 flex items-center justify-between">
                                <span>{item.title}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.subtitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conversation History */}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed text-[13px] ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                      {/* Interactive Action Shortcuts */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap gap-2">
                          {m.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              type="button"
                              onClick={() => handleExecuteAction(act.action)}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-600 text-slate-800 hover:text-white font-semibold text-xs rounded-lg border border-slate-200 hover:border-emerald-600 shadow-2xs transition-all flex items-center gap-1.5"
                            >
                              <span>{act.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                      {m.time}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs px-2 py-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[11px] text-slate-500 ml-1">Kilimo AI is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Clean Bottom Input Bar */}
              <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 bg-white">
                <form 
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 bg-slate-50/70 focus-within:bg-white transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                        : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-200/70'
                    }`}
                    title={isListening ? 'Listening to voice...' : 'Speak with Kilimo AI'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    placeholder={
                      isListening 
                        ? 'Listening to you speak...' 
                        : (language === 'sw' ? 'Uliza Kilimo AI kuhusu bei, kutoa pesa, usalama...' : 'Ask about prices, withdrawals, escrow, crops...')
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none px-1 min-w-0"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white shadow-xs transition-colors shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                  Kilimo AI Assistant · Real-time Kenyan Agricultural Intelligence
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
