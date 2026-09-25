import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAIN_DIR = path.resolve('C:\\Users\\USER11\\.gemini\\antigravity\\brain\\efcc5c73-03b9-44a1-af69-c7012c2f4c84');
const OUTPUT_DIR = path.resolve(__dirname, '../academic_docs');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Markdown-to-HTML parser (clean, self-contained)
function markdownToHtml(md) {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold / Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Alerts
    .replace(/> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n> (.*)/gim, '<div class="alert alert-$1"><strong>$1:</strong> $2</div>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Tables
    .replace(/\|(.+)\|/gim, (match) => {
      const cells = match.split('|').filter(c => c.trim().length > 0);
      if (cells.some(c => c.includes('---'))) return '';
      const td = cells.map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${td}</tr>`;
    })
    // Bullet lists
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Paragraphs
    .replace(/\n\n/gim, '</p><p>');

  // Wrap table rows
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/gim, '<table class="academic-table">$1</table>');
  return `<p>${html}</p>`;
}

function generateDocumentHtml(title, subtitle, contentMarkdown) {
  const contentHtml = markdownToHtml(contentMarkdown);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — AgriLink BBIT Capstone Project</title>
  <style>
    @page {
      size: A4;
      margin: 25mm 20mm 25mm 25mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111827;
      margin: 0;
      padding: 40px;
      background: #f8fafc;
    }
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      margin: -40px -40px 30px -40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 4px 4px 0 0;
      font-family: system-ui, sans-serif;
      font-size: 13px;
    }
    .print-btn {
      background: #16a34a;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    .coversheet {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    .coversheet h1 {
      font-size: 22pt;
      margin: 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
    }
    .coversheet h2 {
      font-size: 14pt;
      font-weight: normal;
      color: #475569;
      margin: 5px 0 20px 0;
    }
    .meta-box {
      margin-top: 25px;
      font-size: 11pt;
      line-height: 1.8;
      border: 1px solid #cbd5e1;
      padding: 15px;
      border-radius: 6px;
      background: #f8fafc;
      display: inline-block;
      text-align: left;
    }
    h1, h2, h3, h4 {
      font-family: 'Times New Roman', Times, serif;
      color: #0f172a;
      page-break-after: avoid;
    }
    h1 { font-size: 16pt; margin-top: 28px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
    h2 { font-size: 14pt; margin-top: 22px; }
    h3 { font-size: 12pt; margin-top: 16px; }
    p { margin: 10px 0; text-align: justify; text-justify: inter-word; }
    .academic-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10.5pt;
    }
    .academic-table td, .academic-table th {
      border: 1px solid #94a3b8;
      padding: 8px 12px;
      text-align: left;
    }
    .academic-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 10pt;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    pre code { background: none; color: inherit; padding: 0; }
    .alert {
      padding: 12px 16px;
      margin: 15px 0;
      border-left: 4px solid #16a34a;
      background: #f0fdf4;
      font-size: 11pt;
    }
    @media print {
      body { background: white; padding: 0; }
      .page-container { box-shadow: none; padding: 0; max-width: 100%; }
      .no-print-bar { display: none !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="no-print-bar">
      <span>📄 <strong>AgriLink Academic Document</strong> — Formatted for BBIT Supervisor Review</span>
      <button class="print-btn" onclick="window.print()">🖨️ Print to PDF / Save as PDF</button>
    </div>

    <div class="coversheet">
      <p style="font-size: 13pt; font-weight: bold; letter-spacing: 1px; color: #15803d; margin: 0;">
        BACHELOR OF BUSINESS INFORMATION TECHNOLOGY (BBIT)
      </p>
      <p style="font-size: 11pt; color: #64748b; margin: 5px 0 15px 0;">FINAL YEAR CAPSTONE PROJECT DOCUMENTATION</p>
      <h1>${title}</h1>
      <h2>${subtitle}</h2>

      <div class="meta-box">
        <strong>Project Name:</strong> AgriLink Agribusiness B2B SCM Platform<br>
        <strong>Lead Developer / Admin:</strong> Kelvin Kiriinya<br>
        <strong>Target Sector:</strong> Agricultural Value Chain & Digital Escrow Procurement<br>
        <strong>Academic Year:</strong> 2025 / 2026<br>
        <strong>System Status:</strong> Fully Operational (Live Authentication & Daraja Escrow Rails)
      </div>
    </div>

    <div class="content-body">
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;
}

// Read and build documents
const files = [
  {
    src: path.join(BRAIN_DIR, 'project_proposal_chapter_1.md'),
    out: '01_AgriLink_Project_Proposal_Chapter_1.html',
    title: 'Chapter 1: Project Proposal',
    sub: 'Introduction, Problem Statement, Objectives, and Scope'
  },
  {
    src: path.join(BRAIN_DIR, 'system_modeling_and_design.md'),
    out: '02_AgriLink_System_Modeling_and_Design_Chapter_3.html',
    title: 'Chapter 3: System Modeling & Architecture Design',
    sub: '3-Tier SCM Architecture, 3NF Relational ERD, DFDs, and Escrow Sequence Models'
  },
  {
    src: path.join(BRAIN_DIR, 'implementation_plan.md'),
    out: '03_AgriLink_Implementation_Plan.html',
    title: 'System Implementation & Technical Specifications',
    sub: 'Full-Stack Enterprise Architecture, M-Pesa Integration, and Multi-Channel Verification'
  }
];

console.log('Generating academic printable HTML/PDF documents...');

let combinedContent = '';

files.forEach((f) => {
  if (fs.existsSync(f.src)) {
    const rawMarkdown = fs.readFileSync(f.src, 'utf-8');
    const docHtml = generateDocumentHtml(f.title, f.sub, rawMarkdown);
    const destPath = path.join(OUTPUT_DIR, f.out);
    fs.writeFileSync(destPath, docHtml, 'utf-8');
    console.log(`✓ Created printable document: ${f.out}`);

    combinedContent += `<div class="page-break"></div><h1>${f.title}</h1><h2>${f.sub}</h2>\n\n` + rawMarkdown + '\n\n';
  } else {
    console.warn(`File not found: ${f.src}`);
  }
});

// Generate combined complete compendium
if (combinedContent) {
  const combinedHtml = generateDocumentHtml(
    'AgriLink: Complete BBIT Capstone Project Compendium',
    'Comprehensive Academic Report (Proposal, Design & Implementation)',
    combinedContent
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, 'AgriLink_Complete_BBIT_Documentation.html'), combinedHtml, 'utf-8');
  console.log('✓ Created combined compendium: AgriLink_Complete_BBIT_Documentation.html');
}

console.log(`\nAll documents successfully generated in:\n${OUTPUT_DIR}\n`);
