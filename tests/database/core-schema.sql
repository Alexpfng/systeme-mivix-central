-- MIVIX core schema contract tests.
-- Run after migrations against a Supabase/Postgres database, for example:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/database/core-schema.sql

begin;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'contacts',
    'projects',
    'content_items',
    'media_assets',
    'entity_links',
    'astrology_profiles',
    'ai_summaries'
  ] loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'missing public table: %', table_name;
    end if;

    if not exists (
      select 1
      from pg_class
      where oid = format('public.%I', table_name)::regclass
        and relrowsecurity
    ) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from storage.buckets
    where id = 'mivix-media'
      and public = false
  ) then
    raise exception 'mivix-media bucket is missing or public';
  end if;
end;
$$;

do $$
declare
  current_table text;
  owner_reference_count integer;
  timestamp_column text;
begin
  foreach current_table in array array[
    'profiles',
    'contacts',
    'projects',
    'content_items',
    'media_assets',
    'entity_links',
    'astrology_profiles',
    'ai_summaries'
  ] loop
    select count(*) into owner_reference_count
    from pg_constraint constraint_record
    where constraint_record.contype = 'f'
      and constraint_record.conrelid = format('public.%I', current_table)::regclass
      and constraint_record.confrelid = 'auth.users'::regclass
      and constraint_record.conkey = array[
        (select attnum
         from pg_attribute
         where attrelid = constraint_record.conrelid
           and attname = 'owner_id'
           and not attisdropped)
      ]::smallint[];

    if owner_reference_count <> 1 then
      raise exception 'public.% must have exactly one owner_id REFERENCES auth.users constraint', current_table;
    end if;

    foreach timestamp_column in array array['created_at', 'updated_at'] loop
      if not exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and information_schema.columns.table_name = current_table
          and column_name = timestamp_column
          and data_type = 'timestamp with time zone'
          and is_nullable = 'NO'
          and column_default like 'now()%%'
      ) then
        raise exception 'public.% is missing coherent % timestamp', current_table, timestamp_column;
      end if;
    end loop;
  end loop;
end;
$$;

do $$
declare
  expected_index record;
begin
  for expected_index in
    select * from (values
      ('contacts_owner_id_idx', 'on public.contacts using btree (owner_id)'),
      ('contacts_profile_id_idx', 'on public.contacts using btree (profile_id)'),
      ('contacts_owner_profile_idx', 'on public.contacts using btree (owner_id, profile_id)'),
      ('projects_owner_id_idx', 'on public.projects using btree (owner_id)'),
      ('content_items_owner_id_idx', 'on public.content_items using btree (owner_id)'),
      ('media_assets_owner_id_idx', 'on public.media_assets using btree (owner_id)'),
      ('entity_links_owner_source_idx', 'on public.entity_links using btree (owner_id, source_type, source_id)'),
      ('entity_links_owner_target_idx', 'on public.entity_links using btree (owner_id, target_type, target_id)'),
      ('astrology_profiles_owner_id_idx', 'on public.astrology_profiles using btree (owner_id)'),
      ('astrology_profiles_contact_id_idx', 'on public.astrology_profiles using btree (contact_id)'),
      ('astrology_profiles_owner_contact_idx', 'on public.astrology_profiles using btree (owner_id, contact_id)'),
      ('ai_summaries_owner_entity_idx', 'on public.ai_summaries using btree (owner_id, entity_type, entity_id)')
    ) as indexes(index_name, definition_fragment)
  loop
    if not exists (
      select 1
      from pg_indexes
      where schemaname = 'public'
        and indexname = expected_index.index_name
        and lower(indexdef) like '%' || expected_index.definition_fragment || '%'
    ) then
      raise exception 'missing key index %', expected_index.index_name;
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'u'
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'id')
      ]::smallint[]
  ) then raise exception 'profiles must have UNIQUE (owner_id, id)'; end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.contacts'::regclass
      and contype = 'u'
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'id')
      ]::smallint[]
  ) then raise exception 'contacts must have UNIQUE (owner_id, id)'; end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.contacts'::regclass
      and contype = 'f'
      and confrelid = 'public.profiles'::regclass
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'profile_id')
      ]::smallint[]
      and confkey = array[
        (select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.profiles'::regclass and attname = 'id')
      ]::smallint[]
      and confdeltype = 'n'
  ) then raise exception 'contacts must have profile FK (owner_id, profile_id) REFERENCES (owner_id, id) ON DELETE SET NULL'; end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.astrology_profiles'::regclass
      and contype = 'f'
      and confrelid = 'public.contacts'::regclass
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.astrology_profiles'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.astrology_profiles'::regclass and attname = 'contact_id')
      ]::smallint[]
      and confkey = array[
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'owner_id'),
        (select attnum from pg_attribute where attrelid = 'public.contacts'::regclass and attname = 'id')
      ]::smallint[]
      and confdeltype = 'n'
  ) then raise exception 'astrology_profiles must have contact FK (owner_id, contact_id) REFERENCES (owner_id, id) ON DELETE SET NULL'; end if;
