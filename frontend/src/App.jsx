import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  Lock, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Wallet, 
  AlertCircle,
  PlusCircle,
  PackageCheck,
  RefreshCw,
  Search,
  DollarSign,
  LogOut,
  User,
  Phone,
  Building,
  Radio,
  Bell,
  FileText,
  Sparkles,
  Share2,
  Smartphone,
  Check,
  Edit3,
  Trash2,
  Database,
  ArrowUpRight,
  Handshake,
  ShieldAlert,
  Scale,
  CloudSun,
  Bot,
  Leaf,
  Camera,
  Download,
  Upload,
  Activity,
  Megaphone,
  TrendingUp,
  Film,
  Wifi,
  WifiOff,
  Mic,
  Printer,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ImagePickerModal from './components/ImagePickerModal';
import ReceiptModal from './components/ReceiptModal';
import NotificationDrawer from './components/NotificationDrawer';
import MobileNotificationPill from './components/MobileNotificationPill';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import KilimoAIAssistant from './components/KilimoAIAssistant';
import WalletTopUpModal from './components/WalletTopUpModal';
import WalletWithdrawModal from './components/WalletWithdrawModal';
import CommodityPriceTicker from './components/CommodityPriceTicker';
import KilimoWeatherAdvisory from './components/KilimoWeatherAdvisory';
import MakeOfferModal from './components/MakeOfferModal';
import DisputeModal from './components/DisputeModal';
import DriverLiveMap from './components/DriverLiveMap';
import { CurrencyUnitProvider, CurrencyUnitBar, useCurrency, USD_TO_KES } from './components/CurrencyUnitContext';
import FreightCalculatorModal from './components/FreightCalculatorModal';
import ChamaAggregationModal from './components/ChamaAggregationModal';
import FarmerProfitCalculatorModal from './components/FarmerProfitCalculatorModal';
import AlertsSubscriptionModal from './components/AlertsSubscriptionModal';
import { LanguageProvider, LanguageSwitcher, useLanguage } from './components/LanguageContext';
import DashboardBackground from './components/DashboardBackground';
import UssdSimulatorModal from './components/UssdSimulatorModal';
import AiNegotiationModal from './components/AiNegotiationModal';
import SatelliteCropScannerModal from './components/SatelliteCropScannerModal';
import CropDiseaseDoctorModal from './components/CropDiseaseDoctorModal';
import UserProfileModal from './components/UserProfileModal';
import AiMarketPricePredictorModal from './components/AiMarketPricePredictorModal';
import AdminSystemHealth from './components/AdminSystemHealth';
import AdminEscrowDisputes from './components/AdminEscrowDisputes';
import AdminBroadcastModal from './components/AdminBroadcastModal';
import AdminOrdersManagement from './components/AdminOrdersManagement';
import AdminProduceManagement from './components/AdminProduceManagement';
import BuyerDemandBoard from './components/BuyerDemandBoard';
import MobileToolsSheetModal from './components/MobileToolsSheetModal';
import IntroVideoSplash from './components/IntroVideoSplash';
import ProducePassportModal from './components/ProducePassportModal';
import OfflineSyncModal from './components/OfflineSyncModal';
import VoiceMessagingModal from './components/VoiceMessagingModal';
import KilimoVisionScanner from './components/KilimoVisionScanner';
import InvoiceModal from './components/InvoiceModal';
import { initPushNotifications, scheduleNativeNotification } from './services/pushNotificationService';
import { 
  cacheListingsOffline, 
  getCachedListingsOffline, 
  cacheOrdersOffline, 
  getCachedOrdersOffline, 
  queueOfflineListing, 
  getPendingSyncQueue, 
  clearPendingSyncItem,
  clearAllSyncQueue 
} from './services/offlineSyncService';

const API_BASE = '/api';

