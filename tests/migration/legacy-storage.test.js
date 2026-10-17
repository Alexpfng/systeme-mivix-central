import { describe, expect, test, vi } from 'vitest';
import {
  LEGACY_STORE_KEY,
  MIGRATION_MARKER_KEY,
  migrateLegacyStorage,
  readLegacyStorage,
} from '../../src/migration/legacyStorage';

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, String(value))),
    removeItem: vi.fn((key) => values.delete(key)),
    key: vi.fn((index) => Array.from(values.keys())[index] ?? null),
    get length() {
      return values.size;
    },
    dump: () => Object.fromEntries(values),
  };
}

describe('legacy MIVIX storage migration', () => {
  test('converts universe entries while preserving identity and legacy fields', async () => {
    const storage = createStorage({
      [LEGACY_STORE_KEY]: JSON.stringify({
        ecriture: [{
          id: 'legacy-entry-1',
          universe: 'ecriture',
          created: 1710000000000,
          type: 'photo',
          title: 'Carnet bleu',
          txt: 'Une note conservée',
          tag: 'Souvenir',
          fav: true,
          ph: 'photo · couverture',
          h: 240,
          attachments: [{ name: 'scan.pdf', url: '/legacy/scan.pdf' }],
          reference: { source: 'carnet', page: 4 },
        }],
      }),
    });
    const upsert = vi.fn(async (items) => items);

    const result = await migrateLegacyStorage({ storage, upsertContentItems: upsert, now: () => 1720000000000 });

    expect(result.status).toBe('migrated');
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0]).toEqual([expect.objectContaining({
      id: 'legacy-entry-1',
      title: 'Carnet bleu',
      content_type: 'photo',
      body: 'Une note conservée',
      tags: ['Souvenir'],
      created_at: new Date(1710000000000).toISOString(),
      metadata: expect.objectContaining({
        universe: 'ecriture',
        favorite: true,
        legacy: expect.objectContaining({ ph: 'photo · couverture', h: 240 }),
        attachments: [{ name: 'scan.pdf', url: '/legacy/scan.pdf' }],
        references: [{ source: 'carnet', page: 4 }],
      }),
    })]);
  });

  test('exports a timestamped backup before remote mutation and marker write', async () => {
    const storage = createStorage({
      [LEGACY_STORE_KEY]: JSON.stringify({ notes: [{ id: 'n-1', type: 'text', txt: 'Note' }] }),
    });
    const events = [];

    const result = await migrateLegacyStorage({
      storage,
      now: () => 1720000000123,
      exportBackup: vi.fn((backup) => {
        events.push(['backup', backup.filename, backup.json]);
        return backup.filename;
      }),
      upsertContentItems: vi.fn(async () => events.push(['upsert'])),
    });

    expect(result.backup.filename).toBe('mivix-local-backup-2024-07-03T09-46-40-123Z.json');
    expect(events.map(([event]) => event)).toEqual(['backup', 'upsert']);
    expect(JSON.parse(events[0][2]).legacyData.notes[0].id).toBe('n-1');
    expect(storage.getItem(LEGACY_STORE_KEY)).toContain('n-1');
    expect(storage.getItem(MIGRATION_MARKER_KEY)).toContain('2024-07-03T09:46:40.123Z');
  });

  test('is idempotent after the migration marker is present', async () => {
    const storage = createStorage({
      [LEGACY_STORE_KEY]: JSON.stringify({ notes: [{ id: 'n-1', type: 'text', txt: 'Note' }] }),
      [MIGRATION_MARKER_KEY]: JSON.stringify({ version: 1, migratedAt: '2024-07-03T09:46:40.123Z' }),
    });
    const upsert = vi.fn();

    const result = await migrateLegacyStorage({ storage, upsertContentItems: upsert });

    expect(result.status).toBe('already-migrated');
    expect(upsert).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  test('skips malformed entries and reports invalid JSON without mutating storage', async () => {
    const storage = createStorage({ [LEGACY_STORE_KEY]: '{not-json' });
    const upsert = vi.fn();

    const invalid = await migrateLegacyStorage({ storage, upsertContentItems: upsert });

    expect(invalid.status).toBe('invalid');
    expect(invalid.errors).toHaveLength(1);
    expect(upsert).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();

    const validStorage = createStorage({
      [LEGACY_STORE_KEY]: JSON.stringify({ notes: [null, 'bad', { id: 'ok', type: 'quote', txt: 'Oui' }] }),
    });
    const valid = await migrateLegacyStorage({ storage: validStorage, upsertContentItems: upsert });

    expect(valid.status).toBe('migrated');
    expect(upsert).toHaveBeenCalledWith([expect.objectContaining({ id: 'ok', content_type: 'quote' })]);
  });

  test('handles unavailable localStorage cleanly', async () => {
    expect(readLegacyStorage(null)).toEqual({ status: 'unavailable', entries: [], errors: [] });
    await expect(migrateLegacyStorage({ storage: null })).resolves.toEqual(expect.objectContaining({
      status: 'unavailable',
    }));
  });
});
