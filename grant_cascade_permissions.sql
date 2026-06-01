-- ============================================================
-- JANKAM — Grant anon INSERT on audit_logs + notifications
-- Run in Supabase SQL Editor
-- ============================================================

-- Table-level grants
GRANT INSERT ON public.audit_logs    TO anon;
GRANT INSERT ON public.notifications TO anon;

-- RLS INSERT policies
DROP POLICY IF EXISTS anon_insert_audit_logs    ON public.audit_logs;
DROP POLICY IF EXISTS anon_insert_notifications ON public.notifications;

CREATE POLICY anon_insert_audit_logs ON public.audit_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY anon_insert_notifications ON public.notifications
  FOR INSERT TO anon WITH CHECK (true);

-- Verify
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('audit_logs','notifications') AND grantee = 'anon'
ORDER BY table_name, privilege_type;
