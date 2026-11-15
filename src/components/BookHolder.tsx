import React from 'react';
import { BookOpen, ArrowRight, CornerRightDown, Sparkles, Compass } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { NOON_MANIFEST } from '../books/registry';

interface BookHolderProps {
  onOpenBook: () => void;
  onBackHome: () => void;
  onOpenOcean: () => void;
  onOpenAppsModal: () => void;
}

export const BookHolder: React.FC<BookHolderProps> = ({
  onOpenBook,
  onBackHome,
  onOpenOcean,
  onOpenAppsModal,
}) => {
  const handleBookClick = () => {
    audioEngine.playBookOpen();
    onOpenBook();
  };

  return (
    <div
      dir="rtl"
      className="relative w-full min-h-screen bg-[#070608] text-white flex flex-col justify-between overflow-hidden select-none pb-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(212,175,55,0.14),rgba(5,5,8,0.96))]" />

      {/* Top Navigation */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-amber-500/15">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2 text-xs font-bold text-amber-200/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لمنصة الكتاب</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenOcean}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/35 bg-black/50 text-xs font-bold text-amber-200 hover:text-white cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>مشهد بحر نون</span>
          </button>

          <button
            type="button"
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/60 bg-amber-500/15 text-amber-300 hover:text-white text-xs font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تطبيقات MD7</span>
          </button>
        </div>
      </header>

      {/* Main Pedestal & 5:7 Cover Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-6 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
            كتاب «{NOON_MANIFEST.title}»
          </h2>
          <p className="text-sm text-amber-200/80 font-editorial">
            تأليف: {NOON_MANIFEST.author} · اضغط على الغلاف لفتح النص الكامل غير المختصر
          </p>
        </div>

        <div className="relative flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-1 mb-3 pointer-events-none">
            <span className="text-[11px] font-bold px-3 py-1 rounded bg-amber-400 text-black">
              اضغط هنا لفتح الكتاب
            </span>
            <CornerRightDown className="w-4 h-4 text-amber-400" />
          </div>

          {/* 5:7 Official Bespoke Cover Image + Clean Title & Author Overlay */}
          <div
            onClick={handleBookClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBookClick()}
            className="group relative cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] z-20"
            title="انقر لفتح كتاب «نون» للمؤلف محمد الهمام"
          >
            <div className="relative w-64 sm:w-72 md:w-80 aspect-[5/7] rounded-r-xl rounded-l-sm border-2 border-amber-400/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden bg-[#100C08]">
              <img
                src={NOON_MANIFEST.cover}
                alt={`غلاف كتاب ${NOON_MANIFEST.title}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 flex flex-col justify-between p-6 text-center">
                <div className="text-[11px] font-editorial text-amber-300/90 tracking-wide">
                  إصدار توثيقي كامل
                </div>

                <div className="my-auto">
                  <h3 className="font-editorial text-5xl sm:text-6xl font-black text-[#F5D68E] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                    «نون»
                  </h3>
                </div>

                <div className="border-t border-amber-400/40 pt-3">
                  <p className="text-sm font-bold text-white">تأليف: {NOON_MANIFEST.author}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Button */}
        <div className="mt-7 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleBookClick}
            className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-sm shadow-lg hover:brightness-105 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>افتح الكتاب الآن</span>
          </button>
        </div>
      </main>
    </div>
  );
};
