import React, { useState } from 'react';
import { Mail, Send, X, Sparkles, CheckCircle2, Phone, BookMarked, FileText, Lightbulb } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface PublishBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishBookModal: React.FC<PublishBookModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookSummary, setBookSummary] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !bookTitle.trim()) return;

    // Encoded target email hidden behind the mail symbol
    const targetEmail = 'avtarpreins@gmail.com';
    const subject = encodeURIComponent(`طلب نشر كتاب رقمي: ${bookTitle}`);
    const body = encodeURIComponent(
      `طلب نشر كتاب رقمي جديد\n\n` +
      `اسم الكتاب: ${bookTitle}\n` +
      `رقم الهاتف / الواتساب: ${phoneNumber}\n\n` +
      `شرح وتلخيص محتويات الكتاب:\n${bookSummary}\n\n` +
      `تم الإرسال عبر منصة كتاب مجموعة MD الرقمية`
    );

    // Open user's mail client with prefilled data
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    audioEngine.playGoldenChime();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setPhoneNumber('');
    setBookTitle('');
    setBookSummary('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-lg p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#070709] border border-amber-400/80 shadow-[0_0_60px_rgba(212,175,55,0.45)] text-white">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 left-4 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ornate corner frames */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/70" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/70" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/70" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/70" />

        {isSubmitted ? (
          /* المرسال الرد على طلب الإرسال */
          <div className="py-2 text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/15 border border-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)]">
              <CheckCircle2 className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                مرسال الرد على طلب الإرسال
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                تم استقبال طلب نشر كتابك بنجاح
              </h3>
              <p className="text-xs text-amber-200/80 mt-1">
                سيقوم فريق التحرير والنشر الرقمي بمراجعة محتوى كتابك والتواصل معك عبر رقمك المسجل.
              </p>
            </div>

            {/* Valuable Author Advice Box */}
            <div className="p-4 rounded-md bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-400/50 text-right shadow-inner">
              <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>نصيحة ذهبية للكاتب والمؤلف:</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans text-justify">
                «احرص على أن تكون خطوتك الأولى هي تحويل كتابك إلى <strong>نسخة رقمية تفاعلية</strong>؛ وتعلّم كيف تسخّر أدوات <strong>الذكاء الاصطناعي</strong> لتحويل النصوص والصور والتصميمات إلى نموذج كتاب إلكتروني سينمائي تفاعلي حديث يبهر القراء في كل مكان ويصل بمؤلفك إلى العالمية.»
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(243,229,171,0.7)] transition-all cursor-pointer"
            >
              تم وموافق
            </button>
          </div>
        ) : (
          /* Form: طلب نشر كتابك */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/10 border border-amber-400/40 text-[11px] font-cinzel text-amber-300 font-bold tracking-widest mb-1.5 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>DIGITAL PUBLISHING REQUEST</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">طلب نشر وتوثيق كتابك</h3>
              <p className="text-xs text-amber-200/70 mt-1">
                انضم إلى عالم النشر الرقمي التفاعلي وانشر كتابك كتحفة رقمية سينمائية
              </p>
            </div>

            {/* Email destination indicator (hidden behind postal icon) */}
            <div className="flex items-center justify-center gap-2 p-2 rounded bg-black/50 border border-amber-500/20 text-xs text-amber-300/80">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>إرسال مباشر لإدارة النشر الرقمي المعتمدة</span>
            </div>

            {/* Phone / WhatsApp */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>رقم الهاتف / الواتساب</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="مثال: +966 5X XXX XXXX أو 010XXXXXXXX"
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                dir="ltr"
              />
            </div>

            {/* Book Title */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                <span>اسم وعنوان الكتاب</span>
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="أدخل اسم الكتاب المقترح..."
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>

            {/* Brief Summary of Contents */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>شرح بسيط لمحتويات وفكرة الكتاب</span>
              </label>
              <textarea
                value={bookSummary}
                onChange={(e) => setBookSummary(e.target.value)}
                placeholder="نبذة مختصرة عن موضوع الكتاب، الفئة المستهدفة، وعدد الفصول..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(243,229,171,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-black" />
              <span>إرسال طلب النشر الرقمي</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
