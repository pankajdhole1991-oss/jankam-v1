-- ============================================================
-- JANKAM — RLS INSERT POLICIES FOR PUBLIC REGISTRATION
-- ============================================================
-- Grants anon role the ability to INSERT into members and volunteers
-- (used during public registration flow via Supabase JS client)

-- MEMBERS: Allow INSERT for anon (public registration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'members' AND policyname = 'anon_insert_members'
  ) THEN
    EXECUTE 'CREATE POLICY anon_insert_members ON public.members FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;

-- VOLUNTEERS: Allow INSERT for anon (public registration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'volunteers' AND policyname = 'anon_insert_volunteers'
  ) THEN
    EXECUTE 'CREATE POLICY anon_insert_volunteers ON public.volunteers FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;

-- Verify policies are active
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('members', 'volunteers')
ORDER BY tablename, policyname;
