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
  table_name text;
  policy_record record;
  expected_policy record;
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
    for policy_record in
      select polcmd::text as command, polroles::text as roles,
             pg_get_expr(polqual, polrelid) as using_expression,
             pg_get_expr(polwithcheck, polrelid) as check_expression
      from pg_policy
      where polrelid = format('public.%I', table_name)::regclass
    loop
      if policy_record.roles not like '%authenticated%' then
        raise exception 'policy on public.% is not restricted to authenticated', table_name;
      end if;
      if policy_record.command <> 'a'
         and lower(coalesce(policy_record.using_expression, '')) not like '%auth.uid()%' then
        raise exception 'policy on public.% is missing auth.uid() ownership check', table_name;
      end if;
      if policy_record.command in ('a', 'w')
         and lower(coalesce(policy_record.check_expression, '')) not like '%auth.uid()%' then
        raise exception 'write policy on public.% is missing WITH CHECK ownership check', table_name;
      end if;
    end loop;

    for expected_policy in
      select * from (values
        ('select'::text, 'r'::text),
        ('insert'::text, 'a'::text),
        ('update'::text, 'w'::text),
        ('delete'::text, 'd'::text)
      ) as expected(command_name, command_code)
    loop
      if not exists (
        select 1
        from pg_policy
        where polrelid = format('public.%I', table_name)::regclass
          and polcmd = expected_policy.command_code
      ) then
        raise exception 'missing % policy on public.%', expected_policy.command_name, table_name;
      end if;
    end loop;
  end loop;
end;
$$;

do $$
declare
  command text;
begin
  foreach command in array array['r', 'a', 'w', 'd'] loop
    if not exists (
      select 1
      from pg_policy
      where polrelid = 'storage.objects'::regclass
        and polcmd = command
        and polroles::text like '%authenticated%'
        and (
          command = 'a' or
          (
            lower(coalesce(pg_get_expr(polqual, polrelid), '')) like '%mivix-media%'
            and lower(coalesce(pg_get_expr(polqual, polrelid), '')) like '%auth.uid()%'
          )
        )
        and (
          command not in ('a', 'w') or
          (
            lower(coalesce(pg_get_expr(polwithcheck, polrelid), '')) like '%mivix-media%'
            and lower(coalesce(pg_get_expr(polwithcheck, polrelid), '')) like '%auth.uid()%'
          )
        )
    ) then
      raise exception 'missing owner-scoped authenticated Storage policy for command %', command;
    end if;
  end loop;
end;
$$;

rollback;
