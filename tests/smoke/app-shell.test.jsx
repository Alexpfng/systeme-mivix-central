import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/app/App';

test('renders the MIVIX shell', () => {
  render(<App />);
  expect(screen.getByText('MIVIX Central')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /importer vos données mivix/i })).toBeInTheDocument();
});
