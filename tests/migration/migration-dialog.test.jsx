import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import MigrationDialog from '../../src/migration/MigrationDialog';

describe('MigrationDialog', () => {
  test('shows a clear confirmation before starting the migration', async () => {
    const migrate = vi.fn(async () => ({ status: 'migrated', entries: [{ id: 'one' }] }));
    const source = { status: 'ready', entries: [{ id: 'one' }, { id: 'two' }], errors: [] };

    render(<MigrationDialog source={source} migrate={migrate} />);

    expect(screen.getByRole('dialog')).toHaveTextContent('2 éléments');
    expect(migrate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(migrate).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('dialog')).toHaveTextContent(/migration terminée/i);
  });

  test('explains when no local storage can be read', () => {
    render(<MigrationDialog source={{ status: 'unavailable', entries: [], errors: [] }} />);

    expect(screen.getByRole('dialog')).toHaveTextContent(/localStorage indisponible/i);
    expect(screen.queryByRole('button', { name: /confirmer/i })).not.toBeInTheDocument();
  });
});
