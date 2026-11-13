import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Compass, Mail } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface GoldenOceanSceneProps {
  onEnterJourney: () => void;
  onOpenAppsModal: () => void;
  onOpenPublishModal: () => void;
}

export const GoldenOceanScene: React.FC<GoldenOceanSceneProps> = ({
  onEnterJourney,
  onOpenAppsModal,
  onOpenPublishModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [letterGlow, setLetterGlow] = useState(1);

  // Initialize Canvas Ocean & Waves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.55),
      size: Math.random() * 1.8 + 0.4,
      blinkSpeed: Math.random() * 0.03 + 0.01,
      alpha: Math.random()
    }));

    // Floating gold particles on water
    const goldGlints = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: height * 0.52 + Math.random() * (height * 0.48),
      size: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.2 + 0.05,
      alpha: Math.random() * 0.8 + 0.2
    }));

    let time = 0;

    const render = () => {
      time += 0.022;

      // 1. Deep space night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      skyGrad.addColorStop(0, '#020204');
      skyGrad.addColorStop(0.5, '#07070D');
      skyGrad.addColorStop(1, '#110F0A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.55);

      // Stars
      stars.forEach((star) => {
        star.alpha += star.blinkSpeed;
        const currentAlpha = 0.3 + Math.abs(Math.sin(star.alpha)) * 0.7;
        ctx.fillStyle = `rgba(243, 229, 171, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Luminous Golden Crescent Moon & Earth glow in top right
      const moonX = width * 0.82;
      const moonY = height * 0.18;
      const moonRadius = Math.min(width, height) * 0.055;

      // Outer golden moon halo
      const moonHalo = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.3, moonX, moonY, moonRadius * 3.5);
      moonHalo.addColorStop(0, 'rgba(243, 229, 171, 0.45)');
      moonHalo.addColorStop(0.5, 'rgba(212, 175, 55, 0.15)');
      moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonHalo;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Crescent Moon shape
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF8DC';
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 25;
      ctx.fill();

      // Shadow overlay to create crescent
      ctx.beginPath();
      ctx.arc(moonX + moonRadius * 0.45, moonY - moonRadius * 0.1, moonRadius * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = '#060609';
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();

      // 2. The Black & Golden Glossy Sea (البحر الأسود اللامع)
      const horizonY = height * 0.52;
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      seaGrad.addColorStop(0, '#0A0A0E');
      seaGrad.addColorStop(0.35, '#050508');
      seaGrad.addColorStop(1, '#020203');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Golden horizon line glow
      const horizonGlow = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 8);
      horizonGlow.addColorStop(0, 'rgba(212, 175, 55, 0)');
      horizonGlow.addColorStop(0.5, 'rgba(243, 229, 171, 0.4)');
      horizonGlow.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, horizonY - 4, width, 12);

      // Central Golden Moon reflection pillar on water
      const pillarGrad = ctx.createLinearGradient(width * 0.4, horizonY, width * 0.6, height);
      pillarGrad.addColorStop(0, 'rgba(243, 229, 171, 0.35)');
      pillarGrad.addColorStop(0.4, 'rgba(212, 175, 55, 0.18)');
      pillarGrad.addColorStop(1, 'rgba(212, 175, 55, 0.02)');
      ctx.fillStyle = pillarGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.48, horizonY);
      ctx.lineTo(width * 0.52, horizonY);
      ctx.lineTo(width * 0.65, height);
      ctx.lineTo(width * 0.35, height);
      ctx.closePath();
      ctx.fill();

      // Multi-layer glossy wave ripples with metallic gold reflections
      const waveLayers = [
        { yOffset: 0, amp: 7, freq: 0.007, speed: 1.2, color: 'rgba(212, 175, 55, 0.28)' },
        { yOffset: height * 0.07, amp: 10, freq: 0.006, speed: 1.0, color: 'rgba(243, 229, 171, 0.32)' },
        { yOffset: height * 0.16, amp: 14, freq: 0.005, speed: 0.85, color: 'rgba(212, 175, 55, 0.22)' },
        { yOffset: height * 0.26, amp: 18, freq: 0.004, speed: 0.7, color: 'rgba(243, 229, 171, 0.25)' },
        { yOffset: height * 0.38, amp: 22, freq: 0.0035, speed: 0.6, color: 'rgba(184, 134, 11, 0.35)' }
      ];

      waveLayers.forEach((layer) => {
        ctx.save();
        ctx.beginPath();
        const baseWaveY = horizonY + layer.yOffset;
        ctx.moveTo(0, baseWaveY);

        for (let x = 0; x <= width; x += 12) {
          const waveHeight =
            Math.sin(x * layer.freq + time * layer.speed) * layer.amp +
            Math.cos(x * layer.freq * 1.5 - time * 0.6) * (layer.amp * 0.45);
          ctx.lineTo(x, baseWaveY + waveHeight);
        }

        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#F3E5AB';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      });

      // Floating gold light glints & reflective water sparkles
      goldGlints.forEach((glint) => {
        glint.x += glint.vx;
        glint.y += Math.sin(time + glint.x * 0.01) * 0.35;
        if (glint.x < 0) glint.x = width;
        if (glint.x > width) glint.x = 0;

        ctx.fillStyle = `rgba(243, 229, 171, ${glint.alpha * (0.6 + Math.sin(time * 2 + glint.x) * 0.4)})`;
        ctx.beginPath();
        ctx.arc(glint.x, glint.y, glint.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle Voice purely for «نُون» without triggering navigation or unwanted actions
  const handlePronounce = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isPlayingVoice) return;
    setIsPlayingVoice(true);
    setLetterGlow(1.8);
    try {
      await audioEngine.pronounceNoon();
    } finally {
      setIsPlayingVoice(false);
      setLetterGlow(1);
    }
  };

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    if (!hasStartedAudio && !muted) {
      audioEngine.startOceanWaves();
      setHasStartedAudio(true);
    }
  };

  const handleStartExperience = () => {
    if (!hasStartedAudio && !isMuted) {
      audioEngine.startOceanWaves();
    }
    audioEngine.playGoldenChime();
    onEnterJourney();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030305] flex flex-col items-center justify-between select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Top Floating Utility Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm border border-amber-400/60 flex items-center justify-center bg-black/60 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="font-editorial text-amber-300 font-bold text-lg">ن</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-wide text-white">كتاب «نون»</span>
            <span className="mx-2 text-amber-500/50">·</span>
            <span className="text-xs text-amber-200/60 font-cinzel">تأليف: محمد الهمام</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* MD7 Apps Hub Button */}
          <button
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-amber-400/70 bg-gradient-to-r from-amber-500/20 to-amber-400/10 hover:bg-amber-400/25 text-amber-300 hover:text-white transition-all text-xs font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
            title="تطبيقات ومنظومة MD7 (AI Studio, Currency, Vercel)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>تطبيقات MD7</span>
          </button>

          {/* Publish Your Book Modal Trigger */}
          <button
            onClick={onOpenPublishModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-zinc-700 bg-black/50 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 transition-all text-xs cursor-pointer"
            title="طلب نشر وتوثيق كتابك الرقمي"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>طلب نشر كتابك</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-amber-500/30 bg-black/50 backdrop-blur-md text-amber-200 hover:text-white hover:border-amber-400/70 transition-all text-xs cursor-pointer"
            title={isMuted ? 'تشغيل صوت أمواج البحر' : 'كتم صوت أمواج البحر'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isMuted ? 'صوت الأمواج مكتوم' : 'أمواج البحر مع النغمات'}</span>
          </button>
        </div>
      </header>

      {/* Central Majestic Golden Arabic Letter "ن" (Noon) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-4 text-center">
        {/* Soft atmospheric golden back-glow */}
        <div
          className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, rgba(184,134,11,0.12) 50%, rgba(0,0,0,0) 75%)',
            transform: `scale(${letterGlow})`,
            filter: 'blur(30px)'
          }}
        />

        {/* The Golden Arabic Letter "ن" - Plays ONLY the voice of «نُون» without navigating */}
        <div
          onClick={(e) => handlePronounce(e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePronounce()}
          className="group relative cursor-pointer select-none transition-transform duration-500 hover:scale-105 active:scale-95"
          title="اضغط لسماع نطق كلمة «نُون» فقط"
        >
          <div
            className="font-editorial text-8xl sm:text-9xl md:text-[14rem] font-bold leading-none select-none transition-all duration-700"
            style={{
              background: 'linear-gradient(135deg, #FFF9E6 0%, #F5DE88 25%, #D4AF37 55%, #AA771C 85%, #FFE9A0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${28 * letterGlow}px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 ${65 * letterGlow}px rgba(243, 229, 171, 0.5))`
            }}
          >
            ن
          </div>

          {/* Interactive Voice Ticker below Letter */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/70 border border-amber-400/40 text-[11px] text-amber-200/90 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{isPlayingVoice ? 'جارٍ نطق: «نُون»...' : 'اضغط على الحرف لسماع نطق «نُون»'}</span>
            </span>
          </div>
        </div>

        {/* Cinematic Title & Verse */}
        <div className="mt-6 max-w-xl mx-auto space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            مَشهدُ البَحر الأسود والأفقُ الذهبي
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/70 font-editorial tracking-wide">
            «ن والقلم وما يسطرون · البداية الأزلية لكل صرح معماري خالد»
          </p>
        </div>
      </div>

      {/* Bottom Call-to-Action Bar with Pointer */}
      <div className="relative z-20 w-full max-w-xl mx-auto px-6 pb-10 flex flex-col items-center text-center">
        {/* Animated Hand / Pointer Guide */}
        <div className="flex flex-col items-center gap-2 mb-3 animate-bounce">
          <span className="text-[11px] uppercase tracking-widest text-amber-300 font-cinzel">EXPEDITION READY</span>
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleStartExperience}
          className="group relative w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-sm bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black font-bold text-base tracking-wide shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:shadow-[0_0_55px_rgba(243,229,171,0.85)] hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-black transition-transform group-hover:rotate-45" />
          <span>اضغط للانتقال إلى الرحلة</span>
          <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-black font-bold">ENTER</span>
        </button>

        <p className="mt-3 text-[11px] text-zinc-400/80">
          انغمس في رحلة الوعي والمعرفة الفلسفية واستكشف فصول كتاب «نون»
        </p>
      </div>
    </div>
  );
};
