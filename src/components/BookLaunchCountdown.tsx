/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BookLaunchCountdown Component
 * Pre-launch gatekeeper and interactive countdown until 11 November 2026 at 11:11 PM Cairo Time.
 * Enforces:
 * - Display Front Cover (Strictly NO MD / MD7 on front cover)
 * - Authentic Title: «نون» | Author: محمد الهمام
 * - Upward dish-like crescent with radiant star as dot of Noon above concentric celestial rings
 * - Live Days / Hours / Minutes / Seconds countdown (Africa/Cairo)
 * - Prevents public reading of book content until launch time
 * - "ذكّرني عند إطلاق الكتاب" interactive button
 * - Automatic unlock when launch time arrives
 * - Discreet Author Preview Gateway ("وضع معاينة المؤلف") strictly separated from public view
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Bell,
  Lock,
  Calendar,
  Volume2,
  VolumeX,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { audioEngine } from '../utils/audioEngine';
import { RemindMeModal } from './RemindMeModal';

interface BookLaunchCountdownProps {
  onLaunchUnlock: () => void;
  onOpenAuthorModal: () => void;
  onOpenAppsModal: () => void;
}

export const BookLaunchCountdown: React.FC<BookLaunchCountdownProps> = ({
  onLaunchUnlock,
  onOpenAuthorModal,
  onOpenAppsModal
}) => {
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Target timestamp: 11 November 2026, 23:11:00 (11:11 PM) Cairo Time (UTC+2 => 21:11:00Z)
  const targetLaunchDate = new Date(BOOK_STRUCTURE_CONFIG.targetLaunchCairo).getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 1
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = targetLaunchDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        // Auto trigger launch when official time arrives
        onLaunchUnlock();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetLaunchDate, onLaunchUnlock]);

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030305] text-[#F3E5AB] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(212,175,55,0.18)_0%,rgba(5,5,8,0.96)_65%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm border border-amber-400/80 bg-black/60 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              كتاب «{BOOK_STRUCTURE_CONFIG.projectTitle}»
            </h1>
            <div className="text-[11px] text-amber-200/70 font-editorial">
              المؤلف: {BOOK_STRUCTURE_CONFIG.author} · تدشين الإصدار الرقمي المعتمد
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-sm border border-amber-500/30 bg-black/60 text-amber-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Apps Modal */}
          <button
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-amber-400/50 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-xs font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تطبيقات MD7</span>
          </button>
        </div>
      </header>

      {/* Main Gatekeeper Showcase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full">
        {/* Banner Announcement */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 border border-amber-400/60 text-xs text-amber-300 font-semibold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.25)] animate-pulse">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>الموعد الرسمي لإتاحة الكتاب للقراءة العامة: 11 نوفمبر 2026 · 11:11 مساءً بتوقيت القاهرة</span>
        </div>

        {/* Two-Column Stage: Left = Front Cover Presentation, Right = Countdown & Lock Directives */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Front Cover Display (Col 5) - Strictly ZERO MD/MD7 on Front Cover */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="group relative w-full max-w-[320px] aspect-[3/4] rounded-lg overflow-hidden border-2 border-amber-400 shadow-[0_0_50px_rgba(212,175,55,0.5)] bg-black transition-transform duration-500 hover:scale-[1.02]">
              {/* Cover Artwork Image: Upward dish crescent + radiant star dot + concentric orbital rings */}
              <img
                src={BOOK_STRUCTURE_CONFIG.frontCover.imageSource}
                alt={`الغلاف الأساسي: كتاب «${BOOK_STRUCTURE_CONFIG.projectTitle}» - تأليف ${BOOK_STRUCTURE_CONFIG.author}`}
                className="w-full h-full object-cover"
              />

              {/* Luxury Frame & Typographic Overlay (Ensuring NO MD / MD7) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/75 p-5 flex flex-col justify-between text-center pointer-events-none">
                {/* Top of Cover */}
                <div className="pt-2">
                  <span className="text-[10px] tracking-widest font-mono text-amber-300 uppercase bg-black/60 px-2 py-0.5 rounded border border-amber-400/40">
                    EDITION 2026 · كتاب وثائقي فلسفي
                  </span>
                </div>

                {/* Bottom of Cover: Title & Author ONLY */}
                <div className="pb-3 bg-black/60 backdrop-blur-sm p-3 rounded border border-amber-500/30">
                  <h2 className="text-3xl sm:text-4xl font-black text-amber-300 leading-tight font-editorial drop-shadow-md">
                    «{BOOK_STRUCTURE_CONFIG.frontCover.title}»
                  </h2>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-1.5" />
                  <p className="text-xs sm:text-sm font-bold text-white font-cinzel">
                    تأليف: {BOOK_STRUCTURE_CONFIG.frontCover.author}
                  </p>
                </div>
              </div>

              {/* Ornate corner gold insets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
            </div>

            <span className="mt-3 text-[11px] text-zinc-400 font-editorial">
              الغلاف الأمامي المعتمد لكتاب «{BOOK_STRUCTURE_CONFIG.projectTitle}»
            </span>
          </div>

          {/* Right Column: Live Countdown & Strict Gatekeeper (Col 7) */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-right space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 font-mono tracking-widest uppercase mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>RESTRICTED ACCESS UNTIL LAUNCH</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                العد التنازلي لإطلاق كتاب «{BOOK_STRUCTURE_CONFIG.projectTitle}»
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-lg leading-relaxed">
                محتوى الكتاب والفهرس والقصص وتقليب الصفحات مغلق ومحمي تقنياً حتى موعد الإطلاق الرسمي المعتمد: <br />
                <strong className="text-amber-300">11 نوفمبر 2026 الساعة 11:11 مساءً بتوقيت القاهرة</strong>.
                عند بلوغ الموعد، تفتح أبواب القراءة تلقائياً لجميع الزوار.
              </p>
            </div>

            {/* Live Countdown Cards (Days, Hours, Minutes, Seconds) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-md">
              {/* Days */}
              <div className="p-3 sm:p-4 rounded-lg bg-black/70 border border-amber-500/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-editorial mt-1">يوم</span>
              </div>

              {/* Hours */}
              <div className="p-3 sm:p-4 rounded-lg bg-black/70 border border-amber-500/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-editorial mt-1">ساعة</span>
              </div>

              {/* Minutes */}
              <div className="p-3 sm:p-4 rounded-lg bg-black/70 border border-amber-500/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-editorial mt-1">دقيقة</span>
              </div>

              {/* Seconds */}
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-b from-amber-500/20 to-black/80 border border-amber-400 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-amber-300 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-editorial mt-1">ثانية</span>
              </div>
            </div>

            {/* Public Action Row: ONLY Remind Me Button (No Public Bypass!) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full">
              <button
                onClick={() => {
                  audioEngine.playGoldenChime();
                  setShowRemindModal(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(243,229,171,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-black animate-bounce" />
                <span>ذكّرني عند إطلاق الكتاب</span>
              </button>
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-3 rounded bg-black/60 border border-amber-500/20 text-right text-xs text-zinc-400 space-y-1 w-full max-w-md">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>نظام الإطلاق والتوقيت الرسمي:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                يتم التحقق من التوقيت بدقة عبر التوقيت المحلي لمدينة القاهرة (Africa/Cairo UTC+2). لا يمكن تخطي شاشة الإطلاق أو قراءة الفصول برابط مباشر قبل موعد 11 نوفمبر 2026 الساعة 11:11 مساءً.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Discreet Author Gateway */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 gap-3">
        <div className="flex items-center gap-3">
          <span>كتاب «{BOOK_STRUCTURE_CONFIG.projectTitle}» · تأليف: {BOOK_STRUCTURE_CONFIG.author}</span>
          <span className="text-zinc-700">|</span>
          <span className="font-mono text-amber-400/70">CAIRO TIME ZONE (UTC+2)</span>
        </div>

        {/* Discreet Author Preview Trigger */}
        <button
          onClick={onOpenAuthorModal}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-amber-300 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-zinc-900 border border-transparent hover:border-amber-500/30"
          title="دخول المؤلف للمعاينة والتدقيق الفني"
        >
          <KeyRound className="w-3 h-3 text-amber-500/70" />
          <span>بوابة معاينة المؤلف</span>
        </button>
      </footer>

      {/* Reminder Modal */}
      <RemindMeModal
        isOpen={showRemindModal}
        onClose={() => setShowRemindModal(false)}
      />
    </div>
  );
};
