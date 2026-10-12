import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Sprout,
  MapPin,
  Calendar,
  Package,
  Truck,
  ShieldCheck,
  Download,
  Printer,
  User,
  Hash,
  ClipboardList,
} from 'lucide-react';

const TRACE_BASE = 'https://agrilink-pyrv.onrender.com/trace';

export default function ProducePassportModal({ order, onClose }) {
  const printRef = useRef(null);

  if (!order) return null;

  const item = order.items?.[0];
  const listing = item?.listing;
  const farmer = listing?.farmer;
  const shipment = order.shipment;
  const transporter = shipment?.transporter;

  const traceUrl = `${TRACE_BASE}/${order.id}`;

  const harvestDate = listing?.harvestDate
    ? new Date(listing.harvestDate).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'N/A';

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=700,height=900');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Produce Passport — ${order.orderNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1e293b; }
          .passport-card { max-width: 680px; margin: 0 auto; padding: 32px; border: 2px solid #064e3b; border-radius: 16px; }
          .header { background: #064e3b; color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
          .header h1 { font-size: 22px; font-weight: 800; }
          .header p { font-size: 12px; opacity: 0.85; margin-top: 2px; }
          .badge { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; }
          .qr-block { display: flex; justify-content: center; margin: 20px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .info-item { background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .info-item .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; margin-bottom: 4px; }
          .info-item .value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .escrow-row { background: #ecfdf5; border: 1px solid #6ee7b7; padding: 12px 16px; border-radius: 10px; margin-top: 16px; display: flex; align-items: center; gap: 10px; }
          .escrow-row .ref { font-size: 14px; font-weight: 800; color: #065f46; }
          .footer-note { margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-sm leading-none">🏷️ Digital Produce Passport</h2>
              <p className="text-emerald-200 text-[10px] mt-0.5">Farm-to-Market Traceability — AgriShamba</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Printable content */}
          <div ref={printRef}>
            <div className="passport-card" style={{
              border: '2px solid #064e3b',
              borderRadius: 16,
              padding: 24,
              background: '#fff'
            }}>
              {/* Passport header block */}
              <div style={{
                background: 'linear-gradient(135deg, #064e3b, #065f46)',
                color: 'white',
                padding: '16px 20px',
                borderRadius: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>🌾 AgriShamba</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Toka Shambani Hadi Sokoni</div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  PRODUCE PASSPORT
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-5">
                <div className="border-4 border-emerald-800 rounded-2xl p-3 bg-white shadow-lg">
                  <QRCodeSVG
                    value={traceUrl}
                    size={160}
                    fgColor="#064e3b"
                    bgColor="#ffffff"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Order number under QR */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-sm font-extrabold text-slate-800">{order.orderNumber}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Scan QR to verify provenance online</p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <Sprout className="w-3 h-3" /> Crop
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{item?.cropName || 'N/A'}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{listing?.grade || ''} · {listing?.category || ''}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <Package className="w-3 h-3" /> Quantity
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{item?.quantity || 0} kg</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Order date: {orderDate}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <User className="w-3 h-3" /> Farmer
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{farmer?.name || 'Unknown'}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{farmer?.businessName || ''}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-slate-600 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <MapPin className="w-3 h-3" /> Farm Location
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{farmer?.location || listing?.location || 'Kenya'}</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-amber-700 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <Calendar className="w-3 h-3" /> Harvest Date
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{harvestDate}</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-1 text-blue-700 font-bold uppercase tracking-wide text-[10px] mb-1">
                    <Truck className="w-3 h-3" /> Transporter
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{transporter?.name || 'Pending Assignment'}</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">{transporter?.businessName || ''}</div>
                </div>

              </div>

              {/* Destination */}
              <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div>
                  <div className="text-indigo-600 font-bold uppercase tracking-wide text-[10px]">Delivery Destination</div>
                  <div className="font-bold text-slate-900">{order.deliveryAddress}</div>
                </div>
              </div>

              {/* Escrow badge */}
              <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-emerald-700 font-bold text-[10px] uppercase tracking-wide">AgriShamba Escrow Protected</div>
                  <div className="font-mono font-extrabold text-emerald-900 text-sm">{order.escrowTransaction?.id?.slice(0, 16)?.toUpperCase() || order.id.slice(0, 16).toUpperCase()}</div>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>{order.status}</span>
                </div>
                <div className="text-slate-400">
                  agrilink-pyrv.onrender.com
                </div>
              </div>

            </div>
          </div>

          {/* Trace URL pill */}
          <div className="bg-slate-100 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 mb-1 font-medium">Public Traceability URL</p>
            <a
              href={traceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-mono text-xs font-bold break-all hover:underline"
            >
              {traceUrl}
            </a>
          </div>

        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

      </div>
    </div>
  );
}
