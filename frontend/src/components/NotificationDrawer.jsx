import React from 'react';
import { Bell, Mail, MessageSquare, Phone, X, CheckCheck, ExternalLink, ShieldCheck } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications = [], onMarkAllRead }) {
  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'WHATSAPP':
        return <Phone className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Notification Center</h3>
                <p className="text-[11px] text-slate-500">Live Email, SMS & WhatsApp Alerts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader / Actions */}
          <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">{notifications.length} Total Messages</span>
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear Unread
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[10px] mt-1 text-slate-400">Disbursement receipts and SMS alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => {
                let meta = null;
                try {
                  meta = n.metadata ? (typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata) : null;
                } catch {
                  meta = null;
                }

                return (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      n.read ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-white border-emerald-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100">
                          {getTypeIcon(n.type)}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {n.type} ALERT
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 mt-2 text-xs">{n.title}</h4>
                    <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{n.message}</p>

                    {meta?.whatsappLink && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <a
                          href={meta.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-[10px] font-bold border border-green-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Open in WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
