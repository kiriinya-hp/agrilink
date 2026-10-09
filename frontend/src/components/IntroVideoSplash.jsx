import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, ArrowRight, Play, Sprout } from 'lucide-react';

export default function IntroVideoSplash({ onComplete }) {
  const videoRef = useRef(null);
  // User requested video does NOT start muted
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure audio is enabled
    video.muted = false;

    const handleEnded = () => {
      handleSkip();
    };

    video.addEventListener('ended', handleEnded);

    // Attempt unmuted autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsInteraction(false);
        })
        .catch((err) => {
          // If browser security policy blocks unmuted autoplay without interaction
          console.warn('Unmuted autoplay prevented by browser policy:', err);
          setNeedsInteraction(true);
          setIsPlaying(false);
        });
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500); // 500ms smooth fade transition
  };

  const handleStartWithAudio = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    video.play()
      .then(() => {
        setIsPlaying(true);
        setNeedsInteraction(false);
      })
      .catch((err) => {
        console.error('Play error:', err);
      });
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (needsInteraction) {
      handleStartWithAudio(e);
      return;
    }

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-500 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Display Container - Pure HD Sharp Native Aspect (object-contain) */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-pointer bg-black"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src="/intro.mp4"
          playsInline
          autoPlay
          preload="auto"
          muted={isMuted}
          className="w-full h-full object-contain max-h-screen max-w-full"
          style={{
            imageRendering: '-webkit-optimize-contrast',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />

        {/* Browser Autoplay Intercept Prompt (Shows only if browser blocks unmuted sound before 1st click) */}
        {needsInteraction && (
          <div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 backdrop-blur-2xs p-4 text-center cursor-pointer"
            onClick={handleStartWithAudio}
          >
            <div className="flex flex-col items-center gap-4 max-w-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-2xl animate-pulse">
                <Play className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 fill-emerald-400 ml-1.5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-white text-lg sm:text-xl font-black tracking-tight">
                  Mazao Hub Premiere
                </h3>
                <p className="text-emerald-300 text-xs sm:text-sm font-semibold">
                  Tap anywhere to play with HD sound
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartWithAudio}
                className="mt-2 flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play With Sound</span>
              </button>
            </div>
          </div>
        )}

        {/* Brief Paused Indicator */}
        {!isPlaying && !needsInteraction && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-2xs pointer-events-none transition-opacity">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Top Floating Sleek Controls Bar (Unobtrusive) */}
      <div className="absolute top-4 sm:top-6 left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between z-40 pointer-events-auto">
        {/* Minimal Brand Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg text-white">
          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shadow-xs">
            <Sprout className="w-3 h-3 text-white" />
          </div>
          <span className="font-extrabold text-xs tracking-tight">
            Mazao<span className="text-emerald-400">Hub</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle (starts unmuted) */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg hover:scale-105"
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

          {/* Minimal Skip Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-xs font-extrabold backdrop-blur-md transition-all hover:scale-105 border border-white/20 shadow-lg"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* NOTE: Bottom progress bar & info bar removed as requested */}
    </div>
  );
}
