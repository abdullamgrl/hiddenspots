-- -------------------------------------------------------------
-- SECURITY HARDENING
-- 1. profiles: stop self-service privilege escalation (role /
--    reputation_score / phone were updatable by their owner because
--    the row-level policy has no column restriction) and stop the
--    public read of phone numbers. RLS cannot scope columns, so both
--    fixes use column-level grants, which PostgREST enforces.
-- 2. tags / spot_tags: any signed-in user could UPDATE or DELETE
--    every tag site-wide; scope writes to owners/moderators.
-- 3. spot_reports: anonymous inserts stay allowed (reporting must be
--    frictionless) but are bounded, and a signed-in user can no
--    longer file reports under someone else's id.
-- 4. Pin search_path on the init-migration SECURITY DEFINER
--    functions ("extensions" included: PostGIS and pg_trgm live
--    there on Supabase).
-- -------------------------------------------------------------

-- 1. Profiles: column-level grants -----------------------------

-- Owners may edit identity fields only. role/reputation_score/phone
-- become server-side-only (service_role bypasses grants; the
-- reputation recalculator and signup trigger are security definer).
-- updated_at is maintained by the update_profiles_updated_at trigger,
-- which is not subject to the caller's column grants.
revoke update on public.profiles from authenticated, anon;
grant update (username, full_name, avatar_url, bio)
  on public.profiles to authenticated;

-- phone is PII sourced from the auth mobile number; it must never be
-- readable through the API. Everything else stays public (profile
-- pages, contributor panels, admin gate reads of role).
revoke select on public.profiles from authenticated, anon;
grant select (id, username, full_name, avatar_url, role, reputation_score, bio, created_at, updated_at)
  on public.profiles to authenticated, anon;

-- 2. Tags -------------------------------------------------------

drop policy "Allow authenticated users to write tags" on public.tags;
drop policy "Allow authenticated users to write spot tags" on public.spot_tags;

create policy "Allow authenticated users to insert tags"
  on public.tags for insert with check (auth.uid() is not null);

create policy "Allow moderators to manage tags"
  on public.tags for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

create policy "Allow spot owners/moderators to manage spot tags"
  on public.spot_tags for all using (
    exists (
      select 1 from public.spots s
      where s.id = spot_id
        and (
          s.created_by = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('moderator', 'admin')
          )
        )
    )
  );

-- 3. Reports ----------------------------------------------------

drop policy "Allow visitors to submit reports" on public.spot_reports;

create policy "Allow visitors to submit reports"
  on public.spot_reports for insert with check (
    char_length(description) <= 2000
    and (reporter_id is null or reporter_id = auth.uid())
  );

-- 4. Pin search_path on init-era SECURITY DEFINER functions ------
-- (Later migrations already set it on their own functions.)

alter function public.sync_spot_location() set search_path = public, extensions;
alter function public.handle_new_user() set search_path = public, extensions;
alter function public.recalculate_spot_score(uuid) set search_path = public, extensions;
alter function public.on_spot_dependency_changed() set search_path = public, extensions;
alter function public.recalculate_user_reputation(uuid) set search_path = public, extensions;
alter function public.on_user_spots_reputation_trigger() set search_path = public, extensions;
alter function public.check_duplicate_spot(double precision, double precision, text, uuid, text[])
  set search_path = public, extensions;
