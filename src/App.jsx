import { useState, useEffect } from 'react';
import Reader from './components/Reader';
import VocabList from './components/VocabList';
import Flashcard from './components/Flashcard';
import Auth from './components/Auth';
import { loadVocab, addWord, removeWord } from './store';
import { supabase } from './supabase';
import { loadBook } from './textLoader';
import { BOOKS } from './books';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookId, setBookId] = useState(BOOKS[0].id);
  const [view, setView] = useState('reader');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [savedWords, setSavedWords] = useState([]);
  const [jumpTarget, setJumpTarget] = useState(null);

  const currentBook = BOOKS.find((b) => b.id === bookId);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reload book text and vocab when the selected book or user changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setChapters([]);
    setCurrentChapter(0);
    setJumpTarget(null);
    setSavedWords([]);

    Promise.all([
      loadBook(currentBook.textFile),
      loadVocab(user.id, bookId),
    ])
      .then(([chaps, vocab]) => {
        setChapters(chaps);
        setSavedWords(vocab);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookId, user]);

  async function handleSave(wordData) {
    const entry = await addWord(user.id, bookId, wordData);
    if (entry) setSavedWords((prev) => [...prev, entry]);
  }

  async function handleUnsave(word, chapterIndex, paragraphIndex) {
    const entry = savedWords.find(
      (v) => v.word === word && v.chapterIndex === chapterIndex && v.paragraphIndex === paragraphIndex
    );
    if (!entry) return;
    await removeWord(entry.id);
    setSavedWords((prev) => prev.filter((v) => v.id !== entry.id));
  }

  async function handleRemove(id) {
    await removeWord(id);
    setSavedWords((prev) => prev.filter((v) => v.id !== id));
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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
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

        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button className="btn-signout" onClick={handleSignOut}>
            Déconnexion
          </button>
        </div>
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
