import { useState, useEffect } from 'react';
import Reader from './components/Reader';
import VocabList from './components/VocabList';
import Flashcard from './components/Flashcard';
import { loadVocab, saveVocab, addWord, removeWord } from './store';
import { loadBook } from './textLoader';
import './App.css';

export default function App() {
  const [view, setView] = useState('reader'); // 'reader' | 'vocab'
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [savedWords, setSavedWords] = useState(loadVocab);
  const [jumpTarget, setJumpTarget] = useState(null);

  useEffect(() => {
    loadBook()
      .then(setChapters)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    saveVocab(savedWords);
  }, [savedWords]);

  function handleSave(wordData) {
    setSavedWords((prev) => addWord(prev, wordData));
  }

  function handleUnsave(word, chapterIndex, paragraphIndex) {
    setSavedWords((prev) =>
      prev.filter(
        (v) => !(v.word === word && v.chapterIndex === chapterIndex && v.paragraphIndex === paragraphIndex)
      )
    );
  }

  function handleRemove(id) {
    setSavedWords((prev) => removeWord(prev, id));
  }

  function handleJumpTo(entry) {
    setCurrentChapter(entry.chapterIndex);
    setJumpTarget(entry);
    setView('reader');
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Chargement du texte…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Texte introuvable</h2>
        <p>
          Veuillez placer le fichier <code>le-petit-prince.txt</code> dans le dossier{' '}
          <code>public/</code> et relancer le serveur.
        </p>
        <p className="hint">
          Le texte original en français est disponible sur des sites de domaine public (ex. Wikisource)
          dans les pays où l'œuvre est libre de droits.
        </p>
        <p className="error-detail">{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="book-title">Le Petit Prince</div>
        <nav className="app-nav">
          <button
            className={view === 'reader' ? 'active' : ''}
            onClick={() => setView('reader')}
          >
            Lire
          </button>
          <button
            className={view === 'vocab' ? 'active' : ''}
            onClick={() => setView('vocab')}
          >
            Vocabulaire
            {savedWords.length > 0 && (
              <span className="badge">{savedWords.length}</span>
            )}
          </button>
          <button
            className={view === 'flashcard' ? 'active' : ''}
            onClick={() => setView('flashcard')}
          >
            Réviser
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'reader' ? (
          <Reader
            chapters={chapters}
            currentChapter={currentChapter}
            setCurrentChapter={setCurrentChapter}
            savedWords={savedWords}
            onSave={handleSave}
            onUnsave={handleUnsave}
            jumpTarget={jumpTarget}
            onJumpDone={() => setJumpTarget(null)}
          />
        ) : view === 'vocab' ? (
          <VocabList
            savedWords={savedWords}
            chapters={chapters}
            onRemove={handleRemove}
            onJumpTo={handleJumpTo}
          />
        ) : (
          <Flashcard
            savedWords={savedWords}
            chapters={chapters}
            onRemove={handleRemove}
            onJumpTo={handleJumpTo}
          />
        )}
      </main>
    </div>
  );
}
