import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../src/app/App';

const migrationDialog = vi.fn(() => <div data-testid="migration-dialog" />);

vi.mock('../../src/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'authenticated-user' },
    upsertContentItems: vi.fn(),
  }),
}));

vi.mock('../../src/migration/MigrationDialog', () => ({ default: (props) => {
  migrationDialog(props);
  return <div data-testid="migration-dialog" />;
} }));

test('wires the authenticated user and remote upsert into MigrationDialog', () => {
  render(<App />);

  expect(screen.getByTestId('migration-dialog')).toBeInTheDocument();
  expect(migrationDialog).toHaveBeenCalledWith(expect.objectContaining({
    userId: 'authenticated-user',
    upsertContentItems: expect.any(Function),
  }));
});
