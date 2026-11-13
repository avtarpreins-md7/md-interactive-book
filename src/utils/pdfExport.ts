/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Luxury PDF Export Document Generator
 * Title: "نون"
 * Author: "محمد الهمام"
 * Strictly enforces Rule 4: Front cover has NO MD or MD7!
 * Back cover allows MD with unified QR code and dark brown MD2.
 */

import { BOOK_PAGES } from '../data/bookContent';
import { MD7_APPS } from '../data/md7Apps';
import { BOOK_STRUCTURE_CONFIG } from '../data/bookStructureConfig';

export function exportBookPDF(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>كتاب «نون» - تأليف محمد الهمام</title>
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
    /* Front Cover - Strictly NO MD / MD7 */
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
    .cover-emblem {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      color: #D4AF37;
      margin: 1.5rem 0;
      background: #111;
      box-shadow: 0 0 25px rgba(212,175,55,0.4);
    }
    .cover h1 {
      font-size: 2.4rem;
      color: #FFF6D6;
      margin: 0 0 0.5rem;
      font-weight: 900;
    }
    .cover h2 {
      font-size: 1.15rem;
      color: #D4AF37;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .cover .author-badge {
      font-size: 1.25rem;
      color: #FFFFFF;
      font-weight: bold;
      border-top: 1px solid rgba(212,175,55,0.5);
      border-bottom: 1px solid rgba(212,175,55,0.5);
      padding: 0.5rem 2rem;
      margin-top: 1rem;
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
      max-height: 320px;
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
      line-height: 1.8;
      color: #E2E8F0;
      margin-bottom: 0.8rem;
      text-align: justify;
    }
    .specs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 0.8rem;
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(212,175,55,0.25);
      border-radius: 4px;
    }
    .spec-item {
      display: flex;
      flex-direction: column;
    }
    .spec-label {
      font-size: 0.75rem;
      color: #94A3B8;
    }
    .spec-val {
      font-size: 0.85rem;
      color: #D4AF37;
      font-weight: bold;
    }
    /* Back Cover */
    .back-cover {
      page-break-after: avoid;
      height: 90vh;
      border: 3px double #D4AF37;
      padding: 2.5rem;
      box-sizing: border-box;
      background: radial-gradient(circle at center, #151520 0%, #060608 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
    }
    .node-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1.5rem 0;
      width: 100%;
      max-width: 450px;
    }
    .node-card {
      background: rgba(0,0,0,0.7);
      border: 1px solid rgba(212,175,55,0.3);
      padding: 0.8rem;
      border-radius: 6px;
      text-align: right;
    }
    .node-md2 {
      border-color: #8C5D30;
      background: rgba(45, 25, 10, 0.6);
    }
    .node-badge {
      font-weight: bold;
      color: #D4AF37;
      font-size: 0.85rem;
    }
    .node-md2 .node-badge {
      color: #C5A059;
    }
    .qr-box {
      border: 2px solid #D4AF37;
      padding: 1rem;
      background: #000;
      display: inline-block;
      margin: 1rem 0;
    }
  </style>
