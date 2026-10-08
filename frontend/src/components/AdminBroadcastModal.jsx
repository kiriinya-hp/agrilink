import React, { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Mail, 
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminBroadcastModal({ token, apiBase, allUsers = [] }) {
  const [targetRole, setTargetRole] = useState('ALL');
  const [channel, setChannel] = useState('SYSTEM');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const TEMPLATES = [
    {
      label: '🌧️ Weather Advisory',
      title: 'Heavy Rainfall Advisory: Protect Harvest in Transit',
      role: 'FARMER',
      channel: 'SMS',
      body: 'Heavy rainfall expected across Nyandarua and Kiambu over the next 48 hours. Ensure harvested produce is stored in waterproof covered shelters before dispatch.'
    },
    {
      label: '📈 Wholesale Price Surge',
      title: 'Market Spike: High Demand for Roma Tomatoes',
      role: 'FARMER',
      channel: 'SYSTEM',
      body: 'Wakulima and Kongowea wholesale markets report a 25% price surge for Grade A Roma Tomatoes. Farmers with active harvest can list now for immediate off-take.'
    },
    {
      label: '🚛 Urgent Freight Loads',
      title: 'Urgent 5-Tonne Cargo Available in Limuru',
      role: 'TRANSPORTER',
      channel: 'SMS',
      body: 'Multiple 3-tonne and 5-tonne produce consignments are awaiting dispatch in Limuru towards Nairobi Central Depot. Open Logistics Board to claim now.'
    },
    {
      label: '🔔 Maintenance Notice',
      title: 'Scheduled Escrow Clearing Maintenance',
      role: 'ALL',
      channel: 'SYSTEM',
      body: 'AgriLink platform will undergo routine database synchronization tonight from 2:00 AM to 2:30 AM EAT. Active escrow transactions remain fully secure.'
    }
  ];

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.body);
    setTargetRole(tpl.role);
    setChannel(tpl.channel);
    setResult(null);
  };

  const calculateRecipients = () => {
    if (targetRole === 'ALL') return allUsers.length;
    return allUsers.filter(u => u.role === targetRole).length;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetRole,
          type: channel,
          title: title.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult({ success: true, text: data.message, count: data.recipientCount });
        setTitle('');
        setMessage('');
      } else {
        setResult({ success: false, text: data.error || 'Failed to dispatch broadcast' });
      }
    } catch (err) {
      setResult({ success: false, text: err.message || 'Network error reaching broadcast server' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 font-bold uppercase">Platform Communication Gateway</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Platform Broadcast & Alert Engine</h2>
          <p className="text-xs text-slate-300 mt-1">
            Dispatch urgent market updates, logistics notifications, and agronomy advisories to targeted stakeholders across Kenya.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-300" />
          <span>Active Stakeholders: {allUsers.length}</span>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${result.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{result.text}</span>
        </div>
      )}

      {/* Main Grid: Composer & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Compose Stakeholder Broadcast
          </h3>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Target Role Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Target Audience:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { role: 'ALL', label: 'All Stakeholders', color: 'slate' },
                  { role: 'FARMER', label: 'Farmers Only', color: 'emerald' },
                  { role: 'BUYER', label: 'Buyers Only', color: 'blue' },
                  { role: 'TRANSPORTER', label: 'Transporters Only', color: 'amber' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => setTargetRole(item.role)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      targetRole === item.role 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Delivery Channel */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Delivery Channel:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SYSTEM', label: 'In-App Alert Center', icon: Radio },
                  { id: 'SMS', label: 'SMS Notification', icon: MessageSquare },
                  { id: 'EMAIL', label: 'Direct Email', icon: Mail }
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => setChannel(ch.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        channel === ch.id
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Announcement Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Highway Traffic Delay or Market Price Surge"
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Announcement Message Body:</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter detailed instructions or alerts for farmers, buyers, or drivers..."
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Will be delivered to <strong>{calculateRecipients()}</strong> registered accounts in MongoDB Atlas.</span>
              </div>

              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Broadcasting...' : `Send Broadcast (${calculateRecipients()})`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Templates & Live Preview (Right col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Advisory Templates
            </h4>
            <div className="space-y-2">
              {TEMPLATES.map((tpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition-all text-xs group"
                >
                  <span className="font-bold text-slate-800 block group-hover:text-indigo-700">{tpl.label}</span>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{tpl.body}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Notification Preview Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">Live Notification Preview</span>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-1">
              <span className="font-bold text-emerald-400 block">
                {title ? `📢 [ANNOUNCEMENT] ${title}` : '📢 [ANNOUNCEMENT] Title Preview'}
              </span>
              <p className="text-[11px] text-slate-300">
                {message || 'Your message body will be displayed here as it appears on stakeholders phones and alerts.'}
              </p>
              <div className="pt-2 flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Audience: {targetRole}</span>
                <span>Channel: {channel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
