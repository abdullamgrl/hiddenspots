-- -------------------------------------------------------------
-- SEED DATA FOR STATES
-- -------------------------------------------------------------
insert into public.states (name, slug, code) values
  ('Kerala', 'kerala', 'KL'),
  ('Karnataka', 'karnataka', 'KA'),
  ('Tamil Nadu', 'tamil-nadu', 'TN'),
  ('Goa', 'goa', 'GA'),
  ('Maharashtra', 'maharashtra', 'MH'),
  ('Himachal Pradesh', 'himachal-pradesh', 'HP'),
  ('Delhi', 'delhi', 'DL')
on conflict (slug) do nothing;

-- Get State UUIDs for reference
do $$
declare
  v_kerala_id uuid;
  v_karnataka_id uuid;
  v_tamil_nadu_id uuid;
  v_goa_id uuid;
begin
  select id into v_kerala_id from public.states where slug = 'kerala';
  select id into v_karnataka_id from public.states where slug = 'karnataka';
  select id into v_tamil_nadu_id from public.states where slug = 'tamil-nadu';
  select id into v_goa_id from public.states where slug = 'goa';

  -- -------------------------------------------------------------
  -- SEED DATA FOR DISTRICTS (Kerala focus, then select South India)
  -- -------------------------------------------------------------
  if v_kerala_id is not null then
    insert into public.districts (state_id, name, slug) values
      (v_kerala_id, 'Wayanad', 'wayanad'),
      (v_kerala_id, 'Idukki', 'idukki'),
      (v_kerala_id, 'Kasaragod', 'kasaragod'),
      (v_kerala_id, 'Kozhikode', 'kozhikode'),
      (v_kerala_id, 'Ernakulam', 'ernakulam'),
      (v_kerala_id, 'Alappuzha', 'alappuzha'),
      (v_kerala_id, 'Kottayam', 'kottayam'),
      (v_kerala_id, 'Thrissur', 'thrissur'),
      (v_kerala_id, 'Palakkad', 'palakkad'),
      (v_kerala_id, 'Malappuram', 'malappuram'),
      (v_kerala_id, 'Pathanamthitta', 'pathanamthitta'),
      (v_kerala_id, 'Kollam', 'kollam'),
      (v_kerala_id, 'Thiruvananthapuram', 'thiruvananthapuram'),
      (v_kerala_id, 'Kannur', 'kannur')
    on conflict (state_id, slug) do nothing;
  end if;

  if v_karnataka_id is not null then
    insert into public.districts (state_id, name, slug) values
      (v_karnataka_id, 'Kodagu', 'kodagu'),
      (v_karnataka_id, 'Chikmagalur', 'chikmagalur'),
      (v_karnataka_id, 'Bangalore Urban', 'bangalore-urban'),
      (v_karnataka_id, 'Uttara Kannada', 'uttara-kannada'),
      (v_karnataka_id, 'Udupi', 'udupi'),
      (v_karnataka_id, 'Mysore', 'mysore')
    on conflict (state_id, slug) do nothing;
  end if;

  if v_tamil_nadu_id is not null then
    insert into public.districts (state_id, name, slug) values
      (v_tamil_nadu_id, 'Nilgiris', 'nilgiris'),
      (v_tamil_nadu_id, 'Kanyakumari', 'kanyakumari'),
      (v_tamil_nadu_id, 'Dindigul', 'dindigul'),
      (v_tamil_nadu_id, 'Chennai', 'chennai')
    on conflict (state_id, slug) do nothing;
  end if;

  if v_goa_id is not null then
    insert into public.districts (state_id, name, slug) values
      (v_goa_id, 'North Goa', 'north-goa'),
      (v_goa_id, 'South Goa', 'south-goa')
    on conflict (state_id, slug) do nothing;
  end if;

end $$;

-- -------------------------------------------------------------
-- SEED DATA FOR CATEGORIES
-- -------------------------------------------------------------
insert into public.categories (name, slug, description, icon) values
  ('Waterfalls', 'waterfalls', 'Beautiful cascades hidden in nature.', 'droplets'),
  ('Viewpoints', 'viewpoints', 'Scenic spots offering panoramic landscapes.', 'mountain'),
  ('Beaches', 'beaches', 'Sandy coastlines, sunset points, and serene waves.', 'palmtree'),
  ('Lakes', 'lakes', 'Quiet bodies of fresh water surrounded by nature.', 'waves'),
  ('Rivers', 'rivers', 'Flowing streams, water streams, and backwater spots.', 'navigation'),
  ('Trekking Spots', 'trekking-spots', 'Climbs and summits for outdoor adventure.', 'footprints'),
  ('Camping Spots', 'camping-spots', 'Under-the-stars overnight camping areas.', 'tent'),
  ('Photography Spots', 'photography-spots', 'Visual gems and viewpoints meant for capturing.', 'camera'),
  ('Sunrise Spots', 'sunrise-spots', 'Gems looking east with majestic morning fog.', 'sunrise'),
  ('Sunset Spots', 'sunset-spots', 'Locations offering spectacular evening views.', 'sunset'),
  ('Hidden Gems', 'hidden-gems', 'Highly secluded, lesser-known secret locales.', 'sparkles'),
  ('Tea spot', 'tea-spot', 'Scenic tea gardens, estates, and tea tasting spots.', 'coffee')
on conflict (slug) do nothing;

-- -------------------------------------------------------------
-- SEED DATA FOR GLOBAL TAGS
-- -------------------------------------------------------------
insert into public.tags (name, slug) values
  ('Adventure', 'adventure'),
  ('Nature', 'nature'),
  ('Serene', 'serene'),
  ('Trekking', 'trekking'),
  ('Camping', 'camping'),
  ('Waterfall', 'waterfall'),
  ('Scenic', 'scenic'),
  ('Sunset View', 'sunset-view'),
  ('Sunrise View', 'sunrise-view'),
  ('Photography', 'photography'),
  ('Historic', 'historic'),
  ('Coastal', 'coastal'),
  ('Family Friendly', 'family-friendly'),
  ('Offbeat', 'offbeat'),
  ('Forest', 'forest')
on conflict (slug) do nothing;
