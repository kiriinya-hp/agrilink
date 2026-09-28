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
  AlertTriangle,
  Layers,
  PhoneCall
} from 'lucide-react';

// =====================================================================
// QUICK CATEGORY TABS & PROMPT CHIPS
// =====================================================================
const CATEGORIES = [
  { id: 'all', label: '✨ All Topics' },
  { id: 'guide', label: '🌐 Website Operator' },
  { id: 'swahili', label: '🇰🇪 Kiswahili (Kenyan)' },
  { id: 'prices', label: '📊 Market Prices' },
  { id: 'agronomy', label: '🌾 Crop Care & Pests' },
  { id: 'escrow', label: '🔒 Escrow & OTP' },
  { id: 'withdraw', label: '💳 M-Pesa Withdraw' },
  { id: 'logistics', label: '🚚 Driver & GPS' }
];

const SUGGESTION_CHIPS = [
  { cat: 'guide', label: '🛒 How to buy produce', query: 'How do I buy produce on the marketplace and pay with Escrow?' },
  { cat: 'guide', label: '🌾 How to post harvest', query: 'How do I post my farm harvest on AgriLink as a farmer?' },
  { cat: 'withdraw', label: '💳 Withdraw to M-Pesa', query: 'How do I withdraw my earnings to M-Pesa or Bank?' },
  { cat: 'swahili', label: '🇰🇪 Msaada wa Kiswahili', query: 'Niaje Kilimo AI! Nielezee jinsi ya kutumia hii tovuti kwa Kiswahili safi.' },
  { cat: 'prices', label: '🍅 Today wholesale prices', query: 'What are current wholesale commodity prices at Wakulima and Kongowea?' },
  { cat: 'agronomy', label: '🐛 Tomato blight & pests', query: 'How do I prevent tomato late blight and control Tuta Absoluta?' },
  { cat: 'escrow', label: '🔐 How Escrow protects me', query: 'How does Safaricom M-Pesa escrow and the 4-digit OTP protect my money?' },
  { cat: 'logistics', label: '🚚 Driver live GPS map', query: 'How does live geographic freight tracking and OTP delivery work?' },
  { cat: 'guide', label: '🤝 Negotiate wholesale price', query: 'How do I make a counter-offer or negotiate prices with farmers?' },
  { cat: 'swahili', label: '🇰🇪 Pesa zangu ziko salama?', query: 'Je, pesa zangu ziko salama vipi kwenye mfumo huu?' }
];

