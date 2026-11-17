import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  BookOpen,
  Coins,
  Share2,
  Printer,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Lock,
  Copy,
  Check,
  CreditCard,
  PlusCircle,
  Award,
  Library,
  Eye,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { ExhibitionBook, PrintedCardEntry } from '../types';
import { INITIAL_EXHIBITION_BOOKS } from '../data/exhibitionBooks';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';
import { audioEngine } from '../utils/audioEngine';
import { AudiobookPlayerView, loadSavedAudiobookResume } from './AudiobookPlayerView';

const FAIR_STORAGE_KEY = 'md_book_fair_state_v1';

interface FairPersistedState {
  mdPoints: number;
  ownedBookIds: string[];
  customBooks: ExhibitionBook[];
  printedCards: PrintedCardEntry[];
  hasMembership: boolean;
  freeListeningSecondsUsed: number;
}

interface BookExhibitionViewProps {
  onBackToPlatform: () => void;
  onOpenFullNoonReader: () => void;
}

function generateCardCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MD-${num}`;
}

export const BookExhibitionView: React.FC<BookExhibitionViewProps> = ({
  onBackToPlatform,
  onOpenFullNoonReader,
}) => {
  const { account } = useUnifiedPlatform();

  const [state, setState] = useState<FairPersistedState>(() => {
    try {
      const raw = localStorage.getItem(FAIR_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FairPersistedState>;
        return {
          mdPoints: typeof parsed.mdPoints === 'number' ? parsed.mdPoints : 100,
          ownedBookIds: Array.isArray(parsed.ownedBookIds) ? parsed.ownedBookIds : [],
          customBooks: Array.isArray(parsed.customBooks) ? parsed.customBooks : [],
          printedCards: Array.isArray(parsed.printedCards) ? parsed.printedCards : [],
          hasMembership: Boolean(parsed.hasMembership),
          freeListeningSecondsUsed:
            typeof parsed.freeListeningSecondsUsed === 'number' && parsed.freeListeningSecondsUsed >= 0
              ? parsed.freeListeningSecondsUsed
              : 0,
        };
      }
    } catch {
      // fallback cleanly
    }
    return {
      mdPoints: 100,
      ownedBookIds: [],
      customBooks: [],
      printedCards: [],
      hasMembership: false,
      freeListeningSecondsUsed: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAIR_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const allBooks: ExhibitionBook[] = useMemo(
    () => [...state.customBooks, ...INITIAL_EXHIBITION_BOOKS],
    [state.customBooks]
  );

  const [activeTab, setActiveTab] = useState<'catalog' | 'myLibrary' | 'cards' | 'publish'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'paid' | 'free'>('all');

  // Selected Book Details Page
  const [selectedBook, setSelectedBook] = useState<ExhibitionBook | null>(null);

  // Preview / Full Inside-App Reader Modal
  const [readingBook, setReadingBook] = useState<{ book: ExhibitionBook; mode: 'preview10' | 'full'; pageIndex: number } | null>(null);

  // Audiobook Listener Full View
  const [listeningBook, setListeningBook] = useState<ExhibitionBook | null>(null);

  const savedResumeBook = useMemo(() => {
    const resume = loadSavedAudiobookResume();
    if (!resume) return null;
    const found = allBooks.find((b) => b.id === resume.bookId);
    return found ? { book: found, resume } : null;
  }, [allBooks, listeningBook]);

  // Modals: Buy 1000 Points / Insufficient Points / Share Card / Print Card
  const [showBuyPointsModal, setShowBuyPointsModal] = useState(false);
  const [insufficientNoticeBook, setInsufficientNoticeBook] = useState<ExhibitionBook | null>(null);
  const [shareCardBook, setShareCardBook] = useState<ExhibitionBook | null>(null);
  const [printDialogBook, setPrintDialogBook] = useState<ExhibitionBook | null>(null);
  const [printerNameInput, setPrinterNameInput] = useState<string>(account.name || 'أحمد');
  const [latestPrintedCard, setLatestPrintedCard] = useState<PrintedCardEntry | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Publish Free / Membership Book Form state
  const [pubTitle, setPubTitle] = useState('');
  const [pubAuthor, setPubAuthor] = useState(account.name || 'مؤلف مشارك');
  const [pubDesc, setPubDesc] = useState('');
  const [pubPages, setPubPages] = useState('32');
  const [pubIsFree, setPubIsFree] = useState(true);
  const [pubPricePoints, setPubPricePoints] = useState('80');

  const userPublishedBooksCount = state.customBooks.length;
  const maxAllowedBooks = state.hasMembership ? 9 : 3;
  const freePublishedCount = state.customBooks.filter((b) => b.isFreeShowcase).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredBooks = useMemo(() => {
    const source = activeTab === 'myLibrary'
      ? allBooks.filter((b) => state.ownedBookIds.includes(b.id) || b.isFreeShowcase)
      : allBooks;

    return source.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);
      const matchesFilter =
        catalogFilter === 'all' ||
        (catalogFilter === 'free' && b.isFreeShowcase) ||
        (catalogFilter === 'paid' && !b.isFreeShowcase);
      return matchesQuery && matchesFilter;
    });
  }, [allBooks, activeTab, state.ownedBookIds, searchQuery, catalogFilter]);

  // Buy 1000 MD Points (converts EGP -> +1000 points)
  const handleBuy1000Points = () => {
    setState((prev) => ({
      ...prev,
      mdPoints: prev.mdPoints + 1000,
    }));
    audioEngine.playGoldenChime();
    setShowBuyPointsModal(false);
    setInsufficientNoticeBook(null);
    showToast('تم تحويل المبلغ بنجاح وإضافة 1000 نقطة MD إلى رصيدك!');
  };

  // Purchase Book using MD Points ONLY
  const handlePurchaseWithPoints = (book: ExhibitionBook): boolean => {
    if (book.isFreeShowcase) {
      setReadingBook({ book, mode: 'full', pageIndex: 0 });
      return true;
    }
    if (state.ownedBookIds.includes(book.id)) {
      if (!listeningBook) {
        if (book.isBuiltInNoon) {
          onOpenFullNoonReader();
        } else {
          setReadingBook({ book, mode: 'full', pageIndex: 0 });
        }
      }
      return true;
    }
    if (state.mdPoints < book.pricePoints) {
      setInsufficientNoticeBook(book);
      return false;
    }

    setState((prev) => ({
      ...prev,
      mdPoints: prev.mdPoints - book.pricePoints,
      ownedBookIds: [...prev.ownedBookIds, book.id],
    }));
    audioEngine.playGoldenChime();
    showToast(`تم شراء «${book.title}» بـ ${book.pricePoints} نقطة MD وأُضيف إلى مكتبتك!`);
    return true;
  };

  // Open Preview (First 10 pages)
  const handleOpenPreview10 = (book: ExhibitionBook) => {
    audioEngine.playBookOpen();
    setReadingBook({ book, mode: 'preview10', pageIndex: 0 });
  };

  // Open Reader ("اقرأ الكتاب": Full if owned/free, otherwise first 10 pages)
  const handleReadBookAction = (book: ExhibitionBook) => {
    if (book.isFreeShowcase || state.ownedBookIds.includes(book.id)) {
      handleReadOwnedBook(book);
    } else {
      handleOpenPreview10(book);
    }
  };

  // Open Full Reader (after purchase or free showcase)
  const handleReadOwnedBook = (book: ExhibitionBook) => {
    if (book.isBuiltInNoon && state.ownedBookIds.includes(book.id)) {
      onOpenFullNoonReader();
      return;
    }
    audioEngine.playBookOpen();
    setReadingBook({ book, mode: 'full', pageIndex: 0 });
  };

  // Open Audiobook Listener ("اسمع الكتاب")
  const handleListenBook = (book: ExhibitionBook) => {
    audioEngine.playBookOpen();
    setListeningBook(book);
  };

  // Print Card -> Record in Printed Cards List (Name, MD-XXXX, Print Date)
  const handleConfirmPrintCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printDialogBook) return;
    const cleanName = printerNameInput.trim() || account.name || 'زائر المعرض';
    const nowFormatted = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newCard: PrintedCardEntry = {
      id: `card-${Date.now()}`,
      cardNumber: generateCardCode(),
      printerName: cleanName,
      bookId: printDialogBook.id,
      bookTitle: printDialogBook.title,
      bookAuthor: printDialogBook.author,
      printedAt: nowFormatted,
    };

    setState((prev) => ({
      ...prev,
      printedCards: [newCard, ...prev.printedCards],
    }));
    audioEngine.playGoldenChime();
    setPrintDialogBook(null);
    setLatestPrintedCard(newCard);
    showToast(`تم تسجيل وطباعة الكارت رقم ${newCard.cardNumber} في قائمة الكروت!`);
  };

  // Trigger browser print for a specific card
  const handlePrintCardSheet = (card: PrintedCardEntry) => {
    const win = window.open('', '_blank', 'width=520,height=420');
    if (win) {
      win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>كارت ${card.cardNumber}</title>
<style>
  body { background:#05070E; color:#F3E5AB; font-family:'Cairo',sans-serif; padding:24px; text-align:center; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .card { border:2px solid #D4AF37; background:#0B1633; border-radius:16px; padding:24px; max-width:400px; margin:0 auto; }
  .code { font-family:monospace; font-size:22px; color:#D4AF37; font-weight:900; margin:10px 0; }
</style></head>
<body>
  <div class="card">
    <div style="color:#D4AF37;font-size:12px;">معرض الكتاب — منظومة MD</div>
    <h2>${card.bookTitle}</h2>
    <p>تأليف: ${card.bookAuthor}</p>
    <div class="code">${card.cardNumber}</div>
    <p>اسم الطابع: <strong>${card.printerName}</strong></p>
    <p style="font-size:12px;color:#CBD5E1;">تاريخ الطباعة: ${card.printedAt}</p>
  </div>
  <script>window.onload=function(){window.print();};</script>
</body></html>`);
      win.document.close();
    } else {
      window.print();
    }
  };

  // Publish Book (3 Free -> Activate Membership -> Max 9)
  const handlePublishExhibitionBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) return;

    if (!state.hasMembership && userPublishedBooksCount >= 3) {
      showToast('استنفدت الحد المجاني (3 كتب للعرض). فعّل العضوية للنشر حتى 9 كتب كحد أقصى.');
      return;
    }
    if (state.hasMembership && userPublishedBooksCount >= 9) {
      showToast('وصلت إلى الحد الأقصى للنشر بالعضوية (9 كتب).');
      return;
    }

    const isFree = !state.hasMembership ? true : pubIsFree;
    const pts = isFree ? 0 : Math.max(20, parseInt(pubPricePoints, 10) || 80);

    const newBook: ExhibitionBook = {
      id: `pub-${Date.now()}`,
      title: pubTitle.trim(),
      author: pubAuthor.trim() || account.name || 'مؤلف',
      description: pubDesc.trim() || 'كتاب منشور حديثاً داخل معرض الكتاب.',
      cover: '/books/noon/images/chapter5.jpg',
      rating: 5.0,
      ratingsCount: 1,
      pageCount: Math.max(10, parseInt(pubPages, 10) || 32),
      isFreeShowcase: isFree,
      pricePoints: pts,
      priceEgpHint: isFree ? 0 : Math.round(pts / 10),
      category: isFree ? 'عرض مجاني' : 'إصدارات الأعضاء',
      publishedByUser: true,
      samplePages: Array.from({ length: 14 }, (_, i) =>
        `صفحة ${i + 1} من «${pubTitle.trim()}»:\n\n${pubDesc.trim() || 'محتوى تمهيدي من الكتاب المنشور داخل معرض الكتاب.'}`
      ),
    };

    setState((prev) => ({
      ...prev,
      customBooks: [newBook, ...prev.customBooks],
    }));
    audioEngine.playGoldenChime();
    setPubTitle('');
    setPubDesc('');
    setActiveTab('catalog');
    showToast(`تم نشر «${newBook.title}» (${isFree ? 'عرض مجاني' : `${pts} نقطة MD`}) في المعرض!`);
  };

  const handleActivateMembership = () => {
    setState((prev) => ({ ...prev, hasMembership: true }));
    audioEngine.playGoldenChime();
    showToast('تم تفعيل العضوية بنجاح! يمكنك الآن نشر المزيد حتى 9 كتب كحد أقصى.');
  };

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#05070E] text-white flex flex-col">
      {/* Background Navy-Black Subtle Radial Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 36, 86, 0.55) 0%, rgba(5, 7, 14, 0.98) 70%)',
        }}
      />

      {/* TOP BAR: 3D Spinning MD Coin + Live Points Balance + Back */}
      <header className="sticky top-0 z-40 bg-[#070B17]/95 backdrop-blur-md border-b border-[#D4AF37]/35">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Right: 3D Spinning MD Coin + Exhibition Brand */}
          <div className="flex items-center gap-3">
            {/* True 3D Rotating MD Coin */}
            <div className="md-coin-3d-stage w-12 h-12 shrink-0">
              <div className="md-coin-3d-spinner relative w-12 h-12">
                {/* Front Face */}
                <div className="md-coin-face absolute inset-0 rounded-full bg-gradient-to-br from-[#FFF3C4] via-[#D4AF37] to-[#8C6214] border-2 border-[#FFF8DC] shadow-[0_0_20px_rgba(212,175,55,0.55)] flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full border border-[#070B17]/50 flex items-center justify-center bg-[#0B1633]/15">
                    <span className="font-black text-xs text-[#070B17] tracking-tight">MD</span>
                  </div>
                </div>
                {/* Back Face */}
                <div className="md-coin-face md-coin-face-back absolute inset-0 rounded-full bg-gradient-to-br from-[#F3E5AB] via-[#C59B27] to-[#78510C] border-2 border-[#FFF8DC] shadow-[0_0_20px_rgba(212,175,55,0.55)] flex items-center justify-center">
                  <span className="font-editorial font-black text-lg text-[#070B17]">ن</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#F3E5AB] leading-tight">
                معرض الكتاب
              </h1>
              <p className="text-[11px] text-slate-300">
                الشراء بالنقاط فقط · أسود وكحلي وذهبي
              </p>
            </div>
          </div>

          {/* Left: Points Balance + Buy 1000 Points + Back to Platform */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B1633] border border-[#D4AF37]/60 shadow-inner">
              <Coins className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs text-slate-300">رصيدي:</span>
              <span className="text-sm sm:text-base font-black text-[#F3E5AB] tabular-nums">
                {state.mdPoints.toLocaleString()} نقطة MD
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowBuyPointsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-xs sm:text-sm hover:brightness-105 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.35)]"
            >
              اشتري 1000 نقطة
            </button>

            <button
              type="button"
              onClick={onBackToPlatform}
              className="px-3 py-2 rounded-xl bg-[#0B1633] border border-slate-700 hover:border-[#D4AF37] text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>المنصة</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-bar & Search Input */}
        <div className="max-w-6xl mx-auto px-4 pb-3 space-y-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedBook(null);
                setActiveTab('catalog');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer border ${
                activeTab === 'catalog' && !selectedBook
                  ? 'bg-[#D4AF37] text-[#05070E] border-[#D4AF37]'
                  : 'bg-[#0B1633] text-slate-200 border-[#D4AF37]/30 hover:border-[#D4AF37]'
              }`}
            >
              المعرض ({allBooks.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedBook(null);
                setActiveTab('myLibrary');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'myLibrary' && !selectedBook
                  ? 'bg-[#D4AF37] text-[#05070E] border-[#D4AF37]'
                  : 'bg-[#0B1633] text-slate-200 border-[#D4AF37]/30 hover:border-[#D4AF37]'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>مكتبتي ({state.ownedBookIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedBook(null);
                setActiveTab('cards');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'cards' && !selectedBook
                  ? 'bg-[#D4AF37] text-[#05070E] border-[#D4AF37]'
                  : 'bg-[#0B1633] text-slate-200 border-[#D4AF37]/30 hover:border-[#D4AF37]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>قايمة الكروت ({state.printedCards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedBook(null);
                setActiveTab('publish');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                activeTab === 'publish' && !selectedBook
                  ? 'bg-[#D4AF37] text-[#05070E] border-[#D4AF37]'
                  : 'bg-[#0B1633] text-slate-200 border-[#D4AF37]/30 hover:border-[#D4AF37]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>
                نشر كتاب ({userPublishedBooksCount}/{maxAllowedBooks})
              </span>
            </button>
          </div>

          {/* Search Bar: "ابحث عن كتاب، مؤلف..." */}
          {!selectedBook && (activeTab === 'catalog' || activeTab === 'myLibrary') && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كتاب، مؤلف..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 focus:border-[#D4AF37] text-sm text-white placeholder-slate-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'paid', label: 'شراء بالنقاط' },
                  { id: 'free', label: 'مجاني · عرض' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCatalogFilter(f.id as 'all' | 'paid' | 'free')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                      catalogFilter === f.id
                        ? 'bg-[#15285C] border-[#D4AF37] text-[#F3E5AB]'
                        : 'bg-[#080E21] border-slate-800 text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Global Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#05070E] font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 max-w-[92%]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MAIN BODY */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-28">
        {/* Saved Audiobook Resume Strip */}
        {!selectedBook && savedResumeBook && activeTab === 'catalog' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#0B1633] border border-[#D4AF37]/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Headphones className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <span className="font-black text-[#F3E5AB]">{savedResumeBook.book.title}</span>
                <span className="text-slate-300 mx-1.5">·</span>
                <span className="text-slate-300 text-xs">
                  توقفت عند صفحة {savedResumeBook.resume.pageIndex + 1}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleListenBook(savedResumeBook.book)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>كمل الاستماع من نفس المكان</span>
            </button>
          </div>
        )}

        {/* VIEW A: BOOK DETAILS PAGE (صفحة الكتاب) */}
        {selectedBook ? (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F3E5AB] hover:text-white cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الرجوع لقائمة المعرض</span>
            </button>

            <div className="rounded-2xl p-5 sm:p-8 bg-gradient-to-b from-[#0B1633] to-[#070B17] border border-[#D4AF37]/50 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Large Book Cover */}
              <div className="md:col-span-4">
                <div className="w-full max-w-xs mx-auto aspect-[5/7] rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_18px_45px_rgba(0,0,0,0.85)] bg-[#05070E] relative">
                  <img
                    src={selectedBook.cover}
                    alt={selectedBook.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-center">
                    <span className="text-xs font-bold text-[#F3E5AB]">{selectedBook.category}</span>
                  </div>
                </div>
              </div>

              {/* Description, Page Count, Share & Print Card Actions */}
              <div className="md:col-span-8 space-y-4 text-right">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <span className="text-xs font-bold text-[#D4AF37]">
                    {selectedBook.isFreeShowcase ? 'عرض مجاني داخل المعرض' : 'إصدار بالنقاط · مكتبة MD'}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-black text-[#F3E5AB] tabular-nums">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    {selectedBook.rating} ({selectedBook.ratingsCount} تقييم)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedBook.title}</h2>
                <p className="text-sm font-bold text-[#D4AF37]">تأليف: {selectedBook.author}</p>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {selectedBook.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#05070E] border border-[#D4AF37]/30">
                    <div className="text-xs text-slate-400">عدد الصفحات</div>
                    <div className="text-lg font-black text-white tabular-nums mt-0.5">
                      {selectedBook.pageCount} صفحة
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#05070E] border border-[#D4AF37]/30">
                    <div className="text-xs text-slate-400">الحالة</div>
                    <div className="text-base font-black text-[#F3E5AB] mt-0.5">
                      {selectedBook.isFreeShowcase
                        ? 'عرض (مجاني)'
                        : state.ownedBookIds.includes(selectedBook.id)
                          ? 'في مكتبتي'
                          : `${selectedBook.pricePoints} نقطة MD`}
                    </div>
                    {!selectedBook.isFreeShowcase && (
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        ({selectedBook.priceEgpHint} ج.م للتوضيح)
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#05070E] border border-[#D4AF37]/30 col-span-2 sm:col-span-1">
                    <div className="text-xs text-slate-400">المعاينة</div>
                    <div className="text-base font-black text-white mt-0.5">أول 10 صفحات</div>
                  </div>
                </div>

                {/* Action Buttons: Read Book + Listen Book + Preview 10 pages + Share + Print Card */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleReadBookAction(selectedBook)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>اقرأ الكتاب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleListenBook(selectedBook)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#15285C] hover:bg-[#1D367B] border-2 border-[#D4AF37] text-xs sm:text-sm font-black text-[#F3E5AB] flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                  >
                    <Headphones className="w-4 h-4 text-[#D4AF37]" />
                    <span>اسمع الكتاب</span>
                  </button>

                  {!selectedBook.isFreeShowcase && !state.ownedBookIds.includes(selectedBook.id) && (
                    <button
                      type="button"
                      onClick={() => handleOpenPreview10(selectedBook)}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B1633] hover:bg-[#13224A] border border-[#D4AF37]/50 text-xs sm:text-sm font-extrabold text-[#F3E5AB] flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة - اقرأ أول 10 صفحات</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShareCardBook(selectedBook)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#05070E] hover:bg-[#0D1426] border border-[#D4AF37]/60 text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>شارك</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrinterNameInput(account.name || 'أحمد');
                      setPrintDialogBook(selectedBook);
                    }}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#05070E] hover:bg-[#0D1426] border border-[#D4AF37]/60 text-xs sm:text-sm font-extrabold text-[#F3E5AB] flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#D4AF37]" />
                    <span>طباعة كارت</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Bar inside Book Page: "شراء بالنقاط" ثابت تحت + اسمع الكتاب */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B17]/95 backdrop-blur-md border-t-2 border-[#D4AF37] px-4 py-3 shadow-2xl">
              <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <div className="text-xs font-bold text-[#F3E5AB] truncate max-w-[180px] sm:max-w-sm">
                    {selectedBook.title}
                  </div>
                  <div className="text-xs text-slate-300 tabular-nums">
                    {selectedBook.isFreeShowcase
                      ? 'عرض مجاني بالكامل'
                      : `${selectedBook.pricePoints} نقطة MD (${selectedBook.priceEgpHint} ج.م للتوضيح)`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleListenBook(selectedBook)}
                    className="px-4 py-3 rounded-xl bg-[#0B1633] border border-[#D4AF37] text-[#F3E5AB] font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-[#D4AF37]" />
                    <span>اسمع الكتاب</span>
                  </button>

                  {selectedBook.isFreeShowcase ? (
                    <button
                      type="button"
                      onClick={() => handleReadOwnedBook(selectedBook)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>عرض — اقرأ الكتاب مجاناً</span>
                    </button>
                  ) : state.ownedBookIds.includes(selectedBook.id) ? (
                    <button
                      type="button"
                      onClick={() => handleReadOwnedBook(selectedBook)}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#05070E] font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>اقرأ الآن في مكتبتي</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePurchaseWithPoints(selectedBook)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.45)]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>شراء بالنقاط ({selectedBook.pricePoints} نقطة MD)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'cards' ? (
          /* VIEW B: PRINTED CARDS LOG (قايمة الكروت) */
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-[#F3E5AB]">قايمة الكروت المطبوعة</h2>
                <p className="text-xs text-slate-300">
                  يسجّل هنا كل كارت يتم طباعته بالاسم ورقم الكارت MD-XXXX وتاريخ الطباعة
                </p>
              </div>
            </div>

            {state.printedCards.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#0B1633] border border-[#D4AF37]/30 text-center space-y-2">
                <Printer className="w-8 h-8 text-[#D4AF37] mx-auto" />
                <div className="font-bold text-sm">لم يتم طباعة أي كارت بعد</div>
                <p className="text-xs text-slate-400">
                  افتح أي كتاب من المعرض واضغط «طباعة كارت» ليُحفظ هنا فوراً برقم MD-XXXX
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.printedCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl p-4 bg-gradient-to-br from-[#0B1633] to-[#060913] border border-[#D4AF37]/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 text-right">
                      <div className="font-mono text-sm font-black text-[#D4AF37]">{card.cardNumber}</div>
                      <div className="font-extrabold text-sm text-white">{card.bookTitle}</div>
                      <div className="text-xs text-slate-300">
                        اسم اللي طبعه: <strong className="text-[#F3E5AB]">{card.printerName}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        تاريخ الطباعة: {card.printedAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrintCardSheet(card)}
                      className="px-3.5 py-2 rounded-xl bg-[#D4AF37] text-[#05070E] font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : activeTab === 'publish' ? (
          /* VIEW C: PUBLISH FREE (MAX 3) + MEMBERSHIP (MAX 9) */
          <section className="max-w-2xl mx-auto space-y-5">
            <div className="rounded-2xl p-5 bg-[#0B1633] border border-[#D4AF37]/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-black text-[#F3E5AB] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  <span>نظام النشر في معرض الكتاب</span>
                </h2>
                <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-[#05070E] border border-[#D4AF37]/40 text-[#F3E5AB] tabular-nums">
                  {state.hasMembership
                    ? `عضوية مفعلة: ${userPublishedBooksCount} / 9 كتب`
                    : `النشر المجاني: ${freePublishedCount} / 3 كتب`}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                لكل كاتب حتى <strong>3 كتب مجانية</strong> بنموذج <strong>«عرض»</strong> داخل المعرض. بعد إتمام الكتب الـ 3 المجانية يتم <strong>تفعيل العضوية</strong> لإتاحة نشر المزيد بحد أقصى <strong>9 كتب</strong>.
              </p>

              {!state.hasMembership && (
                <div className="p-3.5 rounded-xl bg-[#05070E] border border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-200">
                    {userPublishedBooksCount >= 3
                      ? 'استنفدت الـ 3 كتب المجانية! فعّل العضوية الآن للنشر حتى 9 كتب.'
                      : `متبقي لك ${Math.max(0, 3 - userPublishedBooksCount)} كتب مجانية للعرض، أو يمكنك تفعيل العضوية الآن.`}
                  </div>
                  <button
                    type="button"
                    onClick={handleActivateMembership}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-xs cursor-pointer whitespace-nowrap"
                  >
                    تفعيل العضوية (حتى 9 كتب)
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handlePublishExhibitionBook}
              className="rounded-2xl p-5 sm:p-6 bg-[#070B17] border border-[#D4AF37]/40 space-y-4"
            >
              <h3 className="font-black text-base text-white">إضافة كتاب جديد للمعرض</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#F3E5AB] mb-1">اسم الكتاب</label>
                  <input
                    type="text"
                    required
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    placeholder="اكتب عنوان الكتاب..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 focus:border-[#D4AF37] text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#F3E5AB] mb-1">اسم المؤلف</label>
                  <input
                    type="text"
                    required
                    value={pubAuthor}
                    onChange={(e) => setPubAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 focus:border-[#D4AF37] text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F3E5AB] mb-1">وصف الكتاب</label>
                <textarea
                  rows={3}
                  value={pubDesc}
                  onChange={(e) => setPubDesc(e.target.value)}
                  placeholder="وصف مختصر لموضوع الكتاب..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 focus:border-[#D4AF37] text-sm text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#F3E5AB] mb-1">عدد الصفحات</label>
                  <input
                    type="number"
                    min="10"
                    value={pubPages}
                    onChange={(e) => setPubPages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 text-sm text-white tabular-nums outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F3E5AB] mb-1">نوع النشر</label>
                  <select
                    value={pubIsFree || !state.hasMembership ? 'free' : 'paid'}
                    disabled={!state.hasMembership}
                    onChange={(e) => setPubIsFree(e.target.value === 'free')}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 text-sm text-white outline-none disabled:opacity-70"
                  >
                    <option value="free">عرض مجاني</option>
                    {state.hasMembership && <option value="paid">بيع بنقاط MD</option>}
                  </select>
                </div>

                {state.hasMembership && !pubIsFree && (
                  <div>
                    <label className="block text-xs font-bold text-[#F3E5AB] mb-1">السعر (نقطة MD)</label>
                    <input
                      type="number"
                      min="20"
                      value={pubPricePoints}
                      onChange={(e) => setPubPricePoints(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-slate-700 text-sm text-white tabular-nums outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={userPublishedBooksCount >= maxAllowedBooks}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {userPublishedBooksCount >= maxAllowedBooks
                  ? state.hasMembership
                    ? 'اكتمل الحد الأقصى (9 / 9 كتب)'
                    : 'فعّل العضوية لنشر المزيد (تجاوزت 3 مجاني)'
                  : 'نشر الكتاب في المعرض'}
              </button>
            </form>
          </section>
        ) : (
          /* VIEW D: CATALOG / MY LIBRARY BOOK CARDS GRID */
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-[#F3E5AB]">
                {activeTab === 'myLibrary' ? 'مكتبتي — الكتب المقتناة والمجانية' : 'إصدارات معرض الكتاب'}
              </h2>
              <span className="text-xs text-slate-400 tabular-nums">
                {filteredBooks.length} كتاب
              </span>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0B1633] border border-[#D4AF37]/30 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-[#D4AF37] mx-auto" />
                <div className="font-bold text-sm">
                  {activeTab === 'myLibrary'
                    ? 'لا توجد كتب مشتراة في مكتبتك بعد — اشترِ أي كتاب بنقاط MD!'
                    : 'لا توجد كتب مطابقة لبحثك.'}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map((book) => {
                  const isOwned = state.ownedBookIds.includes(book.id);

                  return (
                    <article
                      key={book.id}
                      className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#0B1633] to-[#070B17] border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all shadow-xl flex flex-col justify-between"
                    >
                      {/* Large Cover Image (Clickable to Open Book Page) */}
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="relative w-full h-72 overflow-hidden bg-[#05070E] group cursor-pointer block text-right"
                      >
                        <img
                          src={book.cover}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070B17] via-black/25 to-transparent" />

                        {/* Top Corner Free/Owned Marker */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#05070E]/90 border border-[#D4AF37]/60 text-[11px] font-black text-[#F3E5AB]">
                          {book.isFreeShowcase ? 'عرض' : isOwned ? 'في مكتبتي' : `${book.pageCount} صفحة`}
                        </div>

                        {/* Rating Badge Top Left */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#05070E]/90 border border-[#D4AF37]/40 text-xs font-black text-[#F3E5AB] flex items-center gap-1 tabular-nums">
                          <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                          <span>{book.rating}</span>
                        </div>
                      </button>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-right">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            className="text-lg font-black text-white hover:text-[#F3E5AB] transition-colors text-right cursor-pointer"
                          >
                            {book.title}
                          </button>
                          <p className="text-xs font-bold text-[#D4AF37]">المؤلف: {book.author}</p>

                          {/* Price in Points ONLY (+ tiny EGP note for clarity), OR "عرض" if free */}
                          <div className="pt-1.5 flex items-baseline gap-2 flex-wrap">
                            {book.isFreeShowcase ? (
                              <span className="text-sm font-black text-emerald-400">
                                عرض مجاني (بدون شراء)
                              </span>
                            ) : (
                              <>
                                <span className="text-base font-black text-[#F3E5AB] tabular-nums">
                                  {book.pricePoints} نقطة MD
                                </span>
                                <span className="text-[11px] text-slate-400 tabular-nums">
                                  ({book.priceEgpHint} ج.م للتوضيح)
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: "اسمع الكتاب" جنب "اقرأ الكتاب" + معاينة / شراء */}
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleReadBookAction(book)}
                              className="py-2.5 px-2.5 rounded-xl bg-[#0E1E47] hover:bg-[#172E69] border border-[#D4AF37]/50 text-xs font-extrabold text-[#F3E5AB] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 shrink-0" />
                              <span>اقرأ الكتاب</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleListenBook(book)}
                              className="py-2.5 px-2.5 rounded-xl bg-[#15285C] hover:bg-[#1F3A84] border border-[#D4AF37] text-xs font-black text-[#F3E5AB] flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Headphones className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span>اسمع الكتاب</span>
                            </button>
                          </div>

                          {!book.isFreeShowcase && !isOwned && (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview10(book)}
                              className="w-full py-2 px-3 rounded-xl bg-[#05070E] hover:bg-[#0D1426] border border-[#D4AF37]/35 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>معاينة - اقرأ أول 10 صفحات</span>
                            </button>
                          )}

                          {book.isFreeShowcase ? (
                            <button
                              type="button"
                              onClick={() => handleReadOwnedBook(book)}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-400/60 text-xs font-black text-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>عرض</span>
                            </button>
                          ) : isOwned ? (
                            <button
                              type="button"
                              onClick={() => handleReadOwnedBook(book)}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#05070E] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>اقرأ الآن في مكتبتي</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePurchaseWithPoints(book)}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>شراء بالنقاط</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL 1: 10-PAGE PREVIEW / FULL IN-APP READER */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#070B17] border-2 border-[#D4AF37] text-white p-5 sm:p-7 flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/30">
              <div>
                <div className="text-xs font-bold text-[#D4AF37]">
                  {readingBook.mode === 'preview10' ? 'معاينة — أول 10 صفحات فقط' : 'القراءة الكاملة — مكتبتي'}
                </div>
                <h3 className="text-lg font-black text-white">{readingBook.book.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingBook(null)}
                className="p-2 rounded-lg bg-[#0B1633] text-slate-300 hover:text-white cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-4">
              {readingBook.mode === 'preview10' && readingBook.pageIndex >= 10 ? (
                <div className="py-10 text-center space-y-4">
                  <Lock className="w-10 h-10 text-[#D4AF37] mx-auto" />
                  <h4 className="text-xl font-black text-[#F3E5AB]">
                    انتهت صفحات المعاينة المجانية (10 صفحات)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    اشترِ الكتاب الآن بنقاط MD ليُفتح لك كاملاً داخل مكتبتك وتكمل القراءة فوراً.
                  </p>
                  {!readingBook.book.isFreeShowcase && !state.ownedBookIds.includes(readingBook.book.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = readingBook.book;
                        setReadingBook(null);
                        handlePurchaseWithPoints(target);
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-sm cursor-pointer"
                    >
                      شراء بالنقاط ({readingBook.book.pricePoints} نقطة MD)
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="text-xs font-mono text-[#D4AF37] tabular-nums">
                    صفحة {readingBook.pageIndex + 1} من{' '}
                    {readingBook.mode === 'preview10' ? 10 : readingBook.book.samplePages.length}
                  </div>
                  <div className="text-sm sm:text-base text-slate-100 leading-loose whitespace-pre-line font-sans text-justify">
                    {readingBook.book.samplePages[readingBook.pageIndex] || readingBook.book.description}
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/30 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={readingBook.pageIndex === 0}
                onClick={() =>
                  setReadingBook((prev) => (prev ? { ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) } : null))
                }
                className="px-4 py-2 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {readingBook.book.isBuiltInNoon && state.ownedBookIds.includes(readingBook.book.id) && (
                <button
                  type="button"
                  onClick={() => {
                    setReadingBook(null);
                    onOpenFullNoonReader();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#05070E] text-xs font-black cursor-pointer"
                >
                  فتح القارئ التفاعلي الكامل (نون)
                </button>
              )}

              <button
                type="button"
                disabled={
                  readingBook.mode === 'preview10'
                    ? readingBook.pageIndex >= 10
                    : readingBook.pageIndex >= readingBook.book.samplePages.length - 1
                }
                onClick={() => {
                  audioEngine.playPageFlip();
                  setReadingBook((prev) => (prev ? { ...prev, pageIndex: prev.pageIndex + 1 } : null));
                }}
                className="px-4 py-2 rounded-xl bg-[#0B1633] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BUY 1000 POINTS OR INSUFFICIENT POINTS PROMPT */}
      {(showBuyPointsModal || insufficientNoticeBook) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#070B17] border-2 border-[#D4AF37] p-6 text-white space-y-4">
            <button
              type="button"
              onClick={() => {
                setShowBuyPointsModal(false);
                setInsufficientNoticeBook(null);
              }}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] text-[#05070E] flex items-center justify-center font-black text-lg">
                MD
              </div>
              <h3 className="text-xl font-black text-[#F3E5AB]">
                {insufficientNoticeBook ? 'رصيد النقاط لا يكفي للشراء' : 'شحن رصيد نقاط المعرض'}
              </h3>
              {insufficientNoticeBook ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  سعر «{insufficientNoticeBook.title}» هو <strong>{insufficientNoticeBook.pricePoints} نقطة MD</strong>، ورصيدك الحالي <strong>{state.mdPoints} نقطة</strong>. حوّل فلوسك لنقاط الأول ثم اشتري الكتاب فوراً!
                </p>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">
                  الشراء داخل معرض الكتاب يتم بنقاط MD فقط. اضغط بالأسفل لتحويل 100 ج.م إلى <strong>1000 نقطة MD</strong> فورية.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleBuy1000Points}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[#05070E] font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Coins className="w-4 h-4" />
              <span>اشتري 1000 نقطة الآن (+1000 نقطة MD)</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: SHARE BOOK CARD (زرار "شارك" يطلع كارت الكتاب) */}
      {shareCardBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0B1633] border-2 border-[#D4AF37] p-6 text-white space-y-4">
            <button
              type="button"
              onClick={() => setShareCardBook(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center text-xs font-bold text-[#D4AF37]">كارت مشاركة الكتاب</div>

            <div className="rounded-2xl p-4 bg-[#05070E] border border-[#D4AF37]/60 flex items-center gap-4">
              <img
                src={shareCardBook.cover}
                alt={shareCardBook.title}
                className="w-20 aspect-[5/7] object-cover rounded-lg border border-[#D4AF37]"
              />
              <div className="text-right space-y-1">
                <div className="font-black text-base text-white">{shareCardBook.title}</div>
                <div className="text-xs text-[#D4AF37]">تأليف: {shareCardBook.author}</div>
                <div className="text-xs text-slate-300 tabular-nums">
                  {shareCardBook.pageCount} صفحة ·{' '}
                  {shareCardBook.isFreeShowcase ? 'عرض مجاني' : `${shareCardBook.pricePoints} نقطة MD`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const shareText = `كارت كتاب «${shareCardBook.title}» — تأليف: ${shareCardBook.author} في معرض الكتاب MD\n${window.location.href}`;
                navigator.clipboard.writeText(shareText);
                setCopiedShare(true);
                setTimeout(() => setCopiedShare(false), 2500);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedShare ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedShare ? 'تم نسخ كارت الكتاب!' : 'نسخ ومشاركة كارت الكتاب'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: PRINT CARD DIALOG (طباعة كارت -> يتسجل في قايمة الكروت MD-XXXX) */}
      {printDialogBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleConfirmPrintCard}
            className="relative w-full max-w-md rounded-2xl bg-[#070B17] border-2 border-[#D4AF37] p-6 text-white space-y-4"
          >
            <button
              type="button"
              onClick={() => setPrintDialogBook(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#F3E5AB]">طباعة وتسجيل كارت الكتاب</h3>
            <p className="text-xs text-slate-300">
              سيتم إصدار رقم كارت فريد <strong>MD-XXXX</strong> وتسجيله في قايمة الكروت بتاريخ الطباعة.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#F3E5AB] mb-1">اسم اللي هيطبع الكارت</label>
              <input
                type="text"
                required
                value={printerNameInput}
                onChange={(e) => setPrinterNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1633] border border-[#D4AF37]/50 text-sm text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#05070E] font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>تأكيد الطباعة والتسجيل في قايمة الكروت</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 5: NEWLY PRINTED CARD RESULT */}
      {latestPrintedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0B1633] border-2 border-[#D4AF37] p-6 text-white text-center space-y-4">
            <button
              type="button"
              onClick={() => setLatestPrintedCard(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto" />
            <div className="font-mono text-2xl font-black text-[#F3E5AB]">
              {latestPrintedCard.cardNumber}
            </div>
            <div className="text-sm font-bold">{latestPrintedCard.bookTitle}</div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>الاسم: {latestPrintedCard.printerName}</div>
              <div>تاريخ الطباعة: {latestPrintedCard.printedAt}</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handlePrintCardSheet(latestPrintedCard)}
                className="py-2.5 rounded-xl bg-[#D4AF37] text-[#05070E] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكارت</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLatestPrintedCard(null);
                  setSelectedBook(null);
                  setActiveTab('cards');
                }}
                className="py-2.5 rounded-xl bg-[#05070E] border border-[#D4AF37]/60 text-[#F3E5AB] font-bold text-xs cursor-pointer"
              >
                عرض قايمة الكروت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIOBOOK FULL LISTENING OVERLAY */}
      {listeningBook && (
        <div className="fixed inset-0 z-[45] overflow-y-auto bg-[#05070E]">
          <AudiobookPlayerView
            book={listeningBook}
            isOwned={state.ownedBookIds.includes(listeningBook.id)}
            mdPoints={state.mdPoints}
            freeSecondsUsed={state.freeListeningSecondsUsed}
            onTickFreeSecond={() =>
              setState((prev) => ({
                ...prev,
                freeListeningSecondsUsed: prev.freeListeningSecondsUsed + 1,
              }))
            }
            onPurchaseWithPoints={handlePurchaseWithPoints}
            onOpenBuy1000Points={() => setShowBuyPointsModal(true)}
            onClose={() => setListeningBook(null)}
            autoPlayOnOpen={true}
          />
        </div>
      )}
    </div>
  );
};
