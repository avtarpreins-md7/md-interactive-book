import { BOOK_PAGES } from '../data/bookContent';
import { MD7_APPS } from '../data/md7Apps';

/**
 * Generates and triggers download/viewing of the luxury MD Group Book PDF document
 */
export function exportBookPDF(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>MD Group Luxury Architecture Monograph - الكتاب الرقمي الفاخر</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 1.2cm;
    }
    body {
      background: #08080a;
      color: #F3E5AB;
      font-family: 'Cairo', 'Amiri', serif;
      margin: 0;
      padding: 1.5cm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .cover {
      page-break-after: always;
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      border: 3px double #D4AF37;
      padding: 2.5rem;
      box-sizing: border-box;
      background: radial-gradient(circle at center, #181822 0%, #08080a 100%);
    }
    .emblem {
      font-family: 'Cinzel', serif;
      font-size: 4rem;
      letter-spacing: 0.25em;
      color: #F3E5AB;
      text-shadow: 0 0 30px rgba(212,175,55,0.8);
      margin: 1.5rem 0;
      border: 2px solid #D4AF37;
      padding: 0.8rem 1.8rem;
    }
    .cover h1 {
      font-size: 2.5rem;
      color: #FFF6D6;
      margin: 0 0 0.5rem;
    }
    .cover h2 {
      font-size: 1.2rem;
      color: #D4AF37;
      font-weight: 400;
      letter-spacing: 0.08em;
    }
    .apps-box {
      width: 100%;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(212,175,55,0.35);
      border-radius: 4px;
      padding: 1rem;
      text-align: right;
      margin: 1.5rem 0;
    }
    .apps-box-title {
      font-weight: bold;
      color: #D4AF37;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid rgba(212,175,55,0.2);
      padding-bottom: 0.3rem;
    }
    .app-item {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      font-size: 0.85rem;
    }
    .page {
      page-break-after: always;
      min-height: 85vh;
      border: 1px solid rgba(212,175,55,0.3);
      padding: 2rem;
      margin-bottom: 2rem;
      box-sizing: border-box;
      background: #0C0C10;
      position: relative;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(212,175,55,0.4);
      padding-bottom: 0.6rem;
      margin-bottom: 1.2rem;
      font-size: 0.85rem;
      color: #D4AF37;
    }
    .page h3 {
      font-size: 1.6rem;
      color: #FFF;
      margin-top: 0;
      border-right: 4px solid #D4AF37;
      padding-right: 0.8rem;
    }
    .page-image {
      width: 100%;
      max-height: 340px;
      object-fit: cover;
      border: 1px solid #D4AF37;
      margin: 1rem 0;
      border-radius: 4px;
    }
    .quote {
      font-family: 'Amiri', serif;
      font-size: 1.15rem;
      font-style: italic;
      color: #F3E5AB;
      background: rgba(212,175,55,0.08);
      border-right: 3px solid #D4AF37;
      padding: 0.8rem 1.2rem;
      margin: 1.2rem 0;
    }
    .prose p {
      font-size: 0.95rem;
      line-height: 1.75;
      color: #E2E8F0;
      margin-bottom: 0.8rem;
      text-align: justify;
    }
    .specs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.8rem;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(212,175,55,0.2);
      padding: 0.8rem;
      margin-top: 1.2rem;
    }
    .spec-item {
      font-size: 0.8rem;
    }
    .spec-label {
      color: #A0AEC0;
      display: block;
    }
    .spec-value {
      color: #F3E5AB;
      font-weight: 700;
      margin-top: 0.2rem;
    }
    .page-footer {
      position: absolute;
      bottom: 1rem;
      left: 2rem;
      right: 2rem;
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #718096;
      border-top: 1px solid rgba(212,175,55,0.2);
      padding-top: 0.4rem;
    }
    @media print {
      body {
        padding: 0;
        background: #08080a;
      }
      .page, .cover {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <!-- COVER -->
  <div class="cover">
    <div>
      <div class="emblem">MD</div>
      <h1>مجموعة MD المعمارية</h1>
      <h2>الأفق المعماري الجديد · THE NEW ARCHITECTURAL HORIZON</h2>
    </div>

    <!-- MD7 Ecosystem Apps Box -->
    <div class="apps-box">
      <div class="apps-box-title">منظومة وتطبيقات مجموعة MD7 الرقمية:</div>
      ${MD7_APPS.map(
        (app) => `
        <div class="app-item">
          <span style="color: #FFF; font-weight: 600;">${app.name} (${app.badge})</span>
          <span style="color: #D4AF37; font-family: monospace;">${app.url}</span>
        </div>
      `
      ).join('')}
    </div>

    <div style="color: #A0AEC0; font-size: 0.85rem;">
      الإصدار التوثيقي الحصري لعام 2026 · الفخامة السوداء والذهب الخالص
    </div>
  </div>

  <!-- BOOK PAGES -->
  ${BOOK_PAGES.map(
    (page) => `
    <div class="page">
      <div class="page-header">
        <span>${page.chapter || 'مجموعة MD'}</span>
        <span>صفحة ${page.pageNumber}</span>
      </div>
      <h3>${page.title}</h3>
      ${page.subtitle ? `<p style="color: #D4AF37; font-size: 0.9rem; margin-top: -0.4rem;">${page.subtitle}</p>` : ''}
      
      ${page.image ? `<img src="${page.image}" class="page-image" alt="${page.title}" />` : ''}
      ${page.imageCaption ? `<p style="font-size: 0.8rem; color: #A0AEC0; margin-top: -0.4rem; font-style: italic;">${page.imageCaption}</p>` : ''}
      
      ${page.quote ? `<div class="quote">${page.quote}</div>` : ''}
      
      <div class="prose">
        ${page.content.map((p) => `<p>${p}</p>`).join('')}
      </div>

      ${
        page.specs
          ? `
        <div class="specs">
          ${page.specs
            .map(
              (s) => `
            <div class="spec-item">
              <span class="spec-label">${s.label}</span>
              <span class="spec-value">${s.value}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <div class="page-footer">
        <span>MD GROUP LUXURY EDITION</span>
        <span>صفحة ${page.pageNumber} من ${BOOK_PAGES.length}</span>
      </div>
    </div>
  `
  ).join('')}
</body>
</html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          try {
            printWindow.print();
          } catch {}
          resolve(true);
        }, 500);
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MD_Group_Luxury_Book_Edition_2026.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }
    } catch (err) {
      console.error('PDF export error:', err);
      resolve(false);
    }
  });
}