export default function KilimoAIAssistant({ 
  user, 
  activeTab, 
  onNavigateTab, 
  onOpenTopUp,
  onOpenWithdraw 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Habari ${user?.name ? user.name.split(' ')[0] : 'there'}! I am **Kilimo AI**, your intelligent B2B Agribusiness Specialist & Autonomous Site Navigator.

I can guide you through live wholesale market prices, agronomy pest prevention, M-Pesa escrow protection, or operate the website for you (navigate to marketplace, trigger withdrawals, or track shipments).

You can talk to me in **English** or **Kenyan Kiswahili** using voice or text!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '🛒 Go to Marketplace', action: 'navigate_main' },
        { label: '💳 M-Pesa Withdraw', action: 'open_withdraw' },
        { label: '🌾 Post Harvest', action: 'navigate_farmer' }
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

  // Load and configure natural Lady / Female Voice
  useEffect(() => {
    const pickFemaleVoice = () => {
      if (!('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Match female voices across browsers
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
        console.warn('Speech recognition notice:', e.error);
        setIsListening(false);
      };
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
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Lady voice speech synthesis with feminine pitch
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
    utterance.pitch = 1.25; // Warm, natural feminine pitch
    utterance.rate = 0.96; // Clear speaking cadence
    utterance.lang = isSwahili ? 'sw-KE' : 'en-KE';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const testVoiceEN = () => {
    speakText("Hello! I am Kilimo AI, your personal agricultural assistant and site guide on AgriLink. How can I assist your trade or harvest today?");
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
        text: `Chat reset! I am **Kilimo AI**, ready to assist you. What would you like to explore? Wholesale prices, M-Pesa withdrawals, agronomy crop care, or site navigation?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: [
          { label: '🛒 Produce Marketplace', action: 'navigate_main' },
          { label: '💳 M-Pesa Withdraw', action: 'open_withdraw' },
          { label: '🚚 Driver GPS Radar', action: 'navigate_transporter' }
        ]
      }
    ]);
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
  // KILIMO AI INTELLIGENCE & KNOWLEDGE BASE
  // ===================================================================
  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. KISWAHILI / SHENG WITH AUTHENTIC KENYAN ACCENT & CADENCE
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
      // Swahili about withdrawals
      if (q.includes('kutoa') || q.includes('toa') || q.includes('pesa')) {
        return {
          isSwahili: true,
          text: `Sawa sawa kabisa! Kutoa pesa zako ni rahisi na haina wasiwasi wowote:

1. Angalia juu kwenye menyu ya tovuti na ubofye kitufe cha **'Withdraw'** (au bonyeza kitufe hapa chini).
2. Chagua njia unayotaka: **Safaricom M-Pesa B2C**, **Benki ya Kenya** (KCB, Equity, Co-op, NCBA, n.k.), au **Airtel Money**.
3. Chagua asilimia unayotaka kutoa: 25%, 50%, 75%, au 100% yote (Cash Out).
4. Bonyeza **Confirm Withdrawal**. Pesa zinaingia kwa simu yako ndani ya sekunde 60 bila kuchelewa!

*Hapa AgriLink, jasho lako linaheshimiwa bila makato ya siri!*`,
          actionButtons: [
            { label: '💳 Toa Pesa kwa M-Pesa', action: 'open_withdraw' }
          ]
        };
      }

      // Swahili about Escrow & Security
      if (q.includes('salama') || q.includes('escrow') || q.includes('wizi') || q.includes('madalali')) {
        return {
          isSwahili: true,
          text: `Hapo sasa! Usalama wako ndio nguzo kuu ya AgriLink:

1. **Hakuna Madalali (Zero Brokers)**: Mkulima anauza moja kwa moja kwa wanunuzi wa jumla kwa bei halisi ya soko.
2. **Safaricom M-Pesa Escrow**: Mnunuzi anaponunua mzigo, pesa hazilipwi kwa mkulima mara moja. Zinafungwa salama kwenye vault ya kidijitali.
3. **Mkulima Analindwa**: Mkulima anavuna akijua pesa tayari zimehifadhiwa salama.
4. **Nambari ya Siri (OTP ya tarakimu 4)**: Dereva anapofikisha mzigo, mnunuzi anakagua ubora. Akiridhika, anapeana OTP na papo hapo 95% ya pesa inatumwa kwa simu ya mkulima na dereva anapata ujira wake wa usafiri.

*Pesa zako ziko chonjo kabisa, hakuna kupoteza hata senti moja!*`,
          actionButtons: [
            { label: '🛒 Tazama Soko la Mazao', action: 'navigate_main' },
            { label: '📦 Kagua Mizigo Yako', action: 'navigate_orders' }
          ]
        };
      }

      // General Swahili Welcome
      return {
        isSwahili: true,
        text: `Karibu sana AgriLink! Mimi ni **Kilimo AI**, msaidizi wako wa kidijitali kutoka shambani hadi sokoni.

Hapa unaweza:
• **Kuuza Mazao Shambani**: Weka mavuno yako mtandaoni na upate wanunuzi kutoka Nairobi, Mombasa, na miji yote ya Kenya.
• **Kununua kwa Bei ya Jumla**: Nunua nyanya, vitunguu, viazi, na mahindi moja kwa moja bila madalali.
• **Kufuatilia Mzigo kwa GPS**: Tazama gari lako likisafiri barabarani kwa ramani ya moja kwa moja.
• **Kutoa Faida kwa M-Pesa**: Pata malipo yako ya B2C moja kwa moja ndani ya sekunde 60.

Ungependa nikusaidie na nini sasa hivi?`,
        actionButtons: [
          { label: '🛒 Nenda Sokoni', action: 'navigate_main' },
          { label: '🌾 Weka Mazao Shambani', action: 'navigate_farmer' },
          { label: '💳 Toa Pesa M-Pesa', action: 'open_withdraw' }
        ]
      };
    }

    // 2. WEBSITE OPERATOR: HOW TO POST PRODUCE (FARMER)
    if (q.includes('post') || q.includes('sell') || q.includes('listing') || q.includes('upload') || q.includes('how to post') || q.includes('as a farmer')) {
      return {
        text: `🌾 **How to Post Produce on AgriLink (Farmer Guide):**

1. **Switch to Farmer Dashboard**: Click on the **'Farmer'** tab on the navigation bar (or use the button below).
2. **Fill Produce Details**:
   • **Crop Name**: e.g., *Ranger F1 Tomatoes*, *Red Bulb Onions*, or *Shangi Potatoes*.
   • **Category**: Select Horticulture, Grains, Tubers, or Fruits.
   • **Quantity Available**: Enter available volume in kilograms (kg).
   • **Wholesale Price**: Set fair price per kg in KES/USD.
   • **Harvest Date & Location**: Enter your farm location (e.g., Kirinyaga, Nakuru, Narok).
3. **Click 'Publish Wholesale Listing'**: Your listing goes live instantly on the B2B Marketplace where verified bulk buyers can purchase or make offers!`,
        actionButtons: [
          { label: '🌾 Go to Farmer Portal', action: 'navigate_farmer' }
        ]
      };
    }

    // 3. WEBSITE OPERATOR: HOW TO BUY & PAY VIA ESCROW
    if (q.includes('buy') || q.includes('order') || q.includes('purchase') || q.includes('checkout') || q.includes('how to buy')) {
      return {
        text: `🛒 **How to Buy Produce on AgriLink (Buyer Guide):**

1. **Browse Marketplace**: Click **'Marketplace'** to view active farmer batches, grades, and farm locations.
2. **Order or Negotiate**:
   • Click **'Order Now'** to buy at the stated price.
   • Or click **'Make Offer'** to negotiate a bulk discount directly with the farmer.
3. **Escrow Checkout**:
   • Enter your delivery depot address (e.g., Nairobi Industrial Area, Mombasa Kongowea).
   • Choose payment: **M-Pesa STK Push** (prompt sent to your phone) or **Escrow Wallet Balance**.
4. **Guaranteed Delivery**: Funds are locked in digital escrow until delivery. The driver is assigned with GPS tracking. Once you inspect the produce and enter the 4-digit OTP, payment is released!`,
        actionButtons: [
          { label: '🛒 Open Marketplace', action: 'navigate_main' },
          { label: '💰 Top Up Escrow Wallet', action: 'open_topup' }
        ]
      };
    }

    // 4. WEBSITE OPERATOR: HOW TO WITHDRAW (M-PESA / BANKS)
    if (q.includes('withdraw') || q.includes('cash out') || q.includes('payout') || q.includes('bank') || q.includes('toa pesa') || q.includes('how to withdraw')) {
      return {
        text: `💳 **How to Withdraw Earnings to M-Pesa or Bank:**

1. Click the **'Withdraw'** button in the top navigation bar (or on your Farmer / Driver earnings card).
2. Choose your preferred Kenyan destination:
   • **Safaricom M-Pesa B2C**: Instant mobile money payout.
   • **Kenyan Bank Transfer**: Direct EFT/RTGS to KCB, Equity Bank, Co-operative Bank, NCBA, Stanbic, Absa, DTB, or I&M Bank.
   • **Airtel Money**: Instant mobile wallet payout.
3. Select an amount percentage (25%, 50%, 75%, or 100% Cash Out) or type a custom amount.
4. Click **'Confirm Withdrawal'**. Your disbursement is processed within 60 seconds with an official transaction reference code!`,
        actionButtons: [
          { label: '💳 Open M-Pesa Withdrawals', action: 'open_withdraw' },
          { label: '💰 Escrow Wallet Top-Up', action: 'open_topup' }
        ]
      };
    }

    // 5. ESCROW & 4-DIGIT DELIVERY OTP
    if (q.includes('escrow') || q.includes('otp') || q.includes('safe') || q.includes('scam') || q.includes('security') || q.includes('protection')) {
      return {
        text: `🔒 **How AgriLink Smart Escrow & 4-Digit OTP Work:**

• **Buyer Peace of Mind**: Your money is held in an encrypted digital vault. The farmer does NOT get paid until you receive and inspect the goods.
• **Farmer Assurance**: Farmers harvest and load trucks knowing 100% of the funds are already deposited and verified in escrow.
• **4-Digit Confidential OTP**: When a driver picks up cargo, the system generates a secure 4-digit PIN stored in the driver's manifest.
• **Settlement on Inspection**: Upon delivery at your depot, inspect the grade and weight. If satisfied, hand over the OTP.
• **Automated Split**: The moment the OTP is verified:
  - 95% is credited to the Farmer's wallet.
  - Freight fee is credited to the Driver.
  - 5% platform service fee is deducted.`,
        actionButtons: [
          { label: '📦 View Active Orders', action: 'navigate_orders' }
        ]
      };
    }

    // 6. DRIVER GPS NAVIGATION & MILESTONES
    if (q.includes('driver') || q.includes('gps') || q.includes('map') || q.includes('radar') || q.includes('truck') || q.includes('transporter') || q.includes('tracking')) {
      return {
        text: `🚚 **Live Geographic GPS Freight Navigation (Driver Portal):**

• **100% Free OpenStreetMap Radar**: Drivers can view pending buyer cargo on an interactive live map without any external charges.
• **Real Distance & Milestones**: Displays actual farm origin coordinates (e.g. Kirinyaga, Kinangop) and buyer dropoff depots (Nairobi, Mombasa) with live haversine distance.
• **Milestone Progression**:
  1. \`PICKED_UP\`: Cargo loaded at farm gate.
  2. \`IN_TRANSIT\`: Moving along Kenyan highway corridors (A2, A104).
  3. \`ARRIVED\`: Arrived at buyer depot awaiting OTP validation.
• **Instant Driver Payout**: The moment the buyer enters your 4-digit delivery OTP, your freight earnings credit to your wallet immediately!`,
        actionButtons: [
          { label: '🚚 Open Driver Radar & GPS', action: 'navigate_transporter' }
        ]
      };
    }

    // 7. WHOLESALE COMMODITY PRICES (KENYA MARKETS)
    if (q.includes('price') || q.includes('commodity') || q.includes('rate') || q.includes('cost') || q.includes('wakulima') || q.includes('kongowea') || q.includes('marikiti') || q.includes('market prices')) {
      return {
        text: `📊 **Live Kenyan Wholesale Commodity Price Benchmarks:**

• 🍅 **Tomatoes (Ranger F1 / Anna F1)**:
  - Nairobi Wakulima (Marikiti): **KES 115/kg** (▲ +4.8%)
  - Nakuru Wholesale: **KES 95/kg** (Stable)
• 🧅 **Red Bulb Onions**:
  - Mombasa Kongowea: **KES 88/kg** (▼ -1.2%)
  - Nairobi City Park: **KES 92/kg**
• 🥔 **Shangi Potatoes**:
  - Nairobi Wakulima: **KES 3,200 / 50kg bag** (▲ +3.2%)
  - Nyandarua Farmgate: **KES 2,400 / 50kg bag**
• 🌽 **Dry White Maize**:
  - Eldoret Grain Hub: **KES 4,100 / 90kg bag** (Stable)
  - Kisumu Jubilee Market: **KES 4,400 / 90kg bag**
• 🥑 **Hass Avocado (Export Grade A)**:
  - Murang'a / Meru: **KES 140/kg** (▲ +6.5%)
• 🥬 **Sukuma Wiki & Cabbages**:
  - Kisumu / Eldoret: **KES 38 - 45/kg**

*Tip: Check the Live Commodity Ticker at the top of the Marketplace for 24-hour fluctuations!*`,
        actionButtons: [
          { label: '🛒 View Marketplace Listings', action: 'navigate_main' }
        ]
      };
    }

    // 8. CROP AGRONOMY, PESTS & SEASONS IN KENYA
    if (q.includes('agronomy') || q.includes('blight') || q.includes('pest') || q.includes('fertilizer') || q.includes('disease') || q.includes('tuta') || q.includes('soil') || q.includes('tomato') || q.includes('potato') || q.includes('maize')) {
      return {
        text: `🌾 **Kilimo Agronomy & Crop Health Guide (Kenya Sector):**

• **Late Blight in Tomatoes & Potatoes** (*Phytophthora infestans*):
  - Common in cool, humid zones (Nyandarua, Kiambu, Meru).
  - Spray preventive copper fungicides (Ridomil Gold, Mancozeb, or Nordox) every 7-10 days before rain.
• **Tuta Absoluta (Tomato Leafminer)**:
  - Install delta pheromone traps in the greenhouse/open field.
  - Spray targeted insecticides (e.g. Coragen, Radiant, or Belt) during early moth egg hatch.
• **Fall Armyworm in Maize**:
  - Scout fields early at whorl emergence. Apply Ampligo or Voliam Targo directly into the leaf whorl in early morning hours.
• **Fertilizer Protocol for Kenya**:
  - *Planting*: Use DAP or NPK (17:17:17) for vigorous root branching.
  - *Topdressing*: Apply CAN 4-5 weeks after germination right before earthing up.
• **Post-Harvest Crating**:
  - Avoid packing tomatoes in gunny bags! Use ventilated plastic crates stacked no more than 6 high to avoid transit crushing on rough roads.`,
        actionButtons: [
          { label: '🌾 Go to Farmer Portal', action: 'navigate_farmer' }
        ]
      };
    }

    // 9. PRICE NEGOTIATION / RFQ (MAKE OFFER)
    if (q.includes('negotiate') || q.includes('offer') || q.includes('rfq') || q.includes('bargain') || q.includes('counter')) {
      return {
        text: `🤝 **How to Negotiate Wholesale Prices (Make Offer / RFQ):**

1. Find any produce listing on the **Marketplace**.
2. Click the **'Make Offer'** button on the produce card.
3. Enter your desired wholesale order quantity and proposed unit price per kg.
4. Add any special requests (e.g., graded packaging, delivery timeline).
5. The farmer is instantly alerted to review, accept, or send a counter-offer!`,
        actionButtons: [
          { label: '🛒 Go to Marketplace', action: 'navigate_main' }
        ]
      };
    }

    // 10. DISPUTES & QUALITY INSPECTIONS
    if (q.includes('dispute') || q.includes('damage') || q.includes('rotten') || q.includes('refund') || q.includes('complaint')) {
      return {
        text: `⚖️ **How to Handle Quality Disputes on AgriLink:**

1. If produce arrives damaged, rotten, or under-weight, **do NOT disclose the 4-digit OTP to the driver**.
2. Go to **Orders & Logistics Tracking**.
3. Click the **'Report Quality Issue'** button next to the order.
4. Select the issue type (Transit Damage, Grade Mismatch, Missing Weight) and submit notes.
5. Escrow payout is immediately frozen while our inspection team arranges an escrow refund or replacement consignment!`,
        actionButtons: [
          { label: '📦 Open Orders & Disputes', action: 'navigate_orders' }
        ]
      };
    }

    // DEFAULT INTELLIGENT RESPONSE
    return {
      text: `Regarding "${query}": **Kilimo AI** is here to empower your agribusiness journey on AgriLink.

We connect verified Kenyan farmers with bulk commercial buyers and professional drivers. All payments are backed by Safaricom M-Pesa smart escrow, transparent wholesale pricing across Wakulima and Kongowea, and instant M-Pesa B2C wallet withdrawals.

How would you like to proceed?`,
      actionButtons: [
        { label: '🛒 Open Marketplace', action: 'navigate_main' },
        { label: '💳 M-Pesa Withdraw', action: 'open_withdraw' },
        { label: '🌾 Farmer Dashboard', action: 'navigate_farmer' },
        { label: '🚚 Driver GPS Radar', action: 'navigate_transporter' }
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
        actionButtons: response.actionButtons || []
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(response.text, response.isSwahili);
    }, 450);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  const filteredChips = activeCategory === 'all'
    ? SUGGESTION_CHIPS
    : SUGGESTION_CHIPS.filter(c => c.cat === activeCategory);

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING AI TRIGGER BUTTON (BOTTOM RIGHT)            */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 text-white text-xs px-3.5 py-2 rounded-full border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-bounce cursor-pointer"
               onClick={() => setIsOpen(true)}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Ask <strong>Kilimo AI</strong> · Site Guide</span>
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
      {/* 2. ENHANCED KILIMO AI CONVERSATIONAL DRAWER             */}
      {/* ======================================================== */}
      {isOpen && (
        <div className="fixed bottom-24 right-3 sm:right-6 w-[95vw] sm:w-[460px] max-h-[85vh] h-[670px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-wide">Kilimo AI</h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold uppercase tracking-wider">
                    Site Operator
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">Digital Agronomist · Kenya B2B Navigator</p>
              </div>
            </div>

            {/* Top Controls: Voice, Tests & Reset */}
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
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

              {/* Reset chat */}
              <button
                type="button"
                onClick={resetChat}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close drawer */}
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

          {/* Lady Speaking Animated Equalizer */}
          {isSpeaking && (
            <div className="bg-emerald-950 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-300 border-b border-emerald-900/60 animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Kilimo AI speaking...</span>
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
          <div className="px-3 py-1.5 bg-slate-900 text-slate-300 text-[10px] flex items-center justify-between border-b border-slate-800">
            <span className="text-slate-400 font-mono">Audio Guide:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={testVoiceEN} 
                className="hover:text-emerald-400 flex items-center gap-1 text-[10px] font-bold"
              >
                <Play className="w-2.5 h-2.5 text-emerald-400" />
                <span>Lady Voice (EN)</span>
              </button>
              <span className="text-slate-700">|</span>
              <button 
                onClick={testVoiceSW} 
                className="hover:text-emerald-400 flex items-center gap-1 text-[10px] font-bold"
              >
                <Play className="w-2.5 h-2.5 text-emerald-400" />
                <span>Sauti ya Kiswahili (KE)</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Suggestion Chips Filtered */}
          <div className="px-2.5 py-2 bg-slate-50 border-b border-slate-200/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {filteredChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleUserMessage(chip.query)}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1"
              >
                <span>{chip.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
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
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Interactive Action Buttons inside AI Responses */}
                  {m.actionButtons && m.actionButtons.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actionButtons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          type="button"
                          onClick={() => handleExecuteAction(btn.action)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg border border-emerald-200/80 flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>{btn.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

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

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-400 ml-1">Kilimo AI is thinking...</span>
                </div>
              </div>
            )}

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
              title={isListening ? 'Listening to your voice... (click to stop)' : 'Click to speak to Kilimo AI'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask Kilimo AI: prices, withdraw, post crop, escrow..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-md shadow-emerald-200 transition-colors"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
