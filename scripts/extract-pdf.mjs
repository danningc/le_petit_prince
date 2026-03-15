/**
 * Extracts and cleans text from the Le Petit Prince PDF.
 * Run once: npm run extract
 * Output: public/le-petit-prince.txt
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dir = dirname(fileURLToPath(import.meta.url));
const PDF_PATH = join(__dir, '../public/st_exupery_le_petit_prince.pdf');
const OUT_PATH = join(__dir, '../public/le-petit-prince.txt');

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

    // Skip table-of-contents lines: "CHAPITRE IV ......... 17"
    if (/chapitre\b.*\.{3,}/i.test(line)) continue;
    if (/premier chapitre.*\.{3,}/i.test(line)) continue;

    // Skip page-number markers: "– 56 –" or bare digits
    if (/^[–—-]\s*\d+\s*[–—-]$/.test(line)) continue;
    if (/^\d+$/.test(line)) continue;

    // Fix hyphenated line-break: "His-" + next line "toires Vécues"
    // (only merge when the hyphen is part of a word, not a dialogue dash)
    if (line.endsWith('-') && i + 1 < lines.length) {
      const next = lines[i + 1].replace(/  +/g, ' ').trim();
      if (next && /^[a-z\u00C0-\u017E]/.test(next)) {
        // Inject the merged token back so the loop picks it up
        lines[i + 1] = line.slice(0, -1) + next;
        continue;
      }
    }

    out.push(line);
  }

  return (
    out
      .join('\n')
      // Collapse 3+ blank lines → exactly one blank line
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}
