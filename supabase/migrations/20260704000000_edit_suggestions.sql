-- -------------------------------------------------------------
-- COMMUNITY EDIT SUGGESTIONS
-- "Suggest an edit" on spot detail pages: users propose field-level
-- fixes as {field: {from, to}} diffs; moderators review a diff and
-- approve (auto-applies to the spot) or reject. Approved edits feed
-- the contributor's reputation.
-- -------------------------------------------------------------

-- 1. Table
create table public.spot_edit_suggestions (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  suggested_by uuid references public.profiles(id) on delete set null,
  -- {field: {"from": <current value at suggestion time>, "to": <proposed>}}
  changes jsonb not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone
);
alter table public.spot_edit_suggestions enable row level security;

create index idx_edit_suggestions_status on public.spot_edit_suggestions(status);
create index idx_edit_suggestions_spot on public.spot_edit_suggestions(spot_id);
create index idx_edit_suggestions_user on public.spot_edit_suggestions(suggested_by);

-- One open suggestion per user per spot keeps spam bounded.
create unique index idx_edit_suggestions_one_pending
  on public.spot_edit_suggestions(spot_id, suggested_by)
  where status = 'pending';

-- 2. The single source of truth for which spot fields the community may edit.
create or replace function public.editable_spot_fields()
returns text[]
language sql immutable
as $$
  select array[
    'description', 'short_description', 'address',
    'best_time_to_visit', 'estimated_visit_duration', 'difficulty_level',
    'entry_fee', 'parking_available', 'family_friendly', 'pet_friendly',
    'requires_trek', 'trek_distance_km', 'safety_notes'
  ];
$$;

-- 3. Shape validation on insert: object, non-empty, whitelisted keys,
-- every entry carrying a "to" value.
create or replace function public.validate_edit_suggestion()
returns trigger as $$
declare
  k text;
begin
  if jsonb_typeof(new.changes) <> 'object' then
    raise exception 'changes must be a JSON object';
  end if;
  if new.changes = '{}'::jsonb then
    raise exception 'changes must contain at least one field';
  end if;
  for k in select jsonb_object_keys(new.changes) loop
    if not (k = any (public.editable_spot_fields())) then
      raise exception 'field "%" is not editable', k;
    end if;
    if jsonb_typeof(new.changes->k) <> 'object' or not (new.changes->k ? 'to') then
      raise exception 'entry for "%" must be an object with a "to" value', k;
    end if;
  end loop;
  return new;
end;
$$ language plpgsql;

create trigger trg_validate_edit_suggestion
  before insert on public.spot_edit_suggestions
  for each row execute procedure public.validate_edit_suggestion();

-- 4. RLS
create policy "Users see own suggestions, moderators see all"
  on public.spot_edit_suggestions for select using (
    suggested_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
  );

create policy "Authenticated users suggest edits on live spots"
  on public.spot_edit_suggestions for insert with check (
    auth.uid() is not null and
    suggested_by = auth.uid() and
    status = 'pending' and
    reviewed_by is null and
    exists (
      select 1 from public.spots s
      where s.id = spot_id and s.status = 'approved' and s.is_deleted = false
    )
  );

-- Review happens exclusively through the RPC below (security definer);
-- no direct update/delete policies on purpose.

-- 5. Reputation: approved edits now earn +5 each.
create or replace function public.recalculate_user_reputation(target_user_id uuid)
returns void as $$
declare
  v_rep integer := 10; -- Base reputation
  v_approved_count integer := 0;
  v_featured_count integer := 0;
  v_rejected_count integer := 0;
  v_spam_reports_count integer := 0;
  v_approved_edits integer := 0;
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

  -- Approved edit suggestions (+5 each)
  select count(*) into v_approved_edits
  from public.spot_edit_suggestions
  where suggested_by = target_user_id and status = 'approved';
  v_rep := v_rep + (v_approved_edits * 5);

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

  v_rep := greatest(0, v_rep);

  update public.profiles
  set reputation_score = v_rep
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- 6. Moderator review: approve applies the whitelisted diff to the spot,
-- records the action, and refreshes the contributor's reputation — one call.
create or replace function public.review_edit_suggestion(
  p_suggestion_id uuid,
  p_action text,          -- 'approve' | 'reject'
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sug public.spot_edit_suggestions%rowtype;
  v_ch jsonb;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  ) then
    raise exception 'Only moderators can review edit suggestions';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception 'action must be approve or reject';
  end if;

  select * into v_sug
  from public.spot_edit_suggestions
  where id = p_suggestion_id
  for update;

  if not found then
    raise exception 'Suggestion not found';
  end if;
  if v_sug.status <> 'pending' then
    raise exception 'Suggestion was already reviewed';
  end if;

  if p_action = 'approve' then
    v_ch := v_sug.changes;
    update public.spots s set
      description       = case when v_ch ? 'description'       then v_ch->'description'->>'to'                        else s.description end,
      short_description = case when v_ch ? 'short_description' then v_ch->'short_description'->>'to'                  else s.short_description end,
      address           = case when v_ch ? 'address'           then v_ch->'address'->>'to'                            else s.address end,
      best_time_to_visit        = case when v_ch ? 'best_time_to_visit'        then v_ch->'best_time_to_visit'->>'to'        else s.best_time_to_visit end,
      estimated_visit_duration  = case when v_ch ? 'estimated_visit_duration'  then v_ch->'estimated_visit_duration'->>'to'  else s.estimated_visit_duration end,
      difficulty_level  = case when v_ch ? 'difficulty_level'  then nullif(v_ch->'difficulty_level'->>'to', '')       else s.difficulty_level end,
      entry_fee         = case when v_ch ? 'entry_fee'         then coalesce((v_ch->'entry_fee'->>'to')::numeric, 0)  else s.entry_fee end,
      parking_available = case when v_ch ? 'parking_available' then coalesce((v_ch->'parking_available'->>'to')::boolean, false) else s.parking_available end,
      family_friendly   = case when v_ch ? 'family_friendly'   then coalesce((v_ch->'family_friendly'->>'to')::boolean, false)   else s.family_friendly end,
      pet_friendly      = case when v_ch ? 'pet_friendly'      then coalesce((v_ch->'pet_friendly'->>'to')::boolean, false)      else s.pet_friendly end,
      requires_trek     = case when v_ch ? 'requires_trek'     then coalesce((v_ch->'requires_trek'->>'to')::boolean, false)     else s.requires_trek end,
      trek_distance_km  = case when v_ch ? 'trek_distance_km'  then coalesce((v_ch->'trek_distance_km'->>'to')::numeric, 0)      else s.trek_distance_km end,
      safety_notes      = case when v_ch ? 'safety_notes'      then v_ch->'safety_notes'->>'to'                        else s.safety_notes end
    where s.id = v_sug.spot_id;
  end if;

  update public.spot_edit_suggestions set
    status = case p_action when 'approve' then 'approved' else 'rejected' end,
    reviewed_by = auth.uid(),
    review_reason = p_reason,
    reviewed_at = timezone('utc'::text, now())
  where id = p_suggestion_id;

  insert into public.moderation_actions (spot_id, moderator_id, action_type, reason)
  values (
    v_sug.spot_id,
    auth.uid(),
    case p_action when 'approve' then 'approve' else 'reject' end,
    coalesce(p_reason, '') || ' [edit suggestion ' || p_suggestion_id || ']'
  );

  if v_sug.suggested_by is not null then
    perform public.recalculate_user_reputation(v_sug.suggested_by);
  end if;
end;
$$;

grant execute on function public.review_edit_suggestion(uuid, text, text) to authenticated;