</head>
<body>

  <!-- FRONT COVER (Strictly NO MD / MD7) -->
  <div class="cover">
    <div>
      <div style="font-size: 0.85rem; letter-spacing: 0.2em; color: #D4AF37;">إصدار توثيقي فلسفي حصري</div>
      <div class="cover-emblem">ن</div>
    </div>
    <div>
      <h1 style="font-size: 3rem; margin-bottom: 0.2rem; color: #FFF6D6;">«${BOOK_STRUCTURE_CONFIG.frontCover.title}»</h1>
      <div class="author-badge">تأليف: ${BOOK_STRUCTURE_CONFIG.author}</div>
      <p style="font-size: 0.95rem; color: #E2E8F0; max-width: 500px; margin: 1.5rem auto 0; font-family: 'Amiri', serif;">
        «ن والقلم وما يسطرون · البداية الأزلية لكل فكرة خالدة تتحول إلى أثر حقيقي»
      </p>
    </div>
    <div style="font-size: 0.8rem; color: #94A3B8; border-top: 1px solid rgba(212,175,55,0.3); width: 80%; padding-top: 0.8rem;">
      تاريخ الإتاحة الرسمية: 11 نوفمبر 2026 · توقيت القاهرة
    </div>
  </div>

  <!-- BOOK PAGES -->
  ${BOOK_PAGES.filter(p => p.id > 1 && p.id < BOOK_PAGES.length).map(page => `
    <div class="page">
      <div class="page-header">
        <span>${page.chapter || BOOK_STRUCTURE_CONFIG.projectTitle}</span>
        <span>صفحة ${page.pageNumber}</span>
      </div>
      <h3>${page.title}</h3>
      ${page.subtitle ? `<div style="font-size: 0.95rem; color: #D4AF37; margin-bottom: 0.8rem;">${page.subtitle}</div>` : ''}
      
      ${page.image ? `
        <img class="page-image" src="${page.image}" alt="${page.title}" />
        ${page.imageCaption ? `<div style="font-size: 0.8rem; color: #CBD5E1; margin-bottom: 1rem; font-style: italic;">${page.imageCaption}</div>` : ''}
      ` : ''}

      ${page.quote ? `<div class="quote">${page.quote}</div>` : ''}

      <div class="prose">
        ${page.content.map(para => `<p>${para}</p>`).join('')}
      </div>

      ${page.specs ? `
        <div class="specs">
          ${page.specs.map(s => `
            <div class="spec-item">
              <span class="spec-label">${s.label}</span>
              <span class="spec-val">${s.value}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}

  <!-- BACK COVER (MD allowed with dark brown MD2) -->
  <div class="back-cover">
    <div>
      <div style="font-size: 0.85rem; letter-spacing: 0.2em; color: #D4AF37;">MD UNIFIED ECOSYSTEM</div>
      <h2 style="color: #FFF; font-size: 1.8rem; margin: 0.5rem 0;">منظومة الصروح والتحول الرقمي</h2>
      <p style="font-size: 0.9rem; color: #CBD5E1; max-width: 480px; margin: 0 auto;">
        بوابة موحدة تربط الرؤية الفكرية والتوثيقية بتطبيقات ومنصات المنظومة السحابية
      </p>
    </div>

    <!-- Node Constellation -->
    <div class="node-grid">
      <div class="node-card">
        <div class="node-badge">MD1 · الرؤية والابتكار</div>
        <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.2rem;">توليد الأفكار والاستراتيجيات المستقبلية</div>
      </div>
      <div class="node-card node-md2">
        <div class="node-badge" style="color: #dfc287;">MD2 · الإدارة والحوكمة (بني ذهبي)</div>
        <div style="font-size: 0.75rem; color: #CBD5E1; margin-top: 0.2rem;">القيادة المؤسسية والتنظيم المعتمد</div>
      </div>
      <div class="node-card">
        <div class="node-badge">MD3 · التطوير والتنفيذ</div>
        <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.2rem;">التطبيقات والمنصات التفاعلية المباشرة</div>
      </div>
      <div class="node-card">
        <div class="node-badge">MD4 · الاستدامة والمستقبل</div>
        <div style="font-size: 0.75rem; color: #94A3B8; margin-top: 0.2rem;">الطاقة النظيفة والواقع الافتراضي</div>
      </div>
    </div>

    <!-- QR Code & Link -->
    <div>
      <div class="qr-box">
        <div style="font-size: 1.2rem; font-weight: bold; color: #D4AF37; margin-bottom: 0.3rem;">[ QR CODE ]</div>
        <div style="font-family: monospace; font-size: 0.85rem; color: #FFF;">md7-group.ai.studio</div>
      </div>
      <div style="font-weight: bold; color: #D4AF37; font-size: 0.95rem; margin-top: 0.5rem;">
        ${BOOK_STRUCTURE_CONFIG.backCover.footerText}
      </div>
    </div>

    <div style="font-size: 0.8rem; color: #64748B;">
      كتاب «نون» · تأليف: محمد الهمام · جميع الحقوق محفوظة © 2026
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        resolve(true);
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'كتاب_نون_محمد_الهمام.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }
    } catch (e) {
      console.error('PDF export error:', e);
      resolve(false);
    }
  });
}
