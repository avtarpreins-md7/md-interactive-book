import React from 'react';
import { ShieldCheck, BookOpen, LogOut, Download } from 'lucide-react';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { exportBookPDF } from '../utils/pdfExport';

interface AuthorPreviewBannerProps {
  onExitPreview: () => void;
  currentScreen: string;
  onNavigateScreen: (screen: 'ocean' | 'pedestal' | 'reader' | 'audit' | 'home') => void;
}

export const AuthorPreviewBanner: React.FC<AuthorPreviewBannerProps> = ({
  onExitPreview,
  currentScreen,
  onNavigateScreen,
}) => {
  return (
    <aside
      dir="rtl"
      aria-label="شريط وضع معاينة المؤلف"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#18150a] via-[#241d0c] to-[#18150a] border-b-2 border-amber-400/80 px-3 py-2 text-white shadow-lg backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded bg-amber-400 text-black flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <span className="font-extrabold text-amber-300">وضع معاينة المؤلف</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-200 hidden sm:inline">
            «{BOOK_STRUCTURE_CONFIG.projectTitle}» — {BOOK_STRUCTURE_CONFIG.author}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateScreen('home')}
            className={`px-2.5 py-1 rounded text-xs cursor-pointer border ${
              currentScreen === 'home'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            منصة الكتاب
          </button>

          <button
            type="button"
            onClick={() => onNavigateScreen('ocean')}
            className={`px-2.5 py-1 rounded text-xs cursor-pointer border ${
              currentScreen === 'ocean'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            بحر النون
          </button>

          <button
            type="button"
            onClick={() => onNavigateScreen('pedestal')}
            className={`px-2.5 py-1 rounded text-xs cursor-pointer border ${
              currentScreen === 'pedestal'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            الغلاف
          </button>

          <button
            type="button"
            onClick={() => onNavigateScreen('reader')}
            className={`px-2.5 py-1 rounded text-xs cursor-pointer border flex items-center gap-1 ${
              currentScreen === 'reader'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>قارئ الكتاب (الأبواب والقاموس)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateScreen('audit')}
            className={`px-2.5 py-1 rounded text-xs cursor-pointer border ${
              currentScreen === 'audit'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            تقرير التدقيق
          </button>

          <button
            type="button"
            onClick={() => exportBookPDF()}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 text-amber-200 hover:text-white border border-amber-500/40 text-xs cursor-pointer"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={onExitPreview}
            className="flex items-center gap-1 px-3 py-1 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
