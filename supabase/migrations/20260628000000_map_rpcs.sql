-- -------------------------------------------------------------
-- MAP DISCOVERY RPCs
-- Read-only helpers powering the geographic reel-discovery map.
-- Both are SECURITY DEFINER but explicitly re-apply the public
-- visibility rules (approved + not deleted) so they never leak
-- spots/reels that RLS would otherwise hide.
-- -------------------------------------------------------------

-- 1. get_map_spots
-- Returns a minimal GeoJSON FeatureCollection of approved spots that
-- have at least one Instagram reel and fall inside the given viewport
-- bbox. Designed for a MapLibre GeoJSON source with client clustering,
-- so the payload is intentionally tiny (no descriptions, no joins to
-- heavy columns). The bbox predicate uses the geography `&&` operator
-- so it is served by the existing GiST index `idx_spots_location_gis`.
--
-- `zoom` is accepted for forward-compatibility (future server-side grid
-- aggregation at low zoom); it is currently unused.
create or replace function public.get_map_spots(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
  zoom integer default 0,
  p_category uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  with spot_rows as (
    select
      sp.id,
      sp.title,
      sp.slug,
      sp.cover_image,
      sp.longitude,
      sp.latitude,
      st.slug as state_slug,
      d.slug  as district_slug,
      rc.reel_count
    from public.spots sp
    join public.states st on st.id = sp.state_id
    join public.districts d on d.id = sp.district_id
    cross join lateral (
      select count(*)::int as reel_count
      from public.spot_social_links l
      where l.spot_id = sp.id
        and l.platform = 'instagram'
    ) rc
    where sp.status = 'approved'
      and sp.is_deleted = false
      and sp.location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
      and (p_category is null or sp.category_id = p_category)
      and rc.reel_count > 0
  )
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'type', 'Feature',
          'geometry', jsonb_build_object(
            'type', 'Point',
            'coordinates', jsonb_build_array(longitude, latitude)
          ),
          'properties', jsonb_build_object(
            'id', id,
            'title', title,
            'slug', slug,
            'cover_image', cover_image,
            'state_slug', state_slug,
            'district_slug', district_slug,
            'reel_count', reel_count
          )
        )
      ),
      '[]'::jsonb
    )
  )
  from spot_rows;
$$;

-- 2. get_spot_reels
-- Lazily fetched when a map marker preview is opened. Returns the
-- Instagram reels for a single spot, ordered oldest-first. Joined to
-- spots so reels of unapproved/deleted spots are never exposed.
create or replace function public.get_spot_reels(p_spot_id uuid)
returns table (
  id uuid,
  url text,
  platform text,
  created_at timestamp with time zone
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select l.id, l.url, l.platform, l.created_at
  from public.spot_social_links l
  join public.spots s on s.id = l.spot_id
  where l.spot_id = p_spot_id
    and l.platform = 'instagram'
    and s.status = 'approved'
    and s.is_deleted = false
  order by l.created_at asc;
$$;

-- Expose both to the public (anon) and signed-in roles.
grant execute on function public.get_map_spots(double precision, double precision, double precision, double precision, integer, uuid) to anon, authenticated;
grant execute on function public.get_spot_reels(uuid) to anon, authenticated;
