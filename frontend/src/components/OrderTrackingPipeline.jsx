import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Package, 
  MapPin, 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Navigation, 
  Printer, 
  QrCode, 
  Share2, 
  Calendar, 
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Radio
} from 'lucide-react';
import { useCurrency } from './CurrencyUnitContext';

export default function OrderTrackingPipeline({
  order,
  onVerifyDelivery,
  onReportDispute,
  onOpenLiveMap,
  onOpenProducePassport,
  onOpenInvoice,
  onSendWhatsApp,
  otpValue,
  onOtpChange,
  isBuyer = true
}) {
  const { formatMoney } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!order) return null;

  const item = order.items?.[0];
  const shipment = order.shipment;
  const escrow = order.escrowTransaction;
  const isCompleted = order.status === 'COMPLETED';
  const isDisputed = order.status === 'DISPUTED';

  // Determine current active pipeline stage (0 to 4)
  const getStageIndex = () => {
    if (order.status === 'COMPLETED' || shipment?.transitStatus === 'DELIVERED') return 4;
    if (shipment?.transitStatus === 'ARRIVED') return 3;
    if (order.status === 'IN_TRANSIT' || shipment?.transitStatus === 'IN_TRANSIT' || shipment?.transitStatus === 'PICKED_UP') return 2;
    if (order.status === 'DISPATCH_READY' || shipment?.transitStatus === 'ASSIGNED' || shipment?.transitStatus === 'ACCEPTED') return 1;
    if (order.status === 'ESCROW_FUNDED' || order.status === 'PAID_ESCROW' || escrow?.status === 'HELD') return 1;
    return 0; // PENDING
  };

  const currentStageIndex = getStageIndex();

  const stages = [
    {
      title: 'Order Placed & Escrow Funded',
      subtitle: escrow?.paymentGateway ? `Secured via M-Pesa Escrow (${formatMoney(order.grandTotal || 0)})` : 'Buyer payment locked in safe escrow',
      icon: DollarSign,
      time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Confirmed'
    },
    {
      title: 'Farm Harvest & Quality Graded',
      subtitle: `Producer ${order.farmer?.name || 'Local Farmer'} prepared & verified Grade A packaging`,
      icon: Package,
      time: 'Ready for pickup'
    },
    {
      title: 'Loaded & Highway Transit',
      subtitle: shipment?.vehicleReg ? `Dispatched via ${shipment.vehicleReg} (${shipment.transporter?.name || 'Verified Carrier'})` : 'En-route along regional arterial corridor',
      icon: Truck,
      time: 'In Transit'
    },
    {
      title: 'Arrived at Destination Hub',
      subtitle: `Reached ${order.deliveryAddress || 'Delivery Address'} • Handshake inspection pending`,
      icon: MapPin,
      time: 'Arrival Handshake'
    },
    {
      title: 'Inspected & Escrow Released',
      subtitle: 'Buyer confirmed OTP • Instant M-Pesa mobile payout settled to Farmer & Carrier',
      icon: CheckCircle2,
      time: isCompleted ? 'Completed' : 'Final Step'
    }
  ];

  // Dynamic ETA calculation
  const getEtaString = () => {
    if (isCompleted) return 'Delivered & Completed';
    if (currentStageIndex === 3) return 'Arrived — Complete OTP to Release Funds';
    if (currentStageIndex === 2) return 'Estimated Delivery: ~1 hr 45 min';
    if (currentStageIndex === 1) return 'Pickup Scheduled: Carrier Dispatching';
    return 'Processing Escrow Clearance';
  };

  const transporterPhone = shipment?.transporter?.phone || shipment?.transporterPhone || order.transporter?.phone || '+254700000000';
  const cleanPhone = transporterPhone.replace(/[^0-9]/g, '');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                {order.orderNumber}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-500 text-white' 
                  : isDisputed
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-400 text-slate-950 font-bold'
              }`}>
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                Live SCM Pipeline
              </span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white mt-1">
              {item?.cropName || 'Fresh Produce'} • {item?.quantity ? `${item.quantity.toLocaleString()} kg` : ''}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right sm:mr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Transit ETA</span>
            <span className="text-xs font-bold text-emerald-300 font-mono">
              {getEtaString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isExpanded ? 'Collapse Tracking Pipeline' : 'Expand Tracking Pipeline'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pipeline Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Progress Stepper Bar (Horizontal on tablet/desktop, vertical on mobile) */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (currentStageIndex / (stages.length - 1)) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isUpcoming = idx > currentStageIndex;
                const IconComponent = stage.icon;

                return (
                  <div key={idx} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2">
                    {/* Circle Indicator */}
                    <div className="relative shrink-0">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                          isPassed || (isCompleted && idx === 4)
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 shadow-md animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {isPassed || (isCompleted && idx === 4) ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <IconComponent className="w-4 h-4" />
                        )}
                      </div>
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="sm:text-center min-w-0 flex-1">
                      <span className={`text-[11px] font-black block leading-snug ${
                        isCurrent ? 'text-amber-700' : isPassed ? 'text-emerald-800' : 'text-slate-500'
                      }`}>
                        {stage.title}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                        {stage.subtitle}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        {stage.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Route & Route Telemetry Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Origin & Destination Route */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-emerald-600" />
                Transit Route Corridor
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Farm Gate Origin</span>
                    <strong className="text-slate-900">{shipment?.pickupLocation || order.location || 'Limuru, Kiambu Farm'}</strong>
                    <span className="text-[10px] text-slate-500 block">Producer: {order.farmer?.name || 'Verified Farmer'}</span>
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-slate-300 ml-1 pl-3 py-1">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Direct Escrow Highway Transit (No Middlemen)
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination Dropoff</span>
                    <strong className="text-slate-900">{order.deliveryAddress || 'Wakulima Market, Nairobi'}</strong>
                    <span className="text-[10px] text-slate-500 block">Recipient: {order.buyer?.name || 'Verified Buyer'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrier & Fleet Telemetry */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Truck className="w-3 h-3 text-blue-600" />
                    Assigned Logistics Carrier
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    NTSA Compliant
                  </span>
                </div>

                <div className="mt-2.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Transporter:</span>
                    <strong className="text-slate-900">{shipment?.transporter?.name || 'David Kipchoge (AgriHaul)'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Vehicle / Freight Reg:</span>
                    <strong className="font-mono text-slate-900">{shipment?.vehicleReg || 'KDA 492L (5T Canter)'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Escrow Value:</span>
                    <strong className="font-mono text-emerald-700">{formatMoney(order.grandTotal || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Transporter */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <a
                  href={`tel:${transporterPhone}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Call Driver</span>
                </a>
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, regarding AgriShamba Order #${order.orderNumber} (${item?.cropName}). What is your current transit location?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                {onOpenLiveMap && (
                  <button
                    type="button"
                    onClick={() => onOpenLiveMap(order)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    title="Open Live GPS Satellite Map"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Delivery OTP Handshake & Actions Row */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {isCompleted ? (
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="font-bold text-xs">Delivery Verified &amp; Escrow Released</h5>
                  <p className="text-[11px] text-emerald-700">Both farmer and driver received instant automated payouts via M-Pesa STK.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">
                    {isBuyer ? 'Confirm Inspection & Release Escrow' : 'Awaiting Buyer OTP Verification'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Inspect the produce upon arrival. Enter the driver's 6-digit confirmation code below to release payment from escrow.
                </p>

                {isBuyer && onVerifyDelivery && (
                  <div className="flex items-center gap-2 pt-1 max-w-sm">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="6-digit OTP"
                      value={otpValue || ''}
                      onChange={(e) => onOtpChange && onOtpChange(shipment?.id, e.target.value)}
                      className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-center text-xs tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => onVerifyDelivery(shipment?.id)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      Release Escrow
                    </button>
                  </div>
                )}
                {shipment?.confirmationOtp && (
                  <span className="text-[10px] text-slate-400 block">
                    Driver Verification Code: <strong className="font-mono text-slate-700">{shipment.confirmationOtp}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              {onOpenProducePassport && (
                <button
                  type="button"
                  onClick={() => onOpenProducePassport(order)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Passport QR</span>
                </button>
              )}

              {onOpenInvoice && (
                <button
                  type="button"
                  onClick={() => onOpenInvoice(order)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Invoice</span>
                </button>
              )}

              {onReportDispute && !isCompleted && (
                <button
                  type="button"
                  onClick={() => onReportDispute(order)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Report damaged produce or missing weight to pause escrow"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Report Issue</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
