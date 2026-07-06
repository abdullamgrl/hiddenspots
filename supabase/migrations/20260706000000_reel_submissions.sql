-- -------------------------------------------------------------
-- COMMUNITY REEL SUBMISSIONS
-- Anyone signed in can propose an Instagram reel for an existing
-- approved spot. Moderators review; approval publishes the link to
-- spot_social_links (which auto-recomputes the spot's verification
-- score via the existing trigger) and rewards the submitter.
-- Mirrors the spot_edit_suggestions pipeline.
-- -------------------------------------------------------------

-- 1. Table
create table public.spot_reel_submissions (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references public.spots(id) on delete cascade not null,
  submitted_by uuid references public.profiles(id) on delete set null,
  url text not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone,
  -- The same reel can't be submitted twice for the same spot.
  unique (spot_id, url)
);
alter table public.spot_reel_submissions enable row level security;

create index idx_reel_submissions_status on public.spot_reel_submissions(status);
create index idx_reel_submissions_spot on public.spot_reel_submissions(spot_id);
create index idx_reel_submissions_user on public.spot_reel_submissions(submitted_by);

-- 2. Insert validation: canonical Instagram post/reel URL, normalized
-- (no query string, trailing slash), and not already live on the spot.
create or replace function public.validate_reel_submission()
returns trigger as $$
declare
  v_code text;
  v_kind text;
begin
  select (regexp_match(new.url, 'instagram\.com/(reel|reels|p|tv)/([A-Za-z0-9_-]+)'))[1],
         (regexp_match(new.url, 'instagram\.com/(reel|reels|p|tv)/([A-Za-z0-9_-]+)'))[2]
  into v_kind, v_code;

  if v_code is null then
    raise exception 'URL must be an Instagram reel or post link';
  end if;

  -- Normalize so the (spot_id, url) uniqueness actually bites.
  new.url := 'https://www.instagram.com/' ||
             case when v_kind = 'reels' then 'reel' else v_kind end ||
             '/' || v_code || '/';

  if exists (
    select 1 from public.spot_social_links l
    where l.spot_id = new.spot_id and l.url = new.url
  ) then
    raise exception 'This reel is already featured on the spot';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_validate_reel_submission
  before insert on public.spot_reel_submissions
  for each row execute procedure public.validate_reel_submission();

-- 3. RLS
create policy "Users see own reel submissions, moderators see all"
  on public.spot_reel_submissions for select using (
    submitted_by = auth.uid() or
    exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
  );

create policy "Authenticated users submit reels for live spots"
  on public.spot_reel_submissions for insert with check (
    auth.uid() is not null and
    submitted_by = auth.uid() and
    status = 'pending' and
    reviewed_by is null and
    exists (
      select 1 from public.spots s
      where s.id = spot_id and s.status = 'approved' and s.is_deleted = false
    )
  );

-- Review happens exclusively through the RPC below; no update/delete policies.

-- 4. Reputation: approved reel submissions earn +5 each (same weight as
-- approved edit suggestions). Full redefinition of the recalculator.
create or replace function public.recalculate_user_reputation(target_user_id uuid)
returns void as $$
declare
  v_rep integer := 10; -- Base reputation
  v_approved_count integer := 0;
  v_featured_count integer := 0;
  v_rejected_count integer := 0;
  v_spam_reports_count integer := 0;
  v_approved_edits integer := 0;
  v_approved_reels integer := 0;
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

  -- Approved reel submissions (+5 each)
  select count(*) into v_approved_reels
  from public.spot_reel_submissions
  where submitted_by = target_user_id and status = 'approved';
  v_rep := v_rep + (v_approved_reels * 5);

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

-- 5. Moderator review: approve publishes the reel to spot_social_links
-- (the existing trigger then recomputes the spot's verification score),
-- records the action, and refreshes the submitter's reputation.
create or replace function public.review_reel_submission(
  p_submission_id uuid,
  p_action text,          -- 'approve' | 'reject'
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.spot_reel_submissions%rowtype;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  ) then
    raise exception 'Only moderators can review reel submissions';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception 'action must be approve or reject';
  end if;

  select * into v_sub
  from public.spot_reel_submissions
  where id = p_submission_id
  for update;

  if not found then
    raise exception 'Submission not found';
  end if;
  if v_sub.status <> 'pending' then
    raise exception 'Submission was already reviewed';
  end if;

  if p_action = 'approve' then
    -- Race guard: the reel may have been added by other means meanwhile.
    if not exists (
      select 1 from public.spot_social_links l
      where l.spot_id = v_sub.spot_id and l.url = v_sub.url
    ) then
      insert into public.spot_social_links (spot_id, platform, url)
      values (v_sub.spot_id, 'instagram', v_sub.url);
    end if;
  end if;

  update public.spot_reel_submissions set
    status = case p_action when 'approve' then 'approved' else 'rejected' end,
    reviewed_by = auth.uid(),
    review_reason = p_reason,
    reviewed_at = timezone('utc'::text, now())
  where id = p_submission_id;

  insert into public.moderation_actions (spot_id, moderator_id, action_type, reason)
  values (
    v_sub.spot_id,
    auth.uid(),
    case p_action when 'approve' then 'approve' else 'reject' end,
    coalesce(p_reason, '') || ' [reel submission ' || p_submission_id || ']'
  );

  if v_sub.submitted_by is not null then
    perform public.recalculate_user_reputation(v_sub.submitted_by);
  end if;
end;
$$;

grant execute on function public.review_reel_submission(uuid, text, text) to authenticated;
