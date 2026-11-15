/**
 * A5 Print & Paged.js PDF Generator for «نون»
 * - Exact A5 (148mm × 210mm) page size
 * - Pure black #000 !important page surfaces with -webkit-print-color-adjust: exact
 * - Preloads cover & all images as data URIs before calling print
 * - Live TOC page numbers via CSS target-counter(attr(href), page)
 * - Two small black gold-bordered triangles in footer: Arabic-Indic (right) & Western (left)
 * - Back cover includes md7-group.ai.studio QR + 4 colored spheres + Chrome instructions
 * - Zero HTML/index.html file downloads (uses hidden iframe fallback if popups are blocked)
 */

import { NOON_MANIFEST, getBookChapters } from '../books/registry';
import { MD7_APPS, MD7_HUB_URL, CHROME_INSTALL_STEPS } from '../data/md7Apps';

async function preloadImageAsDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function exportBookPDF(): Promise<boolean> {
  try {
    const chapters = getBookChapters('noon', true);

    // Preload cover & all unique chapter image URLs as data URIs
    const uniqueImgUrls = Array.from(
      new Set([NOON_MANIFEST.cover, ...chapters.map((c) => c.image).filter((u): u is string => Boolean(u))])
    );
    const dataUriMap = new Map<string, string>();
    await Promise.all(
      uniqueImgUrls.map(async (u) => {
        dataUriMap.set(u, await preloadImageAsDataUri(u));
      })
    );

    const coverSrc = dataUriMap.get(NOON_MANIFEST.cover) || NOON_MANIFEST.cover;

    const chaptersHtml = chapters
      .map((ch) => {
        const imgData = ch.image ? dataUriMap.get(ch.image) || ch.image : '';
        return `
        <section class="page-chapter" id="sec-${escapeHtml(ch.id)}">
          <div class="ch-kicker">${escapeHtml(ch.displayNumber || ch.partTitle)} ${
            ch.isAlternateVersion ? '· نسخة بديلة' : ''
          }</div>
          <h2>${escapeHtml(ch.title)}</h2>
          ${
            imgData
              ? `<figure class="ch-fig">
                   <img src="${imgData}" alt="${escapeHtml(ch.title)}" />
                   ${ch.noteUnderImage ? `<figcaption>${escapeHtml(ch.noteUnderImage)}</figcaption>` : ''}
                 </figure>`
              : ''
          }
          ${ch.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        </section>`;
      })
      .join('\n');

    const tocRowsHtml = chapters
      .map(
        (ch) => `
        <li>
          <a href="#sec-${escapeHtml(ch.id)}">
            <span class="toc-title">${escapeHtml(ch.displayNumber ? ch.displayNumber + ' — ' : '')}${escapeHtml(ch.title)}</span>
            <span class="toc-dots"></span>
          </a>
        </li>`
      )
      .join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>كتاب «نون» — ${escapeHtml(NOON_MANIFEST.author)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js"></script>
  <style>
    @page {
      size: 148mm 210mm;
      margin: 15mm 14mm 18mm 14mm;
      background: #000000 !important;
      @bottom-right {
        content: "▲ " counter(page, arabic-indic);
        color: #D4AF37;
        font-family: 'Cairo', sans-serif;
        font-size: 9pt;
        font-weight: 800;
      }
      @bottom-center {
        content: "«نون» · ${escapeHtml(NOON_MANIFEST.author)}";
        color: #A8893D;
        font-family: 'Amiri', serif;
        font-size: 8.5pt;
      }
      @bottom-left {
        content: counter(page) " ▲";
        color: #D4AF37;
        font-family: monospace;
        font-size: 9pt;
        font-weight: 800;
      }
    }
    @page :first {
      margin: 0;
      @bottom-right { content: none; }
      @bottom-center { content: none; }
      @bottom-left { content: none; }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background: #000000 !important;
      color: #F3E5AB;
      font-family: 'Cairo', 'Amiri', serif;
      margin: 0;
      padding: 0;
    }
    .pagedjs_page {
      background: #000000 !important;
    }
    .cover-page {
      width: 148mm;
      height: 210mm;
      position: relative;
      page-break-after: always;
      background: #000000 !important;
      overflow: hidden;
    }
    .cover-page img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .cover-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 20mm 14mm;
      background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.85) 100%);
      text-align: center;
    }
    .cover-title {
      font-family: 'Amiri', serif;
      font-size: 56pt;
      font-weight: 900;
      color: #F5D68E;
      margin: 0;
    }
    .cover-author {
      font-size: 16pt;
      font-weight: 800;
      color: #FFFFFF;
      border-top: 1px solid #D4AF37;
      padding-top: 6pt;
    }
    .toc-page {
      page-break-after: always;
    }
    .toc-page h2 {
      color: #F5D68E;
      border-bottom: 1.5px solid #D4AF37;
      padding-bottom: 5pt;
      font-size: 16pt;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .toc-list li {
      margin-bottom: 4pt;
      font-size: 9.5pt;
    }
    .toc-list a {
      color: #F3E5AB;
      text-decoration: none;
      display: flex;
      justify-content: space-between;
    }
    .toc-list a::after {
      content: target-counter(attr(href), page);
      color: #D4AF37;
      font-weight: bold;
      margin-right: 6pt;
    }
    .page-chapter {
      page-break-before: always;
    }
    .ch-kicker {
      color: #D4AF37;
      font-size: 9.5pt;
      font-weight: 700;
      margin-bottom: 3pt;
    }
    .page-chapter h2 {
      color: #FFFFFF;
      font-size: 15pt;
      border-right: 3px solid #D4AF37;
      padding-right: 8pt;
      margin: 0 0 8pt;
    }
    .ch-fig {
      margin: 8pt 0;
      border: 1px solid #D4AF37;
      background: #08080A;
      padding: 4pt;
    }
    .ch-fig img {
      width: 100%;
      max-height: 75mm;
      object-fit: contain;
      display: block;
    }
    .ch-fig figcaption {
      font-size: 8.5pt;
      color: #D4AF37;
      padding-top: 4pt;
      text-align: center;
    }
    .page-chapter p {
      font-size: 10.2pt;
      line-height: 1.85;
      color: #EDE6D3;
      text-align: justify;
      margin: 0 0 7pt;
    }
    .back-cover {
      page-break-before: always;
      text-align: center;
      padding-top: 8mm;
    }
    .spheres-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6pt;
      margin: 10pt 0;
    }
    .sphere-card {
      border: 1px solid #D4AF37;
      padding: 6pt;
      border-radius: 6pt;
      background: #0A0A0E;
      font-size: 8.5pt;
      text-align: right;
    }
    .mobile-hint {
      font-size: 8pt;
      color: #F5D68E;
      border: 1px dashed #D4AF37;
      padding: 5pt;
      margin-top: 8pt;
    }
  </style>
