-- purpose: allow authenticated users to insert their own habit prefs row
--   (upsert from onboarding requires INSERT + UPDATE RLS).
-- affected: user_habit_prefs policies
-- notes: signup trigger usually creates the row; upsert still checks INSERT policy.

create policy "users can insert own habit prefs"
  on public.user_habit_prefs
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
