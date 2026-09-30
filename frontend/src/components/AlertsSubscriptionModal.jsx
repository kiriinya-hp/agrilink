import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Trash2, 
  Check, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  TrendingDown, 
  TrendingUp, 
  Sprout, 
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useCurrency } from './CurrencyUnitContext';

export default function AlertsSubscriptionModal({ 
  isOpen, 
  onClose, 
  user, 
  defaultCrop = 'Tomatoes' 
}) {
  const { formatMoney, currency } = useCurrency();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [cropName, setCropName] = useState(defaultCrop);
  const [alertType, setAlertType] = useState('PRICE_DROP');
  const [targetPriceKes, setTargetPriceKes] = useState(90);
  const [channel, setChannel] = useState('SMS');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (isOpen) {
      setCropName(defaultCrop);
      setPhone(user?.phone || '');
      setEmail(user?.email || '');
      fetchAlerts();
      setSuccessMsg('');
    }
  }, [isOpen, defaultCrop, user]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?userId=${user?.id || ''}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          cropName,
          alertType,
          targetPriceKes,
          channel,
          phone,
          email
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`🎉 Success! Alert set for ${cropName}. You will receive ${channel} notifications.`);
        fetchAlerts();
      } else {
        alert(data.error || 'Failed to activate alert');
      }
    } catch (err) {
      alert('Error creating alert subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAlerts(alerts.filter(a => a.id !== id));
      }
    } catch (err) {
      console.warn('Error deleting alert:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">SMS & WhatsApp Price & Harvest Alerts</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  SAFARICOM NOTIFICATIONS
                </span>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">Instant mobile notifications when wholesale prices drop or farmers list new crops</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* New Subscription Form */}
          <form onSubmit={handleSubscribe} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase font-mono text-slate-700 tracking-wider">
              Set Up a New Agricultural Market Alert
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Crop / Commodity</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tomatoes">🍅 Tomatoes (Roma / Anna F1)</option>
                  <option value="Red Bulb Onions">🧅 Red Bulb Onions</option>
                  <option value="Shangi Potatoes">🥔 Shangi Irish Potatoes</option>
                  <option value="White Maize">🌽 Dry White Maize Grains</option>
                  <option value="Hass Avocados">🥑 Hass Avocados (Export)</option>
                  <option value="Sukuma Wiki">🥬 Sukuma Wiki / Cabbages</option>
                  <option value="Watermelon">🍉 Watermelons (Sukari F1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trigger Condition</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PRICE_DROP">📉 Price Drop (Notify when price drops below target)</option>
                  <option value="NEW_HARVEST">🌱 New Harvest (Notify whenever a farmer lists fresh batch)</option>
                  <option value="MARKET_SURGE">📈 Market Surge (Notify when wholesale prices increase)</option>
                  <option value="CHAMA_POOL">📦 Cooperative Pool (Notify when Chama aggregation opens)</option>
                </select>
              </div>
            </div>

            {alertType === 'PRICE_DROP' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Target Price Threshold (KES / kg)</label>
                  <span className="text-xs font-black text-emerald-700 font-mono">KES {targetPriceKes}/kg</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={targetPriceKes}
                  onChange={(e) => setTargetPriceKes(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}

            {/* Notification Channel Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SMS', label: 'SMS Prompt', icon: Smartphone, desc: 'Safaricom SMS' },
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, desc: 'Instant Message' },
                  { id: 'EMAIL', label: 'Email Alert', icon: Mail, desc: 'Digest & PDF' }
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-emerald-600" />
                      <span className="text-xs font-bold block">{ch.label}</span>
                      <span className="text-[10px] text-slate-500">{ch.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Mobile Phone (SMS / WhatsApp)</label>
                <input
                  type="tel"
                  required
                  placeholder="+254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@domain.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>{submitting ? 'Activating Subscription...' : 'Activate Instant Market Alert'}</span>
            </button>
          </form>

          {/* Active Subscriptions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase font-mono text-slate-400 tracking-wider flex items-center justify-between">
              <span>Your Active Market Subscriptions ({alerts.length})</span>
              <button onClick={fetchAlerts} className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </h4>

            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                No active market alerts set yet. Choose a crop above to get notified when prices drop or fresh harvests are posted.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{al.cropName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                            {al.channel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Trigger: <strong>{al.alertType.replace('_', ' ')}</strong> {al.targetPriceKes ? `(under KES ${al.targetPriceKes}/kg)` : ''} · To: {al.phone || al.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(al.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Cancel Alert Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
