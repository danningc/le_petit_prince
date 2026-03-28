import { useEffect, useState } from 'react';
import { lookupWord } from '../translator';

export default function WordPanel({ wordData, lang = 'FR', isSaved, onSave, onUnsave, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResult(null);
    setLoading(true);
    lookupWord(wordData.word, lang)
      .then(setResult)
      .catch(() => setResult({}))
      .finally(() => setLoading(false));
  }, [wordData.word, lang]);

  return (
    <div className="wp-overlay" onClick={onClose}>
      <div className="wp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="wp-header">
          <span className="wp-word">{wordData.word}</span>
          <button className="wp-close" onClick={onClose}>×</button>
        </div>

        <div className="wp-body">
          {loading ? (
            <div className="wp-loading"><div className="spinner-sm" /></div>
          ) : (
            <>
              {result?.translation && (
                <div className="wp-row">
                  <span className="wp-tag">EN</span>
                  <span className="wp-translation">{result.translation}</span>
                </div>
              )}

              {result?.definition?.map((entry, i) => (
                <div key={i} className="wp-row wp-def-block">
                  <span className="wp-tag wp-pos">{entry.pos}</span>
                  <ol className="wp-defs">
                    {entry.defs.map((d, j) => <li key={j}>{d}</li>)}
                  </ol>
                </div>
              ))}

              {!result?.translation && !result?.definition && (
                <p className="wp-empty">Définition non trouvée.</p>
              )}
            </>
          )}
        </div>

        <div className="wp-footer">
          {isSaved ? (
            <button className="wp-btn wp-btn-unsave" onClick={() => { onUnsave(); onClose(); }}>
              Retirer du vocabulaire
            </button>
          ) : (
            <button className="wp-btn wp-btn-save" onClick={() => { onSave(); onClose(); }}>
              + Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
