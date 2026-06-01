-- ============================================================
-- JANKAM — FINAL PERMISSION GRANT (All Remaining Tables)
-- Run this entire block in Supabase SQL Editor
-- ============================================================

-- 1. Table-level GRANT for anon
GRANT INSERT ON public.complaints     TO anon;
GRANT SELECT ON public.complaints     TO anon;
GRANT INSERT ON public.audit_logs     TO anon;
GRANT SELECT ON public.audit_logs     TO anon;
GRANT INSERT ON public.notifications  TO anon;
GRANT SELECT ON public.notifications  TO anon;

-- 2. RLS INSERT policies (clean slate)
DROP POLICY IF EXISTS anon_insert_complaints     ON public.complaints;
DROP POLICY IF EXISTS anon_insert_audit_logs     ON public.audit_logs;
DROP POLICY IF EXISTS anon_insert_notifications  ON public.notifications;

CREATE POLICY anon_insert_complaints ON public.complaints
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY anon_insert_audit_logs ON public.audit_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY anon_insert_notifications ON public.notifications
  FOR INSERT TO anon WITH CHECK (true);

-- 3. RLS SELECT policies for read-back (needed for .select() after insert)
DROP POLICY IF EXISTS anon_select_audit_logs     ON public.audit_logs;
DROP POLICY IF EXISTS anon_select_notifications  ON public.notifications;
DROP POLICY IF EXISTS anon_select_complaints     ON public.complaints;

CREATE POLICY anon_select_audit_logs ON public.audit_logs
  FOR SELECT TO anon USING (true);

CREATE POLICY anon_select_notifications ON public.notifications
  FOR SELECT TO anon USING (true);

CREATE POLICY anon_select_complaints ON public.complaints
  FOR SELECT TO anon USING (true);

-- 4. Verify — should show INSERT + SELECT for anon on all 5 tables
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('members','volunteers','complaints','audit_logs','notifications')
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;
