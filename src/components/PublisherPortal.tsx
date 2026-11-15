import React, { useState } from 'react';
import {
  ArrowRight,
  PenTool,
  Upload,
  BookOpen,
  Coins,
  TrendingUp,
  Star,
  Trophy,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';

interface PublisherPortalProps {
  onBackHome: () => void;
  onOpenCentralCard: () => void;
  onOpenBookReader: (bookId: string) => void;
  onOpenMailPublishModal: () => void;
}

export const PublisherPortal: React.FC<PublisherPortalProps> = ({
  onBackHome,
  onOpenCentralCard,
  onOpenBookReader,
  onOpenMailPublishModal,
}) => {
  const {
    account,
    coins,
    books,
    reviews,
    supporters,
    publishNewBook,
    sendGift,
    signInAsRole,
  } = useUnifiedPlatform();

  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState(account.name || 'ناشر معتمد');
  const [category, setCategory] = useState('معرفة وفكر');
  const [priceCoins, setPriceCoins] = useState('39');
  const [description, setDescription] = useState('');
  const [contentText, setContentText] = useState('');
  const [publishNotice, setPublishNotice] = useState<string | null>(null);
  const [giftNotice, setGiftNotice] = useState<string | null>(null);

  const totalSales = books.reduce((sum, b) => sum + b.salesCount, 0);
  const estimatedCoinRevenue = books.reduce((sum, b) => sum + b.salesCount * b.priceCoins, 0);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (account.role !== 'publisher') {
      signInAsRole(authorName || account.name, 'publisher');
    }
    const created = publishNewBook(
      title,
      authorName,
      description,
      Number(priceCoins) || 39,
      category,
      contentText
    );
    setPublishNotice(`تم رفع ونشر «${created.title}» داخل منصة الكتاب بنجاح!`);
    setTitle('');
    setDescription('');
    setContentText('');
    setTimeout(() => setPublishNotice(null), 5000);
  };

  const handleGiftTest = (amt: 3 | 6 | 9) => {
    const res = sendGift(amt, 'دعم الناشرين والكتاب', 'book');
    setGiftNotice(res.message);
    setTimeout(() => setGiftNotice(null), 4000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5ECE0] text-[#2B1C11] pb-24">
      <header className="sticky top-0 z-30 bg-[#2B1C11] text-[#FBF4E6] border-b border-[#C89D54]">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 text-sm font-bold text-[#F5D68E] hover:text-white cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمنصة الكتاب</span>
          </button>

          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#C89D54]" />
            <h1 className="text-base sm:text-lg font-black">بوابة الناشر · نشر ومتابعة الكتب</h1>
          </div>

          <button
            type="button"
            onClick={onOpenCentralCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D2919] border border-[#C89D54] text-xs font-extrabold text-[#F5D68E] cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span className="tabular-nums">{coins} عملة</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Summary Row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 bg-[#2B1C11] text-[#FBF4E6] border border-[#C89D54]">
            <div className="text-xs text-[#DFC49A]">الكتب المنشورة</div>
            <div className="text-2xl font-black mt-1 tabular-nums">{books.length}</div>
          </div>
          <div className="rounded-2xl p-4 bg-[#FBF6EE] border border-[#D5BC96]">
            <div className="text-xs text-[#6D4C24]">إجمالي المبيعات</div>
            <div className="text-2xl font-black mt-1 tabular-nums flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-[#6D4C24]" />
              {totalSales}
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-[#FBF6EE] border border-[#D5BC96]">
            <div className="text-xs text-[#6D4C24]">عوائد العملات المركزية</div>
            <div className="text-2xl font-black mt-1 tabular-nums">{estimatedCoinRevenue} عملة</div>
          </div>
          <div className="rounded-2xl p-4 bg-[#FBF6EE] border border-[#D5BC96]">
            <div className="text-xs text-[#6D4C24]">تقييمات القراء</div>
            <div className="text-2xl font-black mt-1 tabular-nums">{reviews.length}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upload / Publish New Book Form */}
          <section className="lg:col-span-7 rounded-2xl p-5 sm:p-6 bg-[#FBF6EE] border-2 border-[#C89D54] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#2B1C11] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#6D4C24]" />
                <span>ارفع كتابك الجديد</span>
              </h2>
              <button
                type="button"
                onClick={onOpenMailPublishModal}
                className="text-xs font-bold text-[#6D4C24] hover:underline cursor-pointer"
              >
                طلب تحويل رقمي بالبريد ←
              </button>
            </div>

            {publishNotice && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{publishNotice}</span>
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A3B1E] mb-1">اسم الكتاب</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: مسارات النور"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm outline-none focus:border-[#6D4C24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A3B1E] mb-1">اسم المؤلف / الناشر</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm outline-none focus:border-[#6D4C24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A3B1E] mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm outline-none focus:border-[#6D4C24]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A3B1E] mb-1">السعر (عملة مركزية)</label>
                  <input
                    type="number"
                    min="3"
                    value={priceCoins}
                    onChange={(e) => setPriceCoins(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm font-bold tabular-nums outline-none focus:border-[#6D4C24]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A3B1E] mb-1">نبذة الكتاب</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف موجز يجذب القراء داخل المنصة..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm outline-none focus:border-[#6D4C24] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A3B1E] mb-1">
                  محتوى الكتاب (اترك سطراً فارغاً بين كل قسم وآخر)
                </label>
                <textarea
                  rows={4}
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="اكتب المقدمة والنصوص التي ستظهر للقراء فور فتح الكتاب..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] text-sm outline-none focus:border-[#6D4C24]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6D4C24] to-[#2B1C11] text-[#F5D68E] font-black text-sm hover:brightness-110 cursor-pointer"
              >
                نشر الكتاب الآن في منصة الكتاب
              </button>
            </form>
          </section>

          {/* Supporters Leaderboard & Live Gifts (3 / 6 / 9) + Published Books */}
          <section className="lg:col-span-5 space-y-5">
            {/* Live Gift Supporters Box */}
            <div className="rounded-2xl p-5 bg-[#2B1C11] text-[#FBF4E6] border border-[#C89D54] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-[#F5D68E]">
                  <Trophy className="w-4 h-4" />
                  <span>الداعمون · البث المباشر</span>
                </h3>
                <span className="text-[11px] text-[#DFC49A]">بدون أي عمولة مخفية</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([3, 6, 9] as const).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleGiftTest(amt)}
                    className="py-2 rounded-xl bg-[#3D2919] hover:bg-[#523621] border border-[#C89D54]/60 text-xs font-black text-[#F5D68E] flex flex-col items-center cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 mb-0.5" />
                    <span>{amt} عملات</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-center text-[#DFC49A]">
                يتخصم 1 نقطة على كل عملية
              </p>

              {giftNotice && (
                <div className="p-2.5 rounded-lg bg-amber-400/15 border border-[#C89D54] text-xs font-bold text-[#F5D68E] text-center">
                  {giftNotice}
                </div>
              )}

              <div className="space-y-1.5 max-h-44 overflow-y-auto pt-1">
                {supporters.map((sup, idx) => (
                  <div
                    key={sup.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1E130B] border border-[#C89D54]/20 text-xs"
                  >
                    <span className="font-bold">
                      #{idx + 1} · {sup.name}
                    </span>
                    <span className="font-black text-[#F5D68E] tabular-nums">
                      {sup.totalCoins} عملة
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reader Ratings Preview */}
            <div className="rounded-2xl p-5 bg-[#FBF6EE] border border-[#D5BC96] space-y-3">
              <h3 className="font-black text-sm text-[#2B1C11] flex items-center gap-2">
                <Star className="w-4 h-4 text-[#B68B46] fill-[#B68B46]" />
                <span>أحدث تقييمات القراء</span>
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reviews.slice(0, 4).map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-[#F5ECE0] border border-[#E2CFAF] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>{rev.name}</span>
                      <span className="text-[#6D4C24]">{rev.rating}/5 ★</span>
                    </div>
                    <p className="text-[#4A321F] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Publisher's Catalog Management */}
        <section className="rounded-2xl p-5 bg-[#FBF6EE] border border-[#D5BC96] space-y-3">
          <h3 className="font-black text-base text-[#2B1C11]">سجل الكتب والمبيعات داخل المنصة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {books.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-[#F5ECE0] border border-[#D5BC96] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-extrabold text-sm text-[#2B1C11]">{b.title}</div>
                  <div className="text-xs text-[#6D4C24] mt-0.5 tabular-nums">
                    {b.author} · {b.priceCoins} عملة · المبيعات: {b.salesCount}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBookReader(b.id)}
                  className="px-3 py-2 rounded-lg bg-[#6D4C24] text-[#FBF6EE] text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>فتح</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
