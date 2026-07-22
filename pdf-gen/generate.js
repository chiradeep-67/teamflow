const puppeteer = require('puppeteer');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const MD_PATH = path.join(__dirname, '..', 'FINAL_INTERNSHIP_REPORT.md');
const OUT_PATH = path.join(__dirname, '..', 'FINAL_INTERNSHIP_REPORT.pdf');

const markdown = fs.readFileSync(MD_PATH, 'utf-8');

// Custom renderer for better table and code styling
const renderer = new marked.Renderer();

renderer.table = (token) => {
  let header = '';
  token.header.forEach((cell) => {
    const align = cell.align ? ` style="text-align:${cell.align}"` : '';
    header += `<th${align}>${cell.text}</th>`;
  });

  let body = '';
  token.rows.forEach((row, i) => {
    const rowClass = i % 2 === 0 ? 'even' : 'odd';
    let cells = '';
    row.forEach((cell) => {
      const align = cell.align ? ` style="text-align:${cell.align}"` : '';
      cells += `<td${align}>${cell.text}</td>`;
    });
    body += `<tr class="${rowClass}">${cells}</tr>`;
  });

  return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
};

marked.setOptions({ renderer, gfm: true, breaks: false });

const contentHtml = marked.parse(markdown);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>TeamFlow — Final Internship Report</title>
<style>
  /* ── Base & Reset ─────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 22mm 18mm 24mm 18mm;
    @bottom-center {
      content: "TeamFlow — End-of-Internship Handover Report  |  Page " counter(page) " of " counter(pages);
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8pt;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 4pt;
    }
  }

  html { font-size: 10.5pt; }

  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1f2937;
    line-height: 1.65;
    background: #fff;
  }

  /* ── Cover Page ────────────────────────────────────────────── */
  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 240mm;
    text-align: center;
    background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%);
    color: #fff;
    border-radius: 4px;
    padding: 40px 50px;
    margin: -22mm -18mm 0 -18mm;
  }
  .cover-logo {
    font-size: 11pt;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #93c5fd;
    margin-bottom: 32px;
    font-weight: 600;
  }
  .cover-rule {
    width: 80px;
    height: 3px;
    background: #3b82f6;
    margin: 0 auto 36px;
    border-radius: 2px;
  }
  .cover h1 {
    font-size: 28pt;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 10px;
    color: #fff;
  }
  .cover-subtitle {
    font-size: 13pt;
    color: #bfdbfe;
    margin-bottom: 60px;
    font-weight: 300;
  }
  .cover-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 40px;
    width: 100%;
    max-width: 420px;
    text-align: left;
    font-size: 9pt;
    margin-bottom: 50px;
  }
  .cover-meta-item label { color: #93c5fd; font-weight: 600; display: block; margin-bottom: 1px; }
  .cover-meta-item span  { color: #e0f2fe; }
  .cover-badge {
    display: inline-block;
    background: #1d4ed8;
    color: #fff;
    font-size: 8pt;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 16px;
    border-radius: 20px;
    font-weight: 600;
  }
  .cover-confidential {
    margin-top: 36px;
    font-size: 7.5pt;
    color: #64748b;
    letter-spacing: 0.5px;
    border-top: 1px solid #334155;
    padding-top: 16px;
    width: 100%;
  }

  /* ── TOC Page ──────────────────────────────────────────────── */
  .toc-page {
    page-break-after: always;
    padding-top: 10px;
  }
  .toc-page h2 {
    font-size: 16pt;
    font-weight: 700;
    color: #1e3a5f;
    margin-bottom: 4px;
    border-bottom: 3px solid #3b82f6;
    padding-bottom: 8px;
  }
  .toc-list { list-style: none; margin-top: 20px; }
  .toc-list li {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 7px 0;
    border-bottom: 1px dotted #d1d5db;
    font-size: 10.5pt;
  }
  .toc-list li .toc-num {
    font-weight: 700;
    color: #2563eb;
    min-width: 28px;
  }
  .toc-list li .toc-title { flex: 1; color: #1f2937; }
  .toc-list li .toc-dots { flex: 1; border-bottom: 1px dotted #9ca3af; margin: 0 8px 3px; }

  /* ── Main Content ──────────────────────────────────────────── */
  .content { padding-top: 10px; }

  /* Headings */
  h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  h2 {
    font-size: 14.5pt;
    font-weight: 700;
    color: #1e3a5f;
    margin-top: 32px;
    margin-bottom: 8px;
    padding-bottom: 7px;
    border-bottom: 2.5px solid #3b82f6;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #1d4ed8;
    margin-top: 20px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #374151;
    margin-top: 14px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }

  /* Section separators — force each major section to start on new page */
  h2 { page-break-before: always; }
  h2:first-of-type { page-break-before: avoid; }

  p { margin-bottom: 10px; orphans: 3; widows: 3; }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
    padding: 10px 16px;
    margin: 14px 0;
    font-size: 9.5pt;
    color: #1e40af;
    border-radius: 0 4px 4px 0;
    page-break-inside: avoid;
  }

  /* Code & Pre */
  code {
    font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #be185d;
    padding: 1px 5px;
    border-radius: 3px;
  }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 14px 16px;
    border-radius: 6px;
    overflow: hidden;
    margin: 14px 0;
    font-size: 7.8pt;
    line-height: 1.55;
    page-break-inside: avoid;
  }
  pre code { background: none; color: #e2e8f0; padding: 0; font-size: inherit; }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1.5px solid #e5e7eb;
    margin: 22px 0;
  }

  /* Lists */
  ul, ol {
    padding-left: 22px;
    margin-bottom: 10px;
  }
  li { margin-bottom: 4px; }
  li > p { margin-bottom: 4px; }

  /* ── Tables ────────────────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    font-size: 9pt;
    page-break-inside: avoid;
  }
  thead tr {
    background: #1e3a5f;
    color: #fff;
  }
  thead th {
    padding: 8px 11px;
    font-weight: 700;
    text-align: left;
    font-size: 8.5pt;
    letter-spacing: 0.3px;
  }
  tbody tr.even  { background: #f8fafc; }
  tbody tr.odd   { background: #ffffff; }
  tbody tr:hover { background: #eff6ff; }
  tbody td {
    padding: 6.5px 11px;
    vertical-align: top;
    border-bottom: 1px solid #e5e7eb;
    line-height: 1.5;
  }
  tbody tr:last-child td { border-bottom: none; }

  /* First-column emphasis in certain tables */
  table td:first-child { font-weight: 500; }

  /* Status badges inside tables */
  td:last-child:has(span) { }

  /* ── Special Callout blocks ────────────────────────────────── */
  .callout-box {
    background: #fefce8;
    border: 1px solid #fbbf24;
    border-left: 4px solid #f59e0b;
    padding: 10px 14px;
    border-radius: 4px;
    font-size: 9.5pt;
    margin: 12px 0;
    page-break-inside: avoid;
  }

  /* ── Section number accent strips ─────────────────────────── */
  h2::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 18px;
    background: #3b82f6;
    border-radius: 2px;
    margin-right: 10px;
    vertical-align: middle;
  }

  /* ── Inline strong/em ──────────────────────────────────────── */
  strong { font-weight: 700; color: #111827; }
  em     { font-style: italic; color: #374151; }

  /* ── Print safety ──────────────────────────────────────────── */
  table { page-break-inside: avoid; }
  pre   { page-break-inside: avoid; }
  blockquote { page-break-inside: avoid; }
  h2, h3, h4 { page-break-after: avoid; }
</style>
</head>
<body>

<!-- ╔═══════════════════════════════════════╗ -->
<!-- ║            COVER PAGE                 ║ -->
<!-- ╚═══════════════════════════════════════╝ -->
<div class="cover">
  <div class="cover-logo">TeamFlow Platform</div>
  <div class="cover-rule"></div>
  <h1>End-of-Internship<br/>Handover Report</h1>
  <div class="cover-subtitle">Final Evaluation &amp; Technical Handover Document</div>

  <div class="cover-meta">
    <div class="cover-meta-item">
      <label>Project</label>
      <span>TeamFlow — Task Management System</span>
    </div>
    <div class="cover-meta-item">
      <label>Document Version</label>
      <span>1.0.0 — Final</span>
    </div>
    <div class="cover-meta-item">
      <label>Phase</label>
      <span>Final Evaluation &amp; Handover</span>
    </div>
    <div class="cover-meta-item">
      <label>Submission Date</label>
      <span>June 29, 2026</span>
    </div>
    <div class="cover-meta-item">
      <label>Prepared By</label>
      <span>Intern Developer</span>
    </div>
    <div class="cover-meta-item">
      <label>Reviewed By</label>
      <span>Senior Technical Lead</span>
    </div>
  </div>

  <div class="cover-badge">Official Corporate Document</div>

  <div class="cover-confidential">
    CONFIDENTIAL — For Internal Evaluation Committee Use Only.<br/>
    Unauthorized distribution is strictly prohibited.
  </div>
</div>

<!-- ╔═══════════════════════════════════════╗ -->
<!-- ║         TABLE OF CONTENTS             ║ -->
<!-- ╚═══════════════════════════════════════╝ -->
<div class="toc-page">
  <h2 style="page-break-before:avoid;">Table of Contents</h2>
  <ul class="toc-list">
    <li><span class="toc-num">1.</span><span class="toc-title">Executive Summary</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">2.</span><span class="toc-title">Scope of Work &amp; Deliverables</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">3.</span><span class="toc-title">Comprehensive Tech Stack</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">4.</span><span class="toc-title">System Architecture &amp; Data Flow</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">5.</span><span class="toc-title">Complete Database Schema</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">6.</span><span class="toc-title">API Endpoints Dictionary</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">7.</span><span class="toc-title">Code Quality &amp; Security Best Practices</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">8.</span><span class="toc-title">Technical Challenges &amp; Resolutions</span><span class="toc-dots"></span></li>
    <li><span class="toc-num">9.</span><span class="toc-title">Final Handover &amp; Future Roadmap</span><span class="toc-dots"></span></li>
  </ul>
</div>

<!-- ╔═══════════════════════════════════════╗ -->
<!-- ║           MAIN CONTENT                ║ -->
<!-- ╚═══════════════════════════════════════╝ -->
<div class="content">
${contentHtml}
</div>

</body>
</html>`;

(async () => {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Rendering HTML...');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  console.log('Generating PDF...');
  await page.pdf({
    path: OUT_PATH,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="
        width: 100%;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8px;
        color: #6b7280;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 18mm;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
        margin-top: 10px;
      ">
        <span style="color:#1e3a5f;font-weight:600;">TeamFlow</span>
        <span>End-of-Internship Handover Report &nbsp;|&nbsp; CONFIDENTIAL</span>
      </div>`,
    footerTemplate: `
      <div style="
        width: 100%;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 8px;
        color: #6b7280;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 18mm;
        border-top: 1px solid #e5e7eb;
        padding-top: 4px;
        margin-bottom: 10px;
      ">
        <span>June 29, 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' },
  });

  await browser.close();

  const stats = fs.statSync(OUT_PATH);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ PDF generated successfully!`);
  console.log(`   File : ${OUT_PATH}`);
  console.log(`   Size : ${sizeMB} MB`);
})();
