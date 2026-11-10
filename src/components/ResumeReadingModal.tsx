import React from 'react';
import { BookOpen, RefreshCw, Compass } from 'lucide-react';
import { ReadingProgress } from '../types';

interface ResumeReadingModalProps {
  isOpen: boolean;
  progress: ReadingProgress;
  onResume: () => void;
  onRestart: () => void;
}

export const ResumeReadingModal: React.FC<ResumeReadingModalProps> = ({
  isOpen,
  progress,
  onResume,
  onRestart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-lg p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#060608] border-2 border-amber-400/80 shadow-[0_0_60px_rgba(212,175,55,0.45)] text-center text-white">
        {/* Ornate corner accents */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

        {/* Top Monogram */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-amber-400/60 bg-black/60 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <span className="font-cinzel text-amber-300 font-bold text-lg">MD</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          مرحبًا بعودتك، هل ترغب في استكمال رحلتك؟
        </h3>
        <p className="text-xs sm:text-sm text-amber-200/70 mb-6">
          لقد توقفت سابقاً عند <span className="text-amber-400 font-bold font-mono">الصفحة {progress.currentPage}</span> من إجمالي {progress.totalPages} صفحة بنسبة إنجاز ({progress.progressPercent}%).
        </p>

        {/* Choices Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(243,229,171,0.8)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>استكمال القراءة السابقة (من ص {progress.currentPage})</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-sm border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-amber-400/50 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>بدء رحلة جديدة من البداية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
