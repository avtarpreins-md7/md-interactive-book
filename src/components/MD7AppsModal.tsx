import React, { useState } from 'react';
import { ExternalLink, Copy, Check, X, Sparkles, Smartphone } from 'lucide-react';
import { MD7_APPS, MD7_HUB_APP, CHROME_INSTALL_STEPS, MD7App } from '../data/md7Apps';
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

  const allApps = [MD7_HUB_APP, ...MD7_APPS];

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#14141E] via-[#0C0C12] to-[#070709] border border-amber-400/80 shadow-2xl text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 text-xs font-cinzel text-amber-300 font-bold tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MD7 UNIFIED ECOSYSTEM</span>
          </div>
          <h3 className="text-2xl font-bold text-white">منظومة وتطبيقات مجموعة MD7</h3>
          <p className="text-xs text-amber-200/75 mt-1">
            كل منصة بلونها المعتمد: البنفسجي للصوت، الأخضر للعملات، البني للكتاب، الأزرق للسوق، والذهبي للمركز
          </p>
        </div>

        {/* Apps Cards */}
        <div className="space-y-3 max-h-[54vh] overflow-y-auto pr-1">
          {allApps.map((app) => (
            <div
              key={app.id}
              className="rounded-xl p-4 bg-[#12121A] border border-zinc-800 hover:border-amber-400/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-11 h-11 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0 text-white font-black text-xs shadow-md"
                  style={{ backgroundColor: app.colorHex }}
                >
                  {app.sphereLabel}
                </div>

                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-white">{app.name}</h4>
                    <span className="text-[11px] font-semibold text-amber-300">{app.tag}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{app.description}</p>
                  <div className="text-[11px] font-mono text-zinc-500 break-all">{app.url}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                <button
                  type="button"
                  onClick={(e) => handleCopy(app, e)}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
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
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>فتح التطبيق</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Chrome Add to Home Screen Tip */}
        <div className="mt-4 p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">إضافة للشاشة الرئيسية: </strong>
            {CHROME_INSTALL_STEPS[2]}
          </div>
        </div>
      </div>
    </div>
  );
};
