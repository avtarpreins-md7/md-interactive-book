import React from 'react';
import { BookMarked, Zap } from 'lucide-react';

interface ReadingProgressBarProps {
  currentPage: number;
  totalPages: number;
  hasFlippedRecently?: boolean;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  currentPage,
  totalPages,
  hasFlippedRecently
}) => {
  const percent = Math.round((currentPage / totalPages) * 100);

  // Gamified Energy Color logic based on progress: Green -> Yellow -> Rose -> Red / Gold Surge
  const getEnergyColor = () => {
    if (percent >= 90) {
      return {
        bg: 'from-red-500 via-rose-500 to-amber-400',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.8)]',
        border: 'border-red-400/80',
        label: 'طاقة الإنجاز الكامل',
        textColor: 'text-rose-400'
      };
    } else if (percent >= 65) {
      return {
        bg: 'from-pink-500 via-rose-400 to-amber-300',
        glow: 'shadow-[0_0_20px_rgba(236,72,153,0.7)]',
        border: 'border-pink-400/80',
        label: 'طاقة متقدمة',
        textColor: 'text-pink-400'
      };
    } else if (percent >= 35) {
      return {
        bg: 'from-amber-400 via-yellow-400 to-amber-500',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.7)]',
        border: 'border-amber-400/80',
        label: 'طاقة متوسطة',
        textColor: 'text-amber-400'
      };
    } else {
      return {
        bg: 'from-emerald-400 via-teal-400 to-emerald-500',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.7)]',
        border: 'border-emerald-400/80',
        label: 'طاقة الانطلاق',
        textColor: 'text-emerald-400'
      };
    }
  };

  const energy = getEnergyColor();

  return (
    <div
      className={`w-full max-w-4xl mx-auto px-4 py-2 bg-black/80 backdrop-blur-md rounded-md border border-amber-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
        hasFlippedRecently ? 'scale-[1.01]' : 'scale-100'
      }`}
    >
      <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
        {/* Left: Current Page tracking with Book Icon */}
        <div className="flex items-center gap-2 text-amber-200">
          <BookMarked className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">
            الصفحة {currentPage} من {totalPages}
          </span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400 hidden sm:inline">مؤشر التقدم في الرحلة</span>
        </div>

        {/* Right: Percentage & Energy Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${energy.textColor}`}>
            <Zap className="w-3 h-3 fill-current animate-pulse" />
            <span className="hidden md:inline">{energy.label}</span>
          </span>
          <span className="font-mono font-bold text-amber-300 text-sm tracking-wider">
            {percent}%
          </span>
        </div>
      </div>

      {/* Gamified Segmented Energy Bar */}
      <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
        {/* Tick marks for game HUD feel */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-[1px] h-full bg-black" />
          ))}
        </div>

        {/* Dynamic Glowing Energy Fill */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${energy.bg} ${energy.glow} transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
