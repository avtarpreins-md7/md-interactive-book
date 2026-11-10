import React, { useState } from 'react';
import { ExternalLink, Copy, Check, X, Sparkles, Layers, DollarSign, Globe } from 'lucide-react';
import { MD7_APPS, MD7App } from '../data/md7Apps';
import { audioEngine } from '../utils/audioEngine';

interface MD7AppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MD7AppsModal: React.FC<MD7AppsModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (app: MD7App, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(app.url);
    setCopiedId(app.id);
    audioEngine.playGoldenChime();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getIcon = (type: MD7App['iconType']) => {
    switch (type) {
      case 'studio':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'currency':
        return <DollarSign className="w-5 h-5 text-amber-400" />;
      case 'portal':
        return <Globe className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-lg p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#070709] border border-amber-400/80 shadow-[0_0_60px_rgba(212,175,55,0.45)] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-400/10 border border-amber-400/40 text-[11px] font-cinzel text-amber-300 font-bold tracking-widest mb-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>MD7 ECOSYSTEM APPLICATIONS</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            تطبيقات ومنظومة مجموعة MD7
          </h3>
          <p className="text-xs sm:text-sm text-amber-200/70 mt-1">
            استكشف التطبيقات والمنصات الرقمية المطورة تحت مظلة وإشراف مجموعة MD7
          </p>
        </div>

        {/* Apps Cards Grid */}
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {MD7_APPS.map((app) => (
            <div
              key={app.id}
              className="group relative rounded-md p-4 bg-gradient-to-r from-[#12121A] via-[#0E0E14] to-[#141420] border border-amber-400/35 hover:border-amber-400 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* App Meta & Details */}
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-11 h-11 rounded-sm border border-amber-400/60 bg-black/60 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform">
                  {getIcon(app.iconType)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-white tracking-wide group-hover:text-amber-300 transition-colors">
                      {app.name}
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                      {app.badge}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="text-[11px] font-mono text-zinc-500 pt-0.5 break-all">
                    {app.url}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <button
                  onClick={(e) => handleCopy(app, e)}
                  className="px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-400/60 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="نسخ الرابط"
                >
                  {copiedId === app.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(243,229,171,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>فتح التطبيق</span>
                  <ExternalLink className="w-3.5 h-3.5 text-black" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
          <span>منظومة وتطبيقات مجموعة MD7 الرقمية</span>
          <span className="font-mono text-amber-300">MD7 ECOSYSTEM · © 2026</span>
        </div>
      </div>
    </div>
  );
};
