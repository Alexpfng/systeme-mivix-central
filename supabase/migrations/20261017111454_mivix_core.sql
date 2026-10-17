create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  relationship text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'idea' check (status in ('idea', 'exploring', 'preparing', 'active', 'paused', 'launched', 'archived')),
  color text,
  symbol text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content_type text not null,
  body text,
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entity_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, source_type, source_id, target_type, target_id)
);

create table public.astrology_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  name text not null,
  birth_date date,
  birth_time time,
  birth_place text,
  chart_data jsonb not null default '{}'::jsonb,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null check (action in ('summarize', 'analyze', 'compare')),
  content text not null,
  source_data jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_owner_id_idx on public.contacts(owner_id);
create index contacts_profile_id_idx on public.contacts(profile_id);
create index projects_owner_id_idx on public.projects(owner_id);
create index content_items_owner_id_idx on public.content_items(owner_id);
create index media_assets_owner_id_idx on public.media_assets(owner_id);
create index entity_links_owner_source_idx on public.entity_links(owner_id, source_type, source_id);
create index entity_links_owner_target_idx on public.entity_links(owner_id, target_type, target_id);
create index astrology_profiles_owner_id_idx on public.astrology_profiles(owner_id);
create index astrology_profiles_contact_id_idx on public.astrology_profiles(contact_id);
create index ai_summaries_owner_entity_idx on public.ai_summaries(owner_id, entity_type, entity_id);

grant select, insert, update, delete on table
  public.profiles,
  public.contacts,
  public.projects,
  public.content_items,
  public.media_assets,
  public.entity_links,
  public.astrology_profiles,
  public.ai_summaries
to authenticated;

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.projects enable row level security;
alter table public.content_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.entity_links enable row level security;
alter table public.astrology_profiles enable row level security;
alter table public.ai_summaries enable row level security;

create policy profiles_select_owner on public.profiles
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy profiles_insert_owner on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy profiles_update_owner on public.profiles
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy profiles_delete_owner on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy contacts_select_owner on public.contacts
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy contacts_insert_owner on public.contacts
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy contacts_update_owner on public.contacts
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy contacts_delete_owner on public.contacts
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy projects_select_owner on public.projects
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy projects_insert_owner on public.projects
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy projects_update_owner on public.projects
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy projects_delete_owner on public.projects
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy content_items_select_owner on public.content_items
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy content_items_insert_owner on public.content_items
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy content_items_update_owner on public.content_items
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy content_items_delete_owner on public.content_items
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy media_assets_select_owner on public.media_assets
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy media_assets_insert_owner on public.media_assets
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy media_assets_update_owner on public.media_assets
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy media_assets_delete_owner on public.media_assets
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy entity_links_select_owner on public.entity_links
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy entity_links_insert_owner on public.entity_links
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy entity_links_update_owner on public.entity_links
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy entity_links_delete_owner on public.entity_links
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy astrology_profiles_select_owner on public.astrology_profiles
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy astrology_profiles_insert_owner on public.astrology_profiles
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy astrology_profiles_update_owner on public.astrology_profiles
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy astrology_profiles_delete_owner on public.astrology_profiles
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy ai_summaries_select_owner on public.ai_summaries
  for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy ai_summaries_insert_owner on public.ai_summaries
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);
create policy ai_summaries_update_owner on public.ai_summaries
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy ai_summaries_delete_owner on public.ai_summaries
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public)
values ('mivix-media', 'mivix-media', false)
on conflict (id) do update set public = false;

create policy mivix_media_select_owner on storage.objects
  for select to authenticated
  using (
    bucket_id = 'mivix-media'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
create policy mivix_media_insert_owner on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'mivix-media'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
create policy mivix_media_update_owner on storage.objects
  for update to authenticated
  using (
    bucket_id = 'mivix-media'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'mivix-media'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
create policy mivix_media_delete_owner on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'mivix-media'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
