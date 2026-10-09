import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, ArrowRight, Play, Pause, Sparkles, Sprout } from 'lucide-react';

export default function IntroVideoSplash({ onComplete }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleSkip();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Attempt autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Video autoplay prevented by browser policy:', err);
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600); // 600ms fade transition
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-radial from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Video Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src="/intro.mp4"
          playsInline
          autoPlay
          muted={isMuted}
          className="w-full h-full object-cover sm:object-contain max-h-screen"
        />

        {/* Play/Pause Center Indicator (shows briefly when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs transition-opacity">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 sm:top-6 left-4 right-4 sm:left-8 sm:right-8 flex items-center justify-between z-20 pointer-events-auto">
        {/* Brand Chip */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-lg text-white">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-xs">
            <Sprout className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-xs tracking-tight">
            Agri<span className="text-emerald-400">Link</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] text-emerald-300 font-mono border-l border-white/15 pl-2 uppercase tracking-wider">
            Ecosystem Premiere
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg hover:scale-105"
            title={isMuted ? 'Turn Sound On' : 'Mute Video'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline text-[11px]">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-[11px]">Sound On</span>
              </>
            )}
          </button>

          {/* Skip Intro Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xl hover:shadow-emerald-500/20 transition-all hover:scale-105 border border-emerald-400/40"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Progress & Info Bar */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 sm:left-8 sm:right-8 z-20 pointer-events-auto">
        <div className="max-w-2xl mx-auto flex flex-col gap-2 bg-slate-900/85 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-2xl">
          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Connecting Farmers, Transporters & Wholesale Buyers across Kenya</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
              Tap video to play / pause
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
