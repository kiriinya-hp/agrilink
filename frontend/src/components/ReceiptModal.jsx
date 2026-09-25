import React from 'react';
import { ShieldCheck, Printer, Share2, X, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const item = order.items?.[0] || {};
  const cropName = item.cropName || 'Fresh Produce';
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const produceTotal = order.totalAmount || (quantity * unitPrice);
  const transportFee = order.transportFee || 25.00;
  const platformFee = order.platformFee || (produceTotal * 0.05);
  const grandTotal = order.grandTotal || (produceTotal + transportFee + platformFee);

  const whatsappMessage = `*AGRILINK OFFICIAL DISBURSEMENT RECEIPT*\n` +
    `---------------------------------------\n` +
    `*Order Number:* ${order.orderNumber}\n` +
    `*Status:* COMPLETED & SETTLED (ESCROW RELEASED)\n` +
    `*Produce:* ${quantity} kg of ${cropName}\n` +
    `*Delivery To:* ${order.deliveryAddress}\n` +
    `---------------------------------------\n` +
    `*Total Escrow Held:* $${grandTotal.toFixed(2)}\n` +
    `• Farmer Payout: $${produceTotal.toFixed(2)}\n` +
    `• Freight Fee: $${transportFee.toFixed(2)}\n` +
    `• Platform SCM Fee (5%): $${platformFee.toFixed(2)}\n` +
    `---------------------------------------\n` +
    `Verified via 4-Digit Delivery OTP. Funds disbursed to registered M-Pesa accounts.\n` +
    `Thank you for using AgriLink!`;

  const buyerPhone = order.buyer?.phone?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${buyerPhone}&text=${encodeURIComponent(whatsappMessage)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Official Settlement Invoice</span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Order #{order.orderNumber}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Stamp */}
        <div className="my-5 p-4 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-900">ESCROW DISBURSED & SETTLED</p>
              <p className="text-[11px] text-emerald-700">Verified via 4-Digit OTP Confirmation & M-Pesa Rails</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
              ACID AUDITED
            </span>
          </div>
        </div>

        {/* Invoice Details Table */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Buyer / Procurement:</span>
              <span className="font-bold text-slate-800">{order.buyer?.name || 'Commercial Buyer'}</span>
              <span className="text-[10px] text-slate-500 block">{order.buyer?.phone}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Destination:</span>
              <span className="font-bold text-slate-800">{order.deliveryAddress}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 mb-2 uppercase text-[11px]">Settlement Line Breakdown</h4>
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 uppercase text-[10px] text-slate-500 font-bold">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-center">Volume</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Disbursed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-800 block">{cropName}</span>
                    <span className="text-[10px] text-slate-400">Paid to Primary Producer</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">{quantity} kg</td>
                  <td className="py-2.5 px-3 text-right">${unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">${produceTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3" colSpan="3">
                    <span className="font-bold text-slate-800 block">Logistics & Freight Payout</span>
                    <span className="text-[10px] text-slate-400">Paid to Transporter Fleet</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">${transportFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3" colSpan="3">
                    <span className="font-bold text-slate-800 block">AgriLink SCM Platform Commission (5%)</span>
                    <span className="text-[10px] text-slate-400">Escrow Security & Transaction Clearing</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">${platformFee.toFixed(2)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-xs">
                  <td className="py-3 px-3" colSpan="3">TOTAL ESCROW TRANSACTION VALUE:</td>
                  <td className="py-3 px-3 text-right text-emerald-800 text-sm font-black">${grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border space-y-1">
            <p><strong>Payment Reference:</strong> {order.escrowTransaction?.reference || 'ESC-MPESA-8842194'}</p>
            <p><strong>Disbursement Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Platform:</strong> AgriLink B2B Agribusiness SCM (Kenya)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share via WhatsApp
          </a>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
