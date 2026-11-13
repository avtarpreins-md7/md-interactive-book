import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Download,
  List,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { BOOK_PAGES } from '../data/bookContent';
import { ReadingProgressBar } from './ReadingProgressBar';
import { LiveReaderFeed } from './LiveReaderFeed';
import { SaveProgressModal } from './SaveProgressModal';
import { ReviewModal } from './ReviewModal';
import { ReadingProgress, ReaderReview } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { exportBookPDF } from '../utils/pdfExport';
import { BackCoverView } from './BackCoverView';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';

const toArabicIndicDigits = (num: number): string => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d, 10)]);
};

interface BookReaderProps {
  initialPage?: number;
  onCloseBook: () => void;
  onFinishJourney: () => void;
  reviews: ReaderReview[];
  onAddReview: (name: string, rating: number, comment: string) => void;
  onOpenAppsModal: () => void;
  onOpenPublishModal: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  initialPage = 1,
  onCloseBook,
  onFinishJourney,
  reviews,
  onAddReview,
  onOpenAppsModal,
  onOpenPublishModal
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [hasFlippedRecently, setHasFlippedRecently] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getMuted());
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalPages = BOOK_PAGES.length;

  // Auto-save reading progress to LocalStorage on each page change
  useEffect(() => {
    const progressData: ReadingProgress = {
      currentPage,
      totalPages,
      progressPercent: Math.round((currentPage / totalPages) * 100),
      lastReadDate: new Date().toISOString(),
      isCompleted: currentPage === totalPages
    };
    try {
      localStorage.setItem('md_book_progress', JSON.stringify(progressData));
    } catch (e) {
      console.warn('Could not save progress to localStorage', e);
    }
  }, [currentPage, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const goToNextPage = () => {
    if (isFlipping) return;
    if (currentPage < totalPages) {
      setFlipDirection('next');
      setIsFlipping(true);
      setHasFlippedRecently(true);
      audioEngine.playPageFlip();

      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
        setTimeout(() => setHasFlippedRecently(false), 300);
      }, 350);
    } else {
      audioEngine.playPageFlip();
      onFinishJourney();
    }
  };

  const goToPrevPage = () => {
    if (isFlipping) return;
    if (currentPage > 1) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setHasFlippedRecently(true);
      audioEngine.playPageFlip();

      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
        setTimeout(() => setHasFlippedRecently(false), 300);
      }, 350);
    }
  };

  const jumpToPage = (pageNum: number) => {
    if (pageNum === currentPage || isFlipping) return;
    setFlipDirection(pageNum > currentPage ? 'next' : 'prev');
    setIsFlipping(true);
    audioEngine.playPageFlip();
    setShowToc(false);

    setTimeout(() => {
      setCurrentPage(pageNum);
      setIsFlipping(false);
    }, 350);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      goToNextPage();
    } else if (diff < -50) {
      goToPrevPage();
    }
    setTouchStartX(null);
  };

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Quick In-Page Silent Save (no reload, transparent HUD toast)
  const handleQuickSave = () => {
    const progressData: ReadingProgress = {
      currentPage,
      totalPages,
      progressPercent: Math.round((currentPage / totalPages) * 100),
      lastReadDate: new Date().toISOString(),
      isCompleted: currentPage === totalPages
    };
    try {
      localStorage.setItem('md_book_progress', JSON.stringify(progressData));
    } catch {}
    audioEngine.playGoldenChime();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2600);
  };

  const currentContent = BOOK_PAGES[currentPage - 1];

  return (
    <div
      className="relative w-full min-h-screen bg-[#060608] text-white flex flex-col justify-between overflow-x-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background radial ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_45%,rgba(212,175,55,0.1),rgba(4,4,6,0.98))]" />

      {/* Floating Save Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs shadow-[0_0_30px_rgba(212,175,55,0.85)] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>تم حفظ تقدمك في القراءة بنجاح (صفحة {currentPage} من {totalPages})</span>
        </div>
      )}

      {/* Top Header & Reader Controls */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between border-b border-amber-500/20 bg-black/60 backdrop-blur-md">
        {/* Left: Close / Return to pedestal */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseBook}
            className="flex items-center gap-1.5 text-xs text-amber-200/80 hover:text-white transition-colors cursor-pointer"
            title="إغلاق الكتاب والعودة للمنصة"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">إغلاق الكتاب</span>
          </button>
          <span className="text-zinc-600">·</span>
          <span className="font-editorial text-xs text-amber-300 font-bold tracking-wide">
            {BOOK_STRUCTURE_CONFIG.projectTitle}
          </span>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* MD7 Apps Hub Button */}
          <button
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-400/15 border border-amber-400/60 text-xs text-amber-200 hover:text-white hover:bg-amber-400/25 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] cursor-pointer font-medium"
            title="تطبيقات ومنظومة MD7"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="hidden sm:inline">تطبيقات MD7</span>
          </button>

          {/* Publish Your Book Button */}
          <button
            onClick={onOpenPublishModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-amber-400/60 transition-all cursor-pointer"
            title="طلب نشر وتوثيق كتابك"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>طلب نشر كتابك</span>
          </button>

          {/* Table of Contents button */}
          <button
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-amber-400/60 transition-all cursor-pointer"
            title="فهرس الفصول"
          >
            <List className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">الفهرس</span>
          </button>

          {/* Quick Save Progress Button */}
          <button
            onClick={handleQuickSave}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/15 border border-amber-400/60 text-xs text-amber-200 hover:text-white hover:bg-amber-400/25 transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] cursor-pointer"
            title="حفظ موضع القراءة الحالي دون إعادة التحميل"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>حفظ متصفحي</span>
          </button>

          {/* Download Original PDF Button */}
          <button
            onClick={() => exportBookPDF()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(243,229,171,0.7)] transition-all cursor-pointer"
            title="تحميل نسخة الكتاب الأصلية بصيغة PDF"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>احتفظ بنسختك</span>
          </button>

          {/* Expand / Maximize Pages to full screen */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-amber-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isExpanded ? 'تصغير الحجم الطبيعي' : 'تكبير صفحات الكتاب لتوافق الشاشة كلها'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Gamified Power & Energy Reading Progress Bar (Standard View) */}
      {!isExpanded && (
        <div className="relative z-20 w-full pt-2">
          <ReadingProgressBar
            currentPage={currentPage}
            totalPages={totalPages}
            hasFlippedRecently={hasFlippedRecently}
          />
        </div>
      )}

      {/* Main Interactive Book Canvas (Supports Expand to Full Screen) */}
      <main
        className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-500 ${
          isExpanded
            ? 'px-1 sm:px-3 py-2 w-full max-w-full'
            : 'px-2 sm:px-6 py-4'
        }`}
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={goToNextPage}
          className="absolute left-2 sm:left-4 z-30 p-2 sm:p-3 rounded-full bg-black/75 border border-amber-400/40 text-amber-300 hover:text-white hover:bg-black/95 hover:border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
          title="الصفحة التالية (أو سهم يسار)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="absolute right-2 sm:right-4 z-30 p-2 sm:p-3 rounded-full bg-black/75 border border-amber-400/40 text-amber-300 hover:text-white hover:bg-black/95 hover:border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
          title="الصفحة السابقة (أو سهم يمين)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* The Open Book Surface */}
        <div
          className={`relative rounded-lg bg-gradient-to-b from-[#121218] via-[#0D0D12] to-[#08080C] border-2 border-amber-400/60 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(212,175,55,0.25)] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-full max-w-6xl h-[86vh] sm:h-[90vh]'
              : 'w-full max-w-4xl h-[68vh] sm:h-[72vh] md:h-[75vh]'
          } ${
            isFlipping
              ? flipDirection === 'next'
                ? 'transform -rotate-y-6 scale-[0.98] opacity-80'
                : 'transform rotate-y-6 scale-[0.98] opacity-80'
              : 'transform rotate-0 scale-100 opacity-100'
          }`}
        >
          {/* Central Book Spine Crease & Shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/50 via-amber-950/20 to-black/50 pointer-events-none z-20 border-x border-amber-400/10 hidden md:block" />

          {/* Transparent Overlay HUD (Visible inside expanded mode as requested) */}
          {isExpanded && (
            <div className="relative z-20 px-4 py-2 bg-black/40 backdrop-blur-md border-b border-amber-400/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-amber-400">
                  {currentContent.chapter || 'كتاب «نون»'}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">
                  صفحة {currentContent.pageNumber} من {totalPages}
                </span>
              </div>

              {/* Translucent Quick Save & Minimize buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickSave}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer transition-all shadow-[0_0_10px_rgba(212,175,55,0.25)]"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>حفظ متصفحي</span>
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs cursor-pointer border border-zinc-700"
                  title="العودة للحجم الطبيعي"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">تصغير</span>
                </button>
              </div>
            </div>
          )}

          {/* Book Header Margin Ribbon (Standard mode) */}
          {!isExpanded && (
            <div className="relative z-10 px-6 sm:px-8 pt-4 pb-2 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 font-editorial text-sm">
                  {currentContent.chapter || 'كتاب «نون»'}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400 font-cinzel text-[11px]">DOCUMENTARY MONOGRAPH</span>
              </div>
              <div className="font-mono text-amber-300 font-bold">
                صفحة {currentContent.pageNumber}
              </div>
            </div>
          )}

          {/* Book Page Content Body */}
          <div className="relative z-10 flex-1 px-4 sm:px-10 py-4 overflow-y-auto">
            {currentPage === totalPages ? (
              <BackCoverView />
            ) : (
              <>
                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide border-r-4 border-amber-400 pr-3">
                    {currentContent.title}
                  </h2>
                  {currentContent.subtitle && (
                    <p className="mt-1 text-xs sm:text-sm text-amber-300/80 font-sans tracking-wide">
                      {currentContent.subtitle}
                    </p>
                  )}
                </div>

                {/* Chapter Artwork Header / Media */}
                {currentContent.image && (
                  <div className="my-4 rounded-sm overflow-hidden border border-amber-400/50 shadow-[0_0_25px_rgba(212,175,55,0.25)] relative group">
                    <img
                      src={currentContent.image}
                      alt={currentContent.title}
                      referrerPolicy="no-referrer"
                      className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                        isExpanded ? 'h-64 sm:h-80 md:h-96' : 'h-48 sm:h-64 md:h-72'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    {currentContent.imageCaption && (
                      <p className="absolute bottom-2 right-3 left-3 text-[11px] sm:text-xs text-amber-100 font-editorial tracking-wide drop-shadow-md">
                        {currentContent.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Quote */}
                {currentContent.quote && (
                  <blockquote className="my-4 p-3 sm:p-4 rounded-sm bg-gradient-to-r from-amber-500/10 to-transparent border-r-3 border-amber-400 font-editorial text-sm sm:text-base text-amber-200/90 italic leading-relaxed">
                    {currentContent.quote}
                  </blockquote>
                )}

                {/* Editorial Body Paragraphs */}
                <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans text-justify">
                  {currentContent.content.map((paragraph, idx) => (
                    <p key={idx} className="first-letter:text-amber-400 first-letter:font-bold">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Specialized Interactive Glossary Grid when on Glossary Page */}
                {currentContent.isGlossary && (
                  <div className="mt-6 pt-4 border-t border-amber-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-amber-300">
                        معجم المصطلحات والمفاهيم الكونية والتاريخية (12 مدخل أساسي):
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {BOOK_STRUCTURE_CONFIG.glossary.map((g, gIdx) => (
                        <div
                          key={gIdx}
                          className="p-3 rounded bg-black/60 border border-amber-500/25 hover:border-amber-400/60 transition-all text-right"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-amber-300">
                              {g.term}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/10 text-amber-200/80 border border-amber-400/30">
                              {g.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {g.definition}
                          </p>
                          <div className="mt-1 text-[10px] text-zinc-500">
                            موضع الورود: {g.context}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications Grid */}
                {currentContent.specs && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-sm bg-black/60 border border-amber-500/25 text-xs">
                    {currentContent.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[11px] text-zinc-400">{spec.label}</span>
                        <span className="font-semibold text-amber-300 mt-0.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom of Page Marker: Two Small Black Triangles with Golden Page Numbers */}
                <div className="mt-8 pt-4 border-t border-amber-500/20 flex items-center justify-between select-none">
                  {/* Right Small Black Triangle: Arabic Numeral in Gold */}
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-amber-500/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                    title={`رقم الصفحة بالترقيم العربي: ${toArabicIndicDigits(currentPage)}`}
                  >
                    <svg viewBox="0 0 24 22" className="w-4.5 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]">
                      <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.3" />
                      <text x="12" y="17.2" textAnchor="middle" fill="#F3E5AB" fontSize="9.5" fontWeight="bold" fontFamily="Cairo, Amiri, sans-serif">
                        {toArabicIndicDigits(currentPage)}
                      </text>
                    </svg>
                    <span className="text-[10px] text-amber-300 font-editorial font-bold">
                      صفحة {toArabicIndicDigits(currentPage)}
                    </span>
                  </div>

                  <div className="h-[1px] flex-1 mx-3 bg-gradient-to-r from-transparent via-amber-500/25 to-transparent hidden sm:block" />

                  {/* Left Small Black Triangle: English/Western Numeral in Gold */}
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-amber-500/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                    title={`Page number in Western numerals: ${currentPage}`}
                  >
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      P. {currentPage}
                    </span>
                    <svg viewBox="0 0 24 22" className="w-4.5 h-4 shrink-0 drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]">
                      <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.3" />
                      <text x="12" y="17" textAnchor="middle" fill="#F3E5AB" fontSize="9" fontWeight="bold" fontFamily="monospace, sans-serif">
                        {currentPage}
                      </text>
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Book Bottom Footer Ribbon */}
          <div className="relative z-10 px-4 sm:px-8 py-2.5 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-zinc-500 bg-black/50">
            {/* Right: Small Black Triangle with Arabic numeral in Gold + Title */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 22" className="w-4 h-3.5 shrink-0 drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]">
                <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.2" />
                <text x="12" y="17.2" textAnchor="middle" fill="#F3E5AB" fontSize="9" fontWeight="bold" fontFamily="Cairo, Amiri, sans-serif">
                  {toArabicIndicDigits(currentPage)}
                </text>
              </svg>
              <span className="font-editorial text-amber-400/90 font-bold hidden sm:inline">
                كتاب «نون» · تأليف: محمد الهمام © 2026
              </span>
            </div>

            {/* Center: Flip hints and Expand Button */}
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="hidden md:inline text-[10px]">انقر أطراف الصفحة أو استخدم الأسهم للتقليب</span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-amber-300/80 hover:text-white flex items-center gap-1 cursor-pointer text-[10px]"
              >
                {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isExpanded ? 'عرض عادي' : 'تكبير للشاشة'}</span>
              </button>
            </div>

            {/* Left: Total pages + Small Black Triangle with English numeral in Gold */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-400 text-xs hidden sm:inline">
                {currentPage} / {totalPages}
              </span>
              <svg viewBox="0 0 24 22" className="w-4 h-3.5 shrink-0 drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]">
                <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.2" />
                <text x="12" y="17" textAnchor="middle" fill="#F3E5AB" fontSize="8.5" fontWeight="bold" fontFamily="monospace, sans-serif">
                  {currentPage}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Table of Contents Drawer Modal */}
      {showToc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-lg p-6 bg-gradient-to-b from-[#14141E] to-[#0A0A0E] border border-amber-400/80 shadow-[0_0_50px_rgba(212,175,55,0.4)] text-white">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">فهرس فصول الكتاب</h3>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {BOOK_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => jumpToPage(page.pageNumber)}
                  className={`w-full flex items-center justify-between p-3 rounded text-right transition-all cursor-pointer ${
                    page.pageNumber === currentPage
                      ? 'bg-amber-400/20 border border-amber-400 text-white'
                      : 'bg-black/40 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold text-amber-300 block">
                      {page.chapter || 'فصل معماري'}
                    </span>
                    <span className="text-sm font-medium">{page.title}</span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    ص {page.pageNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Docked Live Reader Stream at bottom */}
      {!isExpanded && (
        <div className="relative z-20 w-full border-t border-amber-500/15 bg-black/70 backdrop-blur-md">
          <LiveReaderFeed
            reviews={reviews}
            onOpenReviewModal={() => setShowReviewModal(true)}
          />
        </div>
      )}

      {/* Save Progress Modal */}
      <SaveProgressModal
        isOpen={showSaveModal}
        progress={{
          currentPage,
          totalPages,
          progressPercent: Math.round((currentPage / totalPages) * 100),
          lastReadDate: new Date().toISOString(),
          isCompleted: currentPage === totalPages
        }}
        onClose={() => setShowSaveModal(false)}
      />

      {/* Interactive Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={onAddReview}
      />
    </div>
  );
};
