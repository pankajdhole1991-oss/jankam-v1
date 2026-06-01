-- ============================================================
-- JANKAM — RLS Policy Diagnostic Query
-- Run in Supabase SQL Editor to see all policies on members/volunteers
-- ============================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('members', 'volunteers')
ORDER BY tablename, cmd, policyname;
