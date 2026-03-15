// Vocabulary store backed by localStorage, scoped per book

function storageKey(bookId) {
  return `lpp_vocab_${bookId}`;
}

export function loadVocab(bookId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(bookId))) || [];
  } catch {
    return [];
  }
}

export function saveVocab(bookId, vocab) {
  localStorage.setItem(storageKey(bookId), JSON.stringify(vocab));
}

export function addWord(vocab, { word, chapterIndex, paragraphIndex, sentenceContext }) {
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
