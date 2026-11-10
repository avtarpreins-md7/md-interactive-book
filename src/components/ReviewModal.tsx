import React, { useState } from 'react';
import { Star, X, Send, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (name: string, rating: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmitReview }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    audioEngine.playGoldenChime();
    onSubmitReview(name.trim() || 'قارئ مميز', rating, comment.trim());
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setComment('');
      setRating(5);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-lg p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#070709] border border-amber-400/80 shadow-[0_0_60px_rgba(212,175,55,0.4)] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ornate corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400/60" />

        {isSubmitted ? (
          <div className="py-10 text-center space-y-3 animate-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/15 border border-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)]">
              <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white">شكراً لمشاركتك رأيك القيّم</h3>
            <p className="text-xs text-amber-200/80">
              تم بث رأيك مباشرة في شريط آراء القراء وسيبقى جزءاً من سجل الرحلة التفاعلي.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <span className="text-[11px] font-cinzel uppercase text-amber-400 tracking-widest">
                MD READER FEEDBACK
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">هل استمتعت بالرحلة؟</h3>
              <p className="text-xs text-amber-200/70 mt-1">
                شاركنا انطباعك المعماري والجمالي حول كتاب مجموعة MD التفاعلي
              </p>
            </div>

            {/* Star Rating Selection */}
            <div className="flex flex-col items-center gap-1.5 py-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                          : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-amber-300 font-mono font-medium">
                {rating === 5 ? 'تجربة استثنائية (5/5)' : `التقييم: ${rating} من 5 نجوم`}
              </span>
            </div>

            {/* Reader Name (Optional) */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium">
                أسمك (اختياري)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: المهندس فيصل / سارة الأحمد"
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                maxLength={40}
              />
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium">
                رأيك وانطباعك عن الكتاب
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب رايك هنا... ما أكثر تصميم أو فكرة أثارت اهتمامك؟"
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors resize-none"
                maxLength={300}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!comment.trim()}
              className="w-full py-3 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(243,229,171,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-black" />
              <span>إرسال التقييم والبث المباشر</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
