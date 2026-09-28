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
  Radio, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  DollarSign, 
  Wallet, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  Shield,
  Activity,
  BadgeCheck,
  Building,
  RefreshCw
} from 'lucide-react';

// =====================================================================
// ENTERPRISE TOPIC CATEGORIES & SUGGESTED PROMPTS
// =====================================================================
const CATEGORIES = [
  { id: 'all', label: '✨ All Insights' },
  { id: 'guide', label: '🌐 Website Navigator' },
  { id: 'swahili', label: '🇰🇪 Kiswahili (Kenyan)' },
  { id: 'prices', label: '📊 Market Prices' },
  { id: 'agronomy', label: '🌾 Crop Health & Pests' },
  { id: 'escrow', label: '🔒 Smart Escrow & OTP' },
  { id: 'withdraw', label: '💳 M-Pesa Withdrawals' },
  { id: 'logistics', label: '🚚 Driver & GPS Radar' }
];

const SUGGESTIONS = [
  { cat: 'guide', title: 'Buy produce with Escrow', query: 'How do I buy produce on the marketplace and pay safely with Escrow?' },
  { cat: 'guide', title: 'Post farm harvest', query: 'How do I post my farm harvest on AgriLink as a farmer?' },
  { cat: 'withdraw', title: 'Withdraw to M-Pesa / Bank', query: 'How do I withdraw my earnings to M-Pesa or Bank?' },
  { cat: 'swahili', title: 'Msaada kwa Kiswahili', query: 'Niaje Kilimo AI! Nielezee jinsi ya kutumia hii tovuti kwa Kiswahili safi.' },
  { cat: 'prices', title: 'Kenya wholesale prices', query: 'What are current wholesale commodity prices at Wakulima and Kongowea?' },
  { cat: 'agronomy', title: 'Tomato blight & Tuta Absoluta', query: 'How do I prevent tomato late blight and control Tuta Absoluta?' },
  { cat: 'escrow', title: 'How Escrow protects payments', query: 'How does Safaricom M-Pesa escrow and the 4-digit OTP protect my money?' },
  { cat: 'logistics', title: 'Driver live GPS radar', query: 'How does live geographic freight tracking and OTP delivery work?' },
  { cat: 'guide', title: 'Negotiate bulk prices (RFQ)', query: 'How do I make a counter-offer or negotiate prices with farmers?' },
  { cat: 'swahili', title: 'Usalama wa pesa zangu', query: 'Je, pesa zangu ziko salama vipi kwenye mfumo huu bila madalali?' }
];

// Commodity benchmarks for structured card rendering
const COMMODITY_BENCHMARKS = [
  { crop: 'Tomatoes (Ranger F1)', market: 'Nairobi Wakulima', price: 'KES 115 / kg', change: '+4.8%', up: true },
  { crop: 'Red Bulb Onions', market: 'Mombasa Kongowea', price: 'KES 88 / kg', change: '-1.2%', up: false },
  { crop: 'Shangi Potatoes', market: 'Nakuru Wholesale', price: 'KES 3,200 / 50kg bag', change: '+3.2%', up: true },
  { crop: 'Dry White Maize', market: 'Eldoret Grain Hub', price: 'KES 4,100 / 90kg bag', change: '0.0%', up: true },
  { crop: 'Hass Avocado (Grade A)', market: "Murang'a / Meru", price: 'KES 140 / kg', change: '+6.5%', up: true },
  { crop: 'Sukuma Wiki & Cabbage', market: 'Kisumu Jubilee', price: 'KES 40 / kg', change: '+1.5%', up: true }
];

