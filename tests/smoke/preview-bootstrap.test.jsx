import '@testing-library/jest-dom/vitest';
import { act, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  throw new Error('Supabase must not load in visual preview mode');
});

test('renders the visual preview without importing Supabase configuration', async () => {
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/?preview=mivix');

  const { bootstrap } = await import('../../src/main');
  document.body.innerHTML = '<div id="root"></div>';
  await act(async () => {
    await bootstrap(document.getElementById('root'), new URL('http://localhost/?preview=mivix'));
  });

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /un espace pour conserver/i })).toBeInTheDocument();
});
