/**
 * Back Cover Component (الغلاف الخلفي)
 * Unified MD7 QR Hub (https://md7-group.ai.studio/) + 4 Reserved-Color Spheres + Chrome Add-to-Home-Screen guide.
 * Strictly obeys rotation_disabled = true (zero spin animations).
 */

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Smartphone } from 'lucide-react';
import { MD7_APPS, MD7_HUB_URL, CHROME_INSTALL_STEPS } from '../data/md7Apps';
import { audioEngine } from '../utils/audioEngine';

export const BackCoverView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(MD7_HUB_URL);
    setCopied(true);
    audioEngine.playGoldenChime();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      dir="rtl"
      className="relative w-full min-h-[560px] p-6 sm:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#0D0D14] via-[#07070B] to-[#030305] text-white rounded-xl border-2 border-[#D4AF37]/70 overflow-hidden"
    >
      {/* Header */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="text-xs font-cinzel text-[#D4AF37] font-bold tracking-widest mb-1">
          MD7 UNIFIED ECOSYSTEM
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
          منظومة الصروح والتطبيقات الموحدة
        </h3>
        <p className="text-xs text-amber-200/75 max-w-md mt-1">
          امسح رمز الاستجابة السريعة للوصول إلى البوابة الرئيسية والدوائر الأربع الملونة
        </p>
      </div>

      {/* Central QR Code & 4 Reserved-Color Spheres */}
      <div className="relative z-10 my-4 w-full max-w-lg flex flex-col items-center gap-5">
        {/* QR Box */}
        <div className="p-3 rounded-xl bg-black border-2 border-[#D4AF37] flex flex-col items-center shadow-lg">
          <svg
            className="w-28 h-28 sm:w-32 sm:h-32 bg-white p-2 rounded"
            viewBox="0 0 100 100"
            shapeRendering="crispEdges"
          >
            <rect x="5" y="5" width="28" height="28" fill="#111" />
            <rect x="9" y="9" width="20" height="20" fill="#fff" />
            <rect x="13" y="13" width="12" height="12" fill="#111" />
            <rect x="67" y="5" width="28" height="28" fill="#111" />
            <rect x="71" y="9" width="20" height="20" fill="#fff" />
            <rect x="75" y="13" width="12" height="12" fill="#111" />
            <rect x="5" y="67" width="28" height="28" fill="#111" />
            <rect x="9" y="71" width="20" height="20" fill="#fff" />
            <rect x="13" y="75" width="12" height="12" fill="#111" />

            <rect x="37" y="7" width="6" height="6" fill="#111" />
            <rect x="47" y="7" width="6" height="6" fill="#111" />
            <rect x="57" y="7" width="6" height="6" fill="#111" />
            <rect x="37" y="17" width="6" height="6" fill="#111" />
            <rect x="57" y="17" width="6" height="6" fill="#111" />
            <rect x="47" y="27" width="6" height="6" fill="#111" />
            <rect x="7" y="37" width="6" height="6" fill="#111" />
            <rect x="17" y="47" width="6" height="6" fill="#111" />
            <rect x="27" y="37" width="6" height="6" fill="#111" />
            <rect x="27" y="57" width="6" height="6" fill="#111" />

            <rect x="36" y="36" width="28" height="28" fill="#D4AF37" rx="4" />
            <text
              x="50"
              y="54"
              textAnchor="middle"
              fill="#000"
              fontSize="11"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              MD7
            </text>

            <rect x="67" y="37" width="6" height="6" fill="#111" />
            <rect x="77" y="47" width="6" height="6" fill="#111" />
            <rect x="87" y="37" width="6" height="6" fill="#111" />
            <rect x="77" y="57" width="6" height="6" fill="#111" />
            <rect x="37" y="67" width="6" height="6" fill="#111" />
            <rect x="47" y="77" width="6" height="6" fill="#111" />
            <rect x="57" y="87" width="6" height="6" fill="#111" />
            <rect x="67" y="67" width="6" height="6" fill="#111" />
            <rect x="77" y="77" width="6" height="6" fill="#111" />
            <rect x="87" y="87" width="6" height="6" fill="#111" />
          </svg>
          <span className="font-mono text-[10px] text-[#D4AF37] font-bold mt-1.5">
            md7-group.ai.studio
          </span>
        </div>

        {/* 4 Colored Spheres Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {MD7_APPS.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-black/70 border border-zinc-800 hover:border-[#D4AF37] transition-colors flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs border border-white/40 shadow-md"
                style={{ backgroundColor: app.colorHex }}
              >
                {app.sphereLabel}
              </span>
              <span className="text-xs font-bold text-white leading-tight">{app.name}</span>
              <span className="text-[10px] text-zinc-400">{app.tag}</span>
            </a>
          ))}
        </div>

        {/* Chrome Add to Home Screen Instructions */}
        <div className="w-full p-3.5 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-right space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5D68E]">
            <Smartphone className="w-4 h-4" />
            <span>إضافة أيقونة التطبيق على شاشة هاتفك (Chrome):</span>
          </div>
          <ol className="text-[11px] text-zinc-300 space-y-1 pr-4 list-decimal">
            {CHROME_INSTALL_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer & Launch Links */}
      <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-amber-500/25">
        <a
          href={MD7_HUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>فتح البوابة الرئيسية (md7-group.ai.studio)</span>
        </a>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-700 bg-black/60 hover:bg-zinc-800 text-zinc-200 text-xs cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط المنصة'}</span>
        </button>
      </div>
    </div>
  );
};
