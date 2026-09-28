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
  HelpCircle, 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Navigation,
  RefreshCw,
  MessageSquare,
  Scale,
  ArrowUpRight,
  ShieldAlert,
  Radio,
  Play
} from 'lucide-react';

const TOPIC_CHIPS = [
  { id: 'escrow', label: '🔒 Escrow & Security', query: 'How does Safaricom M-Pesa Escrow protect my money?' },
  { id: 'prices', label: '📊 Live Market Prices', query: 'What are current wholesale commodity prices in Kenya?' },
  { id: 'agronomy', label: '🌾 Agronomy & Crops', query: 'Give me agronomy advice for tomato blight and potato harvest.' },
  { id: 'withdraw', label: '💳 M-Pesa Withdrawal', query: 'How do I withdraw my earnings to M-Pesa or Bank?' },
  { id: 'logistics', label: '🚚 Driver GPS & Map', query: 'How does live geographic freight tracking and OTP delivery work?' },
  { id: 'swahili', label: '🇰🇪 Msaada kwa Kiswahili', query: 'Nielezee kwa Kiswahili jinsi mfumo huu unavyofanya kazi.' }
];

export default function KilimoAIAssistant({ user, activeTab, onNavigateTab, onOpenTopUp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Habari ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **Wanjiku**, your Kilimo AI Specialist and Digital Agronomist. 

I can advise you on live market prices, escrow protection, agronomy crop care, freight tracking, or M-Pesa withdrawals. You can type or tap the microphone to speak with me in English or Kiswahili!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [femaleVoice, setFemaleVoice] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load and configure natural Lady / Female Voice
  useEffect(() => {
    const pickFemaleVoice = () => {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Search specifically for female voices (Zira, Samantha, Victoria, Karen, Jenny, etc.)
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
      recognition.lang = 'en-KE';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition warning:', e.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserMessage(transcript);
        }
      };
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lady voice speech synthesis with feminine pitch
  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanSpeech = text
      .replace(/[#*`_]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    
    // Explicit lady voice assignment & feminine pitch tuning
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    utterance.pitch = 1.25; // Warm, natural feminine pitch
    utterance.rate = 0.96; // Clear speaking cadence
    utterance.lang = 'en-KE';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const testLadyVoice = () => {
    speakText("Hello! I am Wanjiku from AgriLink. My voice is now configured as your personal agricultural guide.");
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  // Expanded AgriLink Deep Knowledge Base
  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Navigation shortcuts
    if (q.includes('marketplace') || q.includes('buy produce') || q.includes('soko') || q.includes('catalog')) {
      if (onNavigateTab) onNavigateTab('main');
      return {
        text: "I have routed you to the **B2B Produce Marketplace**. Here you can inspect live wholesale listings, check farmer verification badges, and make bulk counter-offers."
      };
    }

    if (q.includes('order') || q.includes('track') || q.includes('shipment') || q.includes('mzigo')) {
      if (onNavigateTab) onNavigateTab('orders');
      return {
        text: "Directing you to **Orders & Logistics Tracking**. Here you can inspect active deliveries, review escrow deposits, and access the 4-digit Delivery OTP."
      };
    }

    if (q.includes('topup') || q.includes('top up') || q.includes('deposit') || q.includes('weka pesa')) {
      if (onOpenTopUp) onOpenTopUp();
      return {
        text: "Opening the **Escrow Wallet Top-Up** modal. You can deposit funds instantly via Safaricom M-Pesa STK Push with zero delays."
      };
    }

    // 2. Market Commodity Price Index
    if (q.includes('price') || q.includes('bei') || q.includes('cost') || q.includes('rate') || q.includes('commodity') || q.includes('wakulima') || q.includes('kongowea')) {
      return {
        text: "📊 **Kenya Live Wholesale Commodity Price Benchmarks:**\n\n• 🍅 **Tomatoes (Ranger F1)**: KES 115/kg at Nairobi Wakulima (▲ +4.8%)\n• 🧅 **Red Bulb Onions**: KES 88/kg at Mombasa Kongowea (▼ -1.2%)\n• 🥔 **Shangi Potatoes**: KES 3,200/50kg bag at Nakuru Wholesale (▲ +3.2%)\n• 🌽 **Dry White Maize**: KES 4,100/90kg bag at Eldoret Grain Hub (Stable)\n• 🥑 **Hass Avocado (Export Grade)**: KES 140/kg in Murang'a (▲ +6.5%)\n• 🥬 **Sukuma Wiki**: KES 40/kg at Kisumu Jubilee Market\n\n*Tip: Check our Live Market Ticker at the top of the Marketplace for 24-hour updates.*"
      };
    }

    // 3. Wallet Withdrawals (M-Pesa & Banks)
    if (q.includes('withdraw') || q.includes('toa pesa') || q.includes('cash out') || q.includes('payout') || q.includes('bank')) {
      return {
        text: "💳 **How to Withdraw Funds to M-Pesa or Bank:**\n\n1. Look at the top navigation bar and click the **'Withdraw'** button (or the button on your Farmer / Driver earnings card).\n2. Select your destination: **Safaricom M-Pesa B2C**, **Kenyan Bank Transfer** (Equity, KCB, Co-op, NCBA, etc.), or **Airtel Money**.\n3. Choose amount: Quick 25%, 50%, 75%, or 100% Cash Out.\n4. Click **Confirm Withdrawal**. Payouts are disbursed instantly within 60 seconds with an official transaction reference code!"
      };
    }

    // 4. Escrow & Smart Contract Settlement
    if (q.includes('escrow') || q.includes('safe') || q.includes('scam') || q.includes('protect') || q.includes('pay') || q.includes('deduct')) {
      return {
        text: "🔒 **How AgriLink Smart Escrow Protects You:**\n\n1. **Funds Locked Safely**: When a buyer places an order, payment is deducted and held in an encrypted digital escrow vault.\n2. **Zero Risk for Farmer**: The farmer harvests knowing the money is already guaranteed in escrow.\n3. **Zero Risk for Buyer**: The farmer and driver do NOT receive money until goods arrive and pass quality inspection.\n4. **OTP Settlement**: Once the buyer inputs the driver's confidential 4-digit OTP, funds disburse automatically: 95% to the farmer, freight fee to the transporter, and 5% to AgriLink."
      };
    }

    // 5. Agronomy, Pests, & Harvesting Advice
    if (q.includes('agronomy') || q.includes('blight') || q.includes('fertilizer') || q.includes('pest') || q.includes('dap') || q.includes('can') || q.includes('soil') || q.includes('tomato') || q.includes('potato')) {
      return {
        text: "🌾 **Kilimo Agronomy & Crop Advisory:**\n\n• **Late Blight in Tomatoes/Potatoes**: During rainy or high-humidity periods, spray preventive copper fungicides (e.g. Ridomil or Mancozeb) before lesions spread.\n• **Fertilizer Protocol**: Apply DAP or NPK (17:17:17) at planting for root development; topdress with CAN 4-5 weeks later after weeding.\n• **Harvest Handling**: Harvest watermelons and tomatoes in cool morning hours; avoid piling more than 3 layers deep to prevent transit crushing.\n\n*Check the Kilimo Weather Advisory widget on your dashboard for today's harvesting window!*"
      };
    }

    // 6. Geographic Live Map & Driver Logistics
    if (q.includes('map') || q.includes('gps') || q.includes('driver') || q.includes('transporter') || q.includes('route') || q.includes('freight') || q.includes('truck')) {
      return {
        text: "🚚 **Live Geographic GPS Freight Navigation:**\n\n• Drivers can view our **100% Free OpenStreetMap Radar** directly in the Driver Portal.\n• Displays live pickup points (Farm gate) to delivery depots (Nairobi / Mombasa).\n• Features real-time speed telemetry, cargo temperature monitoring (4°C cold-chain), remaining distance, and ETA.\n• Drivers receive an automated 4-digit Delivery OTP upon dispatch to present to the buyer upon arrival."
      };
    }

    // 7. Quality Inspection & Disputes
    if (q.includes('dispute') || q.includes('damage') || q.includes('rotten') || q.includes('bruise') || q.includes('refund') || q.includes('claim')) {
      return {
        text: "⚖️ **Inspection & Dispute Resolution Center:**\n\nIf produce arrives damaged, short on weight, or substandard:\n1. Do NOT release the 4-digit OTP.\n2. Click **'Report Quality Issue'** under your order.\n3. Select issue (e.g. Transit Damage, Grade Mismatch) and upload notes.\n4. Escrow payout is immediately frozen while our inspection team arranges partial refund or replacement!"
      };
    }

    // 8. Kiswahili / Sheng Responses
    if (q.includes('habari') || q.includes('mambo') || q.includes('kiswahili') || q.includes('hujambo') || q.includes('sasa') || q.includes('nielezee')) {
      return {
        text: "Jambo! Karibu sana kwenye AgriLink. Mimi ni **Wanjiku**, msaidizi wako wa kidijitali.\n\nHapa unaweza:\n• Kununua na kuuza mazao bila madalali (zero brokers).\n• Kulinda pesa zako kwa **M-Pesa Escrow** (mkulima halipwi hadi ukague mzigo).\n• Kutoa faida yako moja kwa moja kwa M-Pesa au Benki bila malipo ya ziada.\n• Kufuatilia usafirishaji kwa ramani ya GPS ya moja kwa moja.\n\nUnahitaji msaada gani maalum leo?"
      };
    }

    // Default intelligent agronomist response
    return {
      text: `Regarding "${query}": AgriLink is Kenya's premier B2B agribusiness ecosystem. We unite farmers, buyers, and transporters with live OpenStreetMap GPS navigation, Safaricom M-Pesa escrow protection, instant wallet withdrawals, and fair wholesale market pricing.`
    };
  };

  const handleUserMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(response.text);
    }, 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING AI TRIGGER BUTTON (BOTTOM RIGHT)            */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 text-white text-xs px-3.5 py-2 rounded-full border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Speak with <strong>Wanjiku (Kilimo AI)</strong></span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-800 rotate-90 scale-95 border border-slate-700' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 hover:scale-105 hover:shadow-emerald-500/50 border-2 border-emerald-300/50'
          }`}
          aria-label="Kilimo AI Voice Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. ENHANCED AI CONVERSATIONAL VOICE & CHAT DRAWER       */}
      {/* ======================================================== */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[440px] max-h-[85vh] h-[640px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Kilimo AI</h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    WANJIKU
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">Senior Agronomist & SCM Guide · Lady Voice Active</p>
              </div>
            </div>

            {/* Voice Toggle & Audio Test */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={testLadyVoice}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1"
                title="Test Female Voice"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Voice Test</span>
              </button>

              <button
                onClick={() => {
                  if (isVoiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsVoiceEnabled(!isVoiceEnabled);
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={isVoiceEnabled ? 'Voice output ON (Lady Voice)' : 'Voice output OFF'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lady Speaking Waveform Indicator */}
          {isSpeaking && (
            <div className="bg-emerald-950 px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-300 border-b border-emerald-900/60 animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wanjiku speaking...</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
              </div>
            </div>
          )}

          {/* Quick Topic Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {TOPIC_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleUserMessage(chip.query)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-bold whitespace-nowrap transition-all shadow-sm shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`text-[9px] mt-1.5 block font-mono ${
                      m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
              title={isListening ? 'Listening to your voice... (click to stop)' : 'Click to speak to Wanjiku'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to you speak..." : "Ask Wanjiku about prices, escrow, agronomy, routes..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-md shadow-emerald-200 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
