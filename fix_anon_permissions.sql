-- ============================================================
-- JANKAM — COMPLETE PERMISSION FIX FOR ANON REGISTRATION
-- Run this ENTIRE block in Supabase SQL Editor
-- ============================================================

-- Step 1: Grant table-level INSERT privilege to anon role
GRANT INSERT ON public.members TO anon;
GRANT INSERT ON public.volunteers TO anon;

-- Step 2: Also grant SELECT so .select() after insert works (for returning inserted row)
GRANT SELECT ON public.members TO anon;
GRANT SELECT ON public.volunteers TO anon;

-- Step 3: Drop existing policies if they exist (clean slate)
DROP POLICY IF EXISTS anon_insert_members ON public.members;
DROP POLICY IF EXISTS anon_insert_volunteers ON public.volunteers;

-- Step 4: Re-create RLS policies for INSERT
CREATE POLICY anon_insert_members ON public.members
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY anon_insert_volunteers ON public.volunteers
  FOR INSERT TO anon WITH CHECK (true);

-- Step 5: Verify grants
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('members', 'volunteers')
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- Step 6: Verify policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('members', 'volunteers')
ORDER BY tablename, policyname;
