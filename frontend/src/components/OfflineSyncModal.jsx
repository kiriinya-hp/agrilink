import React, { useState } from 'react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Send, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { generateListingSms } from '../services/offlineSyncService';

export default function OfflineSyncModal({
  isOpen,
  onClose,
  isOnline,
  pendingQueue = [],
  onSyncAll,
  onRemoveItem
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('Your device is currently offline. Please connect to WiFi or cellular data to synchronize.');
      return;
    }
    setSyncing(true);
    try {
      const count = await onSyncAll();
      setSyncedCount(count);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between text-white ${
          isOnline ? 'bg-gradient-to-r from-emerald-800 to-emerald-600' : 'bg-gradient-to-r from-amber-700 to-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {isOnline ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-amber-200 animate-pulse" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {isOnline ? 'Rural Offline Hub: Online' : 'Rural Offline Mode Active'}
              </h3>
              <p className="text-[11px] text-white/80">
                {isOnline ? 'Internet connected — all local data ready to sync' : 'Zero-data fallback & SMS Shamba Gateway'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          
          {/* Status summary card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isOnline ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold">
                {isOnline ? 'Auto-Sync Operational' : 'No Data Connection Detected'}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {isOnline 
                  ? 'All listings and market updates browse without lag from your phone cache. Any offline drafts can now be published in one tap.' 
                  : 'You can draft harvests freely without internet. Your shamba listings are stored securely on your phone, or you can send via regular SMS without internet data bundle.'}
              </p>
            </div>
          </div>

          {/* Pending Drafts Queue Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Pending Outbox Drafts ({pendingQueue.length})</span>
              </h4>
              {pendingQueue.length > 0 && isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Sync All Now</span>
                </button>
              )}
            </div>

            {pendingQueue.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-xl border-slate-200 bg-slate-50">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                <p className="text-xs font-bold text-slate-700">Outbox Queue Clean</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All shamba listings are synchronized with the live server.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingQueue.map((item) => {
                  const sms = generateListingSms(item.payload);
                  return (
                    <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{item.payload?.cropName || 'Harvest'}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                              Saved Offline
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.payload?.availableQty} kg · KES {item.payload?.unitPrice ? Math.round(item.payload.unitPrice * 130) : 0}/kg · {item.payload?.location}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          Discard
                        </button>
                      </div>

                      {/* SMS Fallback Action */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>SMS Shortcut:</span>
                        </span>
                        <a
                          href={sms.smsUrl}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send via Free SMS</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SMS Manual Command Guide */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <MessageSquare className="w-4 h-4" />
              <span>SMS Shamba Fallback Codes</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When working in areas without Safaricom or Airtel data bundle, text our toll-free shortcode:
            </p>
            <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-[11px] space-y-1 text-slate-200 border border-slate-700">
              <div className="text-emerald-400 font-bold">To: 22000 (AgriShamba SMS)</div>
              <div>• <strong>AGRI LIST</strong> [Crop]*[Kg]*[PriceKES]*[County]</div>
              <div>• <strong>AGRI PRICE</strong> [Crop] (e.g. AGRI PRICE Tomatoes)</div>
              <div>• <strong>AGRI BALANCE</strong> (Check escrow wallet)</div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          {isOnline && pendingQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : `Sync ${pendingQueue.length} Pending`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
