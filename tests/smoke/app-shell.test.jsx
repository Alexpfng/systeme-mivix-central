import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../src/auth/AuthProvider';
import App from '../../src/app/App';

test('renders the MIVIX shell', () => {
  render(<AuthProvider><App /></AuthProvider>);
  expect(screen.getByText('MIVIX Central')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /importer vos données mivix/i })).toBeInTheDocument();
});
