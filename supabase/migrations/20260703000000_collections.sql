-- -------------------------------------------------------------
-- SHAREABLE COLLECTIONS
-- Named collections of saved spots. Private by default; a public
-- collection is readable by anyone (page: /collections/<user>/<slug>).
-- Existing saved_spots rows keep collection_id = null ("all saved").
-- -------------------------------------------------------------

create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (char_length(name) between 1 and 60),
  slug text not null check (slug ~ '^[a-z0-9-]{1,80}$'),
  description text,
  is_public boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (profile_id, slug)
);
alter table public.collections enable row level security;
create index idx_collections_profile_id on public.collections(profile_id);

create trigger update_collections_updated_at
  before update on public.collections
  for each row execute procedure public.update_updated_at_column();

-- Link saved spots to an optional collection.
alter table public.saved_spots
  add column collection_id uuid references public.collections(id) on delete set null;
create index idx_saved_spots_collection_id on public.saved_spots(collection_id);

-- RLS: owners manage their own collections; public ones are world-readable.
create policy "Allow owners to manage own collections" on public.collections
  for all using (auth.uid() = profile_id);

create policy "Allow public read of public collections" on public.collections
  for select using (is_public = true);

-- RLS: items inside a public collection are world-readable (the joined spots
-- are still filtered by the spots policies, so only approved spots surface).
create policy "Allow public read of items in public collections" on public.saved_spots
  for select using (
    exists (
      select 1 from public.collections c
      where c.id = saved_spots.collection_id and c.is_public = true
    )
  );
