-- ============================================================
-- JANKAM — SUPABASE DATABASE POLICY & GRANT MIGRATION
-- Run this entire script in your Supabase SQL Editor to enable:
-- 1. Table-level SELECT and UPDATE privileges for anon role.
-- 2. RLS policies allowing safe anonymous reads and updates.
-- ============================================================

-- 1. GRANT Table-level privileges to the anon role
GRANT SELECT, UPDATE ON public.members TO anon;
GRANT SELECT, UPDATE ON public.volunteers TO anon;
GRANT SELECT, UPDATE ON public.complaints TO anon;
GRANT SELECT, INSERT ON public.audit_logs TO anon;
GRANT SELECT, INSERT ON public.notifications TO anon;

-- 2. MEMBERS: Enable SELECT and UPDATE policies
DROP POLICY IF EXISTS anon_select_members ON public.members;
CREATE POLICY anon_select_members ON public.members
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_update_members ON public.members;
CREATE POLICY anon_update_members ON public.members
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 3. VOLUNTEERS: Enable SELECT and UPDATE policies
DROP POLICY IF EXISTS anon_select_volunteers ON public.volunteers;
CREATE POLICY anon_select_volunteers ON public.volunteers
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_update_volunteers ON public.volunteers;
CREATE POLICY anon_update_volunteers ON public.volunteers
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 4. COMPLAINTS: Enable SELECT and UPDATE policies
DROP POLICY IF EXISTS anon_select_complaints ON public.complaints;
CREATE POLICY anon_select_complaints ON public.complaints
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_update_complaints ON public.complaints;
CREATE POLICY anon_update_complaints ON public.complaints
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 5. AUDIT LOGS: Enable SELECT and INSERT policies
DROP POLICY IF EXISTS anon_select_audit_logs ON public.audit_logs;
CREATE POLICY anon_select_audit_logs ON public.audit_logs
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_insert_audit_logs ON public.audit_logs;
CREATE POLICY anon_insert_audit_logs ON public.audit_logs
  FOR INSERT TO anon WITH CHECK (true);

-- 6. NOTIFICATIONS: Enable SELECT and INSERT policies
DROP POLICY IF EXISTS anon_select_notifications ON public.notifications;
CREATE POLICY anon_select_notifications ON public.notifications
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS anon_insert_notifications ON public.notifications;
CREATE POLICY anon_insert_notifications ON public.notifications
  FOR INSERT TO anon WITH CHECK (true);
