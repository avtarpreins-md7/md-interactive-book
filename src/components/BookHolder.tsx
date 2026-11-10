import React from 'react';
import { BookOpen, Sparkles, ArrowRight, CornerRightDown } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface BookHolderProps {
  onOpenBook: () => void;
  onBackToOcean: () => void;
  onOpenAppsModal: () => void;
}

export const BookHolder: React.FC<BookHolderProps> = ({
  onOpenBook,
  onBackToOcean,
  onOpenAppsModal
}) => {
  const handleBookClick = () => {
    audioEngine.playBookOpen();
    onOpenBook();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#050508] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background ambient lighting and dark space grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(212,175,55,0.15),rgba(5,5,8,0.95))]" />

      {/* Subtle geometric grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(243,229,171,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(243,229,171,0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Navigation */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-amber-500/15">
        <button
          onClick={onBackToOcean}
          className="flex items-center gap-2 text-xs text-amber-200/70 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span>العودة لمشهد البحر ونون</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-amber-400/70 bg-gradient-to-r from-amber-500/20 to-amber-400/10 hover:bg-amber-400/25 text-amber-300 hover:text-white transition-all text-xs font-semibold shadow-[0_0_12px_rgba(212,175,55,0.2)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>تطبيقات MD7</span>
          </button>

          <span className="font-cinzel text-xs text-amber-400 font-bold tracking-widest hidden sm:inline">
            MD LUXURY COLLECTION
          </span>
        </div>
      </header>

      {/* Main Pedestal & 3D Book Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Intro Titles */}
        <div className="text-center mb-8 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>الصرح التوثيقي الحصري</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            رحلتك تبدأ من هنا
          </h2>
          <p className="text-sm text-amber-200/70 font-editorial">
            اضغط على الكتاب لفتحه واستكشاف المعالم المعمارية الفريدة
          </p>
        </div>

        {/* 3D Book on Pedestal Container */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Interactive Pointer Guide above the book */}
          <div className="absolute -top-14 flex flex-col items-center gap-1 z-30 animate-bounce pointer-events-none">
            <span className="text-[11px] font-bold px-3 py-1 rounded bg-amber-400 text-black shadow-[0_0_15px_rgba(212,175,55,0.8)] tracking-wide">
              اضغط هنا لفتح الكتاب
            </span>
            <CornerRightDown className="w-5 h-5 text-amber-400" />
          </div>

          {/* Underlight glowing halo */}
          <div className="absolute -bottom-10 w-80 sm:w-96 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* The Closed Luxury Book (Interactive 3D Card) */}
          <div
            onClick={handleBookClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBookClick()}
            className="group relative cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 perspective-1000 z-20"
            title="انقر لفتح كتاب مجموعة MD"
          >
            {/* The Book Object */}
            <div className="relative w-64 sm:w-72 md:w-80 h-88 sm:h-96 md:h-[420px] rounded-r-lg rounded-l-sm bg-gradient-to-r from-[#121218] via-[#0E0E14] to-[#181824] border-2 border-amber-400/80 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.35)] flex flex-col justify-between p-6 sm:p-8 overflow-hidden transform-style-3d group-hover:shadow-[0_30px_70px_rgba(0,0,0,0.98),0_0_60px_rgba(243,229,171,0.6)]">
              {/* Spine texture on left side */}
              <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-amber-600/40 via-amber-400/20 to-transparent border-r border-amber-400/30" />

              {/* Ornate Golden Filigree Corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/80" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/80" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/80" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/80" />

              {/* Book Top Ribbon / Header */}
              <div className="relative z-10 flex items-center justify-between text-amber-300/80 text-[11px] font-cinzel tracking-widest">
                <span>VOL. I · 2026</span>
                <span>MONOGRAPH</span>
              </div>

              {/* Center MD Monogram & Calligraphy */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                {/* Embossed MD Seal */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/90 flex items-center justify-center bg-black/60 shadow-[0_0_30px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_45px_rgba(243,229,171,0.7)] transition-all">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-amber-300/40 flex flex-col items-center justify-center">
                    <span className="font-cinzel text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-wider">
                      MD
                    </span>
                    <span className="text-[8px] font-sans text-amber-200/70 tracking-widest -mt-1">
                      GROUP
                    </span>
                  </div>
                </div>

                <h3 className="mt-6 text-lg sm:text-xl font-bold text-white tracking-wide">
                  مجموعة MD المعمارية
                </h3>
                <p className="mt-1 text-xs text-amber-300/75 font-editorial tracking-wider">
                  الأفق المعماري الجديد
                </p>
              </div>

              {/* Book Bottom Seal */}
              <div className="relative z-10 text-center border-t border-amber-400/30 pt-3">
                <span className="text-[10px] text-zinc-400 tracking-widest font-mono">
                  SPECIAL INTERACTIVE EDITION
                </span>
              </div>

              {/* Gilded Book Edges (Right 3D Page Simulation) */}
              <div className="absolute top-1 bottom-1 -right-2.5 w-2.5 bg-gradient-to-r from-amber-600 via-yellow-200 to-amber-700 rounded-r-xs shadow-md border-r border-amber-300" />
            </div>
          </div>

          {/* Technological Pedestal Base (القاعدة الهندسية الفاخرة) */}
          <div className="relative mt-2 flex flex-col items-center">
            {/* Top glass platform surface */}
            <div className="w-72 sm:w-88 md:w-96 h-6 rounded-sm bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-amber-400/80 shadow-[0_0_20px_rgba(212,175,55,0.3)] relative">
              <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            </div>

            {/* Geometric Plinth Mid Section with Silver Bevels */}
            <div className="w-80 sm:w-96 md:w-[440px] h-12 bg-gradient-to-b from-[#111118] to-[#08080C] border-x border-b border-zinc-700/60 flex items-center justify-between px-6 shadow-2xl">
              <span className="text-[10px] font-mono text-zinc-500">SYS.STAND // 01</span>
              <div className="h-1.5 w-28 bg-gradient-to-r from-amber-500/20 via-amber-400 to-amber-500/20 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              <span className="text-[10px] font-mono text-zinc-500">MD-PEDESTAL</span>
            </div>

            {/* Bottom Plinth Base with golden underglow */}
            <div className="w-96 sm:w-[440px] md:w-[500px] h-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-t border-amber-500/30 rounded-b-sm shadow-[0_15px_30px_rgba(0,0,0,0.9)]" />
          </div>
        </div>

        {/* Prompt Button to Open */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            onClick={handleBookClick}
            className="flex items-center gap-3 px-8 py-3 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_50px_rgba(243,229,171,0.8)] hover:scale-105 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>افتح الكتاب الآن</span>
          </button>
          <span className="text-xs text-zinc-400">أو اضغط مباشرة على غلاف الكتاب</span>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60">
        <span>تجربة رقمية تفاعلية مستمرة</span>
        <span>جميع الحقوق محفوظة لمجموعة MD © 2026</span>
      </footer>
    </div>
  );
};
