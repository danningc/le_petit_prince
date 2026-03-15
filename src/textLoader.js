/**
 * Loads the pre-extracted plain-text book and parses it into chapters.
 * Generate the text file once with: npm run extract
 */
export async function loadBook() {
  const res = await fetch('/le-petit-prince.txt');
  if (!res.ok) throw new Error('Text file not found — run: npm run extract');
  const raw = await res.text();
  return parseBook(raw);
}

function parseBook(raw) {
  const lines = raw.split('\n');
  const chapters = [];
  let currentChapter = null;
  let currentParagraphLines = [];

  // Matches: "PREMIER CHAPITRE", "CHAPITRE II", "CHAPITRE 3"
  const chapterPattern = /^(premier\s+chapitre|chapitre\s+[IVXLCDM\d]+)/i;

  function flushParagraph() {
    const text = currentParagraphLines.join(' ').trim();
    if (text && currentChapter) currentChapter.paragraphs.push(text);
    currentParagraphLines = [];
  }

  function flushChapter() {
    flushParagraph();
    if (currentChapter && currentChapter.paragraphs.length > 0) {
      chapters.push(currentChapter);
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (chapterPattern.test(trimmed)) {
      flushChapter();
      currentChapter = { title: trimmed, paragraphs: [] };
    } else if (trimmed === '') {
      flushParagraph();
    } else {
      if (!currentChapter) {
        currentChapter = { title: 'Avant-propos', paragraphs: [] };
      }
      currentParagraphLines.push(trimmed);
    }
  }

  flushChapter();

  if (chapters.length === 0) {
    const all = raw.split(/\n\n+/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
    return [{ title: 'Le Petit Prince', paragraphs: all }];
  }

  return chapters;
}
