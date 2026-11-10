import React from 'react';
import { CheckCircle2, Bookmark, Clock, Percent } from 'lucide-react';
import { ReadingProgress } from '../types';

interface SaveProgressModalProps {
  isOpen: boolean;
  progress: ReadingProgress;
  onClose: () => void;
}

export const SaveProgressModal: React.FC<SaveProgressModalProps> = ({ isOpen, progress, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-lg p-6 bg-gradient-to-b from-[#13131A] via-[#0B0B10] to-[#060608] border border-amber-400/80 shadow-[0_0_50px_rgba(212,175,55,0.4)] text-center text-white">
        {/* Ornate corner frames */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/60" />

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)]">
          <CheckCircle2 className="w-8 h-8 text-amber-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">تم حفظ تقدمك بنجاح</h3>
        <p className="text-xs text-amber-200/70 mb-6">
          تم حفظ موقع قراءتك محلياً على جهازك؛ يمكنك استكمال رحلتك في أي وقت من نفس الصفحة.
        </p>

        {/* Progress Snapshot Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded bg-black/60 border border-amber-500/20 mb-6 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-zinc-400 flex items-center gap-1 mb-1">
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>الصفحة</span>
            </span>
            <span className="font-bold text-amber-300 font-mono text-sm">
              {progress.currentPage} / {progress.totalPages}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1 mb-1">
              <Percent className="w-3 h-3 text-amber-400" />
              <span>الإنجاز</span>
            </span>
            <span className="font-bold text-amber-300 font-mono text-sm">
              {progress.progressPercent}%
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-zinc-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>الحالة</span>
            </span>
            <span className="font-bold text-emerald-400 text-xs">
              {progress.isCompleted ? 'مكتمل' : 'قيد القراءة'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(243,229,171,0.7)] transition-all cursor-pointer"
        >
          موافق
        </button>
      </div>
    </div>
  );
};
