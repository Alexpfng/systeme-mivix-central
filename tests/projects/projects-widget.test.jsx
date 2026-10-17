import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../src/auth/AuthProvider';
import App from '../../src/app/App';

const projectState = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: projectState.select,
      insert: projectState.insert,
      update: projectState.update,
      delete: projectState.delete,
    })),
  },
}));

function renderApp() {
  return render(<AuthProvider><App /></AuthProvider>);
}

beforeEach(() => {
  projectState.select.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  });
  projectState.insert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: { id: 'project-1', owner_id: 'user-1', name: 'Studio MIVIX', description: 'Une idée', status: 'idea' },
        error: null,
      }),
    }),
  });
});

test('opens the real projects workspace and creates a project', async () => {
  renderApp();

  fireEvent.click(screen.getByRole('button', { name: /ouvrir projets transversal/i }));
  expect(await screen.findByRole('heading', { name: 'Projets transversal' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /nouveau projet/i }));

  fireEvent.change(screen.getByLabelText(/nom du projet/i), { target: { value: 'Studio MIVIX' } });
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Une idée' } });
  fireEvent.click(screen.getByRole('button', { name: /créer le projet/i }));

  await waitFor(() => expect(projectState.insert).toHaveBeenCalled());
  expect(projectState.insert.mock.calls[0][0]).toMatchObject({
    owner_id: 'user-1',
    name: 'Studio MIVIX',
    description: 'Une idée',
    status: 'idea',
  });
  expect(await screen.findByText('Studio MIVIX')).toBeInTheDocument();
});
