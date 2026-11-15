import React, { useState } from 'react';
import {
  Sun,
  Moon,
  BookOpen,
  PenTool,
  CheckCircle2,
  Coins,
  ListChecks,
  ShieldCheck,
  Star,
  ArrowLeft,
  Sparkles,
  Volume2,
  Headphones,
} from 'lucide-react';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';
import { PlatformBookItem, UserRole } from '../types';
import { EXHIBITION_CONFIG } from '../exhibition.config';

interface BookPlatformHomeProps {
  onOpenAuthModal: (defaultRole?: UserRole) => void;
  onOpenCentralCard: () => void;
  onNavigateLibrary: () => void;
  onNavigatePublisher: () => void;
  onOpenBookHolder: (bookId: string) => void;
  onOpenBookReader: (bookId: string) => void;
  onOpenReviewForBook: (bookId: string) => void;
  onOpenAppsModal: () => void;
  onOpenAuthorModal: () => void;
}

export const BookPlatformHome: React.FC<BookPlatformHomeProps> = ({
  onOpenAuthModal,
  onOpenCentralCard,
  onNavigateLibrary,
  onNavigatePublisher,
  onOpenBookHolder,
  onOpenBookReader,
  onOpenReviewForBook,
  onOpenAppsModal,
  onOpenAuthorModal,
}) => {
  const {
    account,
    coins,
    transactionsCount,
    platformLevels,
    books,
    purchasedBookIds,
    purchaseBook,
    isNightWeather,
    toggleDayNight,
    reviews,
  } = useUnifiedPlatform();

  const [purchaseNotice, setPurchaseNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const bookLevel = platformLevels.find((l) => l.id === 'book');
  const featuredBooks = books.filter((b) => b.isFeatured).slice(0, 3);
  const primaryBook: PlatformBookItem = featuredBooks[0] || books[0];

  const handleBookPurchaseOrOpen = (book: PlatformBookItem) => {
    const isOwned = purchasedBookIds.includes(book.id);
    if (isOwned) {
      onOpenBookReader(book.id);
      return;
    }
    const res = purchaseBook(book.id);
    setPurchaseNotice({ text: res.message, ok: res.success });
    setTimeout(() => setPurchaseNotice(null), 4000);
    if (res.success) {
      onOpenBookHolder(book.id);
    }
  };

  const getBookRatingSummary = (bookId: string) => {
    const matching = reviews.filter((r) => !r.bookId || r.bookId === bookId);
    if (matching.length === 0) return { avg: '5.0', count: 0 };
    const sum = matching.reduce((acc, r) => acc + r.rating, 0);
    return { avg: (sum / matching.length).toFixed(1), count: matching.length };
  };

  const primaryRating = primaryBook ? getBookRatingSummary(primaryBook.id) : { avg: '5.0', count: 0 };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#F5ECE0] text-[#2B1C11] flex flex-col justify-between pb-20 selection:bg-[#C89D54]/30"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(255,250,242,0.9) 0%, rgba(245,236,224,0.98) 55%, rgba(235,221,201,1) 100%)',
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-6 flex-1 flex flex-col gap-5">
        {/* Top Bar: User (Right) — Brown/Gold «ك» Emblem (Center) — Weather + Sun/Moon (Left) */}
        <header className="flex items-center justify-between gap-3">
          {/* Right: User Avatar + Account */}
          <button
            type="button"
            onClick={onOpenCentralCard}
            className="flex items-center gap-2.5 text-right group cursor-pointer rounded-xl px-2 py-1.5 hover:bg-[#EADBC6]/70 transition-colors"
            title="فتح الكارت المركزي الموحد"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6D4C24] to-[#2B1C11] border-2 border-[#C89D54] flex items-center justify-center text-[#F5D68E] font-bold text-base shadow-sm shrink-0">
              {account.name.charAt(0) || 'أ'}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-[#2B1C11] group-hover:text-[#6D4C24] transition-colors">
                مرحباً، {account.name}
              </div>
              <div className="text-xs font-semibold text-[#7A5934]">حسابك</div>
            </div>
          </button>

          {/* Center: Brown & Gold Book Platform «ك» Logo with Laurel Wreath */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="w-14 h-14 drop-shadow-sm">
                {/* Laurel wreath arcs */}
                <path
                  d="M20 62 C10 50 10 26 24 16"
                  fill="none"
                  stroke="#B68B46"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
                <path
                  d="M60 62 C70 50 70 26 56 16"
                  fill="none"
                  stroke="#B68B46"
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="40" r="24" fill="#3B2514" stroke="#C89D54" strokeWidth="2.5" />
                <circle cx="40" cy="40" r="20" fill="none" stroke="#E5C078" strokeWidth="0.9" strokeOpacity="0.65" />
                <text
                  x="40"
                  y="49"
                  textAnchor="middle"
                  fill="#F5D68E"
                  fontSize="28"
                  fontWeight="800"
                  fontFamily="Amiri, Cairo, serif"
                >
                  ك
                </text>
              </svg>
            </div>
            <div className="hidden sm:flex flex-col leading-tight text-right">
              <span className="text-sm font-extrabold text-[#3B2514]">منصة</span>
              <span className="text-sm font-extrabold text-[#6D4C24]">الكتاب</span>
            </div>
          </div>

          {/* Left: Weather Widget (28° + Sun/Moon toggle + City) */}
          <button
            type="button"
            onClick={toggleDayNight}
            className="flex flex-col items-end text-left rounded-xl px-2.5 py-1.5 hover:bg-[#EADBC6]/70 transition-colors cursor-pointer"
            title="تبديل حالة الجو بين النهار والليل"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-[#6D4C24] tabular-nums">
                {isNightWeather ? '22°' : '28°'}
              </span>
              {isNightWeather ? (
                <Moon className="w-5 h-5 text-[#6D4C24] fill-[#C89D54]/40" />
              ) : (
                <Sun className="w-5 h-5 text-[#C89D54] fill-[#C89D54]/30" />
              )}
            </div>
            <div className="text-[11px] font-semibold text-[#6D4C24]">
              {account.city || 'القاهرة'} · {isNightWeather ? 'ليلي هادئ' : 'مشمس'}
            </div>
          </button>
        </header>

        {/* Ornamental Hairline Divider */}
        <div className="flex items-center justify-center gap-3 px-6">
          <div className="h-[1px] flex-1 bg-gradient-to-l from-[#C89D54]/60 to-transparent" />
          <span className="w-2 h-2 rounded-full bg-[#C89D54]" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C89D54]/60 to-transparent" />
        </div>

        {/* Hero Title & Subtitle */}
        <section className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-[#4B311B] tracking-tight">
            {EXHIBITION_CONFIG.platformName}
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#6D4C24]">اختار وجهك</p>
        </section>

        {/* Toast feedback on book unlock */}
        {purchaseNotice && (
          <div
            className={`rounded-xl px-4 py-3 text-xs sm:text-sm font-bold border text-center ${
              purchaseNotice.ok
                ? 'bg-[#6D4C24]/15 border-[#6D4C24] text-[#3B2514]'
                : 'bg-rose-100 border-rose-400 text-rose-900'
            }`}
          >
            {purchaseNotice.text}
          </div>
        )}

        {/* Two Interactive Faces Grid: Right Dark Brown (أنا ناشر) & Left Warm Parchment Gold (أنا قارئ) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          {/* Face 1 (Right): أنا ناشر */}
          <button
            type="button"
            onClick={onNavigatePublisher}
            className="group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#2E1E12] via-[#25170D] to-[#1A1008] border-2 border-[#C89D54] text-[#FBF4E6] text-right shadow-md hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center gap-1.5 pb-1">
                <div className="w-11 h-11 rounded-xl bg-[#3D2919] border border-[#C89D54]/50 flex items-center justify-center text-[#E5C078]">
                  <PenTool className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#F5D68E]">أنا ناشر</h2>
              </div>

              <ul className="space-y-2 text-sm sm:text-base font-semibold text-[#F5ECE0] pr-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C89D54] shrink-0" />
                  <span>انشر كتبك</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C89D54] shrink-0" />
                  <span>اعمل حساب ناشر</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C89D54] shrink-0" />
                  <span>ارفع كتابك</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C89D54] shrink-0" />
                  <span>تابع مبيعاتك وتقييماتك</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-[#C89D54]/25 flex items-center justify-center gap-2 text-sm font-bold text-[#F5D68E] group-hover:text-white">
              <span>ابدأ كـ ناشر</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </button>

          {/* Face 2 (Left): أنا قارئ */}
          <button
            type="button"
            onClick={onNavigateLibrary}
            className="group relative rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#EAD7B9] via-[#E2C9A2] to-[#D6B788] border-2 border-[#B68B46] text-[#2B1C11] text-right shadow-md hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center gap-1.5 pb-1">
                <div className="w-11 h-11 rounded-xl bg-[#F5ECE0] border border-[#B68B46]/60 flex items-center justify-center text-[#5A3B1E]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#2B1C11]">أنا قارئ</h2>
              </div>

              <ul className="space-y-2 text-sm sm:text-base font-semibold text-[#3B2514] pr-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D4C24] shrink-0" />
                  <span>اشتري كتب</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D4C24] shrink-0" />
                  <span>اقرأ</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D4C24] shrink-0" />
                  <span>قيم الكتاب</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6D4C24] shrink-0" />
                  <span>اكتب رأيك</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-[#6D4C24]/25 flex items-center justify-center gap-2 text-sm font-bold text-[#3B2514] group-hover:text-black">
              <span>ابدأ كـ قارئ</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </button>
        </section>

        {/* Primary Auth CTA Button */}
        <section className="space-y-1.5">
          <button
            type="button"
            onClick={() => onOpenAuthModal()}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#B8893D] via-[#DFB76C] to-[#BA8B3E] border border-[#8E6626] text-[#23150A] font-black text-base sm:text-lg shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
          >
            انشاء حساب / تسجيل دخول
          </button>
          <p className="text-center text-xs sm:text-sm font-semibold text-[#5A3B1E]">
            سجل الآن واختر: ناشر أو قارئ
          </p>
        </section>

        {/* Featured Books Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#4B311B]">كتب مميزة</h2>
            <button
              type="button"
              onClick={onNavigateLibrary}
              className="flex items-center gap-1.5 text-sm font-bold text-[#6D4C24] hover:text-[#2B1C11] transition-colors cursor-pointer"
            >
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {primaryBook && (
            <div className="rounded-2xl p-4 sm:p-5 bg-[#FBF6EE] border border-[#D7C2A3] shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                {/* Right: Cover Thumbnail (5:7) */}
                <button
                  type="button"
                  onClick={() => onOpenBookHolder(primaryBook.id)}
                  className="w-24 sm:w-28 aspect-[5/7] rounded-xl overflow-hidden border-2 border-[#C89D54] bg-[#16100A] shadow-md shrink-0 relative group cursor-pointer"
                  title="معاينة غلاف وتجربة كتاب نون"
                >
                  <img
                    src={primaryBook.cover}
                    alt={primaryBook.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-2 text-center">
                    <span className="font-editorial text-lg font-black text-[#F5D68E] leading-none">
                      «نون»
                    </span>
                    <span className="text-[9px] text-amber-100/90 mt-0.5">{primaryBook.author}</span>
                  </div>
                </button>

                {/* Left: Book Metadata & Quick Experience Triggers */}
                <div className="flex-1 text-right space-y-1.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-[#2B1C11]">
                      {primaryBook.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => onOpenBookHolder(primaryBook.id)}
                      className="text-xs font-bold text-[#6D4C24] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>معاينة وتجربة</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-[#5A3B1E]">
                    تأليف: {primaryBook.author}
                  </p>

                  <div className="text-xs font-bold text-[#6D4C24] py-0.5">
                    كتاب داخل المنصة · التقييم: {primaryRating.avg} ★ ({primaryRating.count} تقييم)
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-sm font-extrabold text-[#3B2514]">
                    <Coins className="w-5 h-5 text-[#B68B46] shrink-0" />
                    <span className="tabular-nums">
                      السعر: {primaryBook.priceCoins} عملة / العملات المركزية
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenReviewForBook(primaryBook.id)}
                  className="sm:col-span-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#BA8C3E] via-[#D6AD61] to-[#B8893D] text-[#23150A] font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-105 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-[#23150A]" />
                  <span>تقييم بالنجوم واكتب رأيك</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookPurchaseOrOpen(primaryBook)}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF4EC] border-2 border-[#B68B46] text-[#3B2514] font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#EFE2CF] cursor-pointer"
                >
                  {purchasedBookIds.includes(primaryBook.id) ? (
                    <>
                      <BookOpen className="w-4 h-4 text-[#6D4C24]" />
                      <span>اقرأ الآن</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 text-[#B68B46]" />
                      <span>شراء</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bottom Single Central Bar (Opens Unified Central Card Modal) */}
        <section>
          <button
            type="button"
            onClick={onOpenCentralCard}
            className="w-full rounded-2xl p-4 bg-[#F1E5D3] border border-[#D5BC96] hover:border-[#B68B46] shadow-sm hover:shadow transition-all grid grid-cols-3 gap-2 text-center cursor-pointer"
            title="افتح الكارت المركزي لإدارة العملات والتبرع والبث"
          >
            <div className="flex flex-col items-center justify-center gap-1 border-l border-[#D5BC96] pl-2">
              <div className="flex items-center gap-1 text-xs font-bold text-[#6D4C24]">
                <Coins className="w-4 h-4 text-[#B68B46]" />
                <span>رصيدك المركزي</span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#2B1C11] tabular-nums">
                {coins} عملة
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 border-l border-[#D5BC96] pl-2">
              <div className="flex items-center gap-1 text-xs font-bold text-[#6D4C24]">
                <ListChecks className="w-4 h-4 text-[#B68B46]" />
                <span>معاملاتك</span>
              </div>
              <div className="text-base sm:text-lg font-black text-[#2B1C11] tabular-nums">
                {transactionsCount} عملية
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1 text-xs font-bold text-[#6D4C24]">
                <ShieldCheck className="w-4 h-4 text-[#B68B46]" />
                <span>مستوى حسابك في الكتاب</span>
              </div>
              <div className="text-sm sm:text-base font-black text-[#2B1C11]">
                المستوى: {bookLevel?.levelLabel || 'قارئ فضي'}
              </div>
            </div>
          </button>
        </section>

        {/* Quiet Footer Links */}
        <footer className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6D4C24]">
          <span className="font-bold">{EXHIBITION_CONFIG.platformTagline}</span>
          <div className="flex items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={onOpenAppsModal}
              className="hover:text-[#2B1C11] flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B68B46]" />
              <span>تطبيقات MD7</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBookHolder('noon')}
              className="hover:text-[#2B1C11] flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#6D4C24]" />
              <span>مشهد بحر نون التفاعلي</span>
            </button>
            <button
              type="button"
              onClick={onOpenAuthorModal}
              className="hover:text-[#2B1C11] cursor-pointer"
            >
              بوابة المؤلف
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
