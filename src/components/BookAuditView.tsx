import React from 'react';
import { ArrowRight, CheckCircle2, FileText, AlertTriangle, Quote } from 'lucide-react';
import { NOON_MANIFEST, getBookChapters } from '../books/registry';

interface BookAuditViewProps {
  onBack: () => void;
  onOpenReaderAtChapter: (chapterOrder: number) => void;
}

export const BookAuditView: React.FC<BookAuditViewProps> = ({
  onBack,
  onOpenReaderAtChapter,
}) => {
  const chapters = getBookChapters('noon', true);
  const summary = NOON_MANIFEST.auditSummary;

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0B0F] text-[#F3E5AB] pb-24">
      <header className="sticky top-0 z-30 bg-[#121218]/95 backdrop-blur-md border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة</span>
          </button>
          <h1 className="text-base sm:text-lg font-black text-white">
            تقرير التدقيق النصي الكامل — كتاب «نون»
          </h1>
          <span className="text-xs font-mono text-amber-400">NOON AUDIT</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Audit KPI Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl p-4 bg-[#15151D] border border-amber-500/30">
            <div className="text-xs text-zinc-400">إجمالي صفحات PDF المصدر</div>
            <div className="text-2xl font-black text-amber-300 mt-1 tabular-nums">
              {summary.totalSourcePdfPages}
            </div>
          </div>
          <div className="rounded-xl p-4 bg-[#15151D] border border-amber-500/30">
            <div className="text-xs text-zinc-400">إجمالي الأقسام المستخرجة</div>
            <div className="text-2xl font-black text-white mt-1 tabular-nums">
              {summary.totalChaptersGenerated} ({summary.totalMainChapters} رئيسي + {summary.totalAlternateVersions} بديل)
            </div>
          </div>
          <div className="rounded-xl p-4 bg-[#15151D] border border-amber-500/30">
            <div className="text-xs text-zinc-400">كلمات المصدر</div>
            <div className="text-2xl font-black text-amber-200 mt-1 tabular-nums">
              {summary.totalSourceWordsInChapters.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl p-4 bg-[#15151D] border border-amber-500/30">
            <div className="text-xs text-zinc-400">الكلمات المنسوخة حرفياً</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">
              {summary.totalCopiedWordsInChapters.toLocaleString()}
            </div>
          </div>
        </section>

        {/* Chapters Table */}
        <section className="rounded-xl bg-[#14141B] border border-amber-500/30 overflow-hidden">
          <div className="p-4 border-b border-amber-500/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-sm text-white">جدول مطابقة كل باب وقسم مع ملف PDF</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-black/60 text-amber-300 border-b border-amber-500/20">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">العنوان</th>
                  <th className="p-3">صفحات PDF</th>
                  <th className="p-3">كلمات المصدر</th>
                  <th className="p-3">كلمات منسوخة</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">قراءة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {chapters.map((ch) => (
                  <tr key={ch.id} className="hover:bg-white/[0.03]">
                    <td className="p-3 font-mono text-amber-400 tabular-nums">{ch.order}</td>
                    <td className="p-3 font-bold text-white">
                      {ch.title}
                      {ch.isAlternateVersion && (
                        <span className="mr-2 text-[10px] text-amber-300">(نسخة بديلة)</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-zinc-300 tabular-nums">{ch.sourcePages}</td>
                    <td className="p-3 font-mono text-zinc-300 tabular-nums">{ch.sourceWordCount}</td>
                    <td className="p-3 font-mono text-emerald-400 tabular-nums">{ch.copiedWordCount}</td>
                    <td className="p-3 text-zinc-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{ch.status}</span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onOpenReaderAtChapter(ch.order + 1)}
                        className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-200 hover:bg-amber-400 hover:text-black font-bold cursor-pointer"
                      >
                        فتح
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deletions Log */}
        <section className="rounded-xl p-5 bg-[#14141B] border border-amber-500/30 space-y-3">
          <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>سجل المحذوفات المصرّح بها فقط ({NOON_MANIFEST.deletionsLog.length})</span>
          </h3>
          <div className="space-y-2 text-xs">
            {NOON_MANIFEST.deletionsLog.map((d, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/50 border border-zinc-800 flex flex-wrap justify-between gap-2">
                <span className="font-bold text-white">{d.chapterTitle || d.sourcePage}</span>
                <span className="text-zinc-300">{d.reason}</span>
                <span className="font-mono text-amber-300 tabular-nums">
                  كلمات محذوفة: {d.deletedWordCount}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Extracted Clean Quotes & Verses */}
        <section className="rounded-xl p-5 bg-[#14141B] border border-amber-500/30 space-y-3">
          <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
            <Quote className="w-4 h-4" />
            <span>الاقتباسات والآيات المستخرجة بدقة ({NOON_MANIFEST.quotesAndVerses.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {NOON_MANIFEST.quotesAndVerses.map((q, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/50 border border-zinc-800 space-y-1">
                <div className="text-amber-300 font-bold">
                  {q.chapterTitle} ({q.sourcePages})
                </div>
                <p className="font-editorial text-sm text-zinc-100 leading-relaxed">{q.quote}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
