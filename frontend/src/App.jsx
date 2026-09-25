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
  Database
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ImagePickerModal from './components/ImagePickerModal';
import ReceiptModal from './components/ReceiptModal';
import NotificationDrawer from './components/NotificationDrawer';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import KilimoAIAssistant from './components/KilimoAIAssistant';
import WalletTopUpModal from './components/WalletTopUpModal';

const API_BASE = '/api';

function MainApp() {
  const { user, token, logout, refreshUser } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login', 'register', 'admin-login'

  // Navigation Tabs for active role
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'orders', 'admin-users'
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data States
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Marketplace Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Transporter Count & Notification Drawer State
  const [transporterCount, setTransporterCount] = useState(3);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Modals
  const [orderModalListing, setOrderModalListing] = useState(null);
  const [orderQty, setOrderQty] = useState(100);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('MPESA_STK');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Farmer New Listing Form State
  const [newListing, setNewListing] = useState({
    cropName: '',
    category: 'HORTICULTURE',
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

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      showNotification('Thank you for installing AgriLink on your mobile device!');
    }
  };

  // Reset tab when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'BUYER') setActiveTab('marketplace');
      else if (user.role === 'FARMER') setActiveTab('farmer');
      else if (user.role === 'TRANSPORTER') setActiveTab('logistics');
      else if (user.role === 'ADMIN') setActiveTab('analytics');
      setPaymentPhone(user.phone || '');
      setDeliveryAddress(user.location || 'Nairobi Central Depot');
      loadRoleData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadRoleData();
    }
  }, [activeTab]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
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

      // 2. Fetch user's notification center alerts
      fetch(`${API_BASE}/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotificationsList(data.notifications || []);
            setUnreadNotifCount(data.unreadCount || 0);
          }
        })
        .catch(() => {});

      // 3. Role-specific queries
      if (user.role === 'BUYER' || activeTab === 'marketplace') {
        const query = new URLSearchParams();
        if (selectedCategory !== 'ALL') query.append('category', selectedCategory);
        if (search) query.append('search', search);
        const res = await fetch(`${API_BASE}/listings?${query.toString()}`);
        const data = await res.json();
        if (data.success) setListings(data.listings);

        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=BUYER`);
        const oData = await oRes.json();
        if (oData.success) setOrders(oData.orders);
      } 
      
      if (user.role === 'FARMER') {
        const lRes = await fetch(`${API_BASE}/listings`);
        const lData = await lRes.json();
        if (lData.success) {
          setListings(lData.listings.filter(l => l.farmerId === user.id));
        }

        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=FARMER`);
        const oData = await oRes.json();
        if (oData.success) setOrders(oData.orders);
      } 
      
      if (user.role === 'TRANSPORTER') {
        const sRes = await fetch(`${API_BASE}/shipments/available`);
        const sData = await sRes.json();
        if (sData.success) setAvailableShipments(sData.shipments);

        const oRes = await fetch(`${API_BASE}/orders?userId=${user.id}&role=TRANSPORTER`);
        const oData = await oRes.json();
        if (oData.success) setOrders(oData.orders);
      } 
      
      if (user.role === 'ADMIN') {
        const aRes = await fetch(`${API_BASE}/analytics`);
        const aData = await aRes.json();
        if (aData.success) setAnalytics(aData.analytics);

        const uRes = await fetch(`${API_BASE}/admin/users`);
        const uData = await uRes.json();
        if (uData.success) setAllUsers(uData.users);
      }
    } catch (err) {
      console.error('Failed to load role data:', err);
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

  // Buyer: Issue PO & Trigger Real M-Pesa STK Push
  const handleCreateOrder = async () => {
    if (!orderModalListing) return;
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

      // 2. Trigger M-Pesa Daraja STK Push
      const resEscrow = await fetch(`${API_BASE}/escrow/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      showNotification(
        `💳 PAYMENT CONFIRMED: $${orderData.order.grandTotal.toFixed(2)} deducted and locked in Escrow! Remaining Balance: $${(escrowData.newBuyerBalance ?? (user.walletBalance || 0)).toFixed(2)}. (Inspection OTP: ${escrowData.confirmationOtp})`
      );
      setOrderModalListing(null);
      setActiveTab('orders');
      refreshUser();
      loadRoleData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Farmer: Publish harvest to catalog
  const handleCreateListing = async (e) => {
    e.preventDefault();
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
      showNotification(err.message, 'error');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Database record updated successfully!');
        setEditingUser(null);
        loadRoleData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Admin: Delete stakeholder from database
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}" from the database?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Deleted "${userName}" from database successfully`);
        loadRoleData();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Buyer: Confirm delivery with driver's OTP -> triggers atomic settlement & multi-channel notification
  const handleVerifyDelivery = async (shipmentId) => {
    const otp = otpInputs[shipmentId];
    if (!otp) {
      showNotification('Please enter the 4-digit Delivery OTP provided by the driver', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/shipments/${shipmentId}/verify-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          `Delivery confirmed! Escrow disbursed: $${data.settlement.farmerPayout.toFixed(2)} to Farmer, $${data.settlement.transporterPayout.toFixed(2)} to Driver. Official receipt generated.`
        );

        // Auto-open printable receipt modal
        const matchingOrder = orders.find(o => o.shipment?.id === shipmentId);
        if (matchingOrder) {
          setSelectedReceiptOrder({ ...matchingOrder, status: 'COMPLETED' });
        }

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Agri<span className="text-emerald-600">Link</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enterprise SCM
                </span>
              </div>
            </div>

            {/* User Profile, Notifications & Logout Bar */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* PWA Install Button for Android / Chrome */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  title="Install AgriLink App on your device"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Install Mobile App</span>
                </button>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationDrawer(true)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="View Live Notification Center"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${roleBadgeColors[user.role]}`}>
                  {user.role}
                </span>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    {user.name}
                    {user.isEmailVerified && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" title="Verified Account" />
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">{user.businessName || user.email}</p>
                </div>
              </div>

              {/* Wallet Button with Top-up */}
              <button
                type="button"
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-colors shadow-sm cursor-pointer"
                title="Click to view balance and top up"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>${(user.walletBalance || 0).toFixed(2)}</span>
                <span className="hidden sm:inline text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  Top Up
                </span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                title="Sign out of your session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation for Logged-In Role */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-2 py-2 overflow-x-auto">
            {user.role === 'BUYER' && (
              <>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'marketplace' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  B2B Marketplace
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  My Escrow Orders ({orders.length})
                </button>
              </>
            )}

            {user.role === 'FARMER' && (
              <button
                onClick={() => setActiveTab('farmer')}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm"
              >
                <Sprout className="w-3.5 h-3.5" />
                Farmer Harvest & Inventory Dashboard
              </button>
            )}

            {user.role === 'TRANSPORTER' && (
              <button
                onClick={() => setActiveTab('logistics')}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                Logistics Dispatch Board ({availableShipments.length} Available Jobs)
              </button>
            )}

            {user.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Executive BI & Platform Analytics
                </button>
                <button
                  onClick={() => setActiveTab('admin-users')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'admin-users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Registered Stakeholders Directory ({allUsers.length})
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        
        {/* BUYER VIEW: B2B MARKETPLACE */}
        {user.role === 'BUYER' && activeTab === 'marketplace' && (
          <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-6 shadow-lg relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Safaricom M-Pesa Escrow
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                    <Truck className="w-3.5 h-3.5" /> {transporterCount} Transporters Active in Corridor
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Wholesale Agricultural Sourcing for {user.businessName || user.name}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Purchase produce directly from verified rural farmers. When you place an order, funds are held in escrow via M-Pesa and only disbursed when you inspect and confirm delivery.
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search produce (tomatoes, onions, county)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                {['ALL', 'HORTICULTURE', 'CEREAL', 'TUBER'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button onClick={loadRoleData} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200" title="Refresh Listings">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Produce Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.cropName} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                      {item.category}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm">
                      {(item.grade || 'GRADE_A').replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base text-slate-900">{item.cropName}</h3>
                        <p className="text-base font-extrabold text-emerald-600">
                          ${item.unitPrice.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ kg</span>
                        </p>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}</p>
                        <p className="flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-slate-400" /> Producer: <strong>{item.farmer?.name}</strong></p>
                        <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Harvest: {new Date(item.harvestDate).toLocaleDateString()}</p>
                        
                        {/* Live Drivers Available indicator */}
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            {transporterCount} Active Drivers Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Available Volume</span>
                        <span className="text-xs font-bold text-slate-800">{item.availableQty.toLocaleString()} kg</span>
                      </div>

                      <button
                        onClick={() => {
                          setOrderModalListing(item);
                          setOrderQty(Math.min(200, item.availableQty));
                        }}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Order with Escrow
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUYER VIEW: ESCROW ORDERS & OTP VERIFICATION */}
        {user.role === 'BUYER' && activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Purchase Orders & Escrow Tracker</h2>
                <p className="text-xs text-slate-500 mt-1">Funds remain in escrow until you inspect physical delivery and provide the 4-digit PIN.</p>
              </div>
              <button onClick={loadRoleData} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center bg-white rounded-xl border">No active orders placed yet.</p>
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
                          <ShieldCheck className="w-3.5 h-3.5" /> Escrow Deposit: ${(order.grandTotal || 0).toFixed(2)} ({order.escrowTransaction?.paymentGateway})
                        </p>
                      </div>

                      {/* Delivery Verification Sign-off & Receipt Action */}
                      <div className="w-full lg:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        {isCompleted ? (
                          <div className="space-y-2">
                            <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivery Confirmed & Settled
                            </div>
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Settlement Receipt & Invoice
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="font-bold text-slate-800 block">Confirm Delivery & Release Escrow:</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength="4"
                                placeholder="OTP"
                                value={otpInputs[shipment?.id] || ''}
                                onChange={(e) => setOtpInputs({ ...otpInputs, [shipment?.id]: e.target.value })}
                                className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-center text-sm"
                              />
                              <button
                                onClick={() => handleVerifyDelivery(shipment?.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded transition-colors"
                              >
                                Release Escrow
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">(Driver will provide OTP: <strong>{shipment?.confirmationOtp}</strong>)</p>
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
        {user.role === 'FARMER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Produce Form with Image Selector */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2 pb-2 border-b">
                <PlusCircle className="w-4 h-4 text-emerald-600" /> List Harvest for Wholesale Sourcing
              </h3>
              <form onSubmit={handleCreateListing} className="space-y-3 text-xs font-semibold text-slate-600">
                <div>
                  <label className="block mb-1">Crop / Commodity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Bulb Onions"
                    value={newListing.cropName}
                    onChange={(e) => setNewListing({ ...newListing, cropName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Category</label>
                    <select
                      value={newListing.category}
                      onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border rounded-lg text-xs"
                    >
                      <option value="HORTICULTURE">Horticulture</option>
                      <option value="CEREAL">Cereal</option>
                      <option value="TUBER">Tuber</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Grade</label>
                    <select
                      value={newListing.grade}
                      onChange={(e) => setNewListing({ ...newListing, grade: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border rounded-lg text-xs"
                    >
                      <option value="GRADE_A">Grade A</option>
                      <option value="GRADE_B">Grade B</option>
                      <option value="STANDARD">Standard</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Volume (kg)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1000"
                      value={newListing.availableQty}
                      onChange={(e) => setNewListing({ ...newListing, availableQty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Unit Price ($/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 0.75"
                      value={newListing.unitPrice}
                      onChange={(e) => setNewListing({ ...newListing, unitPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Farm Location / County</label>
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
                  <label className="block mb-1">Harvest Date</label>
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
                    <label className="block">Produce Photo (URL / Gallery)</label>
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

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs mt-2 transition-colors"
                >
                  Publish to B2B Catalog
                </button>
              </form>
            </div>

            {/* Farmer Inventory & Wallet */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 rounded-xl flex justify-between items-center shadow-md">
                <div>
                  <span className="text-xs text-emerald-200">Farmer Wallet Balance (Escrow Settlements)</span>
                  <h2 className="text-3xl font-black mt-1">${(user.walletBalance || 0).toFixed(2)}</h2>
                  <p className="text-[10px] text-emerald-200/80 mt-1">Direct M-Pesa payout to registered number: {user.phone}</p>
                </div>
                <button
                  onClick={() => showNotification(`Initiated M-Pesa withdrawal to ${user.phone}!`)}
                  className="bg-white text-emerald-900 font-bold px-4 py-2 rounded-lg text-xs shadow hover:bg-emerald-50"
                >
                  Withdraw to M-Pesa
                </button>
              </div>

              {/* Listings Table */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 mb-3">My Harvest Inventory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-y uppercase text-slate-400 text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Crop Name</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3">Available</th>
                        <th className="py-2 px-3">Price</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {listings.map((l) => (
                        <tr key={l.id}>
                          <td className="py-2.5 px-3 font-semibold flex items-center gap-2">
                            <img src={l.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
                            <span>{l.cropName}</span>
                          </td>
                          <td className="py-2.5 px-3">{l.grade}</td>
                          <td className="py-2.5 px-3 font-bold">{l.availableQty} kg</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-bold">${l.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRANSPORTER VIEW: LOGISTICS BOARD */}
        {user.role === 'TRANSPORTER' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">AgriLink Freight & Dispatch Dispatcher</h2>
              <p className="text-xs text-slate-500 mt-1">Claim pending cargo shipments, advance transit milestones, and provide the Delivery OTP to the recipient buyer.</p>
            </div>

            {/* Available Jobs */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Available Freight Jobs</h3>
              {availableShipments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No cargo awaiting transporter dispatch.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableShipments.map((shipment) => (
                    <div key={shipment.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="font-bold">{shipment.order?.orderNumber}</span>
                          <span className="text-emerald-700 font-extrabold">Freight: ${shipment.order?.transportFee.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <p><strong>Cargo:</strong> {shipment.order?.items[0]?.cropName} ({shipment.order?.items[0]?.quantity} kg)</p>
                          <p><strong>Pickup:</strong> {shipment.pickupLocation}</p>
                          <p><strong>Dropoff:</strong> {shipment.dropoffLocation}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptShipment(shipment.id)}
                        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs"
                      >
                        Claim Dispatch Job
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Active Shipments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3">My In-Transit Shipments</h3>
              <div className="space-y-3">
                {orders.filter(o => o.shipment?.transporterId === user.id).map((order) => {
                  const s = order.shipment;
                  return (
                    <div key={order.id} className="p-4 rounded-xl border bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{order.items[0]?.cropName} ({order.items[0]?.quantity} kg)</span>
                        <p className="text-slate-500">Route: {s?.pickupLocation} $\rightarrow$ {s?.dropoffLocation}</p>
                        <p className="font-mono text-emerald-700 font-bold text-sm mt-1">
                          Delivery Verification OTP: {s?.confirmationOtp}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'PICKED_UP')}
                          disabled={s.transitStatus !== 'ASSIGNED'}
                          className="px-3 py-1.5 rounded font-bold bg-amber-500 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          Mark Picked Up
                        </button>
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'IN_TRANSIT')}
                          disabled={s.transitStatus !== 'PICKED_UP'}
                          className="px-3 py-1.5 rounded font-bold bg-blue-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          Mark In Transit
                        </button>
                        <button
                          onClick={() => handleUpdateTransitStatus(s.id, 'ARRIVED')}
                          disabled={s.transitStatus !== 'IN_TRANSIT'}
                          className="px-3 py-1.5 rounded font-bold bg-emerald-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          Mark Arrived
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
                <p className="text-2xl font-black text-slate-900 mt-1">${(analytics.grossMerchandiseValue || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Escrow Holdings</span>
                <p className="text-2xl font-black text-amber-600 mt-1">${(analytics.activeEscrowHeld || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Commissions (5%)</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">${(analytics.platformCommissionEarned || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Food Dispatched</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{analytics.totalTonnage || 0} Tonnes</p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW: REGISTERED USERS DATABASE TABLE */}
        {user.role === 'ADMIN' && activeTab === 'admin-users' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {/* Database Studio Quick Info Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-indigo-950">Visual Database Management (Prisma Studio)</h4>
                  <p className="text-xs text-indigo-700">
                    Direct access: Double-click <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-900">open-database.bat</code> in your Desktop folder to open the full visual spreadsheet editor at <span className="underline font-bold">http://localhost:5555</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-800 font-bold">
                  dev.db (SQLite)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registered Ecosystem Stakeholders in SQLite Database</h3>
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
      </main>

      {/* ========================================================= */}
      {/* REAL M-PESA CHECKOUT MODAL                                */}
      {/* ========================================================= */}
      {orderModalListing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Purchase Order (PO)</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{orderModalListing.cropName}</h3>
                <p className="text-xs text-slate-500">Producer: {orderModalListing.farmer?.name}</p>
              </div>
              <button onClick={() => setOrderModalListing(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
            </div>

            <div className="py-4 space-y-3.5 text-xs font-semibold text-slate-700">
              {/* Transporter Availability Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">{transporterCount} Active Verified Transporters Ready</p>
                  <p className="text-[11px] text-emerald-700">Immediate pickup upon escrow lock. Fast cold-chain & freight dispatch.</p>
                </div>
              </div>

              <div>
                <label className="block mb-1">Order Volume (kg)</label>
                <input
                  type="number"
                  min="10"
                  max={orderModalListing.availableQty}
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block mb-1">Destination Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900"
                />
              </div>

              {/* M-Pesa Phone Input */}
              <div>
                <label className="block mb-1 flex items-center justify-between">
                  <span>M-Pesa Mobile Number for STK Push Prompt</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Lipa Na M-Pesa Online</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX or 254..."
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-slate-50 p-3 rounded-xl border space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>Produce Cost ({orderQty} kg @ ${orderModalListing.unitPrice.toFixed(2)}):</span>
                  <span>${(orderQty * orderModalListing.unitPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>Freight / Logistics Estimate:</span>
                  <span>${(20.00 + (orderQty * 0.02)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>AgriLink Escrow Fee (5%):</span>
                  <span>${((orderQty * orderModalListing.unitPrice) * 0.05).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Escrow Lock:</span>
                  <span className="text-emerald-700">
                    ${(
                      (orderQty * orderModalListing.unitPrice) +
                      (20.00 + (orderQty * 0.02)) +
                      ((orderQty * orderModalListing.unitPrice) * 0.05)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderModalListing(null)}
                className="flex-1 px-4 py-2 rounded-lg border text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={handleCreateOrder}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                {paymentProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending STK Push...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Send STK Push & Hold Escrow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT STAKEHOLDER DATABASE RECORD MODAL                   */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> SQLite Direct Record Editor
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

      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        notifications={notificationsList}
        onMarkAllRead={handleMarkAllNotificationsRead}
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
              onClick={() => setActiveTab('admin-users')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2.5 ${
                activeTab === 'admin-users' ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Directory</span>
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
      />

      {/* ========================================================= */}
      {/* ESCROW WALLET TOP-UP MODAL                               */}
      {/* ========================================================= */}
      <WalletTopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        user={user}
        onBalanceUpdated={(newBal) => {
          user.walletBalance = newBal;
          refreshUser();
          loadRoleData();
          showNotification(`Wallet credited successfully! New balance: $${newBal.toFixed(2)}`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
