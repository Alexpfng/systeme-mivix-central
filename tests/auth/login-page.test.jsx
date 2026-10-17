import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/auth/AuthProvider';
import LoginPage from '../../src/auth/LoginPage';

const authState = vi.hoisted(() => ({
  session: null,
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
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
  authState.session = null;
  authState.getSession.mockResolvedValue({ data: { session: null }, error: null });
  authState.signInWithPassword.mockResolvedValue({ error: null });
  authState.resetPasswordForEmail.mockResolvedValue({ error: null });
  authState.signOut.mockResolvedValue({ error: null });
  authState.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

test('shows email, password and submit controls when signed out', async () => {
  renderLoginPage();

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

test('shows a user-facing error when password reset rejects', async () => {
  authState.resetPasswordForEmail.mockRejectedValue(new Error('Reset service unavailable'));
  renderLoginPage();

  const email = await screen.findByLabelText(/email/i);
  fireEvent.change(email, { target: { value: 'alex@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Reset service unavailable');
});

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
