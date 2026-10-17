import { useState } from 'react';
import App from '../app/App';
import { MivixRobot } from '../app/GeometricArt';
import '../styles/tokens.css';
import { useAuth } from './AuthProvider';

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && typeof error.message === 'string' && error.message) {
    return error.message;
  }
  return fallback;
}

export default function LoginPage() {
  const {
    loading,
    session,
    isPasswordRecovery,
    authError,
    signIn,
    resetPassword,
    updatePassword,
    signOut,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  async function handleSignOut() {
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { error: signOutError } = await signOut();
      if (signOutError) {
        setError(getErrorMessage(signOutError, 'La déconnexion a échoué.'));
      }
    } catch (signOutException) {
      setError(getErrorMessage(signOutException, 'La déconnexion a échoué.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mivix-login-page mivix-login-loading" aria-busy="true">
        <div className="mivix-login-card"><span className="mivix-login-pulse" />Chargement de votre espace…</div>
      </main>
    );
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setPasswordSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        setError(getErrorMessage(updateError, 'La mise à jour du mot de passe a échoué.'));
      } else {
        setMessage('Votre nouveau mot de passe a été enregistré.');
      }
    } catch (updateException) {
      setError(getErrorMessage(updateException, 'La mise à jour du mot de passe a échoué.'));
    } finally {
      setPasswordSubmitting(false);
    }
  }

  if (session && isPasswordRecovery) {
    return (
      <main className="mivix-login-page">
        <section className="mivix-login-card mivix-login-card--compact">
          <p className="mivix-login-eyebrow">SÉCURITÉ MIVIX</p>
          <h1>Choisir un nouveau mot de passe</h1>
          <p className="mivix-login-lead">Un nouveau départ pour garder votre espace personnel bien à vous.</p>
          <form className="mivix-login-form" onSubmit={handlePasswordUpdate}>
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <button className="mivix-login-submit" type="submit" disabled={passwordSubmitting}>
              {passwordSubmitting ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
          {error && <p className="mivix-login-feedback mivix-login-feedback--error" role="alert">{error}</p>}
          {message && <p className="mivix-login-feedback" role="status">{message}</p>}
        </section>
      </main>
    );
  }

  if (session) {
    return (
      <div className="mivix-authenticated-view">
        <App />
        <button className="mivix-signout" type="button" onClick={handleSignOut} disabled={submitting}>
          {submitting ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) setError(getErrorMessage(signInError, 'La connexion a échoué.'));
    } catch (signInException) {
      setError(getErrorMessage(signInException, 'La connexion a échoué.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError('');
    setMessage('');

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Saisissez une adresse email valide.');
      return;
    }

    setResetSubmitting(true);
    try {
      const { error: resetError } = await resetPassword(normalizedEmail);
      if (resetError) {
        setError(getErrorMessage(resetError, 'La réinitialisation a échoué.'));
      } else {
        setMessage('Un email de réinitialisation a été envoyé.');
      }
    } catch (resetException) {
      setError(getErrorMessage(resetException, 'La réinitialisation a échoué.'));
    } finally {
      setResetSubmitting(false);
    }
  }

  return (
    <main className="mivix-login-page" data-testid="mivix-login-page">
      <div className="mivix-login-orbit mivix-login-orbit--one" aria-hidden="true" />
      <div className="mivix-login-orbit mivix-login-orbit--two" aria-hidden="true" />
      <section className="mivix-login-card">
        <header className="mivix-login-header">
          <div className="mivix-login-brand" aria-label="MIVIX Central">
            <span className="mivix-login-mark" aria-hidden="true"><span /></span>
            <span>MIVIX <small>Central</small></span>
          </div>
          <p className="mivix-login-eyebrow">ESPACE PRIVÉ</p>
          <h1>Votre espace personnel</h1>
          <p className="mivix-login-lead">Retrouvez vos projets, vos idées et les choses qui comptent au même endroit.</p>
        </header>
        <form className="mivix-login-form" onSubmit={handleSubmit}>
          <div className="mivix-login-field">
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
          </div>
          <div className="mivix-login-field">
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
          </div>
          <button className="mivix-login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter à MIVIX'}
          </button>
        </form>
        <button className="mivix-login-reset" type="button" onClick={handlePasswordReset} disabled={resetSubmitting}>
          {resetSubmitting ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
        </button>
        {authError && <p className="mivix-login-feedback mivix-login-feedback--error" role="alert">{getErrorMessage(authError, 'Impossible de charger la session.')}</p>}
        {error && <p className="mivix-login-feedback mivix-login-feedback--error" role="alert">{error}</p>}
        {message && <p className="mivix-login-feedback" role="status">{message}</p>}
        <p className="mivix-login-footnote">Un espace privé, pensé pour rester simple et vivant.</p>
      </section>
      <aside className="mivix-login-aside">
        <MivixRobot />
        <p>Centraliser sans figer.</p>
        <span>Projets · Création · Spiritualité</span>
      </aside>
    </main>
  );
}
