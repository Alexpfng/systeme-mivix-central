import { useState } from 'react';
import App from '../app/App';
import { useAuth } from './AuthProvider';

export default function LoginPage() {
  const { loading, session, authError, signIn, resetPassword, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p>Chargement…</p>;
  if (session) {
    return (
      <>
        <App />
        <button type="button" onClick={signOut}>
          Se déconnecter
        </button>
      </>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) setError(signInError.message);
    } catch (signInException) {
      setError(signInException.message || 'La connexion a échoué.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError('');
    setMessage('');
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Un email de réinitialisation a été envoyé.');
      }
    } catch (resetException) {
      setError(resetException.message || 'La réinitialisation a échoué.');
    }
  }

  return (
    <main>
      <h1>Connexion à MIVIX Central</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <button type="button" onClick={handlePasswordReset}>
        Réinitialiser le mot de passe
      </button>
      {authError && <p role="alert">{authError.message || 'Impossible de charger la session.'}</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </main>
  );
}
