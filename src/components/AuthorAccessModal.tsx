/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AuthorAccessModal Component
 * Dedicated private gateway allowing the author (محمد الهمام) to enter "وضع معاينة المؤلف"
 * Securely authenticated via server-side endpoint (/api/author/login)
 * No passwords, secrets, or bypass keys are stored in client-side code.
 */

import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Sparkles, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { audioEngine } from '../utils/audioEngine';

interface AuthorAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAuthor: (token: string) => void;
}

export const AuthorAccessModal: React.FC<AuthorAccessModalProps> = ({
  isOpen,
  onClose,
  onConfirmAuthor
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('يرجى إدخال رمز التحقق الخاص بالمؤلف.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Secure server-side authentication call
      const res = await fetch('/api/author/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accessKey: passcode.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        audioEngine.playGoldenChime();
        onConfirmAuthor(data.token);
        onClose();
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة. المصادقة محصورة بالمؤلف فقط.');
      }
    } catch (err) {
      console.error('Server authentication error:', err);
      setError('تعذر الاتصال بخادم المصادقة الآمن. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-lg p-6 bg-gradient-to-b from-[#151522] via-[#0E0E17] to-[#08080E] border-2 border-amber-400/80 shadow-[0_0_60px_rgba(212,175,55,0.45)] text-white text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-sm bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-amber-400 cursor-pointer transition-colors"
          title="إلغاء والعودة"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-sm border border-amber-400 bg-amber-400/10 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              بوابة معاينة المؤلف والتدقيق الآمنة
            </h3>
            <span className="text-[11px] font-mono text-amber-400/90">
              AUTHENTICATED AUTHOR AUDIT PORTAL
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed mb-4">
          تسجيل الدخول محمي عبر خادم المصادقة السحابي المعتمد للمؤلف <strong className="text-amber-300">{BOOK_STRUCTURE_CONFIG.author}</strong> لمراجعة كامل فصول وقاموس كتاب <strong className="text-amber-300">«{BOOK_STRUCTURE_CONFIG.projectTitle}»</strong> دون فتح القراءة للعامة.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-200 mb-1.5">
              مفتاح المصادقة السحابي للمؤلف:
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                placeholder="أدخل مفتاح دخول المؤلف المعتمد..."
                className="w-full px-3 py-2.5 rounded bg-black/70 border border-amber-500/40 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
              />
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded bg-amber-500/10 border border-amber-400/30 text-[11px] text-zinc-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>معايير الأمان المطبقة:</span>
            </div>
            <p className="text-zinc-400 leading-normal">
              • المصادقة تتم على الخادم بدون حفظ أية كلمات سر داخل كود المتصفح.<br />
              • جلسة المعاينة تُمنح عبر رمز أمني مشفر (HMAC-SHA256).<br />
              • لا يمكن للزائر العادي تجاوز شاشة العد التنازلي بأي رابط مباشر.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(243,229,171,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>جارٍ التحقق من الخادم...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>دخول آمن لوضع معاينة المؤلف</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="py-3 px-4 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
