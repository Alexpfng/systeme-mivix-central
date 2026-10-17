import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/auth/AuthProvider';
import LoginPage from '../../src/auth/LoginPage';

const authState = vi.hoisted(() => ({
  session: null,
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
  authChangeCallback: null,
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: authState,
  },
}));

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  authState.getSession.mockClear();
  authState.signInWithPassword.mockClear();
  authState.resetPasswordForEmail.mockClear();
  authState.updateUser.mockClear();
  authState.signOut.mockClear();
  authState.onAuthStateChange.mockClear();
  authState.session = null;
  authState.getSession.mockResolvedValue({ data: { session: null }, error: null });
  authState.signInWithPassword.mockResolvedValue({ error: null });
  authState.resetPasswordForEmail.mockResolvedValue({ error: null });
  authState.updateUser.mockResolvedValue({ error: null });
  authState.signOut.mockResolvedValue({ error: null });
  authState.authChangeCallback = null;
  authState.onAuthStateChange.mockImplementation((callback) => {
    authState.authChangeCallback = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
});

test('shows email, password and submit controls when signed out', async () => {
  renderLoginPage();

  expect(await screen.findByTestId('mivix-login-page')).toHaveClass('mivix-login-page');
  expect(screen.getByText('Votre espace personnel')).toBeInTheDocument();
  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/mot de passe|password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /connexion|sign in|se connecter/i })).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alex@example.com' } });
  fireEvent.change(screen.getByLabelText(/mot de passe|password/i), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /connexion|sign in|se connecter/i }));

  await waitFor(() => {
    expect(authState.signInWithPassword).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'secret',
    });
  });
});

test('renders the application shell when a session exists', async () => {
  authState.getSession.mockResolvedValue({
    data: { session: { user: { email: 'alex@example.com' } } },
    error: null,
  });

  renderLoginPage();

  expect(await screen.findByText('MIVIX Central')).toBeInTheDocument();
  expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
});

test('updates the rendered app when auth state changes and signs out', async () => {
  renderLoginPage();

  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  const session = { user: { email: 'alex@example.com' } };

  await act(async () => {
    authState.authChangeCallback('SIGNED_IN', session);
  });
  expect(await screen.findByText('MIVIX Central')).toBeInTheDocument();

  await act(async () => {
    authState.authChangeCallback('SIGNED_OUT', null);
  });
  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.queryByText('MIVIX Central')).not.toBeInTheDocument();
});

test('shows a new password form after a PASSWORD_RECOVERY event', async () => {
  renderLoginPage();

  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  const session = { user: { email: 'alex@example.com' } };

  await act(async () => {
    authState.authChangeCallback('PASSWORD_RECOVERY', session);
  });

  expect(await screen.findByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  expect(screen.queryByText('MIVIX Central')).not.toBeInTheDocument();
});

test('updates the password from the PASSWORD_RECOVERY form', async () => {
  renderLoginPage();

  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  await act(async () => {
    authState.authChangeCallback('PASSWORD_RECOVERY', { user: { email: 'alex@example.com' } });
  });

  fireEvent.change(screen.getByLabelText(/nouveau mot de passe/i), {
    target: { value: 'new-secret' },
  });
  fireEvent.click(screen.getByRole('button', { name: /enregistrer le nouveau mot de passe/i }));

  await waitFor(() => {
    expect(authState.updateUser).toHaveBeenCalledWith({ password: 'new-secret' });
  });
});

test('shows a user-facing error and stops submitting when sign out rejects', async () => {
  authState.getSession.mockResolvedValue({
    data: { session: { user: { email: 'alex@example.com' } } },
    error: null,
  });
  authState.signOut.mockRejectedValue(new Error('Sign out unavailable'));

  renderLoginPage();

  expect(await screen.findByText('MIVIX Central')).toBeInTheDocument();
  const signOut = screen.getByRole('button', { name: /se déconnecter/i });
  fireEvent.click(signOut);

  expect(await screen.findByRole('alert')).toHaveTextContent('Sign out unavailable');
  expect(signOut).not.toBeDisabled();
  expect(screen.getByText('MIVIX Central')).toBeInTheDocument();
});

test('shows a user-facing error and stops submitting when sign in rejects', async () => {
  authState.signInWithPassword.mockRejectedValue(new Error('Auth service unavailable'));
  renderLoginPage();

  const email = await screen.findByLabelText(/email/i);
  const password = screen.getByLabelText(/mot de passe|password/i);
  const submit = screen.getByRole('button', { name: /connexion|sign in|se connecter/i });

  fireEvent.change(email, { target: { value: 'alex@example.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });
  fireEvent.click(submit);

  expect(await screen.findByRole('alert')).toHaveTextContent('Auth service unavailable');
  expect(submit).not.toBeDisabled();
});

test.each([null, 'unexpected failure', 42])(
  'uses a fallback when sign in rejects with %p', async (exception) => {
    authState.signInWithPassword.mockRejectedValue(exception);
    renderLoginPage();

    const email = await screen.findByLabelText(/email/i);
    const password = screen.getByLabelText(/mot de passe|password/i);
    const submit = screen.getByRole('button', { name: /connexion|sign in|se connecter/i });
    fireEvent.change(email, { target: { value: 'alex@example.com' } });
    fireEvent.change(password, { target: { value: 'secret' } });
    fireEvent.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('La connexion a échoué.');
    expect(submit).not.toBeDisabled();
  },
);

test('shows a user-facing error when password reset rejects', async () => {
  authState.resetPasswordForEmail.mockRejectedValue(new Error('Reset service unavailable'));
  renderLoginPage();

  const email = await screen.findByLabelText(/email/i);
  fireEvent.change(email, { target: { value: 'alex@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Reset service unavailable');
});

test('validates the email before starting password reset', async () => {
  renderLoginPage();

  await screen.findByLabelText(/email/i);
  fireEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Saisissez une adresse email valide.',
  );
  expect(authState.resetPasswordForEmail).not.toHaveBeenCalled();
});

test('disables password reset while the request is pending', async () => {
  let resolveReset;
  authState.resetPasswordForEmail.mockImplementation(
    () => new Promise((resolve) => { resolveReset = resolve; }),
  );
  renderLoginPage();

  const email = await screen.findByLabelText(/email/i);
  fireEvent.change(email, { target: { value: 'alex@example.com' } });
  const reset = screen.getByRole('button', { name: /réinitialiser le mot de passe/i });
  fireEvent.click(reset);

  expect(reset).toBeDisabled();
  expect(reset).toHaveTextContent('Réinitialisation…');

  resolveReset({ error: null });
  await waitFor(() => expect(reset).not.toBeDisabled());
  expect(screen.getByRole('status')).toHaveTextContent('Un email de réinitialisation a été envoyé.');
});

test.each([null, 'unexpected failure', 42])(
  'uses a fallback when password reset rejects with %p', async (exception) => {
    authState.resetPasswordForEmail.mockRejectedValue(exception);
    renderLoginPage();

    const email = await screen.findByLabelText(/email/i);
    fireEvent.change(email, { target: { value: 'alex@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La réinitialisation a échoué.');
  },
);

test('shows a bootstrap error without blocking the loading state', async () => {
  authState.getSession.mockResolvedValue({
    data: { session: null },
    error: new Error('Session storage unavailable'),
  });

  renderLoginPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('Session storage unavailable');
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});

test('shows a bootstrap rejection without blocking the loading state', async () => {
  authState.getSession.mockRejectedValue(new Error('Session bootstrap failed'));

  renderLoginPage();

  expect(await screen.findByRole('alert')).toHaveTextContent('Session bootstrap failed');
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
