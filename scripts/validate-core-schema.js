import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve('supabase/migrations/20261017111454_mivix_core.sql');
const migration = readFileSync(migrationPath, 'utf8');
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
const errors = [];

const tableBlock = (table) => migration.match(
  new RegExp(`create table public\\.${table} \\(([\\s\\S]*?)\\n\\);`),
)?.[1] ?? '';

for (const table of tables) {
  const block = tableBlock(table);
  if (!block) {
    errors.push(`missing table public.${table}`);
    continue;
  }
  if (!/owner_id uuid not null (?:unique )?references auth\.users\(id\)/.test(block)) {
    errors.push(`public.${table} must have owner_id REFERENCES auth.users(id)`);
  }
  for (const timestamp of ['created_at', 'updated_at']) {
    if (!new RegExp(`${timestamp} timestamptz not null default now\\(\\)`).test(block)) {
      errors.push(`public.${table} must have ${timestamp} timestamptz NOT NULL DEFAULT now()`);
    }
  }
}

const indexes = [
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
];
for (const index of indexes) {
  if (!migration.includes(`create index ${index};`)) {
    errors.push(`missing key index: ${index}`);
  }
}

const rlsTables = [...migration.matchAll(/alter table public\.(\w+) enable row level security;/g)]
  .map(([, table]) => table);
for (const table of tables) {
  if (!rlsTables.includes(table)) errors.push(`RLS is not enabled on public.${table}`);
}

const publicPolicyNames = [...migration.matchAll(/create policy (\w+_owner) on public\.(\w+)/g)];
if (publicPolicyNames.length !== 32) {
  errors.push(`expected 32 public owner policies, found ${publicPolicyNames.length}`);
}
const authenticatedPolicyRoles = [...migration.matchAll(/\n  for \w+ to authenticated\n/g)];
if (authenticatedPolicyRoles.length !== 36) {
  errors.push(`expected 36 exact authenticated policy roles, found ${authenticatedPolicyRoles.length}`);
}
const publicPolicyExpression = /\(select auth\.uid\(\)\) = owner_id/g;
if ((migration.match(publicPolicyExpression) ?? []).length !== 40) {
  errors.push('expected 40 exact public (select auth.uid()) ownership expressions');
}
for (const table of tables) {
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    const block = migration.match(
      new RegExp(`create policy ${table}_${operation}_owner on public\\.${table}([\\s\\S]*?)(?=\\ncreate policy|\\ninsert into storage)`),
    )?.[1];
    if (!block) {
      errors.push(`missing public.${table} ${operation} policy`);
      continue;
    }
    const normalized = block.replace(/\s+/g, '').toLowerCase();
    if (operation !== 'insert' && !normalized.includes('using((selectauth.uid())=owner_id)')) {
      errors.push(`public.${table} ${operation} policy has an invalid exact USING owner expression`);
    }
    if (['insert', 'update'].includes(operation)
      && !normalized.includes('withcheck((selectauth.uid())=owner_id)')) {
      errors.push(`public.${table} ${operation} policy has an invalid exact WITH CHECK owner expression`);
    }
  }
}

if (!/values \('mivix-media', 'mivix-media', false\)/.test(migration)) {
  errors.push('mivix-media bucket must be explicitly private');
}
const storagePolicyNames = [...migration.matchAll(/create policy (mivix_media_\w+_owner) on storage\.objects/g)];
if (storagePolicyNames.length !== 4) {
  errors.push(`expected 4 Storage owner policies, found ${storagePolicyNames.length}`);
}
const storagePathExpression = /split_part\(name, '\/', 1\) = \(select auth\.uid\(\)\)::text/g;
if ((migration.match(storagePathExpression) ?? []).length !== 5) {
  errors.push('expected 5 exact Storage first-path-segment ownership expressions');
}
for (const operation of ['select', 'insert', 'update', 'delete']) {
  const block = migration.match(
    new RegExp(`create policy mivix_media_${operation}_owner on storage\\.objects([\\s\\S]*?)(?=\\ncreate policy|$)`),
  )?.[1];
  if (!block) {
    errors.push(`missing Storage ${operation} policy`);
    continue;
  }
  const normalized = block.replace(/\s+/g, '').toLowerCase();
  const pathExpression = "split_part(name,'/',1)=(selectauth.uid())::text";
  if (operation !== 'insert' && !normalized.includes(`using(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)`)) {
    errors.push(`Storage ${operation} policy has an invalid first-path-segment USING expression`);
  }
  if (['insert', 'update'].includes(operation)
    && !normalized.includes(`withcheck(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)`)) {
    errors.push(`Storage ${operation} policy has an invalid first-path-segment WITH CHECK expression`);
  }
  if (!normalized.includes(pathExpression)) errors.push(`Storage ${operation} policy is missing first-path-segment owner equality`);
}

if (errors.length > 0) {
  console.error(`Core SQL contract failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Core SQL contract passed: 8 tables, 8 owner references, coherent timestamps, 12 key indexes, RLS, 32 public policies, 4 Storage policies, private bucket.');
}
