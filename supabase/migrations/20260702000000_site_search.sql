-- -------------------------------------------------------------
-- SITE SEARCH RPC
-- One unified search across spots, districts, states and
-- categories using pg_trgm (already enabled) + prefix matching.
-- SECURITY DEFINER but re-applies public visibility rules
-- (approved + not deleted) so it never leaks hidden spots.
-- -------------------------------------------------------------

create or replace function public.search_site(q text, max_results integer default 12)
returns table (
  kind text,       -- 'spot' | 'district' | 'state' | 'category'
  title text,
  subtitle text,
  url text,
  image text,
  rank real
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with query as (
    select trim(q) as q
  ),
  spot_hits as (
    select
      'spot'::text as kind,
      sp.title,
      d.name || ', ' || st.name as subtitle,
      '/' || st.slug || '/' || d.slug || '/' || sp.slug as url,
      sp.cover_image as image,
      greatest(
        similarity(sp.title, query.q),
        case when sp.title ilike query.q || '%' then 0.9 else 0 end,
        case when sp.title ilike '%' || query.q || '%' then 0.5 else 0 end
      )::real as rank
    from public.spots sp
    join public.states st on st.id = sp.state_id
    join public.districts d on d.id = sp.district_id
    cross join query
    where sp.status = 'approved'
      and sp.is_deleted = false
      and (
        sp.title % query.q
        or sp.title ilike '%' || query.q || '%'
      )
  ),
  district_hits as (
    select
      'district'::text as kind,
      d.name as title,
      st.name as subtitle,
      '/' || st.slug || '/' || d.slug as url,
      null::text as image,
      greatest(
        similarity(d.name, query.q),
        case when d.name ilike query.q || '%' then 0.85 else 0 end
      )::real as rank
    from public.districts d
    join public.states st on st.id = d.state_id
    cross join query
    where d.name % query.q or d.name ilike query.q || '%'
  ),
  state_hits as (
    select
      'state'::text as kind,
      st.name as title,
      'State'::text as subtitle,
      '/' || st.slug as url,
      null::text as image,
      greatest(
        similarity(st.name, query.q),
        case when st.name ilike query.q || '%' then 0.85 else 0 end
      )::real as rank
    from public.states st
    cross join query
    where st.name % query.q or st.name ilike query.q || '%'
  ),
  category_hits as (
    select
      'category'::text as kind,
      c.name as title,
      'Category'::text as subtitle,
      '/category/' || c.slug as url,
      null::text as image,
      greatest(
        similarity(c.name, query.q),
        case when c.name ilike query.q || '%' then 0.85 else 0 end,
        case when c.name ilike '%' || query.q || '%' then 0.5 else 0 end
      )::real as rank
    from public.categories c
    cross join query
    where c.name % query.q or c.name ilike '%' || query.q || '%'
  )
  select * from (
    select * from spot_hits
    union all
    select * from district_hits
    union all
    select * from state_hits
    union all
    select * from category_hits
  ) hits
  where rank > 0.12
  order by rank desc, title asc
  limit greatest(1, least(max_results, 30));
$$;

grant execute on function public.search_site(text, integer) to anon, authenticated;
