import React, { useState } from 'react';
import { Download, Star, Share2, RefreshCw, Sparkles, Check, ArrowRight, ExternalLink, Layers, Mail } from 'lucide-react';
import { exportBookPDF } from '../utils/pdfExport';
import { audioEngine } from '../utils/audioEngine';
import { MD7_APPS } from '../data/md7Apps';

interface CompletionScreenProps {
  onRestart: () => void;
  onOpenReviewModal: () => void;
  onBackToOcean: () => void;
  onOpenAppsModal: () => void;
  onOpenPublishModal: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onRestart,
  onOpenReviewModal,
  onBackToOcean,
  onOpenAppsModal,
  onOpenPublishModal
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
      text: 'عشت تجربة سينمائية تفاعلية فريدة واطلعت على فصول كتاب «نون» للمؤلف محمد الهمام.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    audioEngine.playGoldenChime();
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#040406] text-white flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.22)_0%,rgba(5,5,8,0.98)_70%)]" />

      {/* Top Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-amber-500/15">
        <button
          onClick={onBackToOcean}
          className="flex items-center gap-2 text-xs text-amber-200/70 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          <span>العودة لمشهد البحر ونون</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAppsModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/15 border border-amber-400/50 text-amber-300 text-xs hover:bg-amber-400/25 transition-all cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>تطبيقات MD7</span>
          </button>
          <span className="font-cinzel text-xs text-amber-400 font-bold tracking-widest hidden sm:inline">
            MD COMPLETED JOURNEY
          </span>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-3xl mx-auto">
        {/* Halo Pedestal Book Representation */}
        <div className="relative mb-6">
          <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-300/40 to-amber-600/30 blur-3xl animate-pulse-gold pointer-events-none" />

          {/* Golden Seal Emblem */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400 bg-gradient-to-b from-[#181824] to-[#0A0A0E] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.6)]">
            <Sparkles className="w-5 h-5 text-amber-300 mb-0.5" />
            <span className="font-cinzel text-2xl sm:text-3xl font-extrabold text-amber-300">
              MD
            </span>
            <span className="text-[8px] text-amber-200 font-mono tracking-widest">
              LEGACY ARCHIVED
            </span>
          </div>
        </div>

        {/* Thank You Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
          شكراً لأنك كنت جزءاً من رحلة كتاب «نون»
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 font-editorial leading-relaxed mb-6 max-w-xl">
          اكتملت قراءتك لكافة فصول كتاب «نون» للمؤلف محمد الهمام. كل فكرة قرأتها اليوم هي خطوة نحو تحويل الرؤى والمعرفة إلى منجزات تفيد المجتمع والإنسانية.
        </p>

        {/* Action Buttons Grid */}
        <div className="w-full flex flex-wrap items-center justify-center gap-3 mb-8">
          {/* Download Copy Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-5 py-3 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(243,229,171,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>تم تجهيز النسخة للتحميل!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-black" />
                <span>{isDownloading ? 'جارٍ إعداد النسخة...' : 'احتفظ بنسختك الآن (PDF)'}</span>
              </>
            )}
          </button>

          {/* Rate Experience Button */}
          <button
            onClick={onOpenReviewModal}
            className="px-4 py-3 rounded-sm border border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:text-white hover:border-amber-400/60 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>قيّم تجربتك</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-sm border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-500 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedShare ? 'تم نسخ الرابط!' : 'شارك رحلتك'}</span>
          </button>

          {/* Publish Your Book Button */}
          <button
            onClick={onOpenPublishModal}
            className="px-4 py-3 rounded-sm border border-amber-500/50 bg-amber-500/10 text-amber-200 hover:text-white hover:border-amber-400 hover:bg-amber-500/20 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>طلب نشر وتوثيق كتابك</span>
          </button>
        </div>

        {/* MD7 Apps Ecosystem Showcase Cards */}
        <div className="w-full text-right mt-2 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/25 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">
                تطبيقات ومنصات مجموعة MD7 (روابط مباشرة)
              </h3>
            </div>
            <button
              onClick={onOpenAppsModal}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              عرض كافة التفاصيل
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MD7_APPS.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded bg-black/60 border border-amber-400/30 hover:border-amber-400 hover:bg-black/90 transition-all flex flex-col justify-between text-right shadow-[0_4px_15px_rgba(0,0,0,0.6)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                      {app.badge}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-300 transition-colors" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors mb-1">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] font-mono text-amber-300/80 group-hover:text-amber-300 truncate">
                  {app.url}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Restart Reading */}
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة قراءة الكتاب من البداية</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 gap-2">
        <span>كتاب «نون» · تأليف: محمد الهمام</span>
        <span className="font-mono text-amber-400/80">EDITION 2026 · ALL RIGHTS RESERVED</span>
      </footer>
    </div>
  );
};