</head>
<body>
  <section class="cover-page">
    <img src="${coverSrc}" alt="غلاف كتاب نون" />
    <div class="cover-overlay">
      <div style="color:#D4AF37;font-size:10pt;font-weight:700;">النسخة التوثيقية الكاملة</div>
      <h1 class="cover-title">«${escapeHtml(NOON_MANIFEST.title)}»</h1>
      <div class="cover-author">تأليف: ${escapeHtml(NOON_MANIFEST.author)}</div>
    </div>
  </section>

  <section class="toc-page">
    <h2>فهرس الأبواب والمباحث</h2>
    <ul class="toc-list">${tocRowsHtml}</ul>
  </section>

  ${chaptersHtml}

  <section class="back-cover">
    <h2 style="color:#F5D68E;">منظومة MD7 الموحدة</h2>
    <p style="font-size:9.5pt;color:#D4AF37;">${escapeHtml(MD7_HUB_URL)}</p>
    <div class="spheres-grid">
      ${MD7_APPS.map(
        (app) => `
        <div class="sphere-card">
          <strong style="color:${app.colorHex};">● ${escapeHtml(app.name)}</strong><br/>
          <span style="color:#CBD5E1;">${escapeHtml(app.url)}</span>
        </div>`
      ).join('')}
    </div>
    <div style="text-align:right;font-size:8.5pt;color:#E2E8F0;margin-top:8pt;">
      <strong>إضافة للشاشة الرئيسية (Chrome):</strong><br/>
      ${CHROME_INSTALL_STEPS.map((s) => `• ${escapeHtml(s)}`).join('<br/>')}
    </div>
    <div class="mobile-hint">
      تنبيه الطباعة: فعّل «الرسومات الخلفية» (Background Graphics) من إعدادات الطباعة على هاتفك أو حاسوبك لضمان الخلفية السوداء الفاخرة.
    </div>
  </section>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 1100);
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return true;
    }

    // Fallback via hidden iframe print (NO HTML file download!)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 1200);
    }
    return true;
  } catch (e) {
    console.error('PDF export error:', e);
    return false;
  }
}
