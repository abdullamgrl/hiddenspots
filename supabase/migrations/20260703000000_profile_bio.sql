-- Short free-text bio on public profiles, editable from /settings.
-- RLS already allows owners to update their own row
-- ("Allow users to update own profile"), so no policy changes are needed.
alter table public.profiles
  add column if not exists bio text
  constraint profiles_bio_length check (char_length(bio) <= 200);
