import { describe, expect, test, vi } from 'vitest';
import { createContentItemsUpsert } from '../../src/auth/AuthProvider';

describe('authenticated content_items upsert', () => {
  test('adds the authenticated owner and uses the id conflict key', async () => {
    const upsert = vi.fn(async () => ({ data: [{ id: 'item-1' }], error: null }));
    const supabase = { from: vi.fn(() => ({ upsert })) };
    const save = createContentItemsUpsert({ supabase, userId: 'user-1' });

    await expect(save([{ id: 'item-1', title: 'Note' }])).resolves.toEqual([{ id: 'item-1' }]);
    expect(supabase.from).toHaveBeenCalledWith('content_items');
    expect(upsert).toHaveBeenCalledWith(
      [{ id: 'item-1', title: 'Note', owner_id: 'user-1' }],
      { onConflict: 'id' },
    );
  });

  test('surfaces remote errors instead of reporting success', async () => {
    const remoteError = new Error('RLS denied');
    const supabase = { from: vi.fn(() => ({ upsert: vi.fn(async () => ({ data: null, error: remoteError })) })) };
    const save = createContentItemsUpsert({ supabase, userId: 'user-1' });

    await expect(save([{ id: 'item-1' }])).rejects.toBe(remoteError);
  });
});