end;
$$;

do $$
declare
  table_name text;
  policy_record record;
  expected_policy record;
  normalized_using text;
  normalized_check text;
begin
  foreach table_name in array array[
    'profiles',
    'contacts',
    'projects',
    'content_items',
    'media_assets',
    'entity_links',
    'astrology_profiles',
    'ai_summaries'
  ] loop
    for expected_policy in
      select * from (values
        (table_name || '_select_owner', 'r'::text),
        (table_name || '_insert_owner', 'a'::text),
        (table_name || '_update_owner', 'w'::text),
        (table_name || '_delete_owner', 'd'::text)
      ) as expected(policy_name, command_code)
    loop
      select polcmd::text as command, polroles::text as roles,
             pg_get_expr(polqual, polrelid) as using_expression,
             pg_get_expr(polwithcheck, polrelid) as check_expression
      into policy_record
      from pg_policy
      where polrelid = format('public.%I', table_name)::regclass
        and polname = expected_policy.policy_name;

      if not found then
        raise exception 'missing policy % on public.%', expected_policy.policy_name, table_name;
      end if;
      if policy_record.roles <> '{authenticated}' then
        raise exception 'policy % on public.% must have exactly authenticated role', expected_policy.policy_name, table_name;
      end if;
      if policy_record.command <> expected_policy.command_code then
        raise exception 'policy % on public.% has wrong FOR command', expected_policy.policy_name, table_name;
      end if;

      normalized_using := regexp_replace(lower(coalesce(policy_record.using_expression, '')), '\s+', '', 'g');
      normalized_check := regexp_replace(lower(coalesce(policy_record.check_expression, '')), '\s+', '', 'g');
      if policy_record.command <> 'a'
         and normalized_using !~ '^\(*selectauth\.uid\(\)(asuid)?\)*=owner_id\)*$' then
        raise exception 'policy % on public.% has a non-exact USING ownership expression', expected_policy.policy_name, table_name;
      end if;
      if policy_record.command in ('a', 'w')
         and normalized_check !~ '^\(*selectauth\.uid\(\)(asuid)?\)*=owner_id\)*$' then
        raise exception 'policy % on public.% has a non-exact WITH CHECK ownership expression', expected_policy.policy_name, table_name;
      end if;
    end loop;
  end loop;
end;
$$;

do $$
declare
  expected_policy record;
  policy_record record;
  normalized_using text;
  normalized_check text;
begin
  for expected_policy in
    select * from (values
      ('mivix_media_select_owner', 'r'::text),
      ('mivix_media_insert_owner', 'a'::text),
      ('mivix_media_update_owner', 'w'::text),
      ('mivix_media_delete_owner', 'd'::text)
    ) as expected(policy_name, command_code)
  loop
    select polcmd::text as command, polroles::text as roles,
           pg_get_expr(polqual, polrelid) as using_expression,
           pg_get_expr(polwithcheck, polrelid) as check_expression
    into policy_record
    from pg_policy
    where polrelid = 'storage.objects'::regclass
      and polname = expected_policy.policy_name;

    if not found then
      raise exception 'missing Storage policy %', expected_policy.policy_name;
    end if;
    if policy_record.roles <> '{authenticated}' then
      raise exception 'Storage policy % must have exactly authenticated role', expected_policy.policy_name;
    end if;
    if policy_record.command <> expected_policy.command_code then
      raise exception 'Storage policy % has wrong FOR command', expected_policy.policy_name;
    end if;

    normalized_using := regexp_replace(lower(coalesce(policy_record.using_expression, '')), '\s+', '', 'g');
    normalized_check := regexp_replace(lower(coalesce(policy_record.check_expression, '')), '\s+', '', 'g');
    if policy_record.command <> 'a'
       and normalized_using !~ '^\(*bucket_id=''mivix-media''andsplit_part\(name,''/'',1\)=\(*selectauth\.uid\(\)(asuid)?\)*::text\)*$' then
      raise exception 'Storage policy % has a non-exact USING ownership expression', expected_policy.policy_name;
    end if;
    if policy_record.command in ('a', 'w')
       and normalized_check !~ '^\(*bucket_id=''mivix-media''andsplit_part\(name,''/'',1\)=\(*selectauth\.uid\(\)(asuid)?\)*::text\)*$' then
      raise exception 'Storage policy % has a non-exact WITH CHECK ownership expression', expected_policy.policy_name;
    end if;
  end loop;
end;
$$;

rollback;
