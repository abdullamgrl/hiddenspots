-- -------------------------------------------------------------
-- NEARBY SPOTS RPC
-- Distance-sorted approved spots within a radius of the caller's
-- coordinates. Served by the existing GiST index on spots.location.
-- SECURITY DEFINER but re-applies public visibility rules.
-- The caller's coordinates are used only for this query and are
-- never stored.
-- -------------------------------------------------------------

create or replace function public.get_nearby_spots(
  p_lat double precision,
  p_lng double precision,
  radius_km double precision default 50,
  max_results integer default 24
)
returns table (
  id uuid,
  title text,
  slug text,
  cover_image text,
  state_slug text,
  district_slug text,
  district_name text,
  state_name text,
  category_name text,
  verification_score integer,
  latitude double precision,
  longitude double precision,
  reel_count integer,
  distance_km double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    sp.id,
    sp.title,
    sp.slug,
    sp.cover_image,
    st.slug as state_slug,
    d.slug as district_slug,
    d.name as district_name,
    st.name as state_name,
    c.name as category_name,
    sp.verification_score,
    sp.latitude,
    sp.longitude,
    (
      select count(*)::int
      from public.spot_social_links l
      where l.spot_id = sp.id and l.platform = 'instagram'
    ) as reel_count,
    round(
      (st_distance(
        sp.location,
        st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
      ) / 1000.0)::numeric,
      1
    )::double precision as distance_km
  from public.spots sp
  join public.states st on st.id = sp.state_id
  join public.districts d on d.id = sp.district_id
  join public.categories c on c.id = sp.category_id
  where sp.status = 'approved'
    and sp.is_deleted = false
    and st_dwithin(
      sp.location,
      st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
      greatest(1, least(radius_km, 500)) * 1000
    )
  order by st_distance(
    sp.location,
    st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
  ) asc
  limit greatest(1, least(max_results, 50));
$$;

grant execute on function public.get_nearby_spots(double precision, double precision, double precision, integer) to anon, authenticated;
