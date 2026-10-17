import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider } from '../../src/auth/AuthProvider';
import App from '../../src/app/App';

test('renders the MIVIX shell', () => {
  render(<AuthProvider><App /></AuthProvider>);
  expect(screen.getByText('MIVIX Central')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /importer vos données mivix/i })).toBeInTheDocument();
});

test('renders the visual MIVIX home with its modular widgets', () => {
  render(<AuthProvider><App /></AuthProvider>);

  expect(screen.getByRole('banner')).toHaveClass('mivix-topbar');
  expect(screen.getByRole('searchbox', { name: /rechercher/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /un espace pour conserver/i })).toBeInTheDocument();
  expect(screen.getByTestId('mivix-widget-grid')).toBeInTheDocument();

  for (const widget of [
    'Projets transversal',
    'Spiritualité',
    'Écriture',
    'Bibliothèque du savoir',
    'Atelier créatif',
    'Généalogie',
    'Carnet de voyages',
  ]) {
    expect(screen.getByRole('heading', { name: widget })).toBeInTheDocument();
  }

  expect(screen.getByRole('img', { name: /robot mivix/i })).toBeInTheDocument();
});

test('filters visible widgets from the search field without exposing private content', async () => {
  render(<AuthProvider><App /></AuthProvider>);
  const search = screen.getByRole('searchbox', { name: /rechercher/i });
  fireEvent.change(search, { target: { value: 'voyage' } });

  expect(screen.getByRole('heading', { name: 'Carnet de voyages' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Écriture' })).not.toBeInTheDocument();
  expect(screen.queryByText(/authenticated-user|@/i)).not.toBeInTheDocument();
});
