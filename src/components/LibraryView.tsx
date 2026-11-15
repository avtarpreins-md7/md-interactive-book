import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Coins,
  Search,
  Star,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';
import { PlatformBookItem } from '../types';

interface LibraryViewProps {
  onBackHome: () => void;
  onOpenBookHolder: (bookId: string) => void;
  onOpenBookReader: (bookId: string) => void;
  onOpenReviewForBook: (bookId: string) => void;
  onOpenCentralCard: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onBackHome,
  onOpenBookHolder,
  onOpenBookReader,
  onOpenReviewForBook,
  onOpenCentralCard,
}) => {
  const { books, purchasedBookIds, purchaseBook, coins, reviews } = useUnifiedPlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const categories = ['الكل', ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((b) => {
    const matchesCat = selectedCategory === 'الكل' || b.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleBuyOrOpen = (book: PlatformBookItem) => {
    if (purchasedBookIds.includes(book.id)) {
      onOpenBookReader(book.id);
      return;
    }
    const res = purchaseBook(book.id);
    setStatusMessage({ text: res.message, ok: res.success });
    setTimeout(() => setStatusMessage(null), 4000);
    if (res.success) {
      onOpenBookReader(book.id);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5ECE0] text-[#2B1C11] pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#F5ECE0]/95 backdrop-blur-md border-b border-[#D5BC96]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 text-sm font-bold text-[#6D4C24] hover:text-[#2B1C11] cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمنصة الكتاب</span>
          </button>

          <h1 className="text-lg sm:text-xl font-black text-[#3B2514]">مكتبة القراء والكتب</h1>

          <button
            type="button"
            onClick={onOpenCentralCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EADBC6] border border-[#C89D54] text-xs font-extrabold text-[#3B2514] cursor-pointer"
          >
            <Coins className="w-4 h-4 text-[#B68B46]" />
            <span className="tabular-nums">{coins} عملة</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7A5934] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الكتاب أو المؤلف..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#FBF6EE] border border-[#D5BC96] text-sm text-[#2B1C11] placeholder-[#8E704D] focus:border-[#6D4C24] outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#6D4C24] text-[#FBF6EE]'
                    : 'bg-[#EADBC6] text-[#4A321F] hover:bg-[#DFC9A8]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-bold text-center ${
              statusMessage.ok
                ? 'bg-[#6D4C24]/15 border-[#6D4C24] text-[#2B1C11]'
                : 'bg-rose-100 border-rose-400 text-rose-900'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#FBF6EE] border border-[#D5BC96] text-center text-sm text-[#6D4C24]">
            لا توجد كتب مطابقة لبحثك حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBooks.map((book) => {
              const isOwned = purchasedBookIds.includes(book.id);
              const bookReviews = reviews.filter((r) => !r.bookId || r.bookId === book.id);
              const avgRating =
                bookReviews.length > 0
                  ? (bookReviews.reduce((s, r) => s + r.rating, 0) / bookReviews.length).toFixed(1)
                  : '5.0';

              return (
                <article
                  key={book.id}
                  className="rounded-2xl p-4 sm:p-5 bg-[#FBF6EE] border border-[#D5BC96] shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => onOpenBookHolder(book.id)}
                      className="w-24 sm:w-28 aspect-[5/7] rounded-xl overflow-hidden border-2 border-[#C89D54] bg-[#16100A] shrink-0 relative cursor-pointer"
                    >
                      <img
                        src={book.cover}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-2 text-center">
                        <span className="font-editorial text-sm font-black text-[#F5D68E]">
                          {book.title}
                        </span>
                      </div>
                    </button>

                    <div className="flex-1 space-y-1.5 text-right">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#7A5934]">{book.category}</span>
                        <span className="text-xs font-extrabold text-[#6D4C24] tabular-nums">
                          {avgRating} ★ ({bookReviews.length})
                        </span>
                      </div>

                      <h2 className="text-xl font-black text-[#2B1C11]">{book.title}</h2>
                      <p className="text-xs font-bold text-[#5A3B1E]">تأليف: {book.author}</p>
                      <p className="text-xs text-[#4A321F] leading-relaxed line-clamp-3">
                        {book.description}
                      </p>

                      <div className="pt-1 flex items-center gap-3 text-xs font-extrabold text-[#3B2514]">
                        <span className="flex items-center gap-1 tabular-nums">
                          <Coins className="w-4 h-4 text-[#B68B46]" />
                          {book.priceCoins} عملة مركزية
                        </span>
                        {isOwned && (
                          <span className="flex items-center gap-1 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            مقتنى
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6D5BC]">
                    <button
                      type="button"
                      onClick={() => handleBuyOrOpen(book)}
                      className="col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6D4C24] to-[#4A3219] text-[#FBF6EE] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 hover:brightness-110 cursor-pointer"
                    >
                      {isOwned ? (
                        <>
                          <BookOpen className="w-4 h-4 text-[#F5D68E]" />
                          <span>اقرأ الكتاب الآن</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#F5D68E]" />
                          <span>شراء ({book.priceCoins} عملة)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReviewForBook(book.id)}
                      className="py-2.5 px-3 rounded-xl bg-[#EADBC6] text-[#3B2514] text-xs font-extrabold flex items-center justify-center gap-1 hover:bg-[#DFC9A8] cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-[#B68B46]" />
                      <span>قيّم</span>
                    </button>
                  </div>

                  {book.isBuiltInNoon && (
                    <button
                      type="button"
                      onClick={() => onOpenBookHolder(book.id)}
                      className="w-full py-2 rounded-lg border border-[#C89D54] bg-[#F5ECE0] text-xs font-bold text-[#6D4C24] hover:bg-[#EADBC6] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>دخول منصة الغلاف وبحر نون التفاعلي</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
