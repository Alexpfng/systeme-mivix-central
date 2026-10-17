import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const validateMigration = (migration) => {
  const tables = [
    'profiles', 'contacts', 'projects', 'content_items',
    'media_assets', 'entity_links', 'astrology_profiles', 'ai_summaries',
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
    if (!migration.includes(`create index ${index};`)) errors.push(`missing key index: ${index}`);
  }

  const compositeForeignKeys = [
    {
      pattern: /foreign key \(owner_id, profile_id\)\s+references public\.profiles\(owner_id, id\)\s+on delete set null\b/i,
      referencedColumnsError: 'contacts composite profile FK must reference (owner_id, id)',
      deleteActionError: 'contacts composite profile FK must use ON DELETE SET NULL',
      reference: /foreign key \(owner_id, profile_id\)\s+references public\.profiles\(owner_id, id\)/i,
    },
    {
      pattern: /foreign key \(owner_id, contact_id\)\s+references public\.contacts\(owner_id, id\)\s+on delete set null\b/i,
      referencedColumnsError: 'astrology_profiles composite contact FK must reference (owner_id, id)',
      deleteActionError: 'astrology_profiles composite contact FK must use ON DELETE SET NULL',
      reference: /foreign key \(owner_id, contact_id\)\s+references public\.contacts\(owner_id, id\)/i,
    },
  ];
  for (const foreignKey of compositeForeignKeys) {
    if (foreignKey.pattern.test(migration)) continue;
    if (!foreignKey.reference.test(migration)) errors.push(foreignKey.referencedColumnsError);
    else errors.push(foreignKey.deleteActionError);
  }

  const rlsTables = [...migration.matchAll(/alter table public\.(\w+) enable row level security;/g)]
    .map(([, table]) => table);
  for (const table of tables) {
    if (!rlsTables.includes(table)) errors.push(`RLS is not enabled on public.${table}`);
  }

  const normalizeSql = (sql) => sql.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
  const policyBlocks = [...migration.matchAll(
    /(?:^|\n)create policy\s+(\w+)\s+on\s+(public\.\w+|storage\.objects)([\s\S]*?)(?=\ncreate policy|\ninsert into storage|$)/gi,
  )].map(([, name, scope, body]) => ({ name, scope: scope.toLowerCase(), body }));
  const policiesByName = new Map(policyBlocks.map((policy) => [policy.name.toLowerCase(), policy]));
  const publicPolicyNames = tables.flatMap((table) =>
    ['select', 'insert', 'update', 'delete'].map((operation) => `${table}_${operation}_owner`));
  const expectedPublicPolicyNames = new Set(publicPolicyNames);
  const actualPublicPolicyNames = new Set(
    policyBlocks.filter(({ scope }) => scope.startsWith('public.')).map(({ name }) => name.toLowerCase()),
  );
  if (actualPublicPolicyNames.size !== expectedPublicPolicyNames.size) {
    errors.push(`expected 32 public owner policies, found ${actualPublicPolicyNames.size}`);
  }

  const expectedPublicBody = {
    select: 'using((selectauth.uid())=owner_id)',
    insert: 'withcheck((selectauth.uid())=owner_id)',
    update: 'using((selectauth.uid())=owner_id)withcheck((selectauth.uid())=owner_id)',
    delete: 'using((selectauth.uid())=owner_id)',
  };
  for (const table of tables) {
    for (const operation of ['select', 'insert', 'update', 'delete']) {
      const policyName = `${table}_${operation}_owner`;
      const policy = policiesByName.get(policyName);
      if (!policy || policy.scope !== `public.${table}`) {
        errors.push(`missing public.${table} ${operation} policy`);
        continue;
      }
      const header = policy.body.match(/^\s*for\s+(\w+)\s+to\s+([\w, ]+)/i);
      if (!header || header[1].toLowerCase() !== operation || header[2].trim().toLowerCase() !== 'authenticated') {
        errors.push(`public.${table} ${operation} policy must declare FOR ${operation} TO authenticated`);
        continue;
      }
      const body = policy.body.slice(header[0].length);
      if (normalizeSql(body) !== expectedPublicBody[operation]) {
        errors.push(`public.${table} ${operation} policy must have an exact ${operation === 'insert' ? 'WITH CHECK' : operation === 'update' ? 'USING and WITH CHECK' : 'USING'} owner expression`);
      }
    }
  }

  if (!/values \('mivix-media', 'mivix-media', false\)/.test(migration)) errors.push('mivix-media bucket must be explicitly private');
  const expectedStoragePolicyNames = new Set(['select', 'insert', 'update', 'delete'].map((operation) => `mivix_media_${operation}_owner`));
  const actualStoragePolicyNames = new Set(
    policyBlocks.filter(({ scope }) => scope === 'storage.objects').map(({ name }) => name.toLowerCase()),
  );
  if (actualStoragePolicyNames.size !== expectedStoragePolicyNames.size) {
    errors.push(`expected 4 Storage owner policies, found ${actualStoragePolicyNames.size}`);
  }
  const expectedStorageBody = {
    select: "using(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)",
    insert: "withcheck(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)",
    update: "using(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)withcheck(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)",
    delete: "using(bucket_id='mivix-media'andsplit_part(name,'/',1)=(selectauth.uid())::text)",
  };
  for (const operation of ['select', 'insert', 'update', 'delete']) {
    const policyName = `mivix_media_${operation}_owner`;
    const policy = policiesByName.get(policyName);
    if (!policy || policy.scope !== 'storage.objects') {
      errors.push(`missing Storage ${operation} policy`);
      continue;
    }
    const header = policy.body.match(/^\s*for\s+(\w+)\s+to\s+([\w, ]+)/i);
    if (!header || header[1].toLowerCase() !== operation || header[2].trim().toLowerCase() !== 'authenticated') {
      errors.push(`Storage ${operation} policy must declare FOR ${operation} TO authenticated`);
      continue;
    }
    const body = policy.body.slice(header[0].length);
    if (normalizeSql(body) !== expectedStorageBody[operation]) {
      errors.push(`Storage ${operation} policy must have an exact ${operation === 'insert' ? 'WITH CHECK' : operation === 'update' ? 'USING and WITH CHECK' : 'USING'} owner expression`);
    }
  }
  return errors;
};

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  const migrationPath = resolve('supabase/migrations/20261017111454_mivix_core.sql');
  const errors = validateMigration(readFileSync(migrationPath, 'utf8'));
  if (errors.length > 0) {
    console.error(`Core SQL contract failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Core SQL contract passed: 8 tables, 8 owner references, coherent timestamps, 12 key indexes, composite FK referenced columns and SET NULL actions, RLS, 32 public policies, 4 Storage policies, private bucket.');
  }
}
