/**
 * Extracts and cleans text from a PDF into a plain text file.
 *
 * Usage:
 *   npm run extract                              # Le Petit Prince (default)
 *   node scripts/extract-pdf.mjs <input> <output>
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const PART_RE  = /^(Première|Deuxième|Troisième) partie$/i;
const ROMAN_RE = /^[IVXLCDM]{1,6}$/;

// ─── Main ─────────────────────────────────────────────────────────────────────

const __dir = dirname(fileURLToPath(import.meta.url));
const [,, inputArg, outputArg] = process.argv;
const PDF_PATH = inputArg ? resolve(inputArg) : join(__dir, '../public/st_exupery_le_petit_prince.pdf');
const OUT_PATH = outputArg ? resolve(outputArg) : join(__dir, '../public/le-petit-prince.txt');

console.log('Reading PDF…');
const data = readFileSync(PDF_PATH);
const result = await pdfParse(data);
console.log(`Extracted ${result.numpages} pages.`);

const cleaned = clean(result.text);
writeFileSync(OUT_PATH, cleaned, 'utf-8');
console.log(`Written ${cleaned.length} chars → ${OUT_PATH}`);

// ─── Cleaning pipeline ────────────────────────────────────────────────────────

function clean(raw) {
  const lines = raw.split('\n');
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    // Collapse multiple spaces (PDF justification artefact) and trim
    let line = lines[i].replace(/  +/g, ' ').trim();

    // ── Generic noise ──────────────────────────────────────────────────────────

    // Table-of-contents dot-leader lines: "CHAPITRE IV ......... 17"
    if (/chapitre\b.*\.{3,}/i.test(line)) continue;
    if (/premier chapitre.*\.{3,}/i.test(line)) continue;

    // Page-number markers: "– 56 –" or bare digit-only lines
    if (/^[–—-]\s*\d+\s*[–—-]$/.test(line)) continue;
    if (/^\d+$/.test(line)) continue;

    // ── L'Étranger (Camus) specific ───────────────────────────────────────────

    // Running page headers: "Albert Camus, L'étranger. Roman (1942) 10"
    if (/^Albert Camus,?\s+L.étranger/i.test(line)) continue;

    // Repeated book title headers: "L'étranger. Roman (1942)"
    if (/^L.étranger\.\s+Roman/i.test(line)) continue;

    // Navigation links from the digital edition
    if (/^Retour à la table des matières/i.test(line)) continue;

    // Standalone bracket page-refs on their own line: "[7]"
    if (/^\[\d+\]$/.test(line)) continue;

    // Strip inline bracket page-refs embedded in text: "une excuse [10] pareille"
    line = line.replace(/\s*\[\d+\]\s*/g, ' ').trim();

    // ── Hyphenated line-break ─────────────────────────────────────────────────

    // "His-" + next line "toires Vécues" → "Histoires Vécues"
    if (line.endsWith('-') && i + 1 < lines.length) {
      const next = lines[i + 1].replace(/  +/g, ' ').trim();
      if (next && /^[a-z\u00C0-\u017E]/.test(next)) {
        lines[i + 1] = line.slice(0, -1) + next;
        continue;
      }
    }

    out.push(line);
  }

  const joined = out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return postProcess(joined);
}

// ─── Post-processing ──────────────────────────────────────────────────────────

function postProcess(text) {
  const lines = text.split('\n');

  // ── Step 1: find where the actual body starts ─────────────────────────────
  // The real body is the first "Première partie" that is followed (within
  // the next 8 non-empty lines) by both a Roman numeral AND a substantive
  // paragraph (>30 chars). Everything before that is preamble / TOC.
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (PART_RE.test(lines[i])) {
      const nearby = lines.slice(i + 1, i + 9).filter(l => l.trim());
      const hasRoman     = nearby.some(l => ROMAN_RE.test(l.trim()));
      const hasParagraph = nearby.some(l => l.trim().length > 30);
      if (hasRoman && hasParagraph) { bodyStart = i; break; }
    }
  }

  // ── Step 2: combine "Première partie" + "I/II/..." → "Première partie — I" ─
  // currentPart persists for all chapters within the same part.
  const body = lines.slice(bodyStart);
  const result = [];
  let currentPart = '';

  for (const line of body) {
    if (PART_RE.test(line)) {
      currentPart = line; // update part, don't emit — it'll prefix the next numeral
      continue;
    }
    if (currentPart && ROMAN_RE.test(line.trim()) && line.trim()) {
      result.push(`${currentPart} — ${line.trim()}`);
      continue;
    }
    result.push(line);
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
