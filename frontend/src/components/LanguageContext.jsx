import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Navigation & Header
    appName: 'Mazao Hub',
    enterpriseScm: 'Enterprise SCM',
    installMobileApp: 'Install Mobile App',
    topUp: 'Top Up',
    withdraw: 'Withdraw',
    signOut: 'Sign Out',
    verifiedAccount: 'Verified Account',
    walletBalance: 'Available Balance',
    b2bMarketplace: 'B2B Marketplace',
    farmerDashboard: 'Farmer Harvest Dashboard',
    logisticsBoard: 'Logistics Dispatch Board',
    myOrders: 'My Escrow Orders',
    executiveBi: 'Executive BI & Analytics',
    stakeholders: 'Stakeholders Directory',
    freightQuote: 'Freight Quote',
    chamaPool: 'Chama Pool',
    alerts: 'Alerts',
    backToDashboard: '← Back to My Dashboard',

    // Marketplace
    searchProducePlaceholder: 'Search produce (tomatoes, onions, county)...',
    allCategories: 'ALL',
    horticulture: 'HORTICULTURE',
    cereal: 'CEREAL',
    tuber: 'TUBER',
    availableVolume: 'Available Volume',
    producer: 'Producer',
    harvestDate: 'Harvest',
    activeDriversReady: 'Active Drivers Ready',
    makeOffer: 'Offer',
    orderWithEscrow: 'Order with Escrow',
    escrowBadge: 'Safaricom M-Pesa Escrow',
    corridorTransporters: 'Transporters Active in Corridor',
    marketplaceHeader: 'Wholesale Agricultural Sourcing',
    marketplaceSubheader: 'Purchase produce directly from verified rural farmers. Funds are locked in Safaricom M-Pesa Escrow until you inspect delivery.',

    // Farmer Portal
    listHarvestTitle: 'List Harvest for Wholesale Sourcing',
    cropNameLabel: 'Crop / Commodity Name',
    categoryLabel: 'Category',
    gradeLabel: 'Grade',
    volumeKgLabel: 'Volume (kg)',
    unitPriceLabel: 'Unit Price',
    farmLocationLabel: 'Farm Location / County',
    producePhotoLabel: 'Produce Photo (URL / Gallery)',
    publishToCatalog: 'Publish to B2B Catalog',
    farmerWalletTitle: 'Farmer Wallet Balance (Escrow Settlements)',
    directMpesaPayout: 'Direct M-Pesa or Bank payout to',
    myInventoryTitle: 'My Harvest Inventory',
    noHarvestsListed: 'No harvests listed yet. Use the form on the left to publish your first produce batch.',
    wholesaleRate: 'Wholesale Rate',
    marketStatus: 'Market Status',
    pricingTipTitle: 'Not sure what price to set?',
    pricingTipSubtitle: 'Use the Break-Even Calculator to find your fair minimum selling price',
    calculateButton: 'Calculate',

    // Transporter Portal
    freightDispatcherTitle: 'Mazao Hub Freight & Dispatch Dispatcher',
    freightDispatcherSub: 'Claim pending cargo shipments, advance transit milestones, and provide the Delivery OTP to the recipient buyer.',
    freightEarnings: 'Freight Earnings',
    availableFreightJobs: 'Available Freight Jobs awaiting dispatch',
    noCargoAwaiting: 'No cargo awaiting transporter dispatch.',
    claimCargo: 'Claim Cargo Shipment',
    myInTransitShipments: 'My In-Transit Shipments',
    deliveryOtpNotice: 'Delivery Verification OTP',
    markPickedUp: 'Mark Picked Up',
    markInTransit: 'Mark In Transit',
    markArrived: 'Mark Arrived',

    // Orders / Buyer
    ordersTitle: 'My Purchase Orders & Escrow Tracker',
    ordersSub: 'Funds remain in escrow until you inspect physical delivery and provide the 4-digit PIN.',
    noOrdersYet: 'No active orders placed yet.',
    deliveryConfirmed: 'Delivery Confirmed & Settled',
    viewSettlementReceipt: 'View Settlement Receipt & Invoice',
    confirmDeliveryPrompt: 'Confirm Delivery & Release Escrow:',
    releaseEscrowButton: 'Release Escrow',
    reportQualityIssue: 'Report Quality Issue',

    // Modals & General
    purchaseOrderModalTitle: 'Purchase Order (PO)',
    orderVolumeKg: 'Order Volume (kg)',
    destinationAddress: 'Destination Delivery Address',
    mpesaPhonePrompt: 'M-Pesa Mobile Number for STK Push Prompt',
    produceCost: 'Produce Cost',
    freightLogisticsEst: 'Freight / Logistics Estimate',
    escrowFee: 'Mazao Hub Escrow Fee (5%)',
    totalEscrowLock: 'Total Escrow Lock',
    cancel: 'Cancel',
    confirmAndLockEscrow: 'Confirm & Lock M-Pesa Escrow',
    escrowDeposit: 'Escrow Deposit',
    cargoLabel: 'Cargo',
    pickupLabel: 'Pickup',
    dropoffLabel: 'Dropoff'
  },

  sw: {
    // Navigation & Header
    appName: 'Mazao Hub',
    enterpriseScm: 'Soko la Kilimo',
    installMobileApp: 'Weka App Simuni',
    topUp: 'Weka Pesa',
    withdraw: 'Toa Pesa',
    signOut: 'Ondoka',
    verifiedAccount: 'Akaunti Iliyothibitishwa',
    walletBalance: 'Salio Linalopatikana',
    b2bMarketplace: 'Soko la Jumla la Mazao',
    farmerDashboard: 'Dashibodi ya Mkulima',
    logisticsBoard: 'Bodi ya Usafirishaji & Dereva',
    myOrders: 'Maagizo Yangu ya Escrow',
    executiveBi: 'Takwimu & Ripoti Kuu',
    stakeholders: 'Orodha ya Watumiaji',
    freightQuote: 'Bei ya Usafiri',
    chamaPool: 'Chama ya Wakulima',
    alerts: 'Tahadhari',
    backToDashboard: '← Rudi Kwenye Dashibodi Yangu',

    // Marketplace
    searchProducePlaceholder: 'Tafuta mazao (nyanya, vitunguu, viazi, kaunti)...',
    allCategories: 'YOTE',
    horticulture: 'MBOGA & MATUNDA',
    cereal: 'NAFAKA',
    tuber: 'MIZIZI',
    availableVolume: 'Kiasi Kilichopo',
    producer: 'Mkulima',
    harvestDate: 'Mavuno',
    activeDriversReady: 'Madereva Tayari Kusafirisha',
    makeOffer: 'Pendekeza Bei',
    orderWithEscrow: 'Agiza kwa Escrow',
    escrowBadge: 'Ulinzi wa Pesa kwa Safaricom M-Pesa Escrow',
    corridorTransporters: 'Madereva Wako Tayari Katika Barabara Hii',
    marketplaceHeader: 'Soko la Jumla la Mazao ya Shambani',
    marketplaceSubheader: 'Nunua mazao moja kwa moja kutoka kwa wakulima wa mashambani. Pesa zako zinalindwa kwa M-Pesa Escrow hadi ukague mzigo wako ukifika.',

    // Farmer Portal
    listHarvestTitle: 'Weka Mavuno Sokoni kwa Wanunuzi wa Jumla',
    cropNameLabel: 'Jina la Zao / Bidhaa',
    categoryLabel: 'Aina ya Zao',
    gradeLabel: 'Gredi ya Ubora',
    volumeKgLabel: 'Kiasi cha Mavuno (Kilo)',
    unitPriceLabel: 'Bei ya Kuuzia',
    farmLocationLabel: 'Mahali Shamba Lilipo / Kaunti',
    producePhotoLabel: 'Picha ya Zao (Kiungo / Matunzio)',
    publishToCatalog: 'Chapisha Sokoni Sasa',
    farmerWalletTitle: 'Salio la Pochi ya Mkulima (Malipo ya Escrow)',
    directMpesaPayout: 'Malipo ya papo hapo kwa M-Pesa au Benki kwenda',
    myInventoryTitle: 'Mavuno Yangu Yaliyoko Sokoni',
    noHarvestsListed: 'Hujaweka zao lolote sokoni bado. Tumia fomu iliyo upande wa kushoto kutangaza mavuno yako.',
    wholesaleRate: 'Bei ya Jumla',
    marketStatus: 'Hali Sokoni',
    pricingTipTitle: 'Huna uhakika wa bei ya kuweka?',
    pricingTipSubtitle: 'Tumia Kikokotoo cha Gharama kujua bei inayokupa faida halisi bila kudhulumiwa na madalali',
    calculateButton: 'Kokotoa Bei',

    // Transporter Portal
    freightDispatcherTitle: 'Kituo cha Madereva & Usambazaji wa Mizigo',
    freightDispatcherSub: 'Chukua mizigo inayosubiri usafirishaji, sasisha hatua za safari, na mpatie mnunuzi nambari ya siri (OTP) anapopokea mzigo.',
    freightEarnings: 'Mapato Yangu ya Usafiri',
    availableFreightJobs: 'Mizigo Inayosubiri Madereva',
    noCargoAwaiting: 'Hakuna mizigo inayosubiri kusafirishwa kwa sasa.',
    claimCargo: 'Chukua Safari Hii ya Mzigo',
    myInTransitShipments: 'Mizigo Ninayosafirisha Sasa',
    deliveryOtpNotice: 'Nambari ya Siri ya Upokeaji (OTP)',
    markPickedUp: 'Mzigo Umechukuliwa Shambani',
    markInTransit: 'Mzigo Uko Safarini',
    markArrived: 'Mzigo Umefika Kituoni',

    // Orders / Buyer
    ordersTitle: 'Maagizo Yangu ya Ununuzi & Mfumo wa Escrow',
    ordersSub: 'Pesa zako zimebaki zikilindwa kwenye escrow hadi uthibitishe ubora wa mzigo na kutoa nambari ya siri ya tarakimu nne.',
    noOrdersYet: 'Bado hujaweka agizo lolote la ununuzi.',
    deliveryConfirmed: 'Mzigo Umethibitishwa na Malipo Yamefunguliwa',
    viewSettlementReceipt: 'Tazama Risiti Rasmi ya Malipo',
    confirmDeliveryPrompt: 'Thibitisha Upokeaji & Toa Pesa za Escrow:',
    releaseEscrowButton: 'Fungulia Mkulima Pesa',
    reportQualityIssue: 'Ripoti Mzigo Ulioharibika',

    // Modals & General
    purchaseOrderModalTitle: 'Agizo Rasmi la Ununuzi (PO)',
    orderVolumeKg: 'Kiasi Unachotaka Kununua (Kilo)',
    destinationAddress: 'Mahali pa Kuletewa Mzigo',
    mpesaPhonePrompt: 'Nambari ya Simu ya M-Pesa ya Kulipia (STK Push)',
    produceCost: 'Gharama ya Mazao',
    freightLogisticsEst: 'Makadirio ya Nauli ya Usafiri',
    escrowFee: 'Ada ya Ulinzi wa Escrow (5%)',
    totalEscrowLock: 'Jumla ya Pesa Zitakazofungwa Escrow',
    cancel: 'Ghairi',
    confirmAndLockEscrow: 'Thibitisha & Funga Pesa kwa M-Pesa',
    escrowDeposit: 'Amana ya Escrow',
    cargoLabel: 'Mzigo',
    pickupLabel: 'Mahali pa Kuchukua',
    dropoffLabel: 'Mahali pa Kupeleka'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('Mazao Hub_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('Mazao Hub_lang', language);
  }, [language]);

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Global Language Switcher UI Component for Header
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-extrabold shadow-2xs">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
          language === 'en'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch whole application to English"
      >
        <span>🇬🇧 EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('sw')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
          language === 'sw'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Badilisha tovuti nzima kwa Kiswahili safi cha Kenya"
      >
        <span>🇰🇪 SWA</span>
      </button>
    </div>
  );
}
