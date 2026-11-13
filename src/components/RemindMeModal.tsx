/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RemindMeModal Component
 * Interactive modal for "ذكّرني عند إطلاق الكتاب"
 * Allows:
 * - Entering email/phone for notification
 * - Downloading .ICS calendar event for 11 November 2026 at 11:11 PM Cairo Time
 * - Saving preference to localStorage
 */

import React, { useState } from 'react';
import { Bell, Calendar, Mail, Phone, CheckCircle2, X, Sparkles, Download } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface RemindMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDateString?: string;
}

export const RemindMeModal: React.FC<RemindMeModalProps> = ({
  isOpen,
  onClose,
  targetDateString = '11 نوفمبر 2026 · 11:11 مساءً بتوقيت القاهرة'
}) => {
  const [contactInput, setContactInput] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    try {
      const stored = localStorage.getItem('md_book_launch_reminders') || '[]';
      const parsed = JSON.parse(stored);
      parsed.push({
        contact: contactInput.trim(),
        type: contactType,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('md_book_launch_reminders', JSON.stringify(parsed));
    } catch {
      // fallback
    }

    audioEngine.playGoldenChime();
    setIsSaved(true);
  };

  const handleDownloadICS = () => {
    // Generate .ics calendar file for 11 November 2026 11:11 PM Cairo (UTC+2 => 21:11:00Z)
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MD Interactive Book//Launch Reminder//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:md-book-launch-20261111T211100Z@md7-group.ai.studio',
      'DTSTAMP:20261111T000000Z',
      'DTSTART:20261111T211100Z',
      'DTEND:20261111T221100Z',
      'SUMMARY:إطلاق كتاب «نون» (تأليف: محمد الهمام)',
      'DESCRIPTION:الموعد الرسمي لإتاحة وقراءة كتاب «نون» للمؤلف محمد الهمام عبر المنصة التفاعلية.\\nالرابط: https://md7-group.ai.studio',
      'LOCATION:المنصة الرقمية التفاعلية (md7-group.ai.studio)',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:تذكير: بعد 15 دقيقة يتم إطلاق كتاب «نون» للمؤلف محمد الهمام',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'كتاب_نون_موعد_الإطلاق.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    audioEngine.playGoldenChime();
  };

  const handleClose = () => {
    setIsSaved(false);
    setContactInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-lg p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#070709] border border-amber-400 shadow-[0_0_50px_rgba(212,175,55,0.45)] text-white">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ornate corner lines */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

        {isSaved ? (
          <div className="py-4 text-center space-y-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.5)]">
              <CheckCircle2 className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">تم تفعيل التذكير بنجاح!</h3>
              <p className="text-xs text-amber-200/80 mt-1.5 leading-relaxed">
                سنقوم بإشعارك فور انطلاق الكتاب في الموعد المحدد: <br />
                <span className="font-bold text-amber-300">{targetDateString}</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownloadICS}
                className="w-full py-2.5 rounded-sm border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تحميل ملف التقويم (.ICS) لجوجل / آبل</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
              >
                حسناً، متابعة العد التنازلي
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/10 border border-amber-400/40 text-[11px] font-cinzel text-amber-300 font-bold tracking-widest mb-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>LAUNCH NOTIFICATION</span>
              </div>
              <h3 className="text-xl font-bold text-white">ذكّرني عند إطلاق الكتاب</h3>
              <p className="text-xs text-amber-200/70 mt-1">
                احصل على تنبيه فوري فور فتح صفحات وفصول الكتاب للقراءة العامة
              </p>
              <div className="mt-2 py-1 px-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
                {targetDateString}
              </div>
            </div>

            {/* Quick Action: Add to Calendar */}
            <div className="p-3 rounded bg-black/50 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div className="text-right">
                  <div className="text-xs font-bold text-white">إضافة فورية لتقويم هاتفك</div>
                  <div className="text-[10px] text-zinc-400">Google Calendar أو Apple Calendar</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadICS}
                className="px-3 py-1.5 rounded bg-amber-400/20 border border-amber-400/50 hover:bg-amber-400 hover:text-black text-amber-300 text-xs font-semibold transition-all cursor-pointer"
              >
                حفظ موعد
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    contactType === 'email'
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>عبر البريد الإلكتروني</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                    contactType === 'phone'
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  <span>عبر الواتساب / الهاتف</span>
                </button>
              </div>

              <div>
                <input
                  type={contactType === 'email' ? 'email' : 'tel'}
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder={
                    contactType === 'email'
                      ? 'أدخل بريدك الإلكتروني للتنبيه...'
                      : 'أدخل رقم هاتفك أو واتساب...'
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-zinc-700 focus:border-amber-400 text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(243,229,171,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>تأكيد طلب التذكير</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
