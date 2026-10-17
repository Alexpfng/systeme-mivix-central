import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { validateMigration } from '../../scripts/validate-core-schema.js';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20261017111454_mivix_core.sql'),
  'utf8',
);

const tables = [
  'profiles',
  'contacts',
  'projects',
  'content_items',
  'media_assets',
  'entity_links',
  'astrology_profiles',
  'ai_summaries',
];

describe('MIVIX core SQL contract', () => {
  test.each(tables)('%s has an owner reference and coherent timestamps', (table) => {
    const tableBlock = migration.match(
      new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`),
    )?.[1];

    expect(tableBlock).toBeTruthy();
    expect(tableBlock).toMatch(/owner_id uuid not null (?:unique )?references auth\.users\(id\)/);
    expect(tableBlock).toMatch(/created_at timestamptz not null default now\(\)/);
    expect(tableBlock).toMatch(/updated_at timestamptz not null default now\(\)/);
  });

  test('declares the required owner and relation indexes', () => {
    for (const index of [
      'contacts_owner_id_idx on public.contacts(owner_id)',
      'contacts_profile_id_idx on public.contacts(profile_id)',
      'contacts_owner_profile_idx on public.contacts(owner_id, profile_id)',
      'projects_owner_id_idx on public.projects(owner_id)',
      'content_items_owner_id_idx on public.content_items(owner_id)',
      'media_assets_owner_id_idx on public.media_assets(owner_id)',
      'entity_links_owner_source_idx on public.entity_links(owner_id, source_type, source_id)',
      'entity_links_owner_target_idx on public.entity_links(owner_id, target_type, target_id)',
      'astrology_profiles_owner_id_idx on public.astrology_profiles(owner_id)',
      'astrology_profiles_contact_id_idx on public.astrology_profiles(contact_id)',
      'astrology_profiles_owner_contact_idx on public.astrology_profiles(owner_id, contact_id)',
      'ai_summaries_owner_entity_idx on public.ai_summaries(owner_id, entity_type, entity_id)',
    ]) {
      expect(migration).toContain(`create index ${index};`);
    }
  });

  test('preserves ownership across profile and contact foreign keys', () => {
    expect(migration.match(/unique \(owner_id, id\)/g)).toHaveLength(2);
    expect(migration).toMatch(
      /foreign key \(owner_id, profile_id\)\s+references public\.profiles\(owner_id, id\)\s+on delete set null \(profile_id\)/,
    );
    expect(migration).toMatch(
      /foreign key \(owner_id, contact_id\)\s+references public\.contacts\(owner_id, id\)\s+on delete set null \(contact_id\)/,
    );
  });

  test('rejects composite FKs that reference the wrong columns', () => {
    const invalidMigration = migration.replace(
      'references public.profiles(owner_id, id)',
      'references public.profiles(id, owner_id)',
    );

    expect(validateMigration(invalidMigration)).toContain(
      'contacts composite profile FK must reference (owner_id, id)',
    );
  });

  test('rejects composite FKs without ON DELETE SET NULL', () => {
    const invalidMigration = migration.replace(
      'on delete set null (profile_id)',
      'on delete cascade',
    );

    expect(validateMigration(invalidMigration)).toContain(
      'contacts composite profile FK must use ON DELETE SET NULL',
    );
  });

  test('restricts every public and Storage owner policy to authenticated exactly', () => {
    const publicPolicies = [...migration.matchAll(
      /create policy \w+ on public\.\w+\n  for \w+ to authenticated/g,
    )];
    expect(publicPolicies).toHaveLength(32);

    const storagePolicies = [...migration.matchAll(
      /create policy \w+ on storage\.objects\n  for \w+ to authenticated/g,
    )];
    expect(storagePolicies).toHaveLength(4);
    expect(migration).not.toMatch(/to public/);
    expect(migration).not.toMatch(/to anon/);
  });

  test('uses exact owner expressions in public and Storage policies', () => {
    expect(migration.match(/\(select auth\.uid\(\)\) = owner_id/g)).toHaveLength(40);
    expect(migration.match(/split_part\(name, '\/', 1\) = \(select auth\.uid\(\)\)::text/g)).toHaveLength(5);
  });
});
