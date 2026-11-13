/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AuthorPreviewBanner Component
 * Visual and navigational luxury HUD indicating that the system is currently in "وضع معاينة المؤلف"
 * Allows the author to switch directly between the pedestal, the full 21-page reader,
 * table of contents, and exit preview mode back to the public countdown lock.
 */

import React from 'react';
import { ShieldCheck, BookOpen, Layers, LogOut, Download, Sparkles } from 'lucide-react';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { exportBookPDF } from '../utils/pdfExport';

interface AuthorPreviewBannerProps {
  onExitPreview: () => void;
  currentScreen: 'ocean' | 'pedestal' | 'reader' | 'completion';
  onNavigateScreen: (screen: 'ocean' | 'pedestal' | 'reader' | 'completion') => void;
}

export const AuthorPreviewBanner: React.FC<AuthorPreviewBannerProps> = ({
  onExitPreview,
  currentScreen,
  onNavigateScreen
}) => {
  return (
    <aside
      aria-label="شريط وضع معاينة المؤلف"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#18150a] via-[#241d0c] to-[#18150a] border-b-2 border-amber-400/80 px-3 py-2 text-white shadow-[0_4px_25px_rgba(212,175,55,0.4)] backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Author Badge & Book Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(212,175,55,0.8)]">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-amber-300 font-editorial">
              وضع «معاينة المؤلف والتدقيق الفني»
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-200">
              كتاب <strong className="text-white">«{BOOK_STRUCTURE_CONFIG.projectTitle}»</strong>
            </span>
            <span className="text-zinc-500 hidden sm:inline">|</span>
            <span className="text-amber-200/80 text-[11px] hidden sm:inline">
              المؤلف: {BOOK_STRUCTURE_CONFIG.author} (مغلق أمام الجمهور حتى 11-11-2026)
            </span>
          </div>
        </div>

        {/* Navigation Quick Shortcuts for Author */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigateScreen('ocean')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer border ${
              currentScreen === 'ocean'
                ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white hover:border-amber-400/60'
            }`}
          >
            بحر النون
          </button>

          <button
            onClick={() => onNavigateScreen('pedestal')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer border ${
              currentScreen === 'pedestal'
                ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white hover:border-amber-400/60'
            }`}
          >
            منصة الغلاف
          </button>

          <button
            onClick={() => onNavigateScreen('reader')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer border flex items-center gap-1 ${
              currentScreen === 'reader'
                ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white hover:border-amber-400/60'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>قارئ الكتاب (كامل الفصول والقاموس)</span>
          </button>

          <button
            onClick={() => exportBookPDF()}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 text-amber-200 hover:text-white border border-amber-500/40 text-xs transition-all cursor-pointer"
            title="تحميل نسخة PDF الكاملة للتدقيق والطباعة"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>تصدير PDF</span>
          </button>

          {/* Exit Preview and Return to Locked Countdown */}
          <button
            onClick={onExitPreview}
            className="flex items-center gap-1 px-3 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-semibold cursor-pointer transition-all ml-1"
            title="إنهاء وضع المعاينة وإعادة القفل لشاشة العد التنازلي العامة"
          >
            <LogOut className="w-3 h-3 text-rose-300" />
            <span>خروج من المعاينة</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
