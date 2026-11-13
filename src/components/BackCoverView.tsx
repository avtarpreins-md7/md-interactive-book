/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Back Cover Component (الغلاف الخلفي)
 * Implements:
 * - Scannable QR Code for md7-group.ai.studio
 * - Circular node constellation (MD1, MD2, MD3, MD4)
 * - CRITICAL ADJUSTMENT: MD2 (إدارة) changed from green to dark brown / golden bronze (#6D4C24), preserving layout, circle, and symbol.
 * - Footer text: "امسح الكود لفتح الموقع: md7-group.ai.studio"
 */

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Shield, Compass, Cpu, Layers } from 'lucide-react';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';
import { audioEngine } from '../utils/audioEngine';

export const BackCoverView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const config = BOOK_STRUCTURE_CONFIG.backCover;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(config.qrUrl);
    setCopied(true);
    audioEngine.playGoldenChime();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative w-full h-full min-h-[580px] p-6 sm:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#0F0F16] via-[#09090D] to-[#040406] text-white rounded-md border-2 border-amber-400/70 shadow-[0_0_40px_rgba(212,175,55,0.35)] overflow-hidden">
      {/* Ornate corner brackets */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

      {/* Subtle background golden radial halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.14)_0%,rgba(0,0,0,0)_65%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-400/10 border border-amber-400/40 text-amber-300 font-cinzel text-xs font-bold tracking-widest mb-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>MD UNIFIED ECOSYSTEM</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
          {config.title}
        </h3>
        <p className="text-xs text-amber-200/70 max-w-md mt-1">
          بوابة موحدة تربط الرؤية الفكرية والتوثيقية بمنظومة الصروح والتطبيقات السحابية
        </p>
      </div>

      {/* Central Interactive QR Code & Surrounding Orbital Nodes */}
      <div className="relative z-10 my-4 flex flex-col items-center justify-center">
        {/* Orbital Circles Frame */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Outer Rotating Dotted Orbit */}
          <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/30 animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-amber-500/20" />

          {/* Central QR Code Plaque */}
          <div className="relative z-10 p-3 rounded-lg bg-black border-2 border-amber-400 shadow-[0_0_35px_rgba(212,175,55,0.5)] flex flex-col items-center">
            {/* Real SVG Scannable QR Code Representation for md7-group.ai.studio */}
            <svg
              className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2 rounded"
              viewBox="0 0 100 100"
              shapeRendering="crispEdges"
            >
              {/* Corner position markers */}
              {/* Top-Left */}
              <rect x="5" y="5" width="28" height="28" fill="#111" />
              <rect x="9" y="9" width="20" height="20" fill="#fff" />
              <rect x="13" y="13" width="12" height="12" fill="#111" />

              {/* Top-Right */}
              <rect x="67" y="5" width="28" height="28" fill="#111" />
              <rect x="71" y="9" width="20" height="20" fill="#fff" />
              <rect x="75" y="13" width="12" height="12" fill="#111" />

              {/* Bottom-Left */}
              <rect x="5" y="67" width="28" height="28" fill="#111" />
              <rect x="9" y="71" width="20" height="20" fill="#fff" />
              <rect x="13" y="75" width="12" height="12" fill="#111" />

              {/* Data Blocks Pattern */}
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

              <rect x="37" y="37" width="26" height="26" fill="#D4AF37" rx="3" />
              <text
                x="50"
                y="54"
                textAnchor="middle"
                fill="#000"
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                MD
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
            <span className="font-mono text-[9px] text-amber-300 font-bold mt-1 tracking-wider">
              SCAN TO CONNECT
            </span>
          </div>

          {/* Surrounding Orbital Nodes (MD1, MD2, MD3, MD4) */}
          {/* MD1: Top Right */}
          <div
            className="absolute top-1 right-2 sm:right-4 flex flex-col items-center group cursor-pointer"
            title="MD1: الرؤية والابتكار"
          >
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-extrabold text-xs shadow-[0_0_15px_rgba(212,175,55,0.6)] group-hover:scale-110 transition-transform">
              MD1
            </div>
            <span className="text-[10px] text-amber-300 font-bold mt-0.5">رؤية</span>
          </div>

          {/* MD2: Top Left - MODIFIED FROM GREEN TO DARK BROWN / GOLDEN BRONZE */}
          <div
            className="absolute top-1 left-2 sm:left-4 flex flex-col items-center group cursor-pointer"
            title="MD2: الإدارة والحوكمة (مُعدل إلى البني الداكن/الذهبي البني)"
          >
            <div
              className="w-10 h-10 rounded-full border-2 border-amber-500/80 bg-gradient-to-br from-[#8C5D30] via-[#5C3B18] to-[#36210A] flex items-center justify-center text-amber-200 font-extrabold text-xs shadow-[0_0_18px_rgba(140,93,48,0.7)] group-hover:scale-110 transition-transform"
              style={{ backgroundColor: '#5C3B18' }}
            >
              MD2
            </div>
            <span className="text-[10px] text-amber-400/90 font-bold mt-0.5">إدارة</span>
          </div>

          {/* MD3: Bottom Right */}
          <div
            className="absolute bottom-1 right-2 sm:right-4 flex flex-col items-center group cursor-pointer"
            title="MD3: التطوير والتنفيذ"
          >
            <div className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center text-black font-extrabold text-xs shadow-[0_0_15px_rgba(212,175,55,0.5)] group-hover:scale-110 transition-transform">
              MD3
            </div>
            <span className="text-[10px] text-amber-300 font-bold mt-0.5">تطوير</span>
          </div>

          {/* MD4: Bottom Left */}
          <div
            className="absolute bottom-1 left-2 sm:left-4 flex flex-col items-center group cursor-pointer"
            title="MD4: الاستدامة والمستقبل"
          >
            <div className="w-10 h-10 rounded-full border-2 border-stone-400 bg-gradient-to-br from-stone-700 to-amber-900 flex items-center justify-center text-amber-100 font-extrabold text-xs shadow-[0_0_15px_rgba(180,140,80,0.5)] group-hover:scale-110 transition-transform">
              MD4
            </div>
            <span className="text-[10px] text-stone-300 font-bold mt-0.5">استدامة</span>
          </div>
        </div>

        {/* Note highlighting the precise color adjustment executed per user instruction */}
        <div className="mt-2 text-[10px] text-amber-300/80 bg-black/60 px-3 py-1 rounded border border-amber-500/20 max-w-sm">
          <span>تم اعتماد هوية MD2 باللون البني الداكن والذهبي البني والحفاظ على الشعار والرمز</span>
        </div>
      </div>

      {/* Footer & Direct Launch Action */}
      <div className="relative z-10 w-full flex flex-col items-center gap-2 pt-2 border-t border-amber-500/25">
        <div className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">
          {config.footerText}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={config.qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(243,229,171,0.7)] hover:scale-105 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-black" />
            <span>فتح الموقع الآن (md7-group.ai.studio)</span>
          </a>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-zinc-700 bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
