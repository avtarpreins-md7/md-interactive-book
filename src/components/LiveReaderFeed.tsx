import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Pause, Play, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { ReaderReview } from '../types';

interface LiveReaderFeedProps {
  reviews: ReaderReview[];
  onOpenReviewModal: () => void;
  newReviewAlert?: boolean;
}

export const LiveReaderFeed: React.FC<LiveReaderFeedProps> = ({
  reviews,
  onOpenReviewModal,
  newReviewAlert
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto cycle reviews smoothly every 5.5s if not paused
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, reviews.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex] || reviews[0];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-3 select-none">
      {/* Header Bar with Live Indicator and Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {/* Glowing Red LIVE Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400 tracking-wider font-mono">LIVE</span>
          </div>
          <span className="text-xs font-semibold text-white">البث المباشر لآراء القراء</span>
          <span className="text-zinc-600">·</span>
          <span className="text-[11px] text-zinc-400 font-mono">
            {currentIndex + 1} من {reviews.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play auto rotation */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'استئناف الحركة' : 'إيقاف الحركة مؤقتاً'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Carousel Arrows */}
          <button
            onClick={handlePrev}
            className="p-1 rounded text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="الرأي السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="الرأي التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Add Review Trigger Button */}
          <button
            onClick={onOpenReviewModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-medium transition-all shadow-[0_0_10px_rgba(212,175,55,0.15)] cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">أضف رأيك</span>
          </button>
        </div>
      </div>

      {/* Featured Live Review Card */}
      {currentReview && (
        <div
          className={`relative rounded-md p-3.5 sm:p-4 bg-gradient-to-r from-[#111118] via-[#0E0E14] to-[#14141E] border border-amber-400/35 transition-all duration-500 shadow-[0_4px_25px_rgba(0,0,0,0.85)] ${
            newReviewAlert ? 'ring-2 ring-amber-400 shadow-[0_0_25px_rgba(212,175,55,0.6)]' : ''
          }`}
        >
          {/* Subtle gold line accent */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* User Info & Rating */}
            <div className="flex items-center gap-3">
              {/* Avatar circle with gold ring */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-[1.5px] shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-amber-200">
                  {currentReview.name.charAt(0) || 'م'}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {currentReview.name}
                  </span>
                  {currentReview.isVerified && (
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                      قارئ معتمد
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < currentReview.rating
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(212,175,55,0.8)]'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-zinc-500 mr-1.5 font-mono">
                    {currentReview.timestamp}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Bubble */}
            <div className="w-full sm:w-auto sm:max-w-xl text-xs sm:text-sm text-zinc-200 bg-black/40 sm:bg-transparent p-2.5 sm:p-0 rounded border border-zinc-800 sm:border-none">
              <p className="line-clamp-2 leading-relaxed">
                «{currentReview.comment}»
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
