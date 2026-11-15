import React, { useState } from 'react';
import { Download, Star, Share2, RefreshCw, Sparkles, Check, ArrowRight, ExternalLink, Layers, Mail } from 'lucide-react';
import { exportBookPDF } from '../utils/pdfExport';
import { audioEngine } from '../utils/audioEngine';
import { MD7_APPS } from '../data/md7Apps';

interface CompletionScreenProps {
  onRestart: () => void;
  onOpenReviewModal: () => void;
  onBackHome: () => void;
  onOpenAppsModal: () => void;
  onOpenPublishModal: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onRestart,
  onOpenReviewModal,
  onBackHome,
  onOpenAppsModal,
  onOpenPublishModal,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    audioEngine.playGoldenChime();
    const success = await exportBookPDF();
    setIsDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'كتاب «نون» | تأليف: محمد الهمام',
      text: 'أكملت قراءة النسخة الكاملة من كتاب «نون» للمؤلف محمد الهمام على منصة الكتاب.',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div dir="rtl" className="relative w-full min-h-screen bg-[#040406] text-white flex flex-col justify-between overflow-x-hidden pb-20">
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-amber-500/15">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2 text-xs font-bold text-amber-200/80 hover:text-white cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لمنصة الكتاب</span>
        </button>

        <button
          type="button"
          onClick={onOpenAppsModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/50 text-amber-300 text-xs font-bold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>تطبيقات MD7</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-3xl mx-auto">
        <div className="relative w-24 h-24 rounded-full border-2 border-amber-400 bg-[#12121A] flex flex-col items-center justify-center mb-5 shadow-lg">
          <span className="font-editorial text-4xl font-black text-amber-300">ن</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          شكراً لأنك كنت جزءاً من رحلة كتاب «نون»
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 font-editorial leading-relaxed mb-6 max-w-xl">
          اكتملت قراءتك لكافة أبواب وأقسام كتاب «نون» للمؤلف محمد الهمام. كل فكرة قرأتها اليوم هي خطوة نحو تحويل الرؤى والمعرفة إلى منجزات تخدم الإنسانية.
        </p>

        <div className="w-full flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? 'جارٍ إعداد PDF...' : downloadSuccess ? 'تم فتح معاينة PDF!' : 'احتفظ بنسختك الآن (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReviewModal}
            className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>قيّم تجربتك</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? 'تم نسخ الرابط!' : 'شارك تجربتك'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="px-4 py-3 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>طلب نشر وتوثيق كتابك</span>
          </button>
        </div>

        {/* MD7 4 Colored Spheres Links */}
        <div className="w-full text-right mt-2 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/25 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">تطبيقات ومنصات مجموعة MD7</h3>
            </div>
            <button type="button" onClick={onOpenAppsModal} className="text-xs text-amber-400 hover:underline cursor-pointer">
              عرض التفاصيل
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MD7_APPS.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 hover:border-amber-400 transition-colors flex flex-col justify-between text-right"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                      style={{ backgroundColor: app.colorHex }}
                    >
                      {app.sphereLabel}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">{app.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{app.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة قراءة الكتاب من البداية</span>
        </button>
      </main>
    </div>
  );
};
