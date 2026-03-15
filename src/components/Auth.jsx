import { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="auth-screen">
        <div className="auth-box">
          <div className="auth-icon">✉️</div>
          <h2>Vérifiez votre email</h2>
          <p>Un lien de connexion a été envoyé à <strong>{email}</strong></p>
          <p className="auth-hint">Cliquez sur le lien pour vous connecter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <h1 className="auth-title">Mes Flashcards</h1>
        <p className="auth-subtitle">Entrez votre email pour vous connecter</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Envoi…' : 'Continuer →'}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
}
