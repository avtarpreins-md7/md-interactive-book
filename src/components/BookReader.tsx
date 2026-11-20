import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Gift,
  FileSearch,
} from 'lucide-react';
import { ReadingProgressBar } from './ReadingProgressBar';
import { LiveReaderFeed } from './LiveReaderFeed';
import { SaveProgressModal } from './SaveProgressModal';
import { ReviewModal } from './ReviewModal';
import { BookPage, ReadingProgress, ReaderReview } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { exportBookPDF } from '../utils/pdfExport';
import { BackCoverView } from './BackCoverView';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { NOON_MANIFEST, getBookChapters } from '../books/registry';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';

const toArabicIndicDigits = (num: number): string => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => digits[parseInt(d, 10)]);
};

interface BookReaderProps {
  bookId: string;
  initialPage?: number;
  onCloseBook: () => void;
  onFinishJourney: () => void;
  onPageChange?: (pageNum: number) => void;
  onOpenAudit?: () => void;
  reviews: ReaderReview[];
  onAddReview: (name: string, rating: number, comment: string) => void;
  onOpenAppsModal: () => void;
  onOpenPublishModal: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  bookId,
  initialPage = 1,
  onCloseBook,
  onFinishJourney,
  onPageChange,
  onOpenAudit,
  reviews,
  onAddReview,
  onOpenAppsModal,
  onOpenPublishModal,
}) => {
  const { books, sendGift } = useUnifiedPlatform();
  const activeBook = books.find((b) => b.id === bookId) || books[0];

  // Dynamically assemble all pages from verbatim manuscript JSONs (or publisher text)
  const pages: BookPage[] = useMemo(() => {
    if (bookId === 'noon') {
      const chapters = getBookChapters('noon', true);
      const list: BookPage[] = [];
      let pNum = 1;

      // Page 1: Official Cover
      list.push({
        id: pNum,
        pageNumber: pNum++,
        chapter: 'الغلاف الأمامي',
        title: NOON_MANIFEST.title,
        subtitle: `تأليف: ${NOON_MANIFEST.author}`,
        image: NOON_MANIFEST.cover,
        imageCaption: '«ن والقلم وما يسطرون» — النسخة التوثيقية الكاملة',
        quote: '«ن والقلم وما يسطرون · البداية الأزلية لكل فكرة خالدة تتحول إلى أثر حقيقي»',
        content: [NOON_MANIFEST.description],
        isFrontCover: true,
      });

      // Page 2: Interactive Table of Contents
      list.push({
        id: pNum,
        pageNumber: pNum++,
        chapter: 'خريطة الكتاب',
        title: 'فهرس الأبواب والمباحث الكاملة',
        subtitle: 'اضغط على زر الفهرس في الأعلى للانتقال المباشر إلى أي باب',
        content: chapters.map(
          (ch) => `${ch.displayNumber ? ch.displayNumber + ' · ' : ''}${ch.title} (${ch.sourcePages})`
        ),
        specs: [
          { label: 'عدد الأقسام والأبواب', value: `${chapters.length} قسماً` },
          { label: 'الأسلوب', value: 'نص كامل غير مختصر' },
          { label: 'المؤلف', value: NOON_MANIFEST.author },
        ],
      });

      // All 38 extracted sections verbatim
      chapters.forEach((ch) => {
        list.push({
          id: pNum,
          pageNumber: pNum++,
          chapter: ch.partTitle,
          partId: ch.partId,
          partTitle: ch.partTitle,
          displayNumber: ch.displayNumber,
          title: ch.title,
          subtitle: ch.subtitle || ch.displayNumber,
          content: ch.paragraphs,
          quote: ch.quotes && ch.quotes.length > 0 ? ch.quotes[0] : undefined,
          quotes: ch.quotes,
          image: ch.image,
          imageCaption: ch.noteUnderImage,
          sourcePages: ch.sourcePages,
          sourceWordCount: ch.sourceWordCount,
          copiedWordCount: ch.copiedWordCount,
          isAlternateVersion: ch.isAlternateVersion,
          kind: ch.kind,
        });
      });

      // Glossary Page
      list.push({
        id: pNum,
        pageNumber: pNum++,
        chapter: 'القاموس التوثيقي',
        title: 'معجم المصطلحات والمفاهيم',
        subtitle: 'مسرد شامل للمفاهيم الفلسفية والعلمية الواردة في كتاب «نون»',
        content: ['مختارات من أبرز المصطلحات والمفاهيم الواردة في متن الكتاب وشروحاتها المنهجية:'],
        isGlossary: true,
      });

      // Back Cover Page
      list.push({
        id: pNum,
        pageNumber: pNum++,
        chapter: 'الغلاف الخلفي',
        title: 'منظومة MD7 الموحدة',
        content: [],
        isBackCover: true,
      });

      return list;
    }

    // Custom publisher-uploaded book
    const sections = activeBook.chaptersText && activeBook.chaptersText.length > 0
      ? activeBook.chaptersText
      : [activeBook.description];
    const customPages: BookPage[] = [
      {
        id: 1,
        pageNumber: 1,
        chapter: 'الغلاف الأمامي',
        title: activeBook.title,
        subtitle: `تأليف: ${activeBook.author}`,
        image: activeBook.cover,
        content: [activeBook.description],
        isFrontCover: true,
      },
      ...sections.map((sec, idx) => ({
        id: idx + 2,
        pageNumber: idx + 2,
        chapter: `الباب ${idx + 1}`,
        title: `${activeBook.title} — القسم ${idx + 1}`,
        content: sec.split('\n').filter(Boolean),
      })),
    ];
    return customPages;
  }, [bookId, activeBook]);

  const totalPages = pages.length;
  const safeInitial = Math.min(Math.max(1, initialPage), totalPages);

  const [currentPage, setCurrentPage] = useState<number>(safeInitial);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getMuted());
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [giftNotice, setGiftNotice] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(Math.min(Math.max(1, initialPage), totalPages));
  }, [initialPage, totalPages]);

  useEffect(() => {
    if (onPageChange) onPageChange(currentPage);
    if (bookId === 'noon') {
      const progressData: ReadingProgress = {
        currentPage,
        totalPages,
        progressPercent: Math.round((currentPage / totalPages) * 100),
        lastReadDate: new Date().toISOString(),
        isCompleted: currentPage === totalPages,
      };
      try {
        localStorage.setItem('md_book_progress', JSON.stringify(progressData));
      } catch {
        // ignore storage quota errors
      }
    }
  }, [currentPage, totalPages, bookId, onPageChange]);

  const goToNextPage = () => {
    if (isFlipping) return;
    if (currentPage < totalPages) {
      setIsFlipping(true);
      audioEngine.playPageFlip();
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
      }, 220);
    } else {
      audioEngine.playPageFlip();
      onFinishJourney();
    }
  };

  const goToPrevPage = () => {
    if (isFlipping) return;
    if (currentPage > 1) {
      setIsFlipping(true);
      audioEngine.playPageFlip();
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
      }, 220);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToNextPage();
      else if (e.key === 'ArrowRight') goToPrevPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const jumpToPage = (pageNum: number) => {
    if (pageNum === currentPage || isFlipping) return;
    setIsFlipping(true);
    audioEngine.playPageFlip();
    setShowToc(false);
    setTimeout(() => {
      setCurrentPage(pageNum);
      setIsFlipping(false);
    }, 220);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) goToNextPage();
    else if (diff < -50) goToPrevPage();
    setTouchStartX(null);
  };

  const toggleSound = () => setIsMuted(audioEngine.toggleMute());

  const handleQuickSave = () => {
    const progressData: ReadingProgress = {
      currentPage,
      totalPages,
      progressPercent: Math.round((currentPage / totalPages) * 100),
      lastReadDate: new Date().toISOString(),
      isCompleted: currentPage === totalPages,
    };
    try {
      localStorage.setItem('md_book_progress', JSON.stringify(progressData));
    } catch {}
    audioEngine.playGoldenChime();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2600);
  };

  const handleSendReaderGift = (amt: 3 | 6 | 9) => {
    const res = sendGift(amt, `دعم كتاب «${activeBook.title}»`, 'book');
    setGiftNotice(res.message);
    setTimeout(() => setGiftNotice(null), 4000);
  };

  const currentContent = pages[currentPage - 1] || pages[0];

  return (
    <div
      dir="rtl"
      className="relative w-full min-h-screen bg-[#060608] text-white flex flex-col justify-between overflow-x-hidden select-none pb-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_45%,rgba(212,175,55,0.1),rgba(4,4,6,0.98))]" />

      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>تم حفظ موضع قراءتك بنجاح (صفحة {currentPage} من {totalPages})</span>
        </div>
      )}

      {/* Top Header & Reader Controls */}
      <header className="relative z-30 w-full max-w-6xl mx-auto px-4 py-3 flex items-center justify-between border-b border-amber-500/20 bg-black/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseBook}
            className="flex items-center gap-1.5 text-xs text-amber-200/85 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">إغلاق الكتاب</span>
          </button>
          <span className="text-zinc-600">·</span>
          <span className="font-editorial text-xs sm:text-sm text-amber-300 font-bold">
            {activeBook.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/60 text-xs text-amber-200 hover:text-white cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">تطبيقات MD7</span>
          </button>

          {bookId === 'noon' && onOpenAudit && (
            <button
              type="button"
              onClick={onOpenAudit}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white cursor-pointer"
              title="تقرير التدقيق النصي"
            >
              <FileSearch className="w-3.5 h-3.5 text-amber-400" />
              <span>التدقيق</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>طلب نشر</span>
          </button>

          <button
            type="button"
            onClick={() => setShowToc(!showToc)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 hover:border-amber-400/60 cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">فهرس الأبواب</span>
          </button>

          <button
            type="button"
            onClick={handleQuickSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/60 text-xs text-amber-200 hover:text-white cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>حفظ متصفحي</span>
          </button>

          {bookId === 'noon' && (
            <button
              type="button"
              onClick={() => exportBookPDF()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>نسخة PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
            title={isExpanded ? 'تصغير' : 'تكبير للشاشة'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {!isExpanded && (
        <div className="relative z-20 w-full pt-2">
          <ReadingProgressBar
            currentPage={currentPage}
            totalPages={totalPages}
            hasFlippedRecently={false}
          />
        </div>
      )}

      {/* Main Interactive Book Canvas */}
      <main
        className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 ${
          isExpanded ? 'px-1 sm:px-3 py-2 w-full max-w-full' : 'px-2 sm:px-6 py-4'
        }`}
      >
        <button
          type="button"
          onClick={goToNextPage}
          className="absolute left-2 sm:left-4 z-30 p-2.5 rounded-full bg-black/80 border border-amber-400/50 text-amber-300 hover:text-white cursor-pointer"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="absolute right-2 sm:right-4 z-30 p-2.5 rounded-full bg-black/80 border border-amber-400/50 text-amber-300 hover:text-white cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          className={`relative rounded-xl bg-gradient-to-b from-[#121218] via-[#0C0C11] to-[#07070A] border-2 border-amber-400/60 shadow-2xl flex flex-col justify-between overflow-hidden transition-opacity duration-200 ${
            isExpanded ? 'w-full max-w-6xl h-[84vh]' : 'w-full max-w-4xl h-[68vh] md:h-[74vh]'
          } ${isFlipping ? 'opacity-70' : 'opacity-100'}`}
        >
          {/* Transparent Overlay HUD in Expanded Mode */}
          {isExpanded ? (
            <div className="relative z-20 px-4 py-2 bg-black/50 backdrop-blur-md border-b border-amber-400/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">{currentContent.chapter || activeBook.title}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-300 tabular-nums">صفحة {currentPage} من {totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickSave}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-amber-400/20 border border-amber-400/60 text-amber-200 text-xs font-semibold cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>حفظ متصفحي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>تصغير</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 px-6 pt-3.5 pb-2 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300/85">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 font-editorial text-sm">
                  {currentContent.chapter || activeBook.title}
                </span>
                {currentContent.sourcePages && (
                  <span className="text-zinc-400 font-mono text-[11px]">({currentContent.sourcePages})</span>
                )}
              </div>
              <div className="font-mono text-amber-300 font-bold tabular-nums">
                صفحة {currentPage} / {totalPages}
              </div>
            </div>
          )}

          {/* Book Content Scroll Body */}
          <div className="relative z-10 flex-1 px-5 sm:px-10 py-5 overflow-y-auto space-y-4">
            {currentContent.isBackCover ? (
              <BackCoverView />
            ) : (
              <>
                <div>
                  {currentContent.displayNumber && (
                    <div className="text-xs font-bold text-amber-400 mb-1">
                      {currentContent.displayNumber}
                      {currentContent.isAlternateVersion ? ' · نسخة بديلة' : ''}
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white border-r-4 border-amber-400 pr-3">
                    {currentContent.title}
                  </h2>
                  {currentContent.subtitle && (
                    <p className="mt-1 text-xs sm:text-sm text-amber-300/85">{currentContent.subtitle}</p>
                  )}
                </div>

                {currentContent.image && (
                  <div className="rounded-lg overflow-hidden border border-amber-400/50 bg-black">
                    <img
                      src={currentContent.image}
                      alt={currentContent.title}
                      referrerPolicy="no-referrer"
                      className={`w-full object-contain bg-[#09090D] ${
                        isExpanded ? 'max-h-96' : 'max-h-72'
                      }`}
                    />
                    {currentContent.imageCaption && (
                      <div className="px-3 py-2 bg-black/80 text-xs text-amber-200/90 font-editorial border-t border-amber-500/20">
                        {currentContent.imageCaption}
                      </div>
                    )}
                  </div>
                )}

                {currentContent.quote && (
                  <blockquote className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-400/30 font-editorial text-sm sm:text-base text-amber-200 leading-relaxed">
                    {currentContent.quote}
                  </blockquote>
                )}

                <div className="space-y-3 text-sm sm:text-base text-zinc-200 leading-loose font-sans text-justify">
                  {currentContent.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {currentContent.isGlossary && (
                  <div className="mt-5 pt-4 border-t border-amber-500/30 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {BOOK_STRUCTURE_CONFIG.glossary.map((g, gIdx) => (
                      <div key={gIdx} className="p-3 rounded-lg bg-black/60 border border-amber-500/25 text-right">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-amber-300">{g.term}</span>
                          <span className="text-[11px] text-amber-200/80">{g.category}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{g.definition}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentContent.specs && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-lg bg-black/60 border border-amber-500/25 text-xs">
                    {currentContent.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-zinc-400">{spec.label}</span>
                        <span className="font-bold text-amber-300 mt-0.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* In-Reader Support Gift Bar (3 / 6 / 9 coins ONLY + -1 progress point note) */}
                <div className="mt-6 p-3.5 rounded-xl bg-black/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4" />
                      <span>ادعم الكاتب بهدية بث مباشر (بدون أي عمولة)</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">دعم مباشر للكاتب بدون أي عمولة</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {([3, 6, 9] as const).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSendReaderGift(amt)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-black border border-amber-400/60 text-xs font-extrabold text-amber-200 transition-colors cursor-pointer"
                      >
                        {amt} عملات
                      </button>
                    ))}
                  </div>
                </div>

                {giftNotice && (
                  <div className="p-2.5 rounded-lg bg-amber-400/20 border border-amber-400 text-xs font-bold text-amber-100 text-center">
                    {giftNotice}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Book Bottom Footer Ribbon with TWO Small Black Gold-Bordered Triangles */}
          <div className="relative z-10 px-4 sm:px-8 py-2.5 border-t border-amber-500/25 flex items-center justify-between text-[11px] text-zinc-400 bg-black/75">
            {/* Right Triangle: Arabic-Indic numeral in gold */}
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 22" className="w-5 h-4 shrink-0">
                <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.4" />
                <text
                  x="12"
                  y="17.2"
                  textAnchor="middle"
                  fill="#F3E5AB"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="Cairo, Amiri, sans-serif"
                >
                  {toArabicIndicDigits(currentPage)}
                </text>
              </svg>
              <span className="font-editorial text-amber-300/90 font-bold hidden sm:inline">
                {activeBook.title} · {activeBook.author}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer text-xs font-semibold"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'عرض عادي' : 'تكبير للشاشة'}</span>
            </button>

            {/* Left Triangle: English numeral in gold */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-400 text-xs hidden sm:inline tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <svg viewBox="0 0 24 22" className="w-5 h-4 shrink-0">
                <polygon points="12,1 23,21 1,21" fill="#040406" stroke="#D4AF37" strokeWidth="1.4" />
                <text
                  x="12"
                  y="17"
                  textAnchor="middle"
                  fill="#F3E5AB"
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace, sans-serif"
                >
                  {currentPage}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Table of Contents Drawer Modal */}
      {showToc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl p-6 bg-[#12121A] border border-amber-400/80 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">فهرس الأبواب والمباحث</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowToc(false)}
                className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {pages.map((page) => (
                <button
                  type="button"
                  key={page.id}
                  onClick={() => jumpToPage(page.pageNumber)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-right transition-colors cursor-pointer ${
                    page.pageNumber === currentPage
                      ? 'bg-amber-400/20 border border-amber-400 text-white'
                      : 'bg-black/50 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-semibold text-amber-300 block">
                      {page.displayNumber || page.chapter || 'مبحث'}
                    </span>
                    <span className="text-sm font-bold">{page.title}</span>
                  </div>
                  <span className="font-mono text-xs text-amber-400 font-bold tabular-nums">
                    ص {page.pageNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="relative z-20 w-full border-t border-amber-500/15 bg-black/75 backdrop-blur-md">
          <LiveReaderFeed reviews={reviews} onOpenReviewModal={() => setShowReviewModal(true)} />
        </div>
      )}

      <SaveProgressModal
        isOpen={showSaveModal}
        progress={{
          currentPage,
          totalPages,
          progressPercent: Math.round((currentPage / totalPages) * 100),
          lastReadDate: new Date().toISOString(),
          isCompleted: currentPage === totalPages,
        }}
        onClose={() => setShowSaveModal(false)}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={onAddReview}
      />
    </div>
  );
};
