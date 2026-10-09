import React, { useState, useEffect } from 'react';
import { Phone, X, RefreshCw, Send, CheckCircle2, Smartphone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function UssdSimulatorModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [dialCode, setDialCode] = useState('*384*50#');
  const [sessionActive, setSessionActive] = useState(false);
  const [screenText, setScreenText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [historyText, setHistoryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  if (!isOpen) return null;

  const handleDial = async () => {
    setLoading(true);
    setHistoryText('');
    setUserInput('');
    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'SESSION_' + Date.now(),
          serviceCode: dialCode,
          phoneNumber,
          text: ''
        })
      });
      const data = await res.text();
      setSessionActive(true);
      if (data.startsWith('CON ')) {
        setScreenText(data.replace('CON ', ''));
        setIsSessionEnded(false);
      } else if (data.startsWith('END ')) {
        setScreenText(data.replace('END ', ''));
        setIsSessionEnded(true);
      } else {
        setScreenText(data);
      }
    } catch (err) {
      setScreenText('Connection failed. Network unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInput = async () => {
    if (!userInput.trim() || isSessionEnded) return;

    setLoading(true);
    const nextText = historyText ? `${historyText}*${userInput.trim()}` : userInput.trim();
    setHistoryText(nextText);
    setUserInput('');

    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'SESSION_LIVE',
          serviceCode: dialCode,
          phoneNumber,
          text: nextText
        })
      });
      const data = await res.text();
      if (data.startsWith('CON ')) {
        setScreenText(data.replace('CON ', ''));
        setIsSessionEnded(false);
      } else if (data.startsWith('END ')) {
        setScreenText(data.replace('END ', ''));
        setIsSessionEnded(true);
      } else {
        setScreenText(data);
      }
    } catch (err) {
      setScreenText('USSD Error: Request timeout.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (val) => {
    if (!sessionActive) {
      setDialCode(prev => prev + val);
    } else {
      setUserInput(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    if (!sessionActive) {
      setDialCode(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  const handleEndCall = () => {
    setSessionActive(false);
    setScreenText('');
    setHistoryText('');
    setUserInput('');
    setIsSessionEnded(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-200">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">Rural USSD Gateway Simulator</h3>
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  *384*50#
                </span>
              </div>
              <p className="text-xs text-slate-500">Live test for smallholder farmers using basic feature phones (Kabambe)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="my-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Zero Internet & Smartphone Required</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Farmers dial <strong className="font-mono">*384*50#</strong> on any 2G Safaricom or Airtel feature phone to check commodity wholesale prices, publish harvests, or enter their 4-digit Delivery OTP.
            </p>
          </div>
        </div>

        {/* Realistic Mobile Feature Phone Device Frame */}
        <div className="bg-slate-900 p-5 rounded-3xl shadow-xl border-4 border-slate-800 max-w-sm mx-auto w-full text-white">
          
          {/* Top Speaker Earphone Grill */}
          <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

          {/* Retro Monochromatic USSD Display Screen */}
          <div className="bg-[#a3b899] text-slate-900 p-3.5 rounded-xl border-2 border-[#809677] font-mono shadow-inner min-h-[160px] flex flex-col justify-between">
            
            {/* Top Signal Bar */}
            <div className="flex justify-between items-center text-[9px] border-b border-[#809677]/60 pb-1 mb-1 font-bold">
              <span>SAFARICOM 2G</span>
              <span>100% 🔋</span>
            </div>

            {/* Screen Output Area */}
            <div className="flex-1 py-1 text-xs whitespace-pre-line leading-tight font-semibold">
              {loading ? (
                <div className="flex items-center gap-1.5 justify-center py-6 text-slate-700">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading USSD...</span>
                </div>
              ) : sessionActive ? (
                <div>
                  <p>{screenText}</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-sm font-bold block">{dialCode}</span>
                  <span className="text-[10px] text-slate-700 block mt-1">Press CALL to dial Mazao Hub</span>
                </div>
              )}
            </div>

            {/* In-Session User Input Box */}
            {sessionActive && !isSessionEnded && (
              <div className="mt-2 pt-1 border-t border-[#809677]/70 flex gap-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInput()}
                  placeholder="Enter option..."
                  className="w-full bg-[#b8cca8] border border-[#809677] px-2 py-1 text-xs font-mono font-bold text-slate-900 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSendInput}
                  className="bg-[#6b8262] text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#5b7053]"
                >
                  Send
                </button>
              </div>
            )}

            {isSessionEnded && (
              <div className="mt-2 pt-1 border-t border-[#809677]/70 text-center">
                <button
                  onClick={handleEndCall}
                  className="text-[10px] font-bold bg-[#6b8262] text-white px-3 py-1 rounded"
                >
                  OK / End Session
                </button>
              </div>
            )}
          </div>

          {/* Action Call & Hangup Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {!sessionActive ? (
              <button
                onClick={handleDial}
                disabled={loading}
                className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Dial *384*50#</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSendInput}
                  disabled={loading || isSessionEnded}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>

          {/* Keypad Buttons 0-9, *, # */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-slate-200">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyPress(k)}
                className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 py-2 rounded-lg text-xs font-bold text-center border border-slate-700 shadow-inner transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
          
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={handleBackspace}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded"
            >
              ⌫ Clear
            </button>
          </div>
        </div>

        {/* Quick Menu Cheat-Sheet for testing */}
        <div className="mt-5 border-t border-slate-100 pt-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Simulated USSD Quick Shortcuts
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <button
              onClick={() => { handleEndCall(); setDialCode('*384*50*1#'); }}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-700"
            >
              📊 1. Market Rates
            </button>
            <button
              onClick={() => { handleEndCall(); setDialCode('*384*50*2#'); }}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-700"
            >
              🌾 2. List Harvest
            </button>
            <button
              onClick={() => { handleEndCall(); setDialCode('*384*50*3#'); }}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-700"
            >
              💰 3. Escrow Wallet
            </button>
            <button
              onClick={() => { handleEndCall(); setDialCode('*384*50*4#'); }}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-700"
            >
              🔐 4. Delivery OTP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
