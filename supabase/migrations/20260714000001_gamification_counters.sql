-- -------------------------------------------------------------
-- GAMIFICATION COUNTERS
-- spot_reel_submissions and spot_edit_suggestions are RLS-visible
-- to their owner and moderators only, so a visitor viewing someone
-- else's profile would count 0 approved reels/edits and see their
-- badges as unearned. These SECURITY DEFINER counters expose ONLY
-- integer counts of approved items — the submission contents stay
-- protected by RLS.
-- -------------------------------------------------------------

create or replace function public.count_approved_reels(p_profile_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.spot_reel_submissions
  where submitted_by = p_profile_id and status = 'approved';
$$;

create or replace function public.count_approved_edits(p_profile_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.spot_edit_suggestions
  where suggested_by = p_profile_id and status = 'approved';
$$;

grant execute on function public.count_approved_reels(uuid) to anon, authenticated;
grant execute on function public.count_approved_edits(uuid) to anon, authenticated;
