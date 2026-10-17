begin;

select plan(27);

select tests.create_supabase_user('owner@mivix.test');
select tests.create_supabase_user('other@mivix.test');

select tests.authenticate_as('owner@mivix.test');

select lives_ok($sql$
  insert into public.profiles (owner_id, display_name)
  values (tests.get_supabase_uid('owner@mivix.test'), 'Owner profile');
$sql$, 'owner can insert their profile');

select lives_ok($sql$
  insert into public.contacts (owner_id, profile_id, full_name)
  values (
    tests.get_supabase_uid('owner@mivix.test'),
    (select id from public.profiles where owner_id = tests.get_supabase_uid('owner@mivix.test')),
    'Owner contact'
  );
$sql$, 'owner can insert their contact with their profile');

select is(
  (select count(*)::integer from public.contacts
   where owner_id = tests.get_supabase_uid('owner@mivix.test')),
  1,
  'owner can select their contact'
);

select lives_ok($sql$
  insert into public.astrology_profiles (owner_id, contact_id, name)
  values (
    tests.get_supabase_uid('owner@mivix.test'),
    (select id from public.contacts where owner_id = tests.get_supabase_uid('owner@mivix.test')),
    'Owner astrology profile'
  );
$sql$, 'owner can insert their astrology profile');

select is(
  (select count(*)::integer from public.astrology_profiles
   where owner_id = tests.get_supabase_uid('owner@mivix.test')),
  1,
  'owner can select their astrology profile'
);

select lives_ok($sql$
  update public.contacts set full_name = 'Owner contact updated'
  where owner_id = tests.get_supabase_uid('owner@mivix.test');
$sql$, 'owner can update their contact');

select lives_ok($sql$
  update public.astrology_profiles set name = 'Owner astrology profile updated'
  where owner_id = tests.get_supabase_uid('owner@mivix.test');
$sql$, 'owner can update their astrology profile');

select tests.authenticate_as('other@mivix.test');

select is(
  (select count(*)::integer from public.contacts),
  0,
  'other user cannot select owner contact'
);

select is(
  (select count(*)::integer from public.astrology_profiles),
  0,
  'other user cannot select owner astrology profile'
);

select throws_ok($sql$
  insert into public.contacts (owner_id, profile_id, full_name)
  values (
    tests.get_supabase_uid('owner@mivix.test'),
    (select id from public.profiles where owner_id = tests.get_supabase_uid('owner@mivix.test')),
    'Cross-owner contact'
  );
$sql$, '42501', 'other user cannot insert a contact owned by owner');

select throws_ok($sql$
  insert into public.astrology_profiles (owner_id, contact_id, name)
  values (
    tests.get_supabase_uid('owner@mivix.test'),
    (select id from public.contacts where owner_id = tests.get_supabase_uid('owner@mivix.test')),
    'Cross-owner astrology profile'
  );
$sql$, '42501', 'other user cannot insert an astrology profile owned by owner');

select is(
  (with changed as (
    update public.contacts set full_name = 'Blocked update'
    where id = (select id from public.contacts where owner_id = tests.get_supabase_uid('owner@mivix.test'))
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot update owner contact'
);

select is(
  (with changed as (
    update public.astrology_profiles set name = 'Blocked update'
    where id = (select id from public.astrology_profiles where owner_id = tests.get_supabase_uid('owner@mivix.test'))
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot update owner astrology profile'
);

select is(
  (with changed as (
    delete from public.contacts
    where id = (select id from public.contacts where owner_id = tests.get_supabase_uid('owner@mivix.test'))
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot delete owner contact'
);

select is(
  (with changed as (
    delete from public.astrology_profiles
    where id = (select id from public.astrology_profiles where owner_id = tests.get_supabase_uid('owner@mivix.test'))
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot delete owner astrology profile'
);

select lives_ok($sql$
  insert into public.profiles (owner_id, display_name)
  values (tests.get_supabase_uid('other@mivix.test'), 'Other profile');
$sql$, 'other user can insert their own profile for FK testing');

select tests.authenticate_as('owner@mivix.test');

select throws_ok($sql$
  insert into public.contacts (owner_id, profile_id, full_name)
  values (
    tests.get_supabase_uid('owner@mivix.test'),
    (select id from public.profiles where owner_id = tests.get_supabase_uid('other@mivix.test')),
    'Cross-owner relation'
  );
$sql$, '23503', 'composite profile FK rejects a cross-owner reference');

select lives_ok($sql$
  insert into storage.objects (bucket_id, name, metadata)
  values ('mivix-media', tests.get_supabase_uid('owner@mivix.test') || '/owned.txt', '{}'::jsonb);
$sql$, 'owner can insert an object under their Storage path');

select is(
  (select count(*)::integer from storage.objects
   where bucket_id = 'mivix-media'
     and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt'),
  1,
  'owner can select their Storage object'
);

select tests.authenticate_as('other@mivix.test');

select is(
  (select count(*)::integer from storage.objects
   where bucket_id = 'mivix-media'
     and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt'),
  0,
  'other user cannot select owner Storage object'
);

select throws_ok($sql$
  insert into storage.objects (bucket_id, name, metadata)
  values ('mivix-media', tests.get_supabase_uid('owner@mivix.test') || '/other.txt', '{}'::jsonb);
$sql$, '42501', 'other user cannot insert under owner Storage path');

select tests.authenticate_as('owner@mivix.test');

select lives_ok($sql$
  update storage.objects set metadata = '{"updated": true}'::jsonb
  where bucket_id = 'mivix-media'
    and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt';
$sql$, 'owner can update their Storage object');

select tests.authenticate_as('other@mivix.test');

select is(
  (with changed as (
    update storage.objects set metadata = '{"blocked": true}'::jsonb
    where bucket_id = 'mivix-media'
      and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt'
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot update owner Storage object'
);

select is(
  (with changed as (
    delete from storage.objects
    where bucket_id = 'mivix-media'
      and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt'
    returning id
  ) select count(*)::integer from changed),
  0,
  'other user cannot delete owner Storage object'
);

select tests.authenticate_as('owner@mivix.test');

select lives_ok($sql$
  delete from storage.objects
  where bucket_id = 'mivix-media'
    and name = tests.get_supabase_uid('owner@mivix.test') || '/owned.txt';
$sql$, 'owner can delete their Storage object');

select lives_ok($sql$
  delete from public.astrology_profiles
  where owner_id = tests.get_supabase_uid('owner@mivix.test');
$sql$, 'owner can delete their astrology profile');

select lives_ok($sql$
  delete from public.contacts
  where owner_id = tests.get_supabase_uid('owner@mivix.test');
$sql$, 'owner can delete their contact');

select * from finish();
rollback;
