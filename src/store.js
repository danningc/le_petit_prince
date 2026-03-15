// Vocabulary store backed by localStorage

const STORAGE_KEY = 'lpp_vocab';

export function loadVocab() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveVocab(vocab) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vocab));
}

export function addWord(vocab, { word, chapterIndex, paragraphIndex, sentenceContext }) {
  // Avoid exact duplicates (same word + same location)
  const exists = vocab.some(
    (v) => v.word === word && v.chapterIndex === chapterIndex && v.paragraphIndex === paragraphIndex
  );
  if (exists) return vocab;
  return [
    ...vocab,
    {
      id: Date.now(),
      word,
      chapterIndex,
      paragraphIndex,
      sentenceContext,
      savedAt: new Date().toISOString(),
    },
  ];
}

export function removeWord(vocab, id) {
  return vocab.filter((v) => v.id !== id);
}
