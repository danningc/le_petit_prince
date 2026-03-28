import { useEffect, useRef, useState } from 'react';
import Paragraph from './Paragraph';
import WordPanel from './WordPanel';

export default function Reader({ chapters, currentChapter, setCurrentChapter, savedWords, onSave, onUnsave, jumpTarget, onJumpDone, lang }) {
  const containerRef = useRef(null);
  const [activeWord, setActiveWord] = useState(null); // { word, chapterIndex, paragraphIndex, sentenceContext, isSaved }

  // Scroll to jump target when requested
  useEffect(() => {
    if (!jumpTarget) return;
    const el = containerRef.current?.querySelector(
      `[data-para="${jumpTarget.chapterIndex}-${jumpTarget.paragraphIndex}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onJumpDone();
  }, [jumpTarget]);

  const chapter = chapters[currentChapter];
  if (!chapter) return null;

  function handleWordSelect(wordData) {
    setActiveWord(wordData);
  }

  function handleSave() {
    if (!activeWord) return;
    onSave({
      word: activeWord.word,
      chapterIndex: activeWord.chapterIndex,
      paragraphIndex: activeWord.paragraphIndex,
      sentenceContext: activeWord.sentenceContext,
    });
  }

  function handleUnsave() {
    if (!activeWord) return;
    onUnsave(activeWord.word, activeWord.chapterIndex, activeWord.paragraphIndex);
  }

  // Recompute isSaved dynamically (may have changed since panel opened)
  const panelIsSaved = activeWord
    ? savedWords.some(
        (v) =>
          v.word === activeWord.word &&
          v.chapterIndex === activeWord.chapterIndex &&
          v.paragraphIndex === activeWord.paragraphIndex
      )
    : false;

  return (
    <>
      <div className="reader" ref={containerRef}>
        <div className="chapter-nav">
          <button disabled={currentChapter === 0} onClick={() => setCurrentChapter((c) => c - 1)}>
            ← Précédent
          </button>
          <span className="chapter-title">{chapter.title}</span>
          <button disabled={currentChapter === chapters.length - 1} onClick={() => setCurrentChapter((c) => c + 1)}>
            Suivant →
          </button>
        </div>

        <div className="chapter-select-bar">
          <select value={currentChapter} onChange={(e) => setCurrentChapter(Number(e.target.value))}>
            {chapters.map((ch, i) => (
              <option key={i} value={i}>
                {i + 1}. {ch.title}
              </option>
            ))}
          </select>
        </div>

        <div className="chapter-body">
          {chapter.paragraphs.map((text, pi) => (
            <Paragraph
              key={pi}
              text={text}
              chapterIndex={currentChapter}
              paragraphIndex={pi}
              savedWords={savedWords}
              onWordSelect={handleWordSelect}
              highlightWord={
                jumpTarget &&
                jumpTarget.chapterIndex === currentChapter &&
                jumpTarget.paragraphIndex === pi
              }
            />
          ))}
        </div>
      </div>

      {activeWord && (
        <WordPanel
          wordData={activeWord}
          lang={lang}
          isSaved={panelIsSaved}
          onSave={handleSave}
          onUnsave={handleUnsave}
          onClose={() => setActiveWord(null)}
        />
      )}
    </>
  );
}
