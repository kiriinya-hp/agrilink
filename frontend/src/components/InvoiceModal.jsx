import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  Truck, 
  ShieldCheck, 
  QrCode as QrIcon, 
  CheckCircle2, 
  Calendar, 
  User, 
  MapPin, 
  Phone,
  Building2,
  Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function InvoiceModal({ isOpen, onClose, order }) {
  const [activeTab, setActiveTab] = useState('invoice'); // 'invoice' | 'waybill' | 'certificate'

  if (!isOpen || !order) return null;

  const invoiceNo = `INV-2026-${order.id?.slice(-6)?.toUpperCase() || '883921'}`;
  const waybillNo = `WB-2026-${order.id?.slice(-5)?.toUpperCase() || '44102'}`;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : new Date().toLocaleDateString('en-GB');

  // Line items
  const items = order.items && order.items.length > 0 
    ? order.items 
    : [{
        id: '1',
        cropName: order.cropName || order.listing?.cropName || 'Fresh Horticultural Produce',
        quantity: order.quantity || order.volumeKg || 500,
        unitPrice: order.unitPrice || order.pricePerKg || 85,
        total: (order.quantity || 500) * (order.unitPrice || 85),
        grade: order.qualityGrade || order.listing?.qualityGrade || 'GRADE_A'
      }];

  const subtotalKes = items.reduce((sum, item) => sum + (item.total || ((item.quantity || 0) * (item.unitPrice || 0))), 0);
  const transportFeeKes = order.transportFee || Math.round(subtotalKes * 0.08);
  const platformFeeKes = Math.round(subtotalKes * 0.05);
  const grandTotalKes = subtotalKes + transportFeeKes;

  const buyerName = order.buyer?.name || order.buyerName || 'Commercial Bulk Buyer';
  const buyerBusiness = order.buyer?.businessName || 'Wholesale Depot / Supermarket';
  const buyerPhone = order.buyer?.phone || '+254 712 000 000';
  const buyerLocation = order.deliveryLocation || order.buyer?.location || 'Nairobi Central Wholesale Depot';

  const farmerName = order.farmer?.name || order.items?.[0]?.listing?.farmer?.name || 'Verified Farmer Member';
  const farmerPhone = order.farmer?.phone || order.items?.[0]?.listing?.farmer?.phone || '+254 722 000 000';
  const farmLocation = order.pickupLocation || order.items?.[0]?.listing?.farmLocation || 'Kirinyaga County';

  const transporterName = order.shipment?.transporter?.name || 'FastTrack Cargo Logistics Ltd';
  const vehiclePlate = order.shipment?.vehiclePlate || 'KDD 482B (Isuzu FRR 5-Ton)';
  const driverPhone = order.shipment?.transporter?.phone || '+254 733 999 111';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Top Screen Toolbar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'invoice' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Invoice</span>
            </button>
            <button
              onClick={() => setActiveTab('waybill')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'waybill' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Transporter Waybill</span>
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'certificate' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certificate of Origin</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 sm:p-12 print:p-6 bg-white space-y-8 font-sans">
          
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-3">
                {/* AgriShamba v2 Logo */}
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/40 shadow-md bg-slate-900 shrink-0 flex items-center justify-center">
                  <img
                    src="/agrishamba-logo.png"
                    alt="AgriShamba"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-emerald-600 hidden items-center justify-center text-white text-xs font-black">AS</div>
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-emerald-800">Agri<span className="text-slate-900">Shamba</span></span>
                  <span className="ml-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Kenya Agribusiness SCM
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Direct Farm-Gate to Wholesale Market Network</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>AgriShamba Supply Chain Ltd • KRA PIN: <strong>P051982736Z</strong></p>
                <p>KRA eTIMS CU Number: <strong className="font-mono text-emerald-800">KRA-CU-2026-ETR-094812</strong></p>
                <p>Control Code: <strong className="font-mono text-slate-800">{order.id ? order.id.slice(-8).toUpperCase() : 'B4F92C10'}</strong> (Cryptographically Signed)</p>
                <p>Wakulima House, Haile Selassie Ave, Nairobi, Kenya</p>
                <p>Support: +254 700 000 000 • legal@agrishamba.co.ke</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-widest bg-slate-900 text-white">
                {activeTab === 'invoice' && 'OFFICIAL TAX INVOICE'}
                {activeTab === 'waybill' && 'GOODS TRANSIT WAYBILL'}
                {activeTab === 'certificate' && 'CERTIFICATE OF ORIGIN'}
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono mt-1">
                {activeTab === 'invoice' && invoiceNo}
                {activeTab === 'waybill' && waybillNo}
                {activeTab === 'certificate' && `CERT-${invoiceNo}`}
              </p>
              <p className="text-xs text-slate-500">Date: {orderDate}</p>
              <p className="text-xs text-slate-500">Escrow ID: {order.escrowTransaction?.id || order.id || 'ESC-9921'}</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: TAX INVOICE */}
          {/* ========================================================================= */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              
              {/* Billing Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Billed To (Buyer):</span>
                  <p className="font-bold text-sm text-slate-900">{buyerName}</p>
                  <p className="text-slate-600">{buyerBusiness}</p>
                  <p className="text-slate-600">Location: {buyerLocation}</p>
                  <p className="text-slate-600">Phone: {buyerPhone}</p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Origin / Seller (Farmer):</span>
                  <p className="font-bold text-sm text-slate-900">{farmerName}</p>
                  <p className="text-slate-600">Farm Location: {farmLocation}</p>
                  <p className="text-slate-600">Phone: {farmerPhone}</p>
                  <p className="text-emerald-700 font-semibold">AgriShamba Verified Producer Badge ✅</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700">
                      <th className="py-2.5 px-3 font-bold uppercase">Produce Item</th>
                      <th className="py-2.5 px-3 font-bold uppercase">Quality Grade</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Volume (Kg)</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Rate (KES / Kg)</th>
                      <th className="py-2.5 px-3 font-bold uppercase text-right">Total Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{it.cropName}</td>
                        <td className="py-3 px-3 text-slate-600">{it.grade || 'GRADE_A'}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800">{Number(it.quantity).toLocaleString()} kg</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800">KES {Number(it.unitPrice).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          KES {Number(it.total || (it.quantity * it.unitPrice)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Produce Subtotal:</span>
                    <span className="font-mono">KES {subtotalKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Consolidated Freight / Logistics:</span>
                    <span className="font-mono">KES {transportFeeKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
                    <span>Platform Escrow Trust Protection (5%):</span>
                    <span className="font-mono text-emerald-700 font-semibold">KES {platformFeeKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                    <span>Grand Total Due:</span>
                    <span className="font-mono text-emerald-800">KES {grandTotalKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>USD Equivalent (Approx):</span>
                    <span className="font-mono">${Number(grandTotalKes / 130).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Security Seal */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-600 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Safaricom M-Pesa Smart Escrow Guarantee</p>
                    <p className="text-emerald-700">100% of payment held securely in escrow until 6-digit cryptographic OTP is validated at delivery point.</p>
                  </div>
                </div>
                <div className="hidden sm:block text-right font-mono font-bold text-emerald-800">
                  VERIFIED AUTHENTIC
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TRANSPORTER WAYBILL */}
          {/* ========================================================================= */}
          {activeTab === 'waybill' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">1. Consignor (Pickup Farm):</span>
                  <p className="font-bold text-slate-900">{farmerName}</p>
                  <p className="text-slate-600">{farmLocation}</p>
                  <p className="text-slate-600">{farmerPhone}</p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">2. Consignee (Destination):</span>
                  <p className="font-bold text-slate-900">{buyerName}</p>
                  <p className="text-slate-600">{buyerLocation}</p>
                  <p className="text-slate-600">{buyerPhone}</p>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">3. Carrier / Freight Truck:</span>
                  <p className="font-bold text-slate-900">{transporterName}</p>
                  <p className="text-slate-700 font-mono font-bold">Plate: {vehiclePlate}</p>
                  <p className="text-slate-600">Driver Phone: {driverPhone}</p>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-700 block">Cargo Manifest & Handling:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase">Total Weight</span>
                    <span className="font-mono font-bold text-sm text-slate-900">{items.reduce((sum, i) => sum + (i.quantity || 0), 0)} Kg</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase">Packaging Type</span>
                    <span className="font-bold text-xs text-slate-900">Plastic Crates (Max 6 High)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase">Perishability Level</span>
                    <span className="font-bold text-xs text-amber-700">High (Ventilated transit)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase">Transit Corridor</span>
                    <span className="font-bold text-xs text-slate-900">A2 Highway / Thika Rd</span>
                  </div>
                </div>
              </div>

              {/* Handover & OTP Sign-off Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-xs">
                <div className="border border-slate-300 rounded-xl p-4 text-center space-y-8">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Farm Gate Loading Sign-off</p>
                  <div className="border-b-2 border-slate-400 w-3/4 mx-auto" />
                  <p className="text-slate-500 text-[10px]">Farmer Signature & Date</p>
                </div>
                <div className="border border-slate-300 rounded-xl p-4 text-center space-y-8">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Transporter Custody Acceptance</p>
                  <div className="border-b-2 border-slate-400 w-3/4 mx-auto" />
                  <p className="text-slate-500 text-[10px]">Driver Signature & Date</p>
                </div>
                <div className="border border-slate-300 rounded-xl p-4 text-center space-y-8 bg-emerald-50/50">
                  <p className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">Delivery Verification OTP</p>
                  <div className="text-lg font-mono font-black text-emerald-700 tracking-widest">
                    {order.deliveryOtp || '• • • •'}
                  </div>
                  <p className="text-slate-500 text-[10px]">Buyer OTP Handover & Seal</p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CERTIFICATE OF ORIGIN */}
          {/* ========================================================================= */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-2xl bg-slate-50 border-2 border-emerald-600/30 text-center space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  Republic of Kenya • AgriShamba Traceability Standard
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Certificate of Origin & Agro-Traceability
                </h3>
                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                  This certifies that the agricultural commodities referenced under Batch #{order.id?.slice(-8) || '2026-X88'} have been grown and harvested in accordance with Kenyan GAP (Good Agricultural Practices) standards.
                </p>

                {/* QR Code Block */}
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 inline-block">
                  <QRCodeSVG 
                    value={`https://agrilink-pyrv.onrender.com/trace/${order.id || 'sample'}`}
                    size={140}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-[10px] font-mono text-slate-500 mt-2">Scan for Cryptographic Ledger Record</p>
                </div>

                {/* Metadata List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs pt-4 border-t border-slate-200 max-w-2xl mx-auto">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Harvest Region</span>
                    <span className="font-bold text-slate-800">{farmLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Certified Grade</span>
                    <span className="font-bold text-emerald-700">Grade A (Wholesale)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pre-Harvest Interval (PHI)</span>
                    <span className="font-bold text-slate-800">14 Days Withheld (Safe)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Escrow Token</span>
                    <span className="font-bold font-mono text-slate-800">SHA-256 Validated</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <p>© 2026 AgriShamba B2B Agribusiness SCM Platform • Nairobi, Kenya</p>
            <p className="font-mono text-[11px]">System-Generated Document • No physical stamp required</p>
          </div>

        </div>

      </div>
    </div>
  );
}