function MainApp({ onReplayIntro }) {
  const { user, token, logout, refreshUser } = useAuth();
  const { formatMoney, currency } = useCurrency();
  const { t, language } = useLanguage();



  // Admin login is accessible ONLY via secret URL: /?admin=1
  // It is not linked from anywhere in the regular user interface.
  const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === '1';
  const [authPage, setAuthPage] = useState(isAdminRoute ? 'admin-login' : 'login');

  // Navigation Tabs for active role
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'farmer', 'logistics', 'orders', 'analytics', 'admin-users'
  const [marketplaceSubTab, setMarketplaceSubTab] = useState('listings'); // 'listings' | 'demands'
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data States
  const [listings, setListings] = useState([]);
  const [farmerListings, setFarmerListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Marketplace Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Expanded product cards – stores a Set of item IDs that are expanded
  const [expandedCards, setExpandedCards] = useState(new Set());
  const toggleCardExpand = (id) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // Transporter Count & Notification Drawer State
  const [transporterCount, setTransporterCount] = useState(3);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [activeHeadsUpNotification, setActiveHeadsUpNotification] = useState(null);
  const prevUnreadCountRef = React.useRef(0);
  const notifPollRef = React.useRef(null);

  const handleDeleteNotification = (notifId) => {
    setNotificationsList(prev => prev.filter(n => n.id !== notifId));
    setUnreadNotifCount(prev => Math.max(0, prev - 1));
  };

  /**
   * Fetch fresh notifications from server and show heads-up pill if a new
   * unread notification has arrived since the last poll.
   */
  const fetchNotifications = React.useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res  = await fetch(`${API_BASE}/notifications?userId=${userId}`);
      const data = await res.json();
      if (!data.success) return;

      const incoming = data.notifications || [];
      const newCount = data.unreadCount   || 0;

      setNotificationsList(incoming);
      setUnreadNotifCount(newCount);

      // If unread count grew since last poll, surface the newest as heads-up pill
      if (newCount > prevUnreadCountRef.current && incoming.length > 0) {
        const newest = incoming.find(n => !n.read) || incoming[0];
        setActiveHeadsUpNotification({
          id:        'hud_' + newest.id,
          title:     newest.title,
          message:   newest.message,
          type:      newest.type || 'ALERT',
          createdAt: newest.createdAt,
        });

        // Also fire native notification tray if in background/foreground
        scheduleNativeNotification({
          title: newest.title  || 'AgriShamba',
          body:  newest.message || 'You have a new alert on AgriShamba.',
        }).catch(() => {});
      }

      prevUnreadCountRef.current = newCount;
    } catch {}
  }, []);

  // Modals
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [orderQty, setOrderQty] = useState(100);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('MPESA_STK');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderPaymentStep, setOrderPaymentStep] = useState('form'); // 'form' | 'awaiting_pin' | 'success'
  const [orderPaymentDetails, setOrderPaymentDetails] = useState(null);
  const [orderPinInput, setOrderPinInput] = useState('');

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [negotiatingListing, setNegotiatingListing] = useState(null);
  const [disputingOrder, setDisputingOrder] = useState(null);

  // New Feature Modals State
  const [showFreightCalculator, setShowFreightCalculator] = useState(false);
  const [showChamaAggregation, setShowChamaAggregation] = useState(false);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [alertsDefaultCrop, setAlertsDefaultCrop] = useState('Tomatoes');
  const [freightOrigin, setFreightOrigin] = useState('');
  const [freightDestination, setFreightDestination] = useState('Nairobi Central Wholesale Depot');

  // Novel Differentiator Modals State
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [showAiNegotiation, setShowAiNegotiation] = useState(false);
  const [showSatelliteScanner, setShowSatelliteScanner] = useState(false);
  const [satelliteCrop, setSatelliteCrop] = useState('Tomatoes');
  const [satelliteLocation, setSatelliteLocation] = useState('Kinangop, Nyandarua County');
  const [showCropDoctor, setShowCropDoctor] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAiPricePredictor, setShowAiPricePredictor] = useState(false);
  const [trackingMapOrder, setTrackingMapOrder] = useState(null);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [showMobileToolsSheet, setShowMobileToolsSheet] = useState(false);
  const [producePassportOrder, setProducePassportOrder] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState(getPendingSyncQueue());
  const [voiceChatOrder, setVoiceChatOrder] = useState(null);
  const [showKilimoVision, setShowKilimoVision] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

  const handleSendWhatsAppAlert = (order) => {
    if (!order) return;
    const recipientPhone = order.buyer?.phone || order.farmer?.phone || user?.phone || '0712345678';
    let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('254')) cleanPhone = '254' + cleanPhone;

    const crop = order.items?.[0]?.cropName || order.cropName || 'Fresh Produce';
    const qty = order.items?.[0]?.quantity || order.quantity || 500;
    const total = order.grandTotal || (order.unitPrice * qty) || 45000;
    const otp = order.shipment?.confirmationOtp || order.deliveryOtp || '• • • •';
    const orderNo = order.id?.slice(-6)?.toUpperCase() || '883921';

    const msg = `*AgriShamba SCM Official Alert*\n` +
      `📦 *Order #${orderNo}* (${crop} • ${qty} kg)\n` +
      `💰 Amount: *KES ${Number(total).toLocaleString()}* (M-Pesa Escrow Protected)\n` +
      `🔐 6-Digit Delivery OTP: *${otp}*\n` +
      `📍 Current Status: *${order.status}*\n` +
      `🔗 Digital Trace: https://agrilink-pyrv.onrender.com/trace/${order.id || ''}\n\n` +
      `_Toka Shambani Hadi Sokoni • AgriShamba Kenya_`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Farmer New Listing Form State
  const [newListing, setNewListing] = useState({
    cropName: '',
    category: 'HORTICULTURE',
    unit: 'kg',
    availableQty: '',
    unitPrice: '',
    grade: 'GRADE_A',
    location: '',
    harvestDate: '',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
  });

  // Delivery OTP Input
  const [otpInputs, setOtpInputs] = useState({});

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture PWA install event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Online / Offline Network State Listener & Auto-Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('📶 Cellular/WiFi connection restored! You are back online.', 'success');
      // Trigger background auto-sync of queued offline items
      handleSyncPendingQueue();
      loadRoleData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('📡 Offline Mode Activated: Using local device cache for farm data.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      showNotification('Thank you for installing AgriShamba on your mobile device!');
    }
  };

  // Reset tab and initialize push notifications when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'BUYER') setActiveTab('marketplace');
      else if (user.role === 'FARMER') setActiveTab('farmer');
      else if (user.role === 'TRANSPORTER') setActiveTab('logistics');
      else if (user.role === 'ADMIN') setActiveTab('analytics');
      setPaymentPhone(user.phone || '');
      setDeliveryAddress(user.location || 'Nairobi Central Depot');
      loadRoleData();
      // Initialize native push / local notification service
      initPushNotifications();
    }
    return () => {
      if (notifPollRef.current) clearInterval(notifPollRef.current);
    };
  }, [user]);


  useEffect(() => {
    if (user) {
      loadRoleData();
    }
  }, [activeTab, selectedCategory, search]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setActiveHeadsUpNotification({
      id: 'hud_' + Date.now(),
      title: type === 'error' ? 'Security / System Alert' : 'AgriShamba Update',
      message: msg,
      type: type === 'error' ? 'ALERT' : 'ESCROW',
      createdAt: new Date().toISOString()
    });
    setTimeout(() => setNotification(null), 6000);
  };

  const loadRoleData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      // 1. Fetch available drivers count
      fetch(`${API_BASE}/transporters/count`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setTransporterCount(data.count);
        })
        .catch(() => {});

      // 2. Fetch user's notification center alerts (initial load + start 30s poll)
      fetchNotifications(user.id);

      // Clear any existing poll interval then start fresh 30-second polling
      if (notifPollRef.current) clearInterval(notifPollRef.current);
      notifPollRef.current = setInterval(() => {
        fetchNotifications(user.id);
      }, 30_000);

      // 3. Always fetch all public marketplace produce listings
      const query = new URLSearchParams();
      if (selectedCategory !== 'ALL') query.append('category', selectedCategory);
      if (search) query.append('search', search);
      const res = await fetch(`${API_BASE}/listings?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings || []);
        cacheListingsOffline(data.listings || []);
        if (user.role === 'FARMER') {
          setFarmerListings((data.listings || []).filter(l => l.farmerId === user.id));
        }
      }

      if (user.role === 'BUYER') {
        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=BUYER`);
        const oData = await oRes.json();
        if (oData.success) {
          setOrders(oData.orders);
          cacheOrdersOffline(oData.orders);
        }
      } 
      
      if (user.role === 'FARMER') {
        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=FARMER`);
        const oData = await oRes.json();
        if (oData.success) {
          setOrders(oData.orders);
          cacheOrdersOffline(oData.orders);
        }
      } 
      
      if (user.role === 'TRANSPORTER') {
        const sRes = await fetch(`${API_BASE}/shipments/available`);
        const sData = await sRes.json();
        if (sData.success) setAvailableShipments(sData.shipments);

        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=TRANSPORTER`);
        const oData = await oRes.json();
        if (oData.success) {
          setOrders(oData.orders);
          cacheOrdersOffline(oData.orders);
        }
      } 
      
      if (user.role === 'ADMIN') {
        const authHeaders = { 'Authorization': `Bearer ${token}` };

        const aRes = await fetch(`${API_BASE}/analytics`, { headers: authHeaders });
        const aData = await aRes.json();
        if (aData.success) setAnalytics(aData.analytics);

        const uRes = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders });
        const uData = await uRes.json();
        if (uData.success) setAllUsers(uData.users);
      }
    } catch (err) {
      console.warn('Network request failed, falling back to local offline cache:', err.message);
      // Fallback: Populate from offline local cache
      const cachedListings = getCachedListingsOffline();
      if (cachedListings && cachedListings.length > 0) {
        setListings(cachedListings);
        if (user.role === 'FARMER') {
          setFarmerListings(cachedListings.filter(l => l.farmerId === user.id));
        }
      }
      const cachedOrders = getCachedOrdersOffline();
      if (cachedOrders && cachedOrders.length > 0) {
        setOrders(cachedOrders);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      setUnreadNotifCount(0);
      setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Buyer: Issue PO & Trigger Real M-Pesa STK Push or Wallet Escrow Lock
  const handleCreateOrder = async () => {
    if (!orderModalListing) return;

    const produceCost = orderQty * orderModalListing.unitPrice;
    const freightCost = 20.00 + (orderQty * 0.02);
    const escrowFee = produceCost * 0.05;
    const grandTotal = produceCost + freightCost + escrowFee;

    // If paying via internal wallet, check balance first!
    if (paymentGateway === 'WALLET') {
      const currentBalance = user?.walletBalance || 0;
      if (currentBalance < grandTotal) {
        showNotification(
          `Insufficient Wallet Balance: You have $${currentBalance.toFixed(2)}, but order total is $${grandTotal.toFixed(2)}. Please Top Up or choose Lipa Na M-Pesa.`,
          'error'
        );
        return;
      }
    } else {
      if (!paymentPhone || !paymentPhone.trim()) {
        showNotification('Please enter a valid Safaricom M-Pesa phone number.', 'error');
        return;
      }
    }

    setPaymentProcessing(true);

    try {
      // 1. Create Purchase Order
      const resOrder = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          listingId: orderModalListing.id,
          quantity: orderQty,
          deliveryAddress
        })
      });
      const orderData = await resOrder.json();
      if (!orderData.success) throw new Error(orderData.error);

      // 2. Trigger Escrow Deposit (Daraja STK or Wallet)
      const resEscrow = await fetch(`${API_BASE}/escrow/deposit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId: orderData.order.id,
          paymentGateway,
          phoneNumber: paymentPhone
        })
      });
      const escrowData = await resEscrow.json();
      if (!escrowData.success) throw new Error(escrowData.error);

      if (escrowData.newBuyerBalance !== undefined && escrowData.newBuyerBalance !== null) {
        user.walletBalance = escrowData.newBuyerBalance;
      }

      const paymentInfo = {
        order: orderData.order,
        grandTotal: orderData.order.grandTotal || grandTotal,
        amountInKes: Math.round((orderData.order.grandTotal || grandTotal) * 130),
        confirmationOtp: escrowData.confirmationOtp,
        checkoutRequestId: escrowData.stkDetails?.checkoutRequestId,
        phone: paymentPhone,
        paymentGateway
      };
      setOrderPaymentDetails(paymentInfo);

      if (paymentGateway === 'MPESA_STK') {
        // Show interactive on-screen STK PIN prompt!
        setOrderPaymentStep('awaiting_pin');
      } else {
        // Wallet payment was confirmed directly
        setOrderPaymentStep('success');
        refreshUser();
        loadRoleData();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Authorize On-Screen PIN / Confirm Payment
  const handleConfirmOrderPin = () => {
    setOrderPaymentStep('success');
    showNotification(
      `💳 PAYMENT VERIFIED: $${orderPaymentDetails?.grandTotal?.toFixed(2) || '0.00'} locked in Escrow! Delivery OTP: ${orderPaymentDetails?.confirmationOtp}`
    );
    // Push notification to Android system notification shade
    scheduleNativeNotification({
      title: 'AgriShamba Escrow Locked! 🔒',
      body: `KES ${orderPaymentDetails?.amountInKes?.toLocaleString() || '0'} funded. Delivery OTP: ${orderPaymentDetails?.confirmationOtp}. Farmer & driver notified.`
    });
    refreshUser();
    loadRoleData();
  };


  // Close Order Modal & reset state
  const handleCloseOrderModal = () => {
    const wasSuccess = orderPaymentStep === 'success';
    setOrderModalListing(null);
    setOrderPaymentStep('form');
    setOrderPaymentDetails(null);
    setOrderPinInput('');
    if (wasSuccess) {
      setActiveTab('orders');
    }
  };

  // Sync all queued offline listings when network is online
  const handleSyncPendingQueue = async () => {
    const queue = getPendingSyncQueue();
    if (!queue || queue.length === 0) return 0;
    let synced = 0;

    for (const item of queue) {
      if (item.type === 'CREATE_LISTING') {
        try {
          const res = await fetch(`${API_BASE}/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...item.payload,
              farmerId: user?.id || item.payload.farmerId
            })
          });
          const data = await res.json();
          if (data.success) {
            clearPendingSyncItem(item.id);
            synced++;
          }
        } catch (e) {
          console.warn('[Sync Error] Could not sync offline item:', e.message);
        }
      }
    }

    setPendingSyncQueue(getPendingSyncQueue());
    if (synced > 0) {
      showNotification(`🎉 Successfully synced ${synced} offline shamba listing(s) to live marketplace!`, 'success');
      loadRoleData();
    }
    return synced;
  };

  const handleRemovePendingSyncItem = (itemId) => {
    const updated = clearPendingSyncItem(itemId);
    setPendingSyncQueue(updated);
    showNotification('Offline draft discarded.');
  };

  // Farmer: Publish harvest to catalog (with Offline Queue support)
  const handleCreateListing = async (e) => {
    e.preventDefault();

    // Check if browser is currently offline
    if (!navigator.onLine) {
      queueOfflineListing({
        ...newListing,
        farmerId: user.id
      });
      setPendingSyncQueue(getPendingSyncQueue());
      showNotification('📱 Shamba harvest saved to local offline drafts! It will auto-publish once back online or can be sent via SMS shortcut.', 'success');
      setNewListing({
        cropName: '',
        category: 'HORTICULTURE',
        unit: 'kg',
        availableQty: '',
        unitPrice: '',
        grade: 'GRADE_A',
        location: '',
        harvestDate: '',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
      });
      setShowOfflineModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListing,
          farmerId: user.id
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Produce listing published to live B2B marketplace!');
        setNewListing({
          cropName: '',
          category: 'HORTICULTURE',
          unit: 'kg',
          availableQty: '',
          unitPrice: '',
          grade: 'GRADE_A',
          location: '',
          harvestDate: '',
          imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop'
        });
        loadRoleData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // If network failed during post, save to offline queue automatically!
      queueOfflineListing({
        ...newListing,
        farmerId: user.id
      });
      setPendingSyncQueue(getPendingSyncQueue());
      showNotification('📡 Connection interrupted. Shamba draft saved offline! Tap "Offline Hub" to view or send via SMS.', 'error');
    }
  };


  // Transporter: Accept dispatch
  const handleAcceptShipment = async (shipmentId) => {
    try {
      const res = await fetch(`${API_BASE}/shipments/${shipmentId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user.id,
          vehicleReg: user.businessName || 'KBZ 500M (Commercial Freight)'
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Freight cargo claimed! Proceed to farm pickup location.');
        loadRoleData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Transporter: Update status
  const handleUpdateTransitStatus = async (shipmentId, status) => {
    try {
      const res = await fetch(`${API_BASE}/shipments/${shipmentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Shipment status updated to ${status}`);
        loadRoleData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Admin: Save updated stakeholder directly to database
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role,
          businessName: editingUser.businessName,
          location: editingUser.location,
          kycStatus: editingUser.kycStatus,
          isEmailVerified: editingUser.isEmailVerified,
          walletBalance: editingUser.walletBalance
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'Database record updated successfully!');
        setEditingUser(null);
        loadRoleData();
      } else {
        throw new Error(data.error || 'Failed to update user record in database');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Admin: Delete stakeholder from database (with cascading cleanup)
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}" from the database? This will cleanly remove all associated records.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || `Deleted "${userName}" from database successfully`);
        loadRoleData();
      } else {
        throw new Error(data.error || 'Failed to delete user record from database');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Admin: Export full database as JSON snapshot
  const handleExportDatabase = async () => {
    try {
      setDbSyncing(true);
      const res = await fetch(`${API_BASE}/admin/database/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Download JSON backup file to user machine
      const blob = new Blob([JSON.stringify(data.snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AgriShamba-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Database backup downloaded successfully to your computer!');
    } catch (err) {
      showNotification(err.message || 'Export failed', 'error');
    } finally {
      setDbSyncing(false);
    }
  };

  // Admin: Import / Restore database from JSON snapshot file
  const handleImportDatabase = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setDbSyncing(true);
      const text = await file.text();
      const snapshot = JSON.parse(text);
      const res = await fetch(`${API_BASE}/admin/database/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ snapshot })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showNotification(data.message || 'Database restored and synchronized successfully!');
      loadRoleData();
    } catch (err) {
      showNotification(err.message || 'Failed to restore database from file', 'error');
    } finally {
      setDbSyncing(false);
      e.target.value = '';
    }
  };

  // Admin: Trigger instant snapshot synchronization
  const handleSyncDatabase = async () => {
    try {
      setDbSyncing(true);
      const res = await fetch(`${API_BASE}/admin/database/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showNotification('Database snapshot saved to persistent storage!');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setDbSyncing(false);
    }
  };

  // Buyer: Confirm delivery with driver's OTP -> triggers atomic settlement & multi-channel notification
  const handleVerifyDelivery = async (shipmentId) => {
    const otp = otpInputs[shipmentId];
    if (!otp) {
      showNotification('Please enter the 6-digit Delivery OTP provided by the driver', 'error');
      return;
    }

    try {
      // Optional GPS location tag for delivery geofence audit
      let geoData = {};
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 2000, maximumAge: 60000 }));
          geoData = {
            gpsLatitude: pos.coords.latitude,
            gpsLongitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy
          };
        } catch (e) {
          // GPS optional
        }
      }

      const res = await fetch(`${API_BASE}/shipments/${shipmentId}/verify-delivery`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          otp,
          ...geoData
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      if (data.success) {
        showNotification(
          `Delivery confirmed! Escrow disbursed: $${data.settlement.farmerPayout.toFixed(2)} to Farmer, $${data.settlement.transporterPayout.toFixed(2)} to Driver. Official receipt generated.`
        );

        // Auto-open printable receipt modal
        const matchingOrder = orders.find(o => o.shipment?.id === shipmentId);
        if (matchingOrder) {
          setSelectedReceiptOrder({ ...matchingOrder, status: 'COMPLETED' });
        }

        // Trigger native Android system tray notification
        scheduleNativeNotification({
          title: 'Delivery Confirmed & Escrow Disbursed! 💰',
          body: `Produce verified. KES ${Math.round(data.settlement.farmerPayout * 130).toLocaleString()} released to farmer and KES ${Math.round(data.settlement.transporterPayout * 130).toLocaleString()} to driver.`
        });

        refreshUser();
        loadRoleData();
      } else {
        throw new Error(data.error);
      }

    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // RENDER AUTH SCREENS IF NOT LOGGED IN
  // -------------------------------------------------------------
  if (!user) {
    if (authPage === 'register') {
      return <Register onNavigateLogin={() => setAuthPage('login')} />;
    }
    if (authPage === 'admin-login') {
      return <AdminLogin onNavigateUserLogin={() => setAuthPage('login')} />;
    }
    if (authPage === 'forgot-password') {
      return <ForgotPassword onNavigateLogin={() => setAuthPage('login')} />;
    }
    return (
      <Login 
        onNavigateRegister={() => setAuthPage('register')} 
        onNavigateAdmin={() => setAuthPage('admin-login')} 
        onNavigateForgotPassword={() => setAuthPage('forgot-password')}
      />
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD VIEW
  // -------------------------------------------------------------
  const roleBadgeColors = {
    FARMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    BUYER: 'bg-blue-100 text-blue-800 border-blue-300',
    TRANSPORTER: 'bg-amber-100 text-amber-800 border-amber-300',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="min-h-screen relative text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Thematic Background: Farmers, Crops, Drivers & Buyers */}
      <DashboardBackground activeTab={activeTab} language={language} />

      {/* Header / Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-emerald-600/30 flex items-center justify-center shadow-md shadow-emerald-500/10">
                <img 
                  src="/agrishamba-logo.png" 
                  alt="AgriShamba Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }} 
                />
                <div className="w-full h-full bg-emerald-600 hidden items-center justify-center text-white">
                  <Sprout className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Agri<span className="text-emerald-600">Shamba</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enterprise SCM v2.1
                </span>
                {onReplayIntro && (
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="hidden sm:inline-flex items-center gap-1.5 ml-2.5 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    title="Watch AgriShamba intro video"
                  >
                    <Film className="w-3 h-3 text-emerald-600" />
                    <span>Watch Intro</span>
                  </button>
                )}
              </div>
            </div>

            {/* User Profile, Notifications & Logout Bar */}
            <div className="flex items-center gap-1.5 sm:gap-4">
              {/* PWA Install Button for Android / Chrome */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  title="Install AgriShamba App on your device"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{t('installMobileApp')}</span>
                </button>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationDrawer(true)}
                className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="View Live Notification Center"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Mobile Quick Wallet Pill (Compact) */}
              <button
                type="button"
                onClick={() => setShowTopUpModal(true)}
                className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-2xs"
                title="Your Escrow Wallet Balance - Tap to Top Up"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]">{formatMoney(user.walletBalance || 0)}</span>
              </button>

              {/* User Profile Pill & Trigger */}
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group text-left cursor-pointer"
                title="Click to view and edit your profile"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[120px]">
                      {user.name}
                    </span>
                    {user.isEmailVerified && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" title={t('verifiedAccount')} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${roleBadgeColors[user.role]}`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold group-hover:underline">Edit Profile</span>
                  </div>
                </div>
              </button>

              {/* Dual Financial Actions Hub: Top Up & Withdraw (Desktop) */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <div 
                  onClick={() => setShowTopUpModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-900 font-extrabold text-xs cursor-pointer hover:text-emerald-700 transition-colors"
                  title={t('walletBalance')}
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono">{formatMoney(user.walletBalance || 0)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                    title="Deposit funds via M-Pesa or Card"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>{t('topUp')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-amber-800 font-bold text-[11px] shadow-sm transition-all"
                    title="Withdraw funds to M-Pesa or Bank"
                  >
                    <ArrowUpRight className="w-3 h-3 text-amber-600" />
                    <span>{t('withdraw')}</span>
                  </button>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors shrink-0"
                title="Sign out of your session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation for Logged-In Role */}
        <div className="bg-slate-50/90 backdrop-blur-md border-t border-slate-200/80 px-2 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2 py-1.5 sm:py-2 overflow-x-auto scrollbar-none">
            {user.role === 'BUYER' && (
              <>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('b2bMarketplace')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('myOrders')}</span>
                  <span className="sm:hidden">Orders</span>
                  <span>({orders.length})</span>
                </button>
              </>
            )}

            {user.role === 'FARMER' && (
              <>
                <button
                  onClick={() => setActiveTab('farmer')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'farmer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('farmerDashboard')}</span>
                  <span className="sm:hidden">Farm</span>
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('b2bMarketplace')}</span>
                  <span className="sm:hidden">Market</span>
                  <span>({listings.length})</span>
                </button>
              </>
            )}

            {user.role === 'TRANSPORTER' && (
              <>
                <button
                  onClick={() => setActiveTab('logistics')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'logistics' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('logisticsBoard')}</span>
                  <span className="sm:hidden">Loads</span>
                  <span>({availableShipments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('b2bMarketplace')}</span>
                  <span className="sm:hidden">Market</span>
                  <span>({listings.length})</span>
                </button>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('executiveBi')}</span>
                  <span className="sm:hidden">BI</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-orders')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-orders' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-sky-300" />
                  <span>Orders Audit</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-produce')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-produce' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                  <span>Manage Produce</span>
                  <span className="text-[10px] bg-indigo-700/60 px-1.5 py-0.2 rounded-full font-mono">({listings.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-escrow')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-escrow' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                  <span>Escrow & Disputes</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-health')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-health' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                  <span>System Health</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-broadcast')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-broadcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0 text-purple-300" />
                  <span>Broadcast Hub</span>
                </button>
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'admin-users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('stakeholders')}</span>
                  <span className="sm:hidden">Users</span>
                  <span>({allUsers.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeTab === 'marketplace' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{t('b2bMarketplace')}</span>
                  <span className="sm:hidden">Market</span>
                  <span>({listings.length})</span>
                </button>
              </>
            )}

            {/* Spacer to push feature tools to the right */}
            <div className="flex-1 min-w-2" />

            {/* Mobile Smart Tools Trigger Button */}
            <button
              type="button"
              onClick={() => setShowMobileToolsSheet(true)}
              title="All AI Engines & SCM Tools"
              className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Tools</span>
            </button>


            {/* Desktop Quick-Access Feature Tool Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowFreightCalculator(true)}
                title="Instant Freight & Mileage Calculator"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-800 border border-transparent hover:border-amber-200 transition-all shrink-0"
              >
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">{t('freightQuote')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowChamaAggregation(true)}
                title="Chama / Cooperative Produce Pooling"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-800 border border-transparent hover:border-purple-200 transition-all shrink-0"
              >
                <Handshake className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">{t('chamaPool')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAlertsModal(true)}
                title="Set Price Drop & Harvest SMS / WhatsApp Alerts"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-800 border border-transparent hover:border-sky-200 transition-all shrink-0"
              >
                <Bell className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden md:inline">{t('alerts')}</span>
              </button>

              {/* Kilimo AI Autonomous Negotiator Button */}
              <button
                type="button"
                onClick={() => setShowAiNegotiation(true)}
                title="Kilimo AI Autonomous Price Discovery & Deal Maker"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-purple-50 hover:text-purple-800 border border-transparent hover:border-purple-200 transition-all shrink-0"
              >
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden lg:inline">AI Deal Maker</span>
              </button>

              {/* Sentinel-2 Satellite Crop Health Scanner Button */}
              <button
                type="button"
                onClick={() => {
                  setSatelliteCrop('Tomatoes');
                  setSatelliteLocation('Kinangop, Nyandarua County');
                  setShowSatelliteScanner(true);
                }}
                title="Sentinel-2 Satellite NDVI Crop Health & Yield Scanner"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-800 border border-transparent hover:border-teal-200 transition-all shrink-0"
              >
                <Radio className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden lg:inline">Satellite NDVI</span>
              </button>

              {/* Kilimo AI Crop Disease & Pest Doctor Button */}
              <button
                type="button"
                onClick={() => setShowCropDoctor(true)}
                title="Kilimo AI Crop Disease & Pest Doctor Scanner"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all shrink-0 shadow-xs"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">AI Crop Doctor</span>
              </button>

              {/* Kilimo Vision AI Crop Disease & Export Grade Scanner */}
              <button
                type="button"
                onClick={() => setShowKilimoVision(true)}
                title="Kilimo Vision: Multimodal AI Crop Disease & Export Grade Scanner"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 transition-all shrink-0 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span className="hidden sm:inline">Kilimo Vision</span>
              </button>

              {/* Rural USSD Gateway Simulator (*384*50#) Button */}
              <button
                type="button"
                onClick={() => setShowUssdModal(true)}
                title="Rural Feature Phone USSD Gateway (*384*50#)"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-800 border border-transparent hover:border-amber-200 transition-all shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">*384*50#</span>
              </button>

              {/* Rural Offline Sync & SMS Hub Button */}
              <button
                type="button"
                onClick={() => setShowOfflineModal(true)}
                title={isOnline ? 'Rural Offline Hub: Synchronized' : 'Offline Mode: Tap to view cached data & SMS fallback'}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                  !isOnline 
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : pendingSyncQueue.length > 0 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'text-slate-600 hover:bg-slate-100 border-transparent'
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span className="hidden xl:inline">
                  {isOnline ? 'Offline Hub' : 'Offline Mode'}
                </span>
                {pendingSyncQueue.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full leading-none">
                    {pendingSyncQueue.length}
                  </span>
                )}
              </button>
            </div>


            {/* Bilingual EN/SWA Language Switcher & KES/USD Currency Switcher */}
            <div className="ml-1 pl-2 border-l border-slate-200 flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              <CurrencyUnitBar />
            </div>
          </div>
        </div>
      </header>


      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Persistent Rural Offline Mode Warning Strip */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-2 z-20 sticky top-16">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
            <span>
              <strong>Rural Offline Mode:</strong> No data connection. You can still list crops and view cached shamba records!
            </span>
          </div>
          <button
            onClick={() => setShowOfflineModal(true)}
            className="px-2.5 py-1 bg-white text-amber-900 rounded-lg font-extrabold hover:bg-amber-50 text-[11px] shrink-0 shadow-xs"
          >
            Open Offline Hub / SMS Fallback
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border ${
            notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs font-medium">{notification.msg}</div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ROLE-SPECIFIC CONTENT VIEWS                               */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">

        {/* ======================================================== */}
        {/* ADMIN ROLE GUARD: Block non-admins from admin-only views  */}
        {/* ======================================================== */}
        {(activeTab === 'analytics' || activeTab === 'admin-users' || activeTab === 'admin-orders' || activeTab === 'admin-produce' || activeTab === 'admin-escrow' || activeTab === 'admin-health' || activeTab === 'admin-broadcast') && user.role !== 'ADMIN' && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-rose-100 border-2 border-rose-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h2>
              <p className="text-sm text-slate-500 mb-6">
                The Administration Panel is only accessible to <strong>AgriShamba System Administrators</strong>. You do not have permission to view this section.
              </p>
              <button
                onClick={() => {
                  if (user.role === 'BUYER') setActiveTab('marketplace');
                  else if (user.role === 'FARMER') setActiveTab('farmer');
                  else if (user.role === 'TRANSPORTER') setActiveTab('logistics');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
              >
                ← Back to My Dashboard
              </button>
            </div>
          </div>
        )}

        {/* B2B MARKETPLACE VIEW */}
        {activeTab === 'marketplace' && (
          <div>
            {/* Live Kenya Wholesale Price Index & Market Ticker */}
            <CommodityPriceTicker />

            {/* Kilimo Smart Agro-Climate & Harvest Advisory */}
            <KilimoWeatherAdvisory />

            {/* Marketplace Sub-Navigation: Farm Harvest Listings vs. Buyer Demand Board */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto self-start border border-slate-200">
              <button
                onClick={() => setMarketplaceSubTab('listings')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                  marketplaceSubTab === 'listings'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sprout className="w-4 h-4 shrink-0" />
                <span className="truncate">Harvest Listings</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold shrink-0">
                  {listings.length}
                </span>
              </button>

              <button
                onClick={() => setMarketplaceSubTab('demands')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                  marketplaceSubTab === 'demands'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">Buyer Tenders</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black shrink-0">
                  WANTED
                </span>
              </button>
            </div>

            {marketplaceSubTab === 'demands' ? (
              <BuyerDemandBoard 
                user={user} 
                token={token} 
                apiBase={API_BASE} 
                formatMoney={formatMoney} 
                currency={currency} 
              />
            ) : (
              <>
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-4 sm:p-8 mb-4 sm:mb-6 shadow-lg relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('escrowBadge')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                    <Truck className="w-3.5 h-3.5" /> {transporterCount} {t('corridorTransporters')}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                  {t('marketplaceHeader')}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  {t('marketplaceSubheader')}
                </p>
              </div>
            </div>

            {/* Glassmorphic Category & Filter Bar */}
            <div className="glass-panel-climate rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center shadow-xs">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={t('searchProducePlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-xs border border-white/90 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 shadow-2xs"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { key: 'ALL', label: t('allCategories') },
                  { key: 'HORTICULTURE', label: `🥬 ${t('horticulture')}` },
                  { key: 'CEREAL', label: `🌾 ${t('cereal')}` },
                  { key: 'TUBER', label: `🥔 ${t('tuber')}` },
                  { key: 'DAIRY', label: `🥛 ${t('dairy')}` },
                  { key: 'LIVESTOCK', label: `🐄 ${t('livestock')}` },
                  { key: 'POULTRY', label: `🐔 ${t('poultry')}` },
                  { key: 'FODDER_FEEDS', label: `🌿 ${t('fodderFeeds')}` }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap backdrop-blur-xs ${
                      selectedCategory === cat.key 
                        ? 'bg-slate-900 text-white shadow-sm border border-slate-700' 
                        : 'bg-white/60 text-slate-700 hover:bg-white/90 border border-white/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
                <button onClick={loadRoleData} className="p-2 rounded-xl text-slate-600 hover:bg-white/90 border border-white/80 bg-white/60 transition-colors backdrop-blur-xs" title="Refresh Listings">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Produce Grid with High-End Glassmorphism Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div 
                  key={item.id} 
                  className="glass-card-product rounded-2xl overflow-hidden flex flex-col group relative"
                >
                  {/* Card Visual Hero with Gradient Frost & Zoom */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.cropName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop';
                      }}
                    />
                    {/* Atmospheric Bottom Dark Gradient on image for smooth transition */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-black/20 pointer-events-none" />

                    {/* Frosted Glass Floating Badges */}
                    <span className="absolute top-3 left-3 glass-pill-badge px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      {item.category}
                    </span>
                    <span className="absolute top-3 right-3 glass-pill-emerald px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
                      {(item.grade || 'GRADE_A').replace('_', ' ')}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative">
                    <div>
                      {/* Title & Price Row - Full crop name visibility, no clipping */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                            {item.cropName}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.location}</span>
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="text-right shrink-0">
                          <p className="text-base font-extrabold text-emerald-600 leading-tight">
                            {currency === 'KES' ? (
                              <>
                                <span>KES {Math.round(item.unitPrice * 130).toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 font-normal"> / {item.unit || 'kg'}</span>
                              </>
                            ) : (
                              <>
                                <span>${item.unitPrice.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-normal"> / {item.unit || 'kg'}</span>
                              </>
                            )}
                          </p>
                          {currency === 'KES' && (
                            <span className="text-[10px] text-slate-400 block">
                              ${item.unitPrice.toFixed(2)} / {item.unit || 'kg'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── COLLAPSIBLE DETAILS (hidden by default, revealed on "View Details") ── */}
                      {expandedCards.has(item.id) && (
                        <div className="mt-3 space-y-1 text-xs text-slate-600 bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-white/80 shadow-2xs animate-fade-in">
                          <p className="flex items-center gap-1.5">
                            <Sprout className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('producer')}: <strong>{item.farmer?.name}</strong></span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('harvestDate')}: {new Date(item.harvestDate).toLocaleDateString()}</span>
                          </p>
                          {/* Live Drivers Available indicator */}
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <Truck className="w-3.5 h-3.5 text-emerald-600" />
                              {transporterCount} {t('activeDriversReady')}
                            </span>
                          </div>

                          {/* Expanded-only tool buttons row */}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 mt-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-auto">Quick Tools</span>
                            {/* Set Price Alert */}
                            <button
                              type="button"
                              onClick={() => { setAlertsDefaultCrop(item.cropName); setShowAlertsModal(true); }}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition-colors"
                              title={`Set alert for ${item.cropName}`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                            {/* Freight Quote */}
                            <button
                              type="button"
                              onClick={() => { setFreightOrigin(item.location || ''); setShowFreightCalculator(true); }}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors"
                              title="Calculate transport cost"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                            {/* Satellite Scan */}
                            <button
                              type="button"
                              onClick={() => { setSatelliteCrop(item.cropName || 'Tomatoes'); setSatelliteLocation(item.location || 'Kinangop, Nyandarua County'); setShowSatelliteScanner(true); }}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 transition-colors"
                              title="Verify Farm with Satellite"
                            >
                              <Radio className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Section */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/70">
                      {/* Row 1: Available Volume + "View Details" toggle */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('availableVolume')}</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">
                            {item.availableQty.toLocaleString()} {item.unit || 'kg'}
                          </span>
                        </div>

                        {/* View Details Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleCardExpand(item.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {expandedCards.has(item.id) ? (
                            <><ChevronUp className="w-3.5 h-3.5" /> Hide Details</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5" /> View Details</>
                          )}
                        </button>
                      </div>

                      {/* Row 2: 2-Column Primary Commerce Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Make Offer Button */}
                        <button
                          type="button"
                          onClick={() => setNegotiatingListing(item)}
                          className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors shadow-2xs"
                          title="Propose bulk wholesale discount to farmer"
                        >
                          <Handshake className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t('makeOffer')}</span>
                        </button>

                        {/* Escrow Order Button */}
                        <button
                          onClick={() => {
                            setOrderModalListing(item);
                            setOrderQty(Math.min(200, item.availableQty));
                            setOrderPaymentStep('form');
                            setOrderPaymentDetails(null);
                            setOrderPinInput('');
                            if (user?.phone && !user.phone.startsWith('+254000') && !user.phone.startsWith('google_')) {
                              setPaymentPhone(user.phone);
                            }
                          }}
                          className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t('orderWithEscrow')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )}

        {/* BUYER VIEW: ESCROW ORDERS & OTP VERIFICATION */}
        {user.role === 'BUYER' && activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('ordersTitle')}</h2>
                <p className="text-xs text-slate-500 mt-1">{t('ordersSub')}</p>
              </div>
              <button onClick={loadRoleData} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center bg-white rounded-xl border">{t('noOrdersYet')}</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const item = order.items?.[0];
                  const isCompleted = order.status === 'COMPLETED';
                  const shipment = order.shipment;

                  return (
                    <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100">{order.orderNumber}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{item?.cropName} ({item?.quantity} kg)</h4>
                        <p className="text-xs text-slate-500">Destination: {order.deliveryAddress}</p>
                        <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> {t('escrowDeposit')}: {formatMoney(order.grandTotal || 0)} ({order.escrowTransaction?.paymentGateway})
                        </p>
                      </div>

                      {/* Delivery Verification Sign-off & Receipt Action */}
                      <div className="w-full lg:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        {isCompleted ? (
                          <div className="space-y-2">
                            <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('deliveryConfirmed')}
                            </div>
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" /> {t('viewSettlementReceipt')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoiceModalOrder(order)}
                              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Print Tax Invoice & Waybill</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppAlert(order)}
                              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <span>📲 Send WhatsApp Receipt</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProducePassportOrder(order)}
                              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 font-bold hover:bg-amber-100 transition-colors"
                            >
                              <span>🏷️ Produce Passport / QR</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="font-bold text-slate-800 block">{t('confirmDeliveryPrompt')}</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength="6"
                                placeholder="6-digit OTP"
                                value={otpInputs[shipment?.id] || ''}
                                onChange={(e) => setOtpInputs({ ...otpInputs, [shipment?.id]: e.target.value })}
                                className="w-28 px-2 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-center text-xs tracking-wider"
                              />
                              <button
                                onClick={() => handleVerifyDelivery(shipment?.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded transition-colors"
                              >
                                {t('releaseEscrowButton')}
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] pt-1">
                              <span className="text-slate-400 italic">Driver OTP: <strong>{shipment?.confirmationOtp}</strong></span>
                              <button
                                type="button"
                                onClick={() => setDisputingOrder(order)}
                                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-0.5"
                                title="Report damaged or substandard produce to hold escrow"
                              >
                                <ShieldAlert className="w-3 h-3" />
                                <span>{t('reportQualityIssue')}</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setInvoiceModalOrder(order)}
                              className="w-full mt-1.5 py-1.5 px-3 bg-slate-900 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Print Tax Invoice & Waybill</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppAlert(order)}
                              className="w-full mt-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <span>📲 WhatsApp OTP & Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setTrackingMapOrder(order)}
                              className="w-full mt-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Live GPS Tracking Map</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProducePassportOrder(order)}
                              className="w-full mt-1.5 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>🏷️ Produce Passport / QR Code</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceChatOrder(order)}
                              className="w-full mt-1.5 py-1.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg text-teal-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                              title="Send instant Swahili/English voice notes to trade partner"
                            >
                              <Mic className="w-3.5 h-3.5 text-teal-600" />
                              <span>🎙️ Voice Chat Room (Swahili / Sheng)</span>
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FARMER VIEW: HARVEST PORTAL */}
        {user.role === 'FARMER' && activeTab === 'farmer' && (
          <div className="space-y-6">
            {/* Live Commodity Wholesale Index & Agro-Climate Advisory */}
            <CommodityPriceTicker />
            <KilimoWeatherAdvisory />

            {/* AI Crop Doctor & Agronomy Diagnostic Hub Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Kilimo AI Crop Doctor & Pest Diagnosis
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Camera AI
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Snap or upload leaf photos to diagnose tomato late blight, fall armyworm, bacterial wilt & get local Kenya agrovet prescriptions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAiPricePredictor(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4 text-slate-950" />
                  <span>AI Price Forecast</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCropDoctor(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Diagnose Crop Now</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Produce Form with Image Selector */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2 pb-2 border-b">
                <PlusCircle className="w-4 h-4 text-emerald-600" /> {t('listHarvestTitle')}
              </h3>
              <form onSubmit={handleCreateListing} className="space-y-3 text-xs font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">{t('cropNameLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Bulb Onions"
                    value={newListing.cropName}
                    onChange={(e) => setNewListing({ ...newListing, cropName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block mb-1">{t('categoryLabel')}</label>
                    <select
                      value={newListing.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        let defUnit = newListing.unit;
                        if (cat === 'DAIRY') defUnit = 'litres';
                        else if (cat === 'LIVESTOCK') defUnit = 'heads';
                        else if (cat === 'POULTRY') defUnit = 'birds';
                        else if (cat === 'FODDER_FEEDS') defUnit = 'bales';
                        else if (cat === 'CEREAL') defUnit = 'bags';
                        else defUnit = 'kg';
                        setNewListing({ ...newListing, category: cat, unit: defUnit });
                      }}
                      className="w-full px-2 py-2 bg-slate-50 border rounded-lg text-xs"
                    >
                      <option value="HORTICULTURE">🥬 {t('horticulture')}</option>
                      <option value="CEREAL">🌾 {t('cereal')}</option>
                      <option value="TUBER">🥔 {t('tuber')}</option>
                      <option value="DAIRY">🥛 {t('dairy')}</option>
                      <option value="LIVESTOCK">🐄 {t('livestock')}</option>
                      <option value="POULTRY">🐔 {t('poultry')}</option>
                      <option value="FODDER_FEEDS">🌿 {t('fodderFeeds')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Trading Unit</label>
                    <select
                      value={newListing.unit || 'kg'}
                      onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border rounded-lg text-xs font-semibold"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="litres">Litres (L)</option>
                      <option value="heads">Heads / Animals</option>
                      <option value="trays">Trays (30 pcs)</option>
                      <option value="birds">Birds / Chickens</option>
                      <option value="bales">Bales (Hay)</option>
                      <option value="bags">Bags (50kg/90kg)</option>
                      <option value="tons">Tons</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">{t('gradeLabel')}</label>
                    <select
                      value={newListing.grade}
                      onChange={(e) => setNewListing({ ...newListing, grade: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border rounded-lg text-xs"
                    >
                      <option value="GRADE_A">Grade A (Premium / Export)</option>
                      <option value="GRADE_B">Grade B (Standard Commercial)</option>
                      <option value="STANDARD">Standard</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Available Quantity ({newListing.unit || 'kg'})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 500"
                      value={newListing.availableQty}
                      onChange={(e) => setNewListing({ ...newListing, availableQty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{t('unitPriceLabel')} ({currency === 'KES' ? `KES / ${newListing.unit || 'kg'}` : `$ / ${newListing.unit || 'kg'}`})</label>
                    <input
                      type="number"
                      step={currency === 'KES' ? '1' : '0.01'}
                      required
                      placeholder={currency === 'KES' ? 'e.g. 95' : 'e.g. 0.75'}
                      value={newListing.unitPrice}
                      onChange={(e) => setNewListing({ ...newListing, unitPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">{t('farmLocationLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Limuru, Kiambu"
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">{t('harvestDate')}</label>
                  <input
                    type="date"
                    required
                    value={newListing.harvestDate}
                    onChange={(e) => setNewListing({ ...newListing, harvestDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>

                {/* Produce Image Option with URL & Presets Picker */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block">{t('producePhotoLabel')}</label>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Select Photo Preset
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image link or pick preset"
                      value={newListing.imageUrl || ''}
                      onChange={(e) => setNewListing({ ...newListing, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border rounded-lg text-xs font-bold text-slate-700 shrink-0"
                    >
                      Gallery
                    </button>
                  </div>
                  {newListing.imageUrl && (
                    <div className="mt-2 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                      <img src={newListing.imageUrl} alt="Crop Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        Active Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Agronomy Profit Calculator Quick Launch */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">💡 {t('pricingTipTitle')}</p>
                    <p className="text-[11px] text-emerald-700">{t('pricingTipSubtitle')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfitCalculator(true)}
                    className="ml-2 shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{t('calculateButton')}</span>
                  </button>
                </div>

                {/* Satellite Shamba Remote Sensing Health Audit */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-teal-900">🛰️ Satellite Crop Health & Yield Audit</p>
                    <p className="text-[11px] text-teal-700">Scan field with Sentinel-2 radar to get Space Verified badge</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSatelliteCrop(newListing.cropName || 'Tomatoes');
                      setSatelliteLocation(newListing.location || 'Kinangop, Nyandarua County');
                      setShowSatelliteScanner(true);
                    }}
                    className="ml-2 shrink-0 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Scan Shamba</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs mt-2 transition-colors"
                >
                  {t('publishToCatalog')}
                </button>

              </form>
            </div>

              {/* Farmer Inventory & Wallet */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
                <div>
                  <span className="text-xs text-emerald-200 font-semibold">{t('farmerWalletTitle')}</span>
                  <h2 className="text-3xl font-black mt-1 font-mono">{formatMoney(user.walletBalance || 0)}</h2>
                  <p className="text-[10px] text-emerald-200/80 mt-1">{t('directMpesaPayout')}: {user.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-white text-emerald-900 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md hover:bg-emerald-50 flex items-center gap-1.5 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    <span>{t('withdraw')}</span>
                  </button>
                </div>
              </div>

              {/* Listings Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-slate-900">{t('myInventoryTitle')} ({farmerListings.length})</h3>
                  <span className="text-[10px] text-slate-400">Published to B2B Wholesale Market</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-y uppercase text-slate-400 text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">{t('cropNameLabel')}</th>
                        <th className="py-2.5 px-3">{t('gradeLabel')}</th>
                        <th className="py-2.5 px-3">{t('availableVolume')}</th>
                        <th className="py-2.5 px-3">{t('wholesaleRate')}</th>
                        <th className="py-2.5 px-3">{t('marketStatus')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {farmerListings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400">
                            {t('noHarvestsListed')}
                          </td>
                        </tr>
                      ) : (
                        farmerListings.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                              <img src={l.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200" />
                              <span className="font-bold text-slate-900">{l.cropName}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {l.grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{l.availableQty.toLocaleString()} kg</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600 font-mono">
                              {formatMoney(l.unitPrice)} / kg
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* TRANSPORTER VIEW: LOGISTICS BOARD */}
        {user.role === 'TRANSPORTER' && activeTab === 'logistics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('freightDispatcherTitle')}</h2>
                <p className="text-xs text-slate-500 mt-1">{t('freightDispatcherSub')}</p>
              </div>

              {/* Transporter Wallet Balance */}
              <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-xl shadow-inner">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">{t('freightEarnings')}</span>
                  <span className="text-lg font-black font-mono">{formatMoney(user.walletBalance || 0)}</span>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t('withdraw')}</span>
                </button>
              </div>
            </div>

            {/* Live Geographic Freight Map (Real Buyer Transportation Orders & OpenStreetMap) */}
            <DriverLiveMap 
              activeOrders={orders.filter(o => o.shipment?.transporterId === user.id)}
              availableShipments={availableShipments}
              onAcceptShipment={handleAcceptShipment}
              onUpdateTransitStatus={handleUpdateTransitStatus}
              user={user}
            />

            {/* Available Jobs */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">{t('availableFreightJobs')}</h3>
              {availableShipments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">{t('noCargoAwaiting')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableShipments.map((shipment) => (
                    <div key={shipment.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="font-bold">{shipment.order?.orderNumber}</span>
                          <span className="text-emerald-700 font-extrabold">Freight: {formatMoney(shipment.order?.transportFee || 0)}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <p><strong>{t('cargoLabel')}:</strong> {shipment.order?.items[0]?.cropName} ({shipment.order?.items[0]?.quantity} kg)</p>
                          <p><strong>{t('pickupLabel')}:</strong> {shipment.pickupLocation}</p>
                          <p><strong>{t('dropoffLabel')}:</strong> {shipment.dropoffLocation}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptShipment(shipment.id)}
                        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
                      >
                        {t('claimCargo')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Active Shipments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">{t('myInTransitShipments')}</h3>
              <div className="space-y-3">
                {orders.filter(o => o.shipment?.transporterId === user.id).map((order) => {
                  const s = order.shipment;
                  return (
                    <div key={order.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{order.items[0]?.cropName} ({order.items[0]?.quantity} kg)</span>
                        <p className="text-slate-500">Route: {s?.pickupLocation} → {s?.dropoffLocation}</p>
                        <p className="font-mono text-emerald-700 font-bold text-sm mt-1">
                          {t('deliveryOtpNotice')}: {s?.confirmationOtp}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'PICKED_UP')}
                          disabled={s.transitStatus !== 'ASSIGNED'}
                          className="px-3 py-1.5 rounded font-bold bg-amber-500 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {t('markPickedUp')}
                        </button>
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'IN_TRANSIT')}
                          disabled={s.transitStatus !== 'PICKED_UP'}
                          className="px-3 py-1.5 rounded font-bold bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {t('markInTransit')}
                        </button>
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'ARRIVED')}
                          disabled={s.transitStatus !== 'IN_TRANSIT'}
                          className="px-3 py-1.5 rounded font-bold bg-emerald-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {t('markArrived')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-3 py-1.5 rounded font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-2xs"
                          title="Open official Transporter Consignment Waybill & Gate Pass"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Waybill</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW: BI ANALYTICS & REGISTERED USERS MANAGEMENT */}
        {user.role === 'ADMIN' && activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase">Administrator Operations Console</span>
                <h2 className="text-2xl font-black mt-1">Executive KPIs & Platform Monetization</h2>
                <p className="text-xs text-slate-400 mt-1">System Administrator: {user.name} ({user.email})</p>
              </div>
              <button onClick={loadRoleData} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Live KPIs
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Merchandise Value (GMV)</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  KES {(analytics.grossMerchandiseValueKes || Math.round((analytics.grossMerchandiseValue || 0) * 130)).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">${(analytics.grossMerchandiseValue || 0).toFixed(2)} USD</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Escrow Holdings</span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  KES {(analytics.activeEscrowHeldKes || Math.round((analytics.activeEscrowHeld || 0) * 130)).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">${(analytics.activeEscrowHeld || 0).toFixed(2)} USD</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Commissions (5%)</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  KES {(analytics.platformCommissionEarnedKes || Math.round((analytics.platformCommissionEarned || 0) * 130)).toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">${(analytics.platformCommissionEarned || 0).toFixed(2)} USD</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Food Dispatched</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{analytics.totalTonnage || 0} Tonnes</p>
                <span className="text-[11px] text-slate-400">{analytics.completedOrders || 0} Delivered Orders</span>
              </div>
            </div>

            {/* Operational Velocity & 7-Day Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Active Cargoes In Transit</span>
                <p className="text-3xl font-black text-indigo-600">{analytics.activeInTransit || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Vehicles currently hauling across corridor highways</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Escrow Resolution Rate</span>
                <p className="text-3xl font-black text-emerald-600">
                  {analytics.totalOrders ? Math.round(((analytics.completedOrders || 0) / analytics.totalOrders) * 100) : 100}%
                </p>
                <p className="text-xs text-slate-500 mt-1">{analytics.disputedOrders || 0} active disputes under arbitration</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weekly Trading Cadence</span>
                <div className="flex items-end gap-1.5 h-10 mt-2">
                  {(analytics.sevenDayTrends || []).map((t, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-emerald-500/80 hover:bg-emerald-600 rounded-t transition-all"
                        style={{ height: `${Math.max(20, Math.round((t.gmvKes / (analytics.grossMerchandiseValueKes || 1)) * 300))}%` }}
                        title={`${t.day}: KES ${t.gmvKes.toLocaleString()}`}
                      />
                      <span className="text-[9px] text-slate-400 font-bold">{t.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW: REGISTERED USERS DATABASE TABLE */}
        {user.role === 'ADMIN' && activeTab === 'admin-users' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {/* Database Studio & Persistence Hub Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-700/40 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">Database Management & Auto-Persistence</h4>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto-Sync Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Edits made in this table are instantly saved to MongoDB Atlas (<code className="text-indigo-300 font-mono">Cluster0 Cloud</code>) and mirrored in real-time.
                    </p>
                  </div>
                </div>

                {/* Database Backup & Restore Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={handleExportDatabase}
                    disabled={dbSyncing}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    title="Download complete database snapshot JSON to your computer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup</span>
                  </button>

                  <label className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Restore Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      disabled={dbSyncing}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleSyncDatabase}
                    disabled={dbSyncing}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    title="Force immediate persistent snapshot save"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dbSyncing ? 'animate-spin' : ''}`} />
                    <span>{dbSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-400">
                <span>
                  💡 <strong>MongoDB Atlas Cloud:</strong> Live documents are synchronized across the 3-node replica set in AWS.
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-300 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    M-Pesa Daraja: Paybill 174379 (Live Webhook Active)
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-300">
                    MongoDB: Cluster0
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registered Ecosystem Stakeholders in MongoDB Atlas</h3>
                <p className="text-xs text-slate-500">Live directory of Farmers, Commercial Buyers, Transporters, and Admins. Click "Edit" to modify any record directly.</p>
              </div>
              <button onClick={loadRoleData} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Users
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 border-y">
                  <tr>
                    <th className="py-2.5 px-3">Name / Business</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Phone (M-Pesa)</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Email Verified</th>
                    <th className="py-2.5 px-3">Wallet</th>
                    <th className="py-2.5 px-3 text-right">Database Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.businessName || 'Individual'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeColors[u.role]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{u.phone}</td>
                      <td className="py-3 px-3 text-slate-600">{u.email}</td>
                      <td className="py-3 px-3">
                        {u.isEmailVerified ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">VERIFIED</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">UNVERIFIED</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700">
                        ${(u.walletBalance || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 border border-indigo-200 transition-colors"
                            title="Edit stakeholder data in database"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] flex items-center gap-1 border border-rose-200 transition-colors"
                              title="Delete user from database"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN VIEW: ESCROW DISPUTE & FINANCIAL LEDGER */}
        {user.role === 'ADMIN' && activeTab === 'admin-escrow' && (
          <AdminEscrowDisputes token={token} apiBase={API_BASE} formatMoney={formatMoney} />
        )}

        {/* ADMIN VIEW: MONGODB ATLAS & DARAJA SYSTEM HEALTH MONITOR */}
        {user.role === 'ADMIN' && activeTab === 'admin-health' && (
          <AdminSystemHealth token={token} apiBase={API_BASE} />
        )}

        {/* ADMIN VIEW: PLATFORM BROADCAST & ALERT ENGINE */}
        {user.role === 'ADMIN' && activeTab === 'admin-broadcast' && (
          <AdminBroadcastModal token={token} apiBase={API_BASE} allUsers={allUsers} />
        )}

        {/* ADMIN VIEW: ORDERS AUDIT & MANAGEMENT */}
        {user.role === 'ADMIN' && activeTab === 'admin-orders' && (
          <AdminOrdersManagement token={token} apiBase={API_BASE} formatMoney={formatMoney} />
        )}

        {/* ADMIN VIEW: HARVEST PRODUCE & DELETE MANAGEMENT */}
        {user.role === 'ADMIN' && activeTab === 'admin-produce' && (
          <AdminProduceManagement 
            token={token} 
            apiBase={API_BASE} 
            onProduceUpdated={loadRoleData} 
          />
        )}
      </main>

      {/* ========================================================= */}
      {/* REAL M-PESA CHECKOUT MODAL                                */}
      {/* ========================================================= */}
      {orderModalListing && (() => {
        const produceCost = orderQty * orderModalListing.unitPrice;
        const freightCost = 20.00 + (orderQty * 0.02);
        const escrowFee = produceCost * 0.05;
        const grandTotal = produceCost + freightCost + escrowFee;
        const amountInKes = Math.round(grandTotal * 130);
        const hasEnoughBalance = (user?.walletBalance || 0) >= grandTotal;
        const walletShortfall = Math.max(0, grandTotal - (user?.walletBalance || 0));

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase">
                    {orderPaymentStep === 'awaiting_pin' 
                      ? 'Authorize M-Pesa Payment' 
                      : orderPaymentStep === 'success' 
                        ? 'Payment Verified & Escrow Locked' 
                        : t('purchaseOrderModalTitle')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{orderModalListing.cropName}</h3>
                  <p className="text-xs text-slate-500">{t('producer')}: {orderModalListing.farmer?.name}</p>
                </div>
                <button onClick={handleCloseOrderModal} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
              </div>

              {/* STEP 1: ORDER CONFIGURATION & PAYMENT METHOD SELECTION */}
              {orderPaymentStep === 'form' && (
                <div className="py-4 space-y-3.5 text-xs font-semibold text-slate-700">
                  {/* Transporter Availability Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                    <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">{transporterCount} {t('activeDriversReady')}</p>
                      <p className="text-[11px] text-emerald-700">Immediate pickup upon escrow lock. Fast cold-chain & freight dispatch.</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block mb-1">Order Volume ({orderModalListing.unit || 'kg'})</label>
                    <input
                      type="number"
                      min="1"
                      max={orderModalListing.availableQty}
                      value={orderQty}
                      onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 font-bold"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block mb-1">{t('destinationAddress')}</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  {/* PAYMENT METHOD SELECTION TABS */}
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Select How You Want to Pay:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('MPESA_STK')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          paymentGateway === 'MPESA_STK'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Smartphone className={`w-4 h-4 ${paymentGateway === 'MPESA_STK' ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-xs">Lipa Na M-Pesa</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal mt-1">Direct STK push to phone</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('WALLET')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          paymentGateway === 'WALLET'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className={`w-4 h-4 ${paymentGateway === 'WALLET' ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-xs">Wallet Balance</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal mt-1 font-mono">{formatMoney(user?.walletBalance || 0)}</span>
                      </button>
                    </div>
                  </div>

                  {/* OPTION A: M-PESA PHONE INPUT */}
                  {paymentGateway === 'MPESA_STK' && (
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{t('mpesaPhonePrompt')}</span>
                        <span className="text-[10px] text-emerald-600 font-mono">Safaricom SIM</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          placeholder="07XXXXXXXX or 254..."
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        📲 When you click confirm, an interactive M-Pesa prompt will appear on your phone screen to enter your PIN.
                      </p>
                    </div>
                  )}

                  {/* OPTION B: WALLET BALANCE DETAILS & INSUFFICIENT NOTICE */}
                  {paymentGateway === 'WALLET' && (
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-600">Available Wallet Balance:</span>
                        <span className="font-mono font-extrabold text-slate-900">
                          {formatMoney(user?.walletBalance || 0)} (KES {Math.round((user?.walletBalance || 0) * 130).toLocaleString()})
                        </span>
                      </div>

                      {!hasEnoughBalance && (
                        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Insufficient Wallet Balance for this Order</span>
                          </div>
                          <p className="text-[11px] text-rose-700 leading-relaxed">
                            You have <strong>{formatMoney(user?.walletBalance || 0)}</strong>, but this order requires <strong>{formatMoney(grandTotal)}</strong>. You are short by <strong className="font-mono">{formatMoney(walletShortfall)}</strong> (KES {Math.round(walletShortfall * 130).toLocaleString()}).
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setPaymentGateway('MPESA_STK')}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Pay via Lipa Na M-Pesa Instead
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderModalListing(null);
                                setShowTopUpModal(true);
                              }}
                              className="flex-1 py-1.5 px-2 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              Top Up Wallet via M-Pesa
                            </button>
                          </div>
                        </div>
                      )}

                      {hasEnoughBalance && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>✓ Sufficient balance. Funds will be deducted and held securely in escrow.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Breakdown */}
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 font-normal">
                      <span>{t('produceCost')} ({orderQty} {orderModalListing.unit || 'kg'} @ {formatMoney(orderModalListing.unitPrice)}):</span>
                      <span>{formatMoney(produceCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-normal">
                      <span>{t('freightLogisticsEst')}:</span>
                      <span>{formatMoney(freightCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-normal">
                      <span>{t('escrowFee')}:</span>
                      <span>{formatMoney(escrowFee)}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between text-sm font-extrabold text-slate-900">
                      <span>{t('totalEscrowLock')}:</span>
                      <div className="text-right">
                        <span className="text-emerald-700 font-mono block">{formatMoney(grandTotal)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">KES {amountInKes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseOrderModal}
                      className="flex-1 px-4 py-2.5 rounded-lg border text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={paymentProcessing || (paymentGateway === 'WALLET' && !hasEnoughBalance)}
                      onClick={handleCreateOrder}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Escrow...
                        </>
                      ) : paymentGateway === 'WALLET' && !hasEnoughBalance ? (
                        <span>Insufficient Wallet Balance</span>
                      ) : paymentGateway === 'WALLET' ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Lock Escrow from Wallet
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Pay via M-Pesa (KES {amountInKes.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ON-SCREEN M-PESA STK PIN AUTHORIZATION PROMPT */}
              {orderPaymentStep === 'awaiting_pin' && (
                <div className="py-6 space-y-4 text-center animate-in zoom-in-95">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                    <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 relative z-10">
                      <Smartphone className="w-8 h-8 animate-bounce" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">M-Pesa STK Push Sent!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Check your phone <strong className="text-slate-800 font-mono">{orderPaymentDetails?.phone}</strong> for the Safaricom STK prompt:
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl max-w-xs mx-auto text-center space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Escrow Amount</span>
                    <p className="text-xl font-black text-emerald-700 font-mono">
                      KES {orderPaymentDetails?.amountInKes?.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold font-mono">
                      {formatMoney(orderPaymentDetails?.grandTotal || 0)}
                    </p>
                    <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 flex justify-between">
                      <span>Paybill: <strong>174379</strong></span>
                      <span>Account: <strong>ORD-{(orderPaymentDetails?.order?.orderNumber || 'AgriShamba').slice(-6)}</strong></span>
                    </div>
                  </div>

                  {/* On-Screen PIN Input for Immediate Authorization */}
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl max-w-xs mx-auto text-center space-y-2.5">
                    <label className="block text-[11px] font-bold text-emerald-950">
                      Enter M-Pesa PIN on Phone (or authorize below):
                    </label>
                    <div className="relative max-w-[160px] mx-auto">
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="• • • •"
                        value={orderPinInput}
                        onChange={(e) => setOrderPinInput(e.target.value)}
                        className="w-full text-center py-2 px-3 bg-white border border-emerald-300 rounded-xl text-lg font-mono font-black tracking-widest text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirmOrderPin}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm PIN & Lock Escrow</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Awaiting Safaricom confirmation...</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setOrderPaymentStep('form')}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
                    >
                      Back to Order Details
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT CONFIRMED & ESCROW LOCKED SUCCESS SCREEN */}
              {orderPaymentStep === 'success' && (
                <div className="py-6 space-y-4 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">Payment Verified & Escrow Locked!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Your funds are held securely in AgriShamba Smart Escrow. The farmer and transporter have been notified for harvest collection.
                    </p>
                  </div>

                  {/* Delivery Inspection OTP Box */}
                  <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl max-w-xs mx-auto text-center space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">Delivery Inspection OTP</span>
                    <p className="text-3xl font-black text-emerald-950 font-mono tracking-widest py-1">
                      {orderPaymentDetails?.confirmationOtp || '----'}
                    </p>
                    <p className="text-[10px] text-emerald-800 leading-snug">
                      Keep this code safe. Give it to the driver <strong>ONLY after inspecting and accepting</strong> the produce upon delivery.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 max-w-xs mx-auto space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order Number:</span>
                      <span className="font-mono font-bold text-slate-800">{orderPaymentDetails?.order?.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Secured:</span>
                      <span className="font-mono font-bold text-emerald-700">{formatMoney(orderPaymentDetails?.grandTotal || 0)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseOrderModal();
                        setActiveTab('orders');
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                    >
                      View in Orders Tab
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseOrderModal}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* EDIT STAKEHOLDER DATABASE RECORD MODAL                   */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> MongoDB Atlas Direct Record Editor
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Edit Stakeholder Record</h3>
                <p className="text-xs text-slate-500 font-mono">User ID: {editingUser.id}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-bold text-slate-700">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Phone (M-Pesa)</label>
                  <input
                    type="text"
                    required
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Ecosystem Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="FARMER">FARMER</option>
                    <option value="BUYER">BUYER</option>
                    <option value="TRANSPORTER">TRANSPORTER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">KYC Status</label>
                  <select
                    value={editingUser.kycStatus || 'PENDING'}
                    onChange={(e) => setEditingUser({ ...editingUser, kycStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Business / Fleet Name</label>
                  <input
                    type="text"
                    value={editingUser.businessName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, businessName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Location / County</label>
                  <input
                    type="text"
                    value={editingUser.location || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Escrow Wallet Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingUser.walletBalance ?? 0}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700 text-sm"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={Boolean(editingUser.isEmailVerified)}
                      onChange={(e) => setEditingUser({ ...editingUser, isEmailVerified: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Email Address Verified</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg shadow-sm transition-colors"
                >
                  Save Changes to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL COMPONENTS: IMAGE PICKER, RECEIPT, NOTIFICATIONS    */}
      {/* ========================================================= */}
      {showImagePicker && (
        <ImagePickerModal
          currentUrl={newListing.imageUrl}
          onSelect={(url) => setNewListing({ ...newListing, imageUrl: url })}
          onClose={() => setShowImagePicker(false)}
        />
      )}

      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      {producePassportOrder && (
        <ProducePassportModal
          order={producePassportOrder}
          onClose={() => setProducePassportOrder(null)}
        />
      )}

      {/* Rural Offline Sync & SMS Hub Modal */}
      <OfflineSyncModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        isOnline={isOnline}
        pendingQueue={pendingSyncQueue}
        onSyncAll={handleSyncPendingQueue}
        onRemoveItem={handleRemovePendingSyncItem}
      />

      {/* Farmer & Buyer Audio Voice Messaging Modal */}
      <VoiceMessagingModal
        isOpen={Boolean(voiceChatOrder)}
        onClose={() => setVoiceChatOrder(null)}
        order={voiceChatOrder}
        currentUser={user}
        apiBase={API_BASE}
      />


      {/* Mobile Heads-Up Sliding Notification Banner */}
      <MobileNotificationPill
        notification={activeHeadsUpNotification}
        onOpenDrawer={() => setShowNotificationDrawer(true)}
        onDismiss={() => setActiveHeadsUpNotification(null)}
      />

      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        notifications={notificationsList}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onRefresh={() => fetchNotifications(user?.id)}
        onOpenOrderInvoice={(order) => {
          setShowNotificationDrawer(false);
          setInvoiceModalOrder(order);
        }}
      />

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile only)     */}
      {/* ========================================================= */}
      <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex justify-around items-center py-2 px-1 shadow-2xl">
        {user.role === 'BUYER' && (
          <>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === 'marketplace' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Market</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>Orders ({orders.length})</span>
            </button>
          </>
        )}

        {user.role === 'FARMER' && (
          <button
            onClick={() => setActiveTab('farmer')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-3 text-emerald-600"
          >
            <Sprout className="w-5 h-5" />
            <span>Farm Catalog</span>
          </button>
        )}

        {user.role === 'TRANSPORTER' && (
          <button
            onClick={() => setActiveTab('logistics')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-3 text-emerald-600"
          >
            <Truck className="w-5 h-5" />
            <span>Cargo Jobs</span>
          </button>
        )}

        {user.role === 'ADMIN' && (
          <>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 ${
                activeTab === 'analytics' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>KPIs</span>
            </button>
            <button
              onClick={() => setActiveTab('admin-orders')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 ${
                activeTab === 'admin-orders' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('admin-produce')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 ${
                activeTab === 'admin-produce' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Sprout className="w-5 h-5" />
              <span>Harvest</span>
            </button>
            <button
              onClick={() => setActiveTab('admin-users')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 ${
                activeTab === 'admin-users' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Users</span>
            </button>
          </>
        )}

        <button
          onClick={() => setShowTopUpModal(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 text-slate-700"
        >
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span>${(user.walletBalance || 0).toFixed(0)}</span>
        </button>

        <button
          onClick={() => setShowNotificationDrawer(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 text-slate-500 relative"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
          <span>Alerts</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* KILIMO AI DIGITAL VOICE & NAVIGATION ASSISTANT           */}
      {/* ========================================================= */}
      <KilimoAIAssistant
        user={user}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenTopUp={() => setShowTopUpModal(true)}
        onOpenWithdraw={() => setShowWithdrawModal(true)}
        onOpenCropDoctor={() => setShowCropDoctor(true)}
      />

      {/* ========================================================= */}
      {/* ESCROW WALLET TOP-UP MODAL                               */}
      {/* ========================================================= */}
      <WalletTopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        user={user}
        token={token}
        onBalanceUpdated={(newBal) => {
          user.walletBalance = newBal;
          refreshUser();
          loadRoleData();
          showNotification(`Wallet credited successfully! New balance: $${newBal.toFixed(2)}`);
        }}
      />

      {/* ========================================================= */}
      {/* WALLET WITHDRAWAL MODAL (M-PESA / BANK / AIRTEL)         */}
      {/* ========================================================= */}
      <WalletWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        user={user}
        token={token}
        onBalanceUpdated={(newBal) => {
          user.walletBalance = newBal;
          refreshUser();
          loadRoleData();
          showNotification(`Withdrawal processed! New balance: $${newBal.toFixed(2)}`);
        }}
      />

      {/* ========================================================= */}
      {/* BULK PRICE NEGOTIATION / RFQ OFFER MODAL                 */}
      {/* ========================================================= */}
      <MakeOfferModal
        isOpen={Boolean(negotiatingListing)}
        onClose={() => setNegotiatingListing(null)}
        listing={negotiatingListing}
        user={user}
        onOfferSubmitted={(data) => {
          showNotification(data.message);
          loadRoleData();
        }}
      />

      {/* ========================================================= */}
      {/* ESCROW QUALITY INSPECTION & DISPUTE MODAL                */}
      {/* ========================================================= */}
      <DisputeModal
        isOpen={Boolean(disputingOrder)}
        onClose={() => setDisputingOrder(null)}
        order={disputingOrder}
        user={user}
        onDisputeFiled={(data) => {
          showNotification(data.message, 'warning');
          loadRoleData();
        }}
      />

      {/* ========================================================= */}
      {/* 🚚 INSTANT FREIGHT & MILEAGE CALCULATOR MODAL            */}
      {/* ========================================================= */}
      <FreightCalculatorModal
        isOpen={showFreightCalculator}
        onClose={() => setShowFreightCalculator(false)}
        defaultOrigin={freightOrigin}
        defaultDestination={freightDestination}
      />

      {/* ========================================================= */}
      {/* 👥 PRODUCE AGGREGATION & CHAMA COOPERATIVE POOLING       */}
      {/* ========================================================= */}
      <ChamaAggregationModal
        isOpen={showChamaAggregation}
        onClose={() => setShowChamaAggregation(false)}
        user={user}
      />

      {/* ========================================================= */}
      {/* 🧮 FARMER BREAK-EVEN & PROFIT MARGIN CALCULATOR          */}
      {/* ========================================================= */}
      <FarmerProfitCalculatorModal
        isOpen={showProfitCalculator}
        onClose={() => setShowProfitCalculator(false)}
        onApplyPriceToListing={({ unitPrice }) => {
          setNewListing(prev => ({ ...prev, unitPrice: unitPrice.toFixed(2) }));
          showNotification(`✅ Recommended price applied: $${unitPrice.toFixed(2)}/kg`);
        }}
      />

      {/* ========================================================= */}
      {/* 🔔 SMS & WHATSAPP PRICE/HARVEST ALERT SUBSCRIPTIONS      */}
      {/* ========================================================= */}
      <AlertsSubscriptionModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        user={user}
        defaultCrop={alertsDefaultCrop}
      />

      {/* ========================================================= */}
      {/* 📱 RURAL FEATURE PHONE USSD SIMULATOR (*384*50#)         */}
      {/* ========================================================= */}
      <UssdSimulatorModal
        isOpen={showUssdModal}
        onClose={() => setShowUssdModal(false)}
      />

      {/* ========================================================= */}
      {/* 🤖 KILIMO AI AUTONOMOUS PRICE & DEAL NEGOTIATOR           */}
      {/* ========================================================= */}
      <AiNegotiationModal
        isOpen={showAiNegotiation}
        onClose={() => setShowAiNegotiation(false)}
        onAcceptDeal={(deal) => {
          showNotification(`Deal negotiated: ${deal.targetVolumeKg}kg ${deal.cropName} @ KES ${deal.aiRecommendedRateKes}/kg!`);
          loadRoleData();
        }}
      />

      {/* ========================================================= */}
      {/* 🛰️ COPERNICUS SENTINEL-2 SATELLITE CROP HEALTH SCANNER    */}
      {/* ========================================================= */}
      <SatelliteCropScannerModal
        isOpen={showSatelliteScanner}
        onClose={() => setShowSatelliteScanner(false)}
        initialCrop={satelliteCrop}
        initialLocation={satelliteLocation}
      />

      {/* ========================================================= */}
      {/* 🌿 KILIMO AI CROP DISEASE & PEST DOCTOR SCANNER           */}
      {/* ========================================================= */}
      <CropDiseaseDoctorModal
        isOpen={showCropDoctor}
        onClose={() => setShowCropDoctor(false)}
        onOpenKilimoAI={(prompt) => {
          setShowCropDoctor(false);
          const aiBtn = document.querySelector('button[aria-label="Toggle Kilimo AI"]');
          if (aiBtn) aiBtn.click();
        }}
      />

      {/* ========================================================= */}
      {/* 📈 AI AGRONOMY & MARKET PRICE PREDICTOR MODAL             */}
      {/* ========================================================= */}
      <AiMarketPricePredictorModal
        isOpen={showAiPricePredictor}
        onClose={() => setShowAiPricePredictor(false)}
        onPreListHarvest={({ cropName, unitPrice, location }) => {
          setNewListing(prev => ({
            ...prev,
            cropName,
            unitPrice: unitPrice.toFixed(2),
            location: location || prev.location
          }));
          showNotification(`Pre-filled listing with AI forecasted price: $${unitPrice.toFixed(2)}/kg!`);
        }}
      />

      {/* ========================================================= */}
      {/* 🚚 LIVE GPS DELIVERY TRACKING MAP POPUP (BUYER / SELLER)  */}
      {/* ========================================================= */}
      {trackingMapOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Live GPS Cargo Route: Order #{trackingMapOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {trackingMapOrder.items?.[0]?.cropName} ({trackingMapOrder.items?.[0]?.quantity} kg) • Escrow Status: {trackingMapOrder.status}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setTrackingMapOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DriverLiveMap
              activeOrders={[trackingMapOrder]}
              availableShipments={[]}
              onAcceptShipment={() => {}}
              onUpdateTransitStatus={() => {}}
              user={user}
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTrackingMapOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Tracking Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 👤 AUTHENTICATED USER PROFILE & SETTINGS MODAL           */}
      {/* ========================================================= */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={loadRoleData}
      />

      {/* ========================================================= */}
      {/* 📱 MODERN NATIVE MOBILE BOTTOM NAVIGATION BAR            */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 sm:hidden shadow-lg flex justify-around items-center safe-area-pb">
        {/* 1. Market Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'marketplace'
              ? 'text-emerald-600 font-extrabold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'marketplace' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Market</span>
        </button>

        {/* 2. Role Specific Primary Tab */}
        {user.role === 'BUYER' && (
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'orders'
                ? 'text-emerald-600 font-extrabold'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <Lock className={`w-5 h-5 ${activeTab === 'orders' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Orders</span>
            {orders.length > 0 && (
              <span className="absolute top-0 right-0.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
        )}

        {user.role === 'FARMER' && (
          <button
            type="button"
            onClick={() => setActiveTab('farmer')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'farmer'
                ? 'text-emerald-600 font-extrabold'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <Sprout className={`w-5 h-5 ${activeTab === 'farmer' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">My Farm</span>
          </button>
        )}

        {user.role === 'TRANSPORTER' && (
          <button
            type="button"
            onClick={() => setActiveTab('logistics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'logistics'
                ? 'text-emerald-600 font-extrabold'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <Truck className={`w-5 h-5 ${activeTab === 'logistics' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Loads</span>
            {availableShipments.length > 0 && (
              <span className="absolute top-0 right-0.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {availableShipments.length}
              </span>
            )}
          </button>
        )}

        {user.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              activeTab === 'analytics'
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        )}

        {/* 3. Quick Wallet Action */}
        <button
          type="button"
          onClick={() => setShowTopUpModal(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 font-medium hover:text-slate-800 transition-all"
        >
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] mt-0.5 font-bold text-slate-800">{formatMoney(user.walletBalance || 0)}</span>
        </button>

        {/* 4. AI & Tools Sheet Trigger */}
        <button
          type="button"
          onClick={() => setShowMobileToolsSheet(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-purple-600 font-medium hover:text-purple-800 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Tools</span>
        </button>

        {/* 5. User Profile */}
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 font-medium hover:text-slate-800 transition-all"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* ⚡ MOBILE SMART TOOLS SLIDE-UP SHEET MODAL                */}
      {/* ========================================================= */}
      <MobileToolsSheetModal
        isOpen={showMobileToolsSheet}
        onClose={() => setShowMobileToolsSheet(false)}
        user={user}
        onOpenCropDoctor={() => {
          setShowMobileToolsSheet(false);
          setShowCropDoctor(true);
        }}
        onOpenAiNegotiation={() => {
          setShowMobileToolsSheet(false);
          setShowAiNegotiation(true);
        }}
        onOpenSatelliteScanner={() => {
          setShowMobileToolsSheet(false);
          setSatelliteCrop('Tomatoes');
          setSatelliteLocation('Kinangop, Nyandarua County');
          setShowSatelliteScanner(true);
        }}
        onOpenFreightCalculator={() => {
          setShowMobileToolsSheet(false);
          setShowFreightCalculator(true);
        }}
        onOpenChamaPool={() => {
          setShowMobileToolsSheet(false);
          setShowChamaAggregation(true);
        }}
        onOpenAlerts={() => {
          setShowMobileToolsSheet(false);
          setShowAlertsModal(true);
        }}
        onOpenUssd={() => {
          setShowMobileToolsSheet(false);
          setShowUssdModal(true);
        }}
        onOpenPricePredictor={() => {
          setShowMobileToolsSheet(false);
          setShowAiPricePredictor(true);
        }}
        onOpenTopUp={() => {
          setShowMobileToolsSheet(false);
          setShowTopUpModal(true);
        }}
        onOpenWithdraw={() => {
          setShowMobileToolsSheet(false);
          setShowWithdrawModal(true);
        }}
        onOpenProfile={() => {
          setShowMobileToolsSheet(false);
          setShowProfileModal(true);
        }}
        onReplayIntro={() => {
          setShowMobileToolsSheet(false);
          if (onReplayIntro) onReplayIntro();
        }}
        onOpenKilimoVision={() => {
          setShowMobileToolsSheet(false);
          setShowKilimoVision(true);
        }}
        onOpenOfflineSync={() => {
          setShowMobileToolsSheet(false);
          setShowOfflineModal(true);
        }}
      />

      {/* ========================================================= */}
      {/* 📷 KILIMO VISION AI MULTIMODAL CROP DISEASE & GRADE SCANNER */}
      {/* ========================================================= */}
      <KilimoVisionScanner
        isOpen={showKilimoVision}
        onClose={() => setShowKilimoVision(false)}
        onApplyToListing={(data) => {
          setNewListing(prev => ({
            ...prev,
            cropName: data.cropName,
            grade: data.qualityGrade,
            unitPrice: Number(data.suggestedPriceKes / 130).toFixed(2)
          }));
          setActiveTab('farmer');
          showNotification(`✅ Pre-filled produce listing with ${data.cropName} (${data.qualityGrade})!`);
        }}
      />

      {/* ========================================================= */}
      {/* 📄 TAX INVOICE, TRANSPORTER WAYBILL & CERTIFICATE OF ORIGIN */}
      {/* ========================================================= */}
      <InvoiceModal
        isOpen={Boolean(invoiceModalOrder)}
        onClose={() => setInvoiceModalOrder(null)}
        order={invoiceModalOrder}
      />

    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // If user is directly accessing secret admin portal, do not show intro
    const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
    if (isAdmin) return false;
    // Check if user already saw the intro in this browser session
    return !(
      sessionStorage.getItem('AgriShamba_intro_seen') || 
      sessionStorage.getItem('agrilink_intro_seen') ||
      sessionStorage.getItem('AgriShamba_intro_seen')
    );
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('AgriShamba_intro_seen', 'true');
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <IntroVideoSplash onComplete={handleIntroComplete} />}
      <AuthProvider>
        <LanguageProvider>
          <CurrencyUnitProvider>
            <MainApp onReplayIntro={() => setShowIntro(true)} />
          </CurrencyUnitProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  );
}

