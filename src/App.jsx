import { useState, useEffect } from 'react';
import Reader from './components/Reader';
import VocabList from './components/VocabList';
import Flashcard from './components/Flashcard';
import { loadVocab, saveVocab, addWord, removeWord } from './store';
import { loadBook } from './textLoader';
import { BOOKS } from './books';
import './App.css';

export default function App() {
  const [bookId, setBookId] = useState(BOOKS[0].id);
  const [view, setView] = useState('reader');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [savedWords, setSavedWords] = useState(() => loadVocab(BOOKS[0].id));
  const [jumpTarget, setJumpTarget] = useState(null);

  const currentBook = BOOKS.find((b) => b.id === bookId);

  // Reload book text and vocab when the selected book changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setChapters([]);
    setCurrentChapter(0);
    setJumpTarget(null);
    setSavedWords(loadVocab(bookId));
    loadBook(currentBook.textFile)
      .then(setChapters)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    saveVocab(bookId, savedWords);
  }, [savedWords, bookId]);

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

  function handleBookChange(newBookId) {
    setBookId(newBookId);
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
        <p className="error-detail">{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="book-switcher">
          {BOOKS.map((book) => (
            <button
              key={book.id}
              className={`book-tab ${bookId === book.id ? 'active' : ''}`}
              onClick={() => handleBookChange(book.id)}
            >
              <span className="book-tab-title">{book.title}</span>
              <span className="book-tab-author">{book.author}</span>
            </button>
          ))}
        </div>

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
