import { useState, useMemo, useEffect } from 'react';
import { lookupWord } from '../translator';

export default function Flashcard({ savedWords, chapters, onJumpTo, onRemove }) {
  // One card per unique word — use first occurrence
  const cards = useMemo(() => {
    const seen = new Set();
    return savedWords.filter((e) => {
      if (seen.has(e.word)) return false;
      seen.add(e.word);
      return true;
    });
  }, [savedWords]);

  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [lookup, setLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // safePos must be computed before useEffect (hook order must be stable)
  const safePos = cards.length > 0 ? ((pos % cards.length) + cards.length) % cards.length : 0;

  // Fetch translation/definition when card flips to back
  useEffect(() => {
    if (!flipped || cards.length === 0) return;
    const word = cards[safePos].word;
    setLookup(null);
    setLookupLoading(true);
    lookupWord(word)
      .then(setLookup)
      .catch(() => setLookup({}))
      .finally(() => setLookupLoading(false));
  }, [flipped, safePos, cards.length]);

  // Early return after all hooks
  if (cards.length === 0) {
    return (
      <div className="fc-empty">
        <p>Aucun mot sauvegardé pour l'instant.</p>
        <p className="hint">En lisant, cliquez sur un mot pour le sauvegarder.</p>
      </div>
    );
  }

  const card = cards[safePos];
  const chapterTitle = chapters[card?.chapterIndex]?.title ?? '';

  function goTo(newPos) {
    setPos(((newPos % cards.length) + cards.length) % cards.length);
    setFlipped(false);
    setLookup(null);
  }

  function markKnown() {
    setKnown((k) => new Set([...k, card.id]));
    goTo(safePos + 1);
  }

  function handleRemove() {
    onRemove(card.id);
    setFlipped(false);
    setLookup(null);
  }

  return (
    <div className="fc-view">
      <div className="fc-progress-bar">
        <div className="fc-progress-fill" style={{ width: `${(known.size / cards.length) * 100}%` }} />
      </div>

      <div className="fc-meta">
        <span className="fc-counter">{safePos + 1} / {cards.length}</span>
        {known.size > 0 && (
          <>
            <span className="fc-known-badge">{known.size} sus ✓</span>
            <button
              className="fc-reset"
              onClick={() => { setKnown(new Set()); setPos(0); setFlipped(false); setLookup(null); }}
            >
              Réinitialiser
            </button>
          </>
        )}
      </div>

      <div
        className={`fc-card ${known.has(card.id) ? 'fc-is-known' : ''}`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`fc-card-inner ${flipped ? 'fc-flipped' : ''}`}>
          <div className="fc-face fc-front">
            <div className="fc-word">{card.word}</div>
            {known.has(card.id) && <div className="fc-known-stamp">✓ Sus</div>}
            <div className="fc-tap-hint">Cliquez pour voir le contexte</div>
          </div>
          <div className="fc-face fc-back">
            <p className="fc-context">"{card.sentenceContext}"</p>
            <div className="fc-chapter-label">{chapterTitle}</div>
            <div className="fc-lookup">
              {lookupLoading && <div className="spinner-sm" />}
              {!lookupLoading && lookup?.translation && (
                <div className="fc-translation">
                  <span className="fc-lookup-tag">EN</span> {lookup.translation}
                </div>
              )}
              {!lookupLoading && lookup?.definition?.map((entry, i) => (
                <div key={i} className="fc-def-entry">
                  <span className="fc-lookup-tag fc-pos">{entry.pos}</span>
                  <span>{entry.defs[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fc-controls">
        <button className="fc-nav" onClick={() => goTo(safePos - 1)} title="Précédent">←</button>

        <div className="fc-action-group">
          <button className="fc-btn fc-btn-jump" onClick={() => onJumpTo(card)} title="Voir dans le texte">
            ↗ Contexte
          </button>
          {!known.has(card.id) && (
            <button className="fc-btn fc-btn-know" onClick={markKnown}>
              Je sais ✓
            </button>
          )}
          <button className="fc-btn fc-btn-del" onClick={handleRemove} title="Supprimer ce mot">
            Supprimer
          </button>
        </div>

        <button className="fc-nav" onClick={() => goTo(safePos + 1)} title="Suivant">→</button>
      </div>
    </div>
  );
}
