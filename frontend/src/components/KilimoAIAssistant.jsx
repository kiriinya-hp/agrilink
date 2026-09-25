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
  MessageSquare
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  { text: "How do I buy produce safely with Escrow?", role: "BUYER" },
  { text: "How does a farmer post crops for sale?", role: "FARMER" },
  { text: "How does transporter delivery & OTP work?", role: "TRANSPORTER" },
  { text: "How is money deducted and released?", role: "ALL" },
  { text: "Take me to the Produce Marketplace", role: "NAV" },
  { text: "Show my orders & active shipments", role: "NAV" }
];

export default function KilimoAIAssistant({ user, activeTab, onNavigateTab, onOpenTopUp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am Kilimo AI, your smart AgriLink digital guide. You can type or use the microphone to talk with me. How can I assist your agribusiness today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-KE'; // Kenyan English

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
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

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice speech synthesis output
  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Cancel any existing speech

    // Clean markdown/bullet points for smooth spoken voice
    const cleanSpeech = text
      .replace(/[#*`_]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\n\r]+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current.start();
    }
  };

  // AI Knowledge & Context Engine
  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Navigation intents
    if (q.includes('marketplace') || q.includes('buy produce') || q.includes('browse') || q.includes('catalog')) {
      if (onNavigateTab) onNavigateTab('main');
      return {
        text: "I have directed you to the **Produce Marketplace**. Here you can filter fresh crops by Horticulture, Cereals, Tubers, or Fruits, and inspect farmer prices and grades.",
        action: 'NAV_MARKETPLACE'
      };
    }

    if (q.includes('order') || q.includes('track') || q.includes('shipment') || q.includes('delivery')) {
      if (onNavigateTab) onNavigateTab('orders');
      return {
        text: "Opening your **Orders & Logistics Dashboard**. Here you can monitor active escrow holdings, track live transit status, and view your 4-digit Delivery OTP.",
        action: 'NAV_ORDERS'
      };
    }

    if (q.includes('topup') || q.includes('top up') || q.includes('wallet') || q.includes('balance') || q.includes('deposit money')) {
      if (onOpenTopUp) onOpenTopUp();
      return {
        text: "I have opened the **Escrow Wallet Manager**. Your balance is safely deducted when you place an order, and automatically refunded if a shipment cannot be fulfilled.",
        action: 'OPEN_TOPUP'
      };
    }

    // 2. Escrow & Payment deduction logic
    if (q.includes('deduct') || q.includes('escrow') || q.includes('pay') || q.includes('m-pesa') || q.includes('mpesa') || q.includes('money')) {
      return {
        text: "🔒 **How Payment & Deduction Works on AgriLink:**\n\n1. When you click **'Send STK Push & Hold Escrow'**, the total sum is deducted from your M-Pesa / wallet and locked safely in the smart escrow vault.\n2. The farmer and driver **do not receive the money yet**.\n3. The transporter delivers the food to your location and provides a **4-digit Delivery OTP**.\n4. When you inspect and confirm the produce, the escrow vault **atomically settles**: 95% is paid to the farmer, transport fee to the driver, and 5% platform commission to AgriLink."
      };
    }

    // 3. Farmer guidance
    if (q.includes('farmer') || q.includes('sell') || q.includes('post') || q.includes('harvest') || q.includes('listing')) {
      return {
        text: "👨‍🌾 **Farmer Step-by-Step Guide:**\n\n1. Click **'Publish New Produce'** at the top of your dashboard.\n2. Enter crop name, available quantity in kilograms, and your unit price.\n3. Add a photo using our agricultural preset gallery or an image URL.\n4. Once published, commercial buyers across Kenya can purchase directly at fair farm gate prices with zero middlemen!"
      };
    }

    // 4. Transporter guidance
    if (q.includes('transporter') || q.includes('driver') || q.includes('fleet') || q.includes('cargo') || q.includes('truck')) {
      return {
        text: "🚚 **Transporter Guide:**\n\n1. Go to the **'Available Cargo Shipments'** tab.\n2. Accept an order to pick up crops from the farmer's county.\n3. When picking up, change status to **'In Transit'**.\n4. Upon arriving at the buyer's depot, share your confidential **4-digit Delivery OTP** with the buyer to trigger instant payment disbursement directly to your account!"
      };
    }

    // 5. General greeting & assistance
    if (q.includes('hello') || q.includes('hi') || q.includes('habari') || q.includes('mambo') || q.includes('help')) {
      return {
        text: "Karibu AgriLink! I am your AI assistant. You can ask me anything about:\n• Buying produce with Safaricom M-Pesa Escrow\n• How wallet balance deductions work\n• How farmers list harvest crops\n• Live logistics & cold-chain freight tracking\n\nOr click the microphone icon below to speak to me!"
      };
    }

    // Default intelligent response
    return {
      text: `Regarding "${query}": AgriLink connects rural farmers directly to commercial buyers and verified freight transporters with end-to-end escrow protection. You can browse produce in the Marketplace, lock funds with M-Pesa, and verify delivery via OTP codes.`
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

    // Generate AI response
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
    }, 400);
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
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white text-xs px-3.5 py-2 rounded-full border border-emerald-500/30 shadow-xl backdrop-blur-md animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Need Help? Speak with <strong>Kilimo AI</strong></span>
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
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 hover:shadow-emerald-500/40 border-2 border-emerald-400/40'
          }`}
          aria-label="Kilimo AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. AI CONVERSATIONAL VOICE & CHAT DRAWER                 */}
      {/* ======================================================== */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 md:w-[420px] bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl z-50 flex flex-col max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 relative">
                <Bot className="w-6 h-6" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Kilimo AI Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Voice Navigation & Smart Agribusiness Guide</p>
              </div>
            </div>

            {/* Voice Output Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextState = !isVoiceEnabled;
                  setIsVoiceEnabled(nextState);
                  if (!nextState && window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-500'
                }`}
                title={isVoiceEnabled ? "Voice Output Active (Click to Mute)" : "Voice Muted (Click to Enable)"}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line text-[11px] sm:text-xs">
                    {m.text}
                  </p>
                  <span className={`text-[9px] block mt-1 text-right ${m.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Guide Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Suggested Inquiries:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUserMessage(q.text)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-900/40 hover:text-emerald-300 text-slate-300 text-[10px] whitespace-nowrap border border-slate-700/60 transition-colors shrink-0"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Voice & Text Input Box */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
              }`}
              title={isListening ? "Listening... Click to stop" : "Click to speak with voice"}
            >
              {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask Kilimo AI anything..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
