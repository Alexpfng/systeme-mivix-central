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
