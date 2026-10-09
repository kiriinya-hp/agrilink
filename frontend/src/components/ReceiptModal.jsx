import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Share2, 
  X, 
  CheckCircle2, 
  FileText, 
  Truck, 
  QrCode, 
  Download, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  BadgeCheck, 
  AlertCircle 
} from 'lucide-react';
import { USD_TO_KES } from './CurrencyUnitContext';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const [activeDoc, setActiveDoc] = useState('invoice'); // 'invoice' | 'waybill'

  const item = order.items?.[0] || {};
  const cropName = item.cropName || 'Fresh Agricultural Produce';
  const quantity = item.quantity || 0;
  const unitPriceUsd = item.unitPrice || 0;
  const unitPriceKes = Math.round(unitPriceUsd * USD_TO_KES);

  const produceTotalUsd = order.totalAmount || (quantity * unitPriceUsd);
  const produceTotalKes = Math.round(produceTotalUsd * USD_TO_KES);

  const transportFeeUsd = order.transportFee || (20.00 + (quantity * 0.02));
  const transportFeeKes = Math.round(transportFeeUsd * USD_TO_KES);

  const platformFeeUsd = order.platformFee || (produceTotalUsd * 0.05);
  const platformFeeKes = Math.round(platformFeeUsd * USD_TO_KES);

  const grandTotalUsd = order.grandTotal || (produceTotalUsd + transportFeeUsd + platformFeeUsd);
  const grandTotalKes = Math.round(grandTotalUsd * USD_TO_KES);

  const invoiceNumber = `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${order.orderNumber}`;
  const waybillNumber = `WB-${order.orderNumber}`;
  const isCompleted = order.status === 'COMPLETED';

  // Transporter & Driver Info
  const shipment = order.shipment || {};
  const transporterName = shipment.transporter?.name || 'AgriShamba Verified Freight Carrier';
  const transporterPhone = shipment.transporter?.phone || '+254 700 000 000';
  const pickupLocation = shipment.pickupLocation || item.listing?.location || 'Origin Farm Depot, Kenya';
  const dropoffLocation = shipment.dropoffLocation || order.deliveryAddress || 'Central Wholesale Depot, Nairobi';

  // WhatsApp share summary text
  const whatsappMessage = activeDoc === 'invoice'
    ? `*AgriShamba OFFICIAL TAX INVOICE*\n` +
      `---------------------------------------\n` +
      `*Invoice No:* ${invoiceNumber}\n` +
      `*Order Ref:* ${order.orderNumber}\n` +
      `*Status:* ${order.status} (${isCompleted ? 'ESCROW RELEASED' : 'ESCROW LOCKED'})\n` +
      `*Buyer:* ${order.buyer?.name || 'Commercial Procurement'}\n` +
      `*Produce:* ${quantity.toLocaleString()} kg of ${cropName}\n` +
      `*Destination:* ${dropoffLocation}\n` +
      `---------------------------------------\n` +
      `*Produce Value:* KES ${produceTotalKes.toLocaleString()} ($${produceTotalUsd.toFixed(2)})\n` +
      `*Logistics Freight:* KES ${transportFeeKes.toLocaleString()} ($${transportFeeUsd.toFixed(2)})\n` +
      `*AgriShamba Escrow Fee (5%):* KES ${platformFeeKes.toLocaleString()} ($${platformFeeUsd.toFixed(2)})\n` +
      `*TOTAL INVOICE VALUE:* KES ${grandTotalKes.toLocaleString()} ($${grandTotalUsd.toFixed(2)})\n` +
      `---------------------------------------\n` +
      `*Payment Ref:* ${order.escrowTransaction?.reference || 'ESC-MPESA-' + order.orderNumber}\n` +
      `*Verification:* Safaricom M-Pesa Rails & Delivery OTP Audited.\n` +
      `AgriShamba Enterprise SCM Kenya`
    : `*AgriShamba CONSIGNMENT WAYBILL & GATE PASS*\n` +
      `---------------------------------------\n` +
      `*Waybill No:* ${waybillNumber}\n` +
      `*Order Ref:* ${order.orderNumber}\n` +
      `*Cargo:* ${quantity.toLocaleString()} kg ${cropName}\n` +
      `*Route:* ${pickupLocation} -> ${dropoffLocation}\n` +
      `*Transporter:* ${transporterName} (${transporterPhone})\n` +
      `*Delivery Confirmation OTP:* ${shipment.confirmationOtp || 'Protected'}\n` +
      `---------------------------------------\n` +
      `Authorized Agricultural Transit Manifest. Valid for transit checkpoints & security gate release.`;

  const buyerPhoneClean = order.buyer?.phone?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${buyerPhoneClean}&text=${encodeURIComponent(whatsappMessage)}`;

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR Code pattern visually
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    `https://AgriShamba.co.ke/verify?order=${order.orderNumber}&type=${activeDoc}&amt=${grandTotalKes}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      
      {/* Print-specific style overrides to print ONLY the document sheet cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-document-sheet, #printable-document-sheet * {
            visibility: visible;
          }
          #printable-document-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[96vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Top Header Bar & Document Type Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              {activeDoc === 'invoice' ? <FileText className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">
                  AgriShamba Document Suite
                </span>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  ETR Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {activeDoc === 'invoice' ? `Tax Invoice ${invoiceNumber}` : `Delivery Waybill ${waybillNumber}`}
              </h2>
            </div>
          </div>

          {/* Switch Document Mode Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveDoc('invoice')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeDoc === 'invoice'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tax Invoice</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveDoc('waybill')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeDoc === 'waybill'
                    ? 'bg-white text-indigo-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Delivery Waybill</span>
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRINTABLE DOCUMENT SHEET CONTAINER                       */}
        {/* ======================================================== */}
        <div id="printable-document-sheet" className="py-4 space-y-5 bg-white text-slate-800 text-xs">

          {/* DOCUMENT HEADER: AgriShamba Official Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  Agri<span className="text-emerald-600">Shamba</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Kenya B2B Agribusiness SCM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                AgriShamba Commodity Clearing House & Escrow Hub<br />
                Kilimo Towers, Upper Hill, Nairobi, Kenya<br />
                KRA PIN: <strong>P051982401Z</strong> | ETR Ref: <strong>ETR-AL-{order.orderNumber}</strong><br />
                Support: info@AgriShamba.co.ke | +254 700 000 000
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-1.5 ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {activeDoc === 'invoice' 
                  ? (isCompleted ? '✓ PAID & ESCROW SETTLED' : '⏳ ESCROW LOCKED IN TRANSIT')
                  : '🚚 AUTHORIZED DISPATCH MANIFEST'
                }
              </span>
              <p className="font-mono text-xs font-bold text-slate-900">
                {activeDoc === 'invoice' ? invoiceNumber : waybillNumber}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: OFFICIAL TAX INVOICE CONTENT                      */}
          {/* ======================================================== */}
          {activeDoc === 'invoice' && (
            <div className="space-y-4">
              
              {/* Buyer & Seller Parties 2-Column Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                    Bill To (Consignee / Buyer):
                  </span>
                  <p className="font-bold text-sm text-slate-900">{order.buyer?.businessName || order.buyer?.name || 'Commercial Procurement Partner'}</p>
                  <p className="text-slate-600 mt-0.5">Attn: {order.buyer?.name || 'Procurement Officer'}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {dropoffLocation}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {order.buyer?.phone || 'N/A'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                    Producer / Shamba Origin (Seller):
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {item.listing?.farmer?.name || 'Verified Rural Smallholder Farmer'}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Farm Origin: <strong>{pickupLocation}</strong>
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Commodity Grade: <span className="font-bold text-emerald-700">{item.listing?.grade || 'GRADE_A'}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Disbursement Channel: Safaricom M-Pesa Escrow
                  </p>
                </div>
              </div>

              {/* Itemized Invoice Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item / Description</th>
                      <th className="py-2.5 px-3 text-center">Volume</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (KES / USD)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (KES)</th>
                      <th className="py-2.5 px-3 text-right">USD Equiv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block text-xs">{cropName}</span>
                        <span className="text-[10px] text-slate-500">
                          Grade: {item.listing?.grade || 'GRADE_A'} | Origin: {pickupLocation}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {quantity.toLocaleString()} kg
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        KES {unitPriceKes.toLocaleString()}<br />
                        <span className="text-[10px] text-slate-400">${unitPriceUsd.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-800 font-mono">
                        KES {produceTotalKes.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono">
                        ${produceTotalUsd.toFixed(2)}
                      </td>
                    </tr>

                    {/* Freight & Logistics Charge */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3" colSpan="3">
                        <span className="font-bold text-slate-800 block">Cold-Chain Freight & Transporter Transit Fee</span>
                        <span className="text-[10px] text-slate-500">
                          Carrier: {transporterName} | Corridor Transit Mileage
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">
                        KES {transportFeeKes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                        ${transportFeeUsd.toFixed(2)}
                      </td>
                    </tr>

                    {/* AgriShamba Platform Escrow & Clearing Fee */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3" colSpan="3">
                        <span className="font-bold text-slate-800 block">AgriShamba Escrow & Quality Assurance Fee (5%)</span>
                        <span className="text-[10px] text-slate-500">
                          Safaricom M-Pesa automated trust custody & OTP arbitration
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">
                        KES {platformFeeKes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                        ${platformFeeUsd.toFixed(2)}
                      </td>
                    </tr>

                    {/* Gross Totals in KES & USD */}
                    <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                      <td className="py-3 px-3 uppercase text-xs" colSpan="3">
                        TOTAL INVOICE AMOUNT PAYABLE:
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 text-sm font-black font-mono">
                        KES {grandTotalKes.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 text-xs font-mono">
                        ${grandTotalUsd.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Settlement Footnotes, Escrow Stamp & Scannable QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-2 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                      Safaricom M-Pesa Escrow Settlement Protocol
                    </h5>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Payment Ref: <strong className="font-mono">{order.escrowTransaction?.reference || 'ESC-MPESA-' + order.orderNumber}</strong><br />
                      This electronic tax invoice constitutes a certified commercial settlement on the AgriShamba Digital Agricultural SCM platform.
                    </p>
                  </div>
                </div>

                {/* QR Code Block */}
                <div className="border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center bg-white shadow-2xs">
                  <img src={qrSvgUrl} alt="Invoice QR" className="w-16 h-16 object-contain" />
                  <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                    Scan to Verify
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TRANSPORTER DELIVERY WAYBILL & GATE PASS          */}
          {/* ======================================================== */}
          {activeDoc === 'waybill' && (
            <div className="space-y-4">
              
              {/* Waybill Subheader Banner */}
              <div className="bg-indigo-900 text-white p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 block">
                    Consignment Manifest & Road Transit Waybill
                  </span>
                  <h4 className="text-sm font-extrabold">Waybill Number: {waybillNumber}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-lg border border-indigo-700">
                    Corridor Clearance Approved
                  </span>
                </div>
              </div>

              {/* Transit Routing & Vehicle Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Origin Consignor (Farm Depot)</span>
                  <p className="font-bold text-slate-900 mt-0.5">{item.listing?.farmer?.name || 'Local Farm Aggregator'}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {pickupLocation}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">2. Designated Freight Carrier</span>
                  <p className="font-bold text-slate-900 mt-0.5">{transporterName}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {transporterPhone}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Vehicle: KDA 824L (5-Tonne Isuzu)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Destination Consignee (Store)</span>
                  <p className="font-bold text-slate-900 mt-0.5">{order.buyer?.businessName || order.buyer?.name || 'Wholesale Buyer'}</p>
                  <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {dropoffLocation}
                  </p>
                </div>
              </div>

              {/* Cargo Specification Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-extrabold border-b">
                    <tr>
                      <th className="py-2 px-3">Cargo Commodity</th>
                      <th className="py-2 px-3 text-center">Package Format</th>
                      <th className="py-2 px-3 text-center">Total Net Weight</th>
                      <th className="py-2 px-3 text-center">Quality Grade</th>
                      <th className="py-2 px-3 text-right">Cold-Chain Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900">{cropName}</td>
                      <td className="py-3 px-3 text-center text-slate-600">Standard Wholesale Crates / Bags</td>
                      <td className="py-3 px-3 text-center font-bold font-mono text-emerald-800">{quantity.toLocaleString()} kg</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{item.listing?.grade || 'GRADE_A'}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">Standard Ventilated</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Delivery OTP Security Strip */}
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                    4-Digit Delivery Verification OTP
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Driver presents this PIN to the receiving storekeeper upon physical cargo inspection.
                  </p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-xs font-mono font-black text-base text-amber-900">
                  {shipment.confirmationOtp || 'OTP-****'}
                </div>
              </div>

              {/* Authorized Signatures & Gate Pass Stamp */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-3">
                    Driver / Transporter Dispatch Sign-Off:
                  </span>
                  <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end">
                    <span className="text-[10px] font-mono text-slate-400">Sign: ___________________________</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Name: {transporterName}</span>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-3">
                    Consignee Receiving Officer / Gate Clearance:
                  </span>
                  <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end">
                    <span className="text-[10px] font-mono text-slate-400">Sign: ___________________________</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Produce Inspected & Accepted</span>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT FOOTER */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>Generated electronically via AgriShamba B2B SCM Platform (Kenya)</span>
            <span className="font-mono">Page 1 of 1</span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* BOTTOM ACTION BAR (Print, Share, Download)               */}
        {/* ======================================================== */}
        <div className="pt-4 mt-2 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 no-print">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
            title="Send formal document summary to customer via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