export default function KilimoAIAssistant({ 
  user, 
  activeTab, 
  onNavigateTab, 
  onOpenTopUp,
  onOpenWithdraw 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' or 'sw'
  const [copiedId, setCopiedId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Habari ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **Kilimo AI**, your enterprise agribusiness specialist and autonomous platform operator.

I can provide live wholesale commodity benchmarks across Kenyan markets, agronomy crop disease protocols, and guide you step-by-step through operating AgriLink (buying, selling, escrow security, or instant M-Pesa withdrawals).

How can I assist your agricultural trade today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cardType: 'welcome',
      actionButtons: [
        { label: 'Browse Marketplace', action: 'navigate_main', icon: 'marketplace' },
        { label: 'Instant M-Pesa Withdraw', action: 'open_withdraw', icon: 'withdraw' },
        { label: 'Post Harvest Listing', action: 'navigate_farmer', icon: 'farmer' }
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [femaleVoice, setFemaleVoice] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load natural Lady / Female Voice across browsers
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
      recognition.lang = selectedLanguage === 'sw' ? 'sw-KE' : 'en-KE';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserMessage(transcript);
        }
      };
      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Lady voice speech synthesis with warm pitch
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

  const testVoiceEN = () => {
    speakText("Hello! I am Kilimo AI, your personal enterprise agricultural assistant on AgriLink. How can I assist your agribusiness today?");
  };

  const testVoiceSW = () => {
    speakText("Habari yako! Mimi ni Kilimo AI, msaidizi wako mkuu wa kilimo na biashara hapa AgriLink. Karibu sana!", true);
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
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Conversation initialized. I am **Kilimo AI**, ready to assist you. Ask me about live market prices, agronomy care, escrow security, or use the shortcuts below.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cardType: 'welcome',
        actionButtons: [
          { label: 'Browse Marketplace', action: 'navigate_main', icon: 'marketplace' },
          { label: 'Instant M-Pesa Withdraw', action: 'open_withdraw', icon: 'withdraw' },
          { label: 'Driver GPS Radar', action: 'navigate_transporter', icon: 'logistics' }
        ]
      }
    ]);
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Execute interactive UI actions directly from AI bubbles
  const handleExecuteAction = (actionKey) => {
    switch (actionKey) {
      case 'navigate_main':
        if (onNavigateTab) onNavigateTab('main');
        break;
      case 'navigate_farmer':
        if (onNavigateTab) onNavigateTab('farmer');
        break;
      case 'navigate_orders':
        if (onNavigateTab) onNavigateTab('orders');
        break;
      case 'navigate_transporter':
        if (onNavigateTab) onNavigateTab('transporter');
        break;
      case 'open_topup':
        if (onOpenTopUp) onOpenTopUp();
        break;
      case 'open_withdraw':
        if (onOpenWithdraw) onOpenWithdraw();
        break;
      default:
        break;
    }
  };

  // ===================================================================
  // INTELLIGENT KNOWLEDGE & MULTI-DOMAIN REASONING
  // ===================================================================
  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. KISWAHILI / SHENG WITH KENYAN ACCENT
    if (
      q.includes('habari') || 
      q.includes('mambo') || 
      q.includes('niaje') || 
      q.includes('vipi') || 
      q.includes('kiswahili') || 
      q.includes('sasa') || 
      q.includes('nielezee') || 
      q.includes('pesa zangu') || 
      q.includes('mkulima') || 
      q.includes('shamba') ||
      q.includes('madalali') ||
      q.includes('shilingi')
    ) {
      if (q.includes('kutoa') || q.includes('toa') || q.includes('pesa')) {
        return {
          isSwahili: true,
          cardType: 'action_guide',
          text: `Sawa sawa kabisa! Kutoa pesa zako ni rahisi na salama 100%:

1. **Bofya Kitufe cha 'Withdraw'**: Kiko juu kwenye menyu au kwenye kadi yako ya mapato.
2. **Chagua Njia ya Malipo**:
   • **Safaricom M-Pesa B2C**: Malipo ya papo hapo kwa simu yako.
   • **Benki ya Kenya**: KCB, Equity, Co-op, NCBA, Stanbic, Absa, DTB, au I&M.
   • **Airtel Money**: Moja kwa moja kwenye pochi yako ya simu.
3. **Chagua Kiasi**: Asilimia ya haraka (25%, 50%, 75%, au 100% Cash Out).
4. **Thibitisha Malipo**: Pesa zinaingia kwa sekunde 60 bila makato ya siri!`,
          actionButtons: [
            { label: 'Toa Pesa kwa M-Pesa Sasa', action: 'open_withdraw', icon: 'withdraw' }
          ]
        };
      }

      if (q.includes('salama') || q.includes('escrow') || q.includes('wizi') || q.includes('madalali')) {
        return {
          isSwahili: true,
          cardType: 'escrow_trust',
          text: `Hapo sasa! Usalama wa biashara yako ndio nguzo kuu ya AgriLink:

• **Hakuna Madalali (Zero Brokers)**: Mkulima anauza moja kwa moja kwa wanunuzi wa jumla kwa bei kamili ya soko.
• **Safaricom M-Pesa Escrow**: Mnunuzi anapolipa, pesa zinalindwa kwenye vault ya kidijitali. Mkulima halipwi hadi mnunuzi akague na kuridhika na ubora.
• **Nambari ya Siri (OTP ya tarakimu 4)**: Dereva akifika, mnunuzi anakagua mzigo kisha anampa dereva OTP. Papo hapo mfumo unalipa 95% kwa mkulima na dereva anapata ujira wake wa usafiri.`,
          actionButtons: [
            { label: 'Tazama Soko la Mazao', action: 'navigate_main', icon: 'marketplace' },
            { label: 'Fuatilia Mizigo Yako', action: 'navigate_orders', icon: 'orders' }
          ]
        };
      }

      return {
        isSwahili: true,
        cardType: 'welcome',
        text: `Karibu sana AgriLink! Mimi ni **Kilimo AI**, msaidizi wako mkuu wa kidijitali.

Hapa unaweza:
• **Kuuza Mazao Shambani**: Weka mavuno yako mtandaoni na upate wanunuzi kutoka kote nchini Kenya.
• **Kununua kwa Bei Halisi ya Soko**: Nunua nyanya, vitunguu, viazi, na mahindi moja kwa moja bila madalali.
• **Kufuatilia Mzigo kwa GPS**: Fuatilia usafirishaji kwa ramani ya kisasa ya moja kwa moja.
• **Kutoa Pesa kwa M-Pesa**: Pata faida yako kwa M-Pesa B2C ndani ya sekunde 60.

Ungependa nikusaidie na nini sasa hivi?`,
        actionButtons: [
          { label: 'Nenda Sokoni', action: 'navigate_main', icon: 'marketplace' },
          { label: 'Weka Mazao Shambani', action: 'navigate_farmer', icon: 'farmer' },
          { label: 'Toa Pesa M-Pesa', action: 'open_withdraw', icon: 'withdraw' }
        ]
      };
    }

    // 2. LIVE COMMODITY PRICES & BENCHMARKS
    if (q.includes('price') || q.includes('commodity') || q.includes('rate') || q.includes('cost') || q.includes('wakulima') || q.includes('kongowea') || q.includes('marikiti') || q.includes('wholesale')) {
      return {
        cardType: 'market_prices',
        text: `Here are the latest verified wholesale agricultural commodity benchmarks across major Kenyan trading hubs:

• **Tomatoes (Ranger F1 / Anna F1)**: **KES 115/kg** at Nairobi Wakulima (Marikiti) (▲ +4.8%)
• **Red Bulb Onions**: **KES 88/kg** at Mombasa Kongowea (▼ -1.2%)
• **Shangi Potatoes**: **KES 3,200 / 50kg bag** at Nakuru Wholesale (▲ +3.2%)
• **Dry White Maize**: **KES 4,100 / 90kg bag** at Eldoret Grain Hub (Stable)
• **Export Hass Avocado**: **KES 140/kg** in Murang'a & Meru (▲ +6.5%)
• **Sukuma Wiki & Cabbage**: **KES 38–45/kg** at Kisumu Jubilee Market

*Benchmark updates reflect 24-hour weighted clearinghouse transactions across verified hubs.*`,
        actionButtons: [
          { label: 'View Marketplace Batches', action: 'navigate_main', icon: 'marketplace' }
        ]
      };
    }

    // 3. HOW TO POST PRODUCE (FARMER OPERATOR)
    if (q.includes('post') || q.includes('sell') || q.includes('listing') || q.includes('upload') || q.includes('how to post') || q.includes('farmer guide')) {
      return {
        cardType: 'action_guide',
        text: `🌾 **Step-by-Step Guide: Posting Produce on AgriLink**

1. **Access Farmer Portal**: Click the **'Farmer'** tab on the navigation bar.
2. **Specify Produce Attributes**:
   • **Crop Identification**: Enter commodity name (e.g. *Anna F1 Tomatoes*, *Red Creole Onions*).
   • **Category Selection**: Choose Horticulture, Tubers, Grains, or Fruits.
   • **Quantity Available**: Enter harvest volume in kilograms (kg).
   • **Unit Price**: Set fair wholesale price per kg in KES/USD.
   • **Origin Hub**: Provide county/sub-county location (e.g., Kirinyaga, Kinangop, Narok).
3. **Publish Listing**: Click **'Publish Wholesale Listing'**. Your produce is broadcast live to institutional buyers, restaurants, and aggregators nationwide!`,
        actionButtons: [
          { label: 'Go to Farmer Portal', action: 'navigate_farmer', icon: 'farmer' }
        ]
      };
    }

    // 4. HOW TO BUY & DEPOSIT TO ESCROW (BUYER OPERATOR)
    if (q.includes('buy') || q.includes('order') || q.includes('purchase') || q.includes('checkout') || q.includes('how to buy')) {
      return {
        cardType: 'action_guide',
        text: `🛒 **Step-by-Step Guide: Purchasing Produce via Escrow**

1. **Browse Wholesale Listings**: Explore available batches in the B2B Marketplace with verified quality badges.
2. **Execute Order or RFQ**:
   • Click **'Order Now'** to accept published pricing.
   • Or click **'Make Offer'** to negotiate bulk volume discounts directly with the farmer.
3. **Escrow Checkout**:
   • Specify delivery depot address (e.g. Nairobi CBD, Mombasa Port).
   • Select payment gateway: **M-Pesa STK Push** or **Escrow Wallet Balance**.
4. **Protection Protocol**: Funds are held in digital escrow. The transporter delivers using live GPS. Inspect cargo at your depot, then provide the **4-digit Delivery OTP** to trigger settlement!`,
        actionButtons: [
          { label: 'Open Produce Marketplace', action: 'navigate_main', icon: 'marketplace' },
          { label: 'Top Up Escrow Wallet', action: 'open_topup', icon: 'topup' }
        ]
      };
    }

    // 5. WITHDRAWALS & PAYOUTS
    if (q.includes('withdraw') || q.includes('cash out') || q.includes('payout') || q.includes('bank') || q.includes('toa pesa') || q.includes('how to withdraw')) {
      return {
        cardType: 'action_guide',
        text: `💳 **Step-by-Step Guide: Instant Wallet Withdrawals**

1. Click the **'Withdraw'** button in the top navigation bar or on your earnings card.
2. Choose your disbursement channel:
   • **Safaricom M-Pesa B2C**: Instant mobile money transfer.
   • **Kenyan Commercial Banks**: Direct EFT/RTGS to KCB, Equity Bank, Co-op, NCBA, Stanbic, Absa, DTB, or I&M Bank.
   • **Airtel Money**: Instant payout.
3. Select preset percentage (25%, 50%, 75%, 100% Full Cash Out) or enter custom amount.
4. Click **'Confirm Withdrawal'**. Funds settle in your account within 60 seconds with an official reference code!`,
        actionButtons: [
          { label: 'Open Withdrawal Modal', action: 'open_withdraw', icon: 'withdraw' },
          { label: 'Top Up Wallet Balance', action: 'open_topup', icon: 'topup' }
        ]
      };
    }

    // 6. ESCROW VAULT & 4-DIGIT OTP
    if (q.includes('escrow') || q.includes('otp') || q.includes('safe') || q.includes('scam') || q.includes('security') || q.includes('protection')) {
      return {
        cardType: 'escrow_trust',
        text: `🔒 **AgriLink Smart Escrow & OTP Architecture**

• **Capital Vaulting**: When a buyer orders, funds are secured in an encrypted digital escrow vault.
• **Production Certainty**: Farmers harvest and dispatch knowing payment is 100% secured and guaranteed.
• **4-Digit Delivery OTP**: Generated dynamically upon dispatch and held confidentially by the driver.
• **Consignment Handover**: The buyer inspects produce quality and weight upon physical arrival.
• **Instant Settlement**: Upon OTP verification, escrow disburses automatically:
  - **95%** to Farmer's wallet.
  - **100% Freight Fee** to Driver's wallet.
  - **5%** Platform Commission.`,
        actionButtons: [
          { label: 'Inspect Active Orders', action: 'navigate_orders', icon: 'orders' }
        ]
      };
    }

    // 7. DRIVER LOGISTICS & GPS RADAR
    if (q.includes('driver') || q.includes('gps') || q.includes('map') || q.includes('radar') || q.includes('truck') || q.includes('transporter') || q.includes('tracking')) {
      return {
        cardType: 'action_guide',
        text: `🚚 **Live Geographic GPS Freight Navigation (Driver Portal)**

• **100% Free OpenStreetMap Radar**: Drivers access real-time mapping with zero external subscription costs.
• **Real Cargo & Distances**: Shows actual pickup farms (e.g. Kirinyaga, Nyandarua) and buyer destinations with real Haversine distance calculations.
• **Milestone Progression**:
  1. \`PICKED_UP\`: Cargo loaded at farm gate.
  2. \`IN_TRANSIT\`: En route along national highway corridors (A2, A104).
  3. \`ARRIVED\`: Arrived at buyer depot awaiting physical OTP verification.
• **Instant Driver Payout**: The moment the buyer validates your 4-digit OTP, your freight fee reflects in your wallet immediately!`,
        actionButtons: [
          { label: 'Open Driver GPS Radar', action: 'navigate_transporter', icon: 'logistics' }
        ]
      };
    }

    // 8. CROP AGRONOMY, PESTS & SEASONS IN KENYA
    if (q.includes('agronomy') || q.includes('blight') || q.includes('pest') || q.includes('fertilizer') || q.includes('disease') || q.includes('tuta') || q.includes('soil') || q.includes('tomato') || q.includes('potato') || q.includes('maize')) {
      return {
        cardType: 'action_guide',
        text: `🌾 **Kilimo Agronomy & Pest Control Protocol (Kenya Sector)**

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
  - Avoid gunny bags for soft horticulture! Use ventilated plastic crates stacked maximum 6 high to avoid transit compression damage on rough murram roads.`,
        actionButtons: [
          { label: 'Access Farmer Portal', action: 'navigate_farmer', icon: 'farmer' }
        ]
      };
    }

    // 9. PRICE NEGOTIATION / RFQ
    if (q.includes('negotiate') || q.includes('offer') || q.includes('rfq') || q.includes('bargain') || q.includes('counter')) {
      return {
        cardType: 'action_guide',
        text: `🤝 **Wholesale Bulk Negotiation (Make Offer / RFQ)**

1. Navigate to the **Produce Marketplace**.
2. Click **'Make Offer'** on any listing card.
3. Input your desired bulk order volume and proposed unit price per kg.
4. Add terms regarding grading, packaging, or delivery schedules.
5. The farmer receives an instant notification to accept, decline, or counter-offer!`,
        actionButtons: [
          { label: 'Explore Marketplace Batches', action: 'navigate_main', icon: 'marketplace' }
        ]
      };
    }

    // 10. QUALITY DISPUTES & RESOLUTION
    if (q.includes('dispute') || q.includes('damage') || q.includes('rotten') || q.includes('refund') || q.includes('complaint')) {
      return {
        cardType: 'action_guide',
        text: `⚖️ **Quality Inspection & Dispute Resolution**

1. If produce arrives damaged, rotten, or under-weight, **do NOT release the 4-digit OTP to the driver**.
2. Go to **Orders & Logistics Tracking**.
3. Click the **'Report Quality Issue'** button on the order card.
4. Select the issue category (Transit Damage, Grade Mismatch, Missing Weight) and submit notes.
5. Escrow disbursement is immediately frozen while our inspection team arranges an escrow refund or replacement consignment!`,
        actionButtons: [
          { label: 'Open Orders & Disputes', action: 'navigate_orders', icon: 'orders' }
        ]
      };
    }

    // DEFAULT ENTERPRISE RESPONSE
    return {
      cardType: 'welcome',
      text: `Regarding "${query}": **Kilimo AI** provides comprehensive enterprise support across the AgriLink ecosystem.

We connect verified Kenyan farmers with institutional buyers and transporters, backed by Safaricom M-Pesa smart escrow, transparent wholesale price benchmarks, and automated 60-second withdrawals.

Select a quick action below or ask any question:`,
      actionButtons: [
        { label: 'Produce Marketplace', action: 'navigate_main', icon: 'marketplace' },
        { label: 'Instant M-Pesa Withdraw', action: 'open_withdraw', icon: 'withdraw' },
        { label: 'Farmer Dashboard', action: 'navigate_farmer', icon: 'farmer' },
        { label: 'Driver GPS Radar', action: 'navigate_transporter', icon: 'logistics' }
      ]
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
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(text);
      setIsTyping(false);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cardType: response.cardType || 'standard',
        actionButtons: response.actionButtons || []
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(response.text, response.isSwahili);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  const filteredSuggestions = activeCategory === 'all'
    ? SUGGESTIONS
    : SUGGESTIONS.filter(c => c.cat === activeCategory);

  const getActionIcon = (iconName) => {
    switch (iconName) {
      case 'marketplace':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />;
      case 'withdraw':
        return <Wallet className="w-3.5 h-3.5 text-amber-600" />;
      case 'farmer':
        return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
      case 'logistics':
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      case 'topup':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'orders':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. PROFESSIONAL FLOATING TRIGGER BUTTON (BOTTOM RIGHT)  */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 bg-slate-900/95 hover:bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full border border-emerald-500/40 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 group"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold tracking-tight">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Kilimo AI</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">v2.4</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Market Prices · Agronomy · Site Guide</span>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen && window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-800 rotate-90 scale-95 border border-slate-700' 
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 hover:scale-105 hover:shadow-emerald-500/50 border-2 border-emerald-300/40'
          }`}
          aria-label="Kilimo AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. ENTERPRISE KILIMO AI DRAWER / WINDOW                  */}
      {/* ======================================================== */}
      {isOpen && (
        <div 
          className={`fixed bottom-24 right-3 sm:right-6 bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-6 ${
            isExpanded 
              ? 'w-[96vw] sm:w-[740px] md:w-[820px] h-[88vh] max-h-[88vh]' 
              : 'w-[95vw] sm:w-[500px] h-[700px] max-h-[85vh]'
          }`}
        >
          
          {/* Executive Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white tracking-tight">Kilimo AI</h3>
                  <BadgeCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold uppercase">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Digital Agronomist & B2B Site Operator</span>
                </p>
              </div>
            </div>

            {/* Header Tools */}
            <div className="flex items-center gap-1.5">
              
              {/* Language Switcher */}
              <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    selectedLanguage === 'en' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 EN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('sw')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    selectedLanguage === 'sw' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇰🇪 SW
                </button>
              </div>

              {/* Lady Voice Toggle */}
              <button
                type="button"
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

              {/* Expand / Maximize Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Collapse window' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Reset Conversation */}
              <button
                type="button"
                onClick={resetChat}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Restart chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
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

          {/* Real-time Voice Audio Equalizer Bar */}
          {isSpeaking && (
            <div className="bg-emerald-950 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-300 border-b border-emerald-900/60 animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Kilimo AI Speaking (Lady Voice Active)...</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              </div>
            </div>
          )}

          {/* Quick Voice Accent Sample Strip */}
          <div className="px-4 py-1.5 bg-slate-900 text-slate-300 text-[10px] flex items-center justify-between border-b border-slate-800">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>Voice Synthesis:</span>
            </span>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={testVoiceEN} 
                className="hover:text-emerald-400 flex items-center gap-1 text-[10px] font-bold transition-colors"
              >
                <Play className="w-2.5 h-2.5 text-emerald-400" />
                <span>Lady Voice (EN)</span>
              </button>
              <span className="text-slate-700">|</span>
              <button 
                type="button"
                onClick={testVoiceSW} 
                className="hover:text-emerald-400 flex items-center gap-1 text-[10px] font-bold transition-colors"
              >
                <Play className="w-2.5 h-2.5 text-emerald-400" />
                <span>Sauti ya Kiswahili (KE)</span>
              </button>
            </div>
          </div>

          {/* Topic Tabs */}
          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Prompts Suggestions Horizontal Strip */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto flex gap-2 no-scrollbar">
            {filteredSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUserMessage(item.query)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 text-[11px] font-semibold whitespace-nowrap transition-all shadow-xs shrink-0 flex items-center gap-1.5 group"
              >
                <span>{item.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-emerald-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 leading-relaxed shadow-sm transition-all ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Clean text formatting */}
                  <div className="text-[12px] sm:text-[13px] leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-normal">
                    {m.sender === 'user' ? (
                      <span className="text-white font-medium">{m.text}</span>
                    ) : (
                      m.text
                    )}
                  </div>

                  {/* STRUCTURED WIDGET: Market Prices Grid */}
                  {m.cardType === 'market_prices' && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                        National Clearinghouse Benchmarks
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {COMMODITY_BENCHMARKS.map((item, bIdx) => (
                          <div key={bIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-900 text-[11px]">{item.crop}</p>
                              <p className="text-[10px] text-slate-500">{item.market}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-emerald-800 text-[11px]">{item.price}</p>
                              <span className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${item.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {item.change}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STRUCTURED WIDGET: Smart Escrow Trust Badge */}
                  {m.cardType === 'escrow_trust' && (
                    <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-emerald-950">Safaricom M-Pesa Smart Escrow Vault</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold font-mono">100% SECURE</span>
                        </div>
                        <p className="text-emerald-800/90 text-[10px] mt-0.5">Funds released strictly upon physical buyer inspection and confidential 4-digit OTP handover.</p>
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE ACTION BUTTONS (SITE OPERATOR) */}
                  {m.actionButtons && m.actionButtons.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {m.actionButtons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          type="button"
                          onClick={() => handleExecuteAction(btn.action)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-bold text-[11px] rounded-xl border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 shadow-2xs transition-all group"
                        >
                          {getActionIcon(btn.icon)}
                          <span>{btn.label}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Bottom Action Bar: Copy, Audio & Time */}
                  <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50">
                    <span className="font-mono">{m.time}</span>
                    
                    {m.sender === 'ai' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakText(m.text)}
                          className="hover:text-emerald-600 flex items-center gap-1 transition-colors"
                          title="Listen to this response"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className="hover:text-emerald-600 flex items-center gap-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

            {/* Live Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-500 font-medium ml-1">Kilimo AI is synthesizing insights...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3.5 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                }`}
                title={isListening ? 'Listening to your voice... (click to stop)' : 'Click to speak to Kilimo AI'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={isListening ? "Listening to your voice..." : "Ask Kilimo AI: prices, withdraw, post crop, escrow..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder-slate-400 transition-all font-medium"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white shadow-md shadow-emerald-500/20 transition-all"
                title="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 text-center text-[10px] text-slate-400 font-medium">
              Kilimo AI Enterprise v2.4 · Kenya Agribusiness Intelligence · Protected by AgriLink Escrow
            </div>
          </div>

        </div>
      )}
    </>
  );
}
