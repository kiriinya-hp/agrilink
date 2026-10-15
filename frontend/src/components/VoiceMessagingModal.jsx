import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Send, 
  X, 
  Volume2, 
  MessageSquare, 
  Radio, 
  Languages,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';

export default function VoiceMessagingModal({
  isOpen,
  onClose,
  order,
  currentUser,
  apiBase
}) {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('sw'); // 'sw' | 'sheng' | 'en'
  const [sending, setSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordIntervalRef = useRef(null);

  const orderId = order?.id || 'general';

  // Fetch messages for this order
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${apiBase}/messages?orderId=${orderId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]);

  // Start Real Browser Audio Recording (MediaRecorder)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result;
          handleSendVoiceMessage(base64data, recordingSeconds || 5);
        };
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      // Fallback: If hardware mic is blocked, provide prompt template
      setInputText(
        language === 'sw' 
          ? 'Habari, mzigo uko tayari kupakiwa shambani. Lori litawasili saa ngapi?'
          : 'Hello, the harvest is bagged and ready for dispatch. What time will the truck arrive?'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordIntervalRef.current);
    }
  };

  const handleSendVoiceMessage = async (audioBase64, duration) => {
    setSending(true);
    try {
      const recipientId = currentUser?.role === 'FARMER'
        ? order?.buyerId
        : order?.items?.[0]?.listing?.farmerId;

      await fetch(`${apiBase}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          senderId: currentUser?.id,
          senderName: currentUser?.name || 'AgriShamba Trader',
          senderRole: currentUser?.role || 'FARMER',
          recipientId,
          audioBase64: audioBase64 || '',
          textTranslation: inputText.trim() || (language === 'sw' ? 'Ujumbe wa sauti umerekodiwa' : 'Voice note recorded'),
          language,
          durationSeconds: duration || 6
        })
      });

      setInputText('');
      fetchMessages();
    } catch (e) {
      console.error('Failed to post voice note:', e);
    } finally {
      setSending(false);
      setRecordingSeconds(0);
    }
  };

  const handleSendTextNote = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await handleSendVoiceMessage('', 5);
  };

  // Synthetic Audio Player using SpeechSynthesis or Audio element
  const playVoiceNote = (msg) => {
    if (playingMsgId === msg.id) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    if (msg.audioUrl && msg.audioUrl.startsWith('data:audio')) {
      const audio = new Audio(msg.audioUrl);
      setPlayingMsgId(msg.id);
      audio.play();
      audio.onended = () => setPlayingMsgId(null);
    } else {
      // SpeechSynthesis playback in Swahili/English
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg.textTranslation);
        utterance.lang = msg.language === 'sw' ? 'sw-KE' : 'en-KE';
        utterance.rate = 0.95;
        setPlayingMsgId(msg.id);
        utterance.onend = () => setPlayingMsgId(null);
        utterance.onerror = () => setPlayingMsgId(null);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Mic className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Farmer & Buyer Voice Room
              </h3>
              <p className="text-[11px] text-emerald-200/90">
                Swahili / Sheng voice notes with real-time transcriptions
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Context Info Strip */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div>
            Order: <strong className="text-slate-800">#{order?.orderNumber || 'AGRI-TRADE'}</strong> · {order?.items?.[0]?.cropName || 'Fresh Produce'}
          </div>
          <div className="flex items-center gap-1 font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow Protected Trade</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs font-bold text-slate-600">No voice messages yet</p>
              <p className="text-[11px]">Hold the microphone button below to send an instant Swahili or English voice note to your trade partner.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUser?.id || m.senderRole === currentUser?.role;
              const isPlaying = playingMsgId === m.id;

              return (
                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                    {m.senderName} ({m.senderRole})
                  </span>
                  
                  <div className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 shadow-xs ${
                    isMine 
                      ? 'bg-emerald-600 text-white rounded-br-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                  }`}>
                    {/* Audio Player Bar */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => playVoiceNote(m)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all ${
                          isMine 
                            ? 'bg-white text-emerald-800 hover:bg-emerald-50' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      {/* Sound Wave Animation */}
                      <div className="flex items-center gap-0.5 h-6 flex-1 px-2">
                        {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 60].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all ${isMine ? 'bg-white/80' : 'bg-emerald-600/70'} ${
                              isPlaying ? 'animate-pulse' : ''
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>

                      <span className={`text-[10px] font-mono font-bold shrink-0 ${isMine ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {m.durationSeconds}s
                      </span>
                    </div>

                    {/* Speech Transcript */}
                    <p className={`text-xs leading-relaxed italic ${isMine ? 'text-emerald-50' : 'text-slate-600'}`}>
                      "{m.textTranslation}"
                    </p>
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Voice & Text Input */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          
          {/* Language Selection */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>Language:</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === 'sw' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}
              >
                Kiswahili
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${language === 'en' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'}`}
              >
                English
              </button>
            </div>
          </div>

          <form onSubmit={handleSendTextNote} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? `Recording voice note... (${recordingSeconds}s)` : "Type a note or hold mic to speak..."}
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />

            {/* Mic Button */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-sm shrink-0 ${
                isRecording 
                  ? 'bg-rose-600 animate-ping ring-4 ring-rose-300' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title="Hold to Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>

            {inputText.trim() && (
              <button
                type="submit"
                disabled={sending}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

        </div>

      </div>
    </div>
  );
}
