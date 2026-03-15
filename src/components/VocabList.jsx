export default function VocabList({ savedWords, chapters, onRemove, onJumpTo }) {
  if (savedWords.length === 0) {
    return (
      <div className="vocab-list empty">
        <p>Aucun mot sauvegardé pour l'instant.</p>
        <p className="hint">En lisant, cliquez sur un mot pour le sauvegarder.</p>
      </div>
    );
  }

  // Group by word (show each unique word once, list all occurrences)
  const grouped = {};
  for (const entry of savedWords) {
    if (!grouped[entry.word]) grouped[entry.word] = [];
    grouped[entry.word].push(entry);
  }

  return (
    <div className="vocab-list">
      <div className="vocab-count">{Object.keys(grouped).length} mots sauvegardés</div>
      <div className="vocab-entries">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([word, entries]) => (
          <div key={word} className="vocab-card">
            <div className="vocab-word">{word}</div>
            {entries.map((entry) => {
              const chapterTitle = chapters[entry.chapterIndex]?.title ?? '?';
              return (
                <div key={entry.id} className="vocab-occurrence">
                  <span className="vocab-context">"{entry.sentenceContext}"</span>
                  <div className="vocab-actions">
                    <button
                      className="btn-jump"
                      onClick={() => onJumpTo(entry)}
                      title="Go to passage"
                    >
                      ↗ {chapterTitle}
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => onRemove(entry.id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
