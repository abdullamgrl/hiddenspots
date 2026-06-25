-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";

-- -------------------------------------------------------------
-- TABLES DEFINITION
-- -------------------------------------------------------------

-- 1. States Table
create table public.states (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  code varchar(5) unique not null
);
alter table public.states enable row level security;
create index idx_states_slug on public.states(slug);

-- 2. Districts Table
create table public.districts (
  id uuid default uuid_generate_v4() primary key,
  state_id uuid references public.states(id) on delete cascade not null,
  name text not null,
  slug text not null,
  unique (state_id, name),
  unique (state_id, slug)
);
alter table public.districts enable row level security;
create index idx_districts_slug on public.districts(slug);
create index idx_districts_state_id on public.districts(state_id);

-- 3. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique check (char_length(username) >= 3),
  full_name text,
  avatar_url text,
  phone text unique,
  role text not null default 'contributor' check (role in ('visitor', 'contributor', 'moderator', 'admin')),
  reputation_score integer not null default 10 check (reputation_score >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create index idx_profiles_username on public.profiles(username);

-- 4. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.categories enable row level security;

-- 5. Spots Table
create table public.spots (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text not null,
  short_description varchar(250) not null,
  latitude double precision not null,
  longitude double precision not null,
  location geography(Point, 4326),
  address text not null,
  state_id uuid references public.states(id) on delete restrict not null,
  district_id uuid references public.districts(id) on delete restrict not null,
  category_id uuid references public.categories(id) on delete restrict not null,
  cover_image text not null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected')),
  is_deleted boolean not null default false,
  verification_score integer not null default 10 check (verification_score >= 0 and verification_score <= 100),
  best_time_to_visit text,
  difficulty_level text check (difficulty_level in ('easy', 'moderate', 'challenging', 'extreme')),
  entry_fee numeric(10,2) default 0.00 not null,
  parking_available boolean default false not null,
  family_friendly boolean default false not null,
  pet_friendly boolean default false not null,
  requires_trek boolean default false not null,
  trek_distance_km numeric(5,2) default 0.00 not null,
  estimated_visit_duration text,
  safety_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.spots enable row level security;

-- Indexing for Spots
create index idx_spots_location_gis on public.spots using gist(location);
create index idx_spots_status_is_deleted on public.spots(status, is_deleted);
create index idx_spots_state_district on public.spots(state_id, district_id);
create index idx_spots_category_id on public.spots(category_id);
create index idx_spots_slug on public.spots(slug);
create index idx_spots_trgm_title on public.spots using gin(title gin_trgm_ops);

-- 6. Spot Images Table
create table public.spot_images (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  image_url text not null,
  is_cover boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.spot_images enable row level security;
create index idx_spot_images_spot_id on public.spot_images(spot_id);

-- 7. Spot Social Links Table
create table public.spot_social_links (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  platform text not null check (platform in ('instagram', 'youtube', 'facebook', 'threads', 'blog', 'other')),
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.spot_social_links enable row level security;
create index idx_social_links_spot_id on public.spot_social_links(spot_id);
create index idx_social_links_url on public.spot_social_links(url);

-- 8. Tags & Join Tables
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null
);
alter table public.tags enable row level security;

create table public.spot_tags (
  spot_id uuid references public.spots(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (spot_id, tag_id)
);
alter table public.spot_tags enable row level security;

-- 9. Saved Spots Table
create table public.saved_spots (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  spot_id uuid references public.spots(id) on delete cascade not null,
  collection_name text not null default 'Favorites',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (profile_id, spot_id, collection_name)
);
alter table public.saved_spots enable row level security;
create index idx_saved_spots_profile_id on public.saved_spots(profile_id);

-- 10. Spot Reports Table
create table public.spot_reports (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  report_type text not null check (report_type in ('incorrect_location', 'duplicate', 'spam', 'inappropriate', 'dangerous')),
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);
alter table public.spot_reports enable row level security;
create index idx_spot_reports_status on public.spot_reports(status);

-- 11. Moderation Actions Table
create table public.moderation_actions (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  moderator_id uuid references public.profiles(id) on delete set null not null,
  action_type text not null check (action_type in ('approve', 'reject', 'request_changes', 'soft_delete', 'restore')),
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.moderation_actions enable row level security;

-- 12. Featured Spots Table
create table public.featured_spots (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  featured_by uuid references public.profiles(id) on delete set null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.featured_spots enable row level security;

-- 13. Audit Logs Table
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audit_logs enable row level security;

-- 14. Site Settings Table
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.site_settings enable row level security;

-- -------------------------------------------------------------
-- TRIGGERS & PROCEDURES (COORDINATES & AUDITS)
-- -------------------------------------------------------------

-- Automatically sync lat/lon to geography field
create or replace function public.sync_spot_location()
returns trigger as $$
begin
  new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_spot_coords_changed
  before insert or update of latitude, longitude on public.spots
  for each row execute procedure public.sync_spot_location();

-- Sync user profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.phone,
    'contributor'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updating updated_at columns
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at_column();
create trigger update_categories_updated_at before update on public.categories for each row execute procedure public.update_updated_at_column();
create trigger update_spots_updated_at before update on public.spots for each row execute procedure public.update_updated_at_column();

-- -------------------------------------------------------------
-- SCORING ALGORITHMS (TRIGGERS & DB CALLS)
-- -------------------------------------------------------------

-- Spot verification score recalculator
create or replace function public.recalculate_spot_score(target_spot_id uuid)
returns void as $$
declare
  v_score integer := 10; -- Base
  v_images_count integer := 0;
  v_social_count integer := 0;
  v_creator_id uuid;
  v_creator_rep integer := 10;
  v_reports_count integer := 0;
  v_status text;
  v_is_deleted boolean;
begin
  -- Get spot status and creator
  select status, created_by, is_deleted into v_status, v_creator_id, v_is_deleted
  from public.spots where id = target_spot_id;

  if v_is_deleted = true then
    update public.spots set verification_score = 0 where id = target_spot_id;
    return;
  end if;

  if v_status = 'approved' then
    v_score := v_score + 30;
  end if;

  -- Image count points
  select count(*) into v_images_count
  from public.spot_images where spot_id = target_spot_id;
  if v_images_count >= 3 then
    v_score := v_score + 10;
  elsif v_images_count > 0 then
    v_score := v_score + 5;
  end if;

  -- Social links points
  select count(*) into v_social_count
  from public.spot_social_links where spot_id = target_spot_id;
  if v_social_count >= 1 then
    v_score := v_score + 15;
  end if;

  -- Creator reputation points (capped at +15)
  if v_creator_id is not null then
    select reputation_score into v_creator_rep
    from public.profiles where id = v_creator_id;
    v_score := v_score + greatest(0, least(15, (v_creator_rep / 10)::integer));
  end if;

  -- Reports deduction
  select count(*) into v_reports_count
  from public.spot_reports
  where spot_id = target_spot_id and status = 'pending';
  v_score := v_score - (v_reports_count * 15);

  -- Keep score within 0 to 100
  v_score := greatest(0, least(100, v_score));

  -- Update spot
  update public.spots
  set verification_score = v_score
  where id = target_spot_id;
end;
$$ language plpgsql security definer;

-- Trigger to recalculate score on changes to Spot dependencies
create or replace function public.on_spot_dependency_changed()
returns trigger as $$
begin
  if TG_OP = 'DELETE' then
    perform public.recalculate_spot_score(old.spot_id);
    return old;
  else
    perform public.recalculate_spot_score(new.spot_id);
    return new;
  end if;
end;
$$ language plpgsql security definer;

create trigger trg_spot_images_changed after insert or update or delete on public.spot_images for each row execute procedure public.on_spot_dependency_changed();
create trigger trg_spot_socials_changed after insert or update or delete on public.spot_social_links for each row execute procedure public.on_spot_dependency_changed();
create trigger trg_spot_reports_changed after insert or update or delete on public.spot_reports for each row execute procedure public.on_spot_dependency_changed();

-- User reputation score recalculator
create or replace function public.recalculate_user_reputation(target_user_id uuid)
returns void as $$
declare
  v_rep integer := 10; -- Base reputation
  v_approved_count integer := 0;
  v_featured_count integer := 0;
  v_rejected_count integer := 0;
  v_spam_reports_count integer := 0;
begin
  -- Approved spots (+10 each)
  select count(*) into v_approved_count
  from public.spots
  where created_by = target_user_id and status = 'approved' and is_deleted = false;
  v_rep := v_rep + (v_approved_count * 10);

  -- Featured spots (+20 each)
  select count(*) into v_featured_count
  from public.featured_spots fs
  join public.spots s on fs.spot_id = s.id
  where s.created_by = target_user_id;
  v_rep := v_rep + (v_featured_count * 20);

  -- Rejected spots (-5 each)
  select count(*) into v_rejected_count
  from public.spots
  where created_by = target_user_id and status = 'rejected' and is_deleted = false;
  v_rep := v_rep - (v_rejected_count * 5);

  -- Spam/Inappropriate reports resolved on user's spots (-30 each)
  select count(*) into v_spam_reports_count
  from public.spot_reports r
  join public.spots s on r.spot_id = s.id
  where s.created_by = target_user_id
    and r.status = 'resolved'
    and r.report_type in ('spam', 'inappropriate');
  v_rep := v_rep - (v_spam_reports_count * 30);

  -- Keep reputation non-negative
  v_rep := greatest(0, v_rep);

  -- Update profiles
  update public.profiles
  set reputation_score = v_rep
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- Trigger user reputation updates on spot changes
create or replace function public.on_user_spots_reputation_trigger()
returns trigger as $$
declare
  v_user_id uuid;
begin
  if TG_OP = 'DELETE' then
    v_user_id := old.created_by;
  else
    v_user_id := new.created_by;
  end if;

  if v_user_id is not null then
    perform public.recalculate_user_reputation(v_user_id);
  end if;

  return null;
end;
$$ language plpgsql security definer;

create trigger trg_user_spots_changed after insert or update of status, is_deleted or delete on public.spots for each row execute procedure public.on_user_spots_reputation_trigger();

-- -------------------------------------------------------------
-- DUPLICATE DETECTION FUNCTION
-- -------------------------------------------------------------
create or replace function public.check_duplicate_spot(
  input_lat double precision,
  input_lon double precision,
  input_title text,
  input_district_id uuid,
  input_social_urls text[]
)
returns table (
  duplicate_spot_id uuid,
  confidence_score integer,
  match_reason text
) as $$
declare
  matching_spot_id uuid;
  social_match_url text;
  dist double precision;
begin
  -- 1. Check exact social link match in spot_social_links
  if input_social_urls is not null and array_length(input_social_urls, 1) > 0 then
    select url, spot_id into social_match_url, matching_spot_id
    from public.spot_social_links
    where url = any(input_social_urls)
    limit 1;

    if matching_spot_id is not null then
      return query select matching_spot_id, 100, 'Duplicate social link: ' || social_match_url;
      return;
    end if;
  end if;

  -- 2. Check for spots within 100 meters using PostGIS
  select id, st_distance(location, st_setsrid(st_makepoint(input_lon, input_lat), 4326)::geography)
  into matching_spot_id, dist
  from public.spots
  where st_dwithin(location, st_setsrid(st_makepoint(input_lon, input_lat), 4326)::geography, 100)
    and is_deleted = false
  order by st_distance(location, st_setsrid(st_makepoint(input_lon, input_lat), 4326)::geography) asc
  limit 1;

  if matching_spot_id is not null then
    -- Combine with title similarity check
    select id into matching_spot_id
    from public.spots
    where id = matching_spot_id
      and (similarity(title, input_title) > 0.4 or title ilike '%' || input_title || '%');

    if matching_spot_id is not null then
      return query select matching_spot_id, 95, 'Within 100m with similar title (distance: ' || round(dist::numeric, 1) || 'm)';
    else
      return query select matching_spot_id, 75, 'Location match within 100m (distance: ' || round(dist::numeric, 1) || 'm)';
    end if;
    return;
  end if;

  -- 3. Check for similar title in the same district using trigram similarity
  select id into matching_spot_id
  from public.spots
  where district_id = input_district_id
    and is_deleted = false
    and (similarity(title, input_title) > 0.7 or title ilike input_title)
  limit 1;

  if matching_spot_id is not null then
    return query select matching_spot_id, 60, 'Similar title in the same district';
    return;
  end if;

  return;
end;
$$ language plpgsql security definer;

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

-- States
create policy "Allow public read access to states" on public.states for select using (true);
create policy "Allow admins to manage states" on public.states for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Districts
create policy "Allow public read access to districts" on public.districts for select using (true);
create policy "Allow admins to manage districts" on public.districts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Profiles
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories
create policy "Allow public read access to categories" on public.categories for select using (true);
create policy "Allow admins to manage categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Spots
create policy "Allow public read access to approved spots" on public.spots
  for select using (status = 'approved' and is_deleted = false);

create policy "Allow creators/moderators to view all status spots" on public.spots
  for select using (
    auth.uid() = created_by or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
  );

create policy "Allow authenticated users to create spots" on public.spots
  for insert with check (
    auth.uid() is not null and
    status = 'pending' and
    is_deleted = false
  );

create policy "Allow owners/moderators to edit spots" on public.spots
  for update using (
    (auth.uid() = created_by and status in ('draft', 'pending')) or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
  );

-- Spot Images
create policy "Allow public read access to images" on public.spot_images for select using (true);
create policy "Allow spot owners/moderators to manage images" on public.spot_images
  for all using (
    exists (
      select 1 from public.spots s
      where s.id = spot_images.spot_id and (
        s.created_by = auth.uid() or
        exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
      )
    )
  );

-- Spot Social Links
create policy "Allow public read access to social links" on public.spot_social_links for select using (true);
create policy "Allow spot owners/moderators to manage social links" on public.spot_social_links
  for all using (
    exists (
      select 1 from public.spots s
      where s.id = spot_social_links.spot_id and (
        s.created_by = auth.uid() or
        exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
      )
    )
  );

-- Tags & Spot Tags
create policy "Allow public read to tags" on public.tags for select using (true);
create policy "Allow public read to spot tags" on public.spot_tags for select using (true);
create policy "Allow authenticated users to write tags" on public.tags for all using (auth.uid() is not null);
create policy "Allow authenticated users to write spot tags" on public.spot_tags for all using (auth.uid() is not null);

-- Saved Spots
create policy "Allow users to view own bookmarks" on public.saved_spots for select using (auth.uid() = profile_id);
create policy "Allow users to manage own bookmarks" on public.saved_spots for all using (auth.uid() = profile_id);

-- Spot Reports
create policy "Allow visitors to submit reports" on public.spot_reports for insert with check (true);
create policy "Allow moderators to manage reports" on public.spot_reports for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
);

-- Moderation Actions
create policy "Allow moderators to view/write audit actions" on public.moderation_actions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
);

-- Featured Spots
create policy "Allow public read access to featured spots" on public.featured_spots for select using (true);
create policy "Allow admins to manage featured spots" on public.featured_spots for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Audit Logs
create policy "Allow admins to view audit logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Site Settings
create policy "Allow public read access to settings" on public.site_settings for select using (true);
create policy "Allow admins to write settings" on public.site_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
