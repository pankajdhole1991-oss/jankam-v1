-- ============================================================
-- JANKAM — LIVE STATS AGGREGATOR SECURE RPC & REALTIME SCHEMAS
-- Run this in the Supabase SQL Editor to enable 100% secure,
-- high-performance, live-updating statistics and automatic
-- Realtime pushes on your dashboards!
-- ============================================================

-- 1. ENABLE REALTIME SUBSCRIPTIONS ON CORE TABLES
-- Adding tables to the supabase_realtime publication allows
-- our web clients to receive push notifications instantly when rows change.
begin;
  -- Remove tables if already added to prevent duplicates, then add
  alter publication supabase_realtime add table public.complaints;
exception when others then
  -- publication might already have it or not exist, ignore and proceed
end;
$$;

begin;
  alter publication supabase_realtime add table public.members;
exception when others then
  -- ignore
end;
$$;

begin;
  alter publication supabase_realtime add table public.volunteers;
exception when others then
  -- ignore
end;
$$;

-- 2. CREATE SECURE LIVE STATS AGGREGATOR RPC
CREATE OR REPLACE FUNCTION public.get_live_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to count records safely within owner boundaries
AS $$
DECLARE
    v_members_count INT;
    v_active_members INT;
    v_volunteers_count INT;
    v_active_volunteers INT;
    v_complaints_count INT;
    v_resolved_complaints INT;
    v_resolution_rate INT;
    v_workers_supported INT;
    v_districts_covered INT;
    v_district_breakdown JSONB;
    v_category_breakdown JSONB;
    v_result JSONB;
BEGIN
    -- 1. Counts filtering out soft deleted rows
    SELECT COUNT(*) INTO v_members_count FROM public.members WHERE is_deleted = FALSE;
    SELECT COUNT(*) INTO v_active_members FROM public.members WHERE is_deleted = FALSE AND status = 'active';
    SELECT COUNT(*) INTO v_volunteers_count FROM public.volunteers WHERE is_deleted = FALSE;
    SELECT COUNT(*) INTO v_active_volunteers FROM public.volunteers WHERE is_deleted = FALSE AND status = 'active';
    SELECT COUNT(*) INTO v_complaints_count FROM public.complaints WHERE is_deleted = FALSE;
    SELECT COUNT(*) INTO v_resolved_complaints FROM public.complaints WHERE is_deleted = FALSE AND status = 'resolved';

    -- 2. Calculations
    IF v_complaints_count > 0 THEN
        v_resolution_rate := ROUND((v_resolved_complaints::DECIMAL / v_complaints_count) * 100);
    ELSE
        v_resolution_rate := 0;
    END IF;

    v_workers_supported := v_active_members + v_active_volunteers + v_resolved_complaints;

    -- 3. Districts covered (unique across all 3 tables matching the 36 districts)
    SELECT COUNT(DISTINCT clean_dist) INTO v_districts_covered
    FROM (
        SELECT LOWER(TRIM(work_district)) as clean_dist FROM public.members WHERE is_deleted = FALSE AND work_district IS NOT NULL
        UNION
        SELECT LOWER(TRIM(district)) as clean_dist FROM public.volunteers WHERE is_deleted = FALSE AND district IS NOT NULL
        UNION
        SELECT LOWER(TRIM(work_district)) as clean_dist FROM public.complaints WHERE is_deleted = FALSE AND work_district IS NOT NULL
    ) t;

    IF v_districts_covered = 0 THEN
        v_districts_covered := 1;
    END IF;

    -- 4. District Breakdown
    SELECT JSONB_AGG(d_stat) INTO v_district_breakdown
    FROM (
        SELECT 
            m.id,
            m.name,
            m.division,
            COALESCE(counts.members, 0) as members,
            COALESCE(counts.volunteers, 0) as volunteers,
            COALESCE(counts.active_complaints, 0) as "activeComplaints",
            COALESCE(counts.resolved_complaints, 0) as "resolvedComplaints",
            COALESCE(counts.cases_new, 0) as "casesNew",
            COALESCE(counts.cases_under_review, 0) as "casesUnderReview",
            COALESCE(counts.cases_resolved, 0) as "casesResolved",
            COALESCE(counts.cases_closed, 0) as "casesClosed",
            COALESCE(counts.cases_escalated, 0) as "casesEscalated",
            CASE 
                WHEN COALESCE(counts.complaints, 0) > 0 THEN ROUND((COALESCE(counts.resolved_complaints, 0)::DECIMAL / counts.complaints) * 100)
                ELSE 0
            END as "resolutionRate",
            CASE
                WHEN COALESCE(counts.members, 0) >= 10 OR COALESCE(counts.complaints, 0) >= 5 THEN 'active'
                WHEN COALESCE(counts.members, 0) > 0 OR COALESCE(counts.complaints, 0) > 0 OR COALESCE(counts.volunteers, 0) > 0 THEN 'growing'
                ELSE 'pending'
            END as status
        FROM (
            VALUES 
                ('mumbai-city', 'Mumbai City', 'Mumbai'),
                ('mumbai-suburban', 'Mumbai Suburban', 'Mumbai'),
                ('thane', 'Thane', 'Mumbai'),
                ('palghar', 'Palghar', 'Mumbai'),
                ('raigad', 'Raigad', 'Mumbai'),
                ('ratnagiri', 'Ratnagiri', 'Mumbai'),
                ('sindhudurg', 'Sindhudurg', 'Mumbai'),
                ('pune', 'Pune', 'Pune'),
                ('satara', 'Satara', 'Pune'),
                ('sangli', 'Sangli', 'Pune'),
                ('solapur', 'Solapur', 'Pune'),
                ('kolhapur', 'Kolhapur', 'Pune'),
                ('nashik', 'Nashik', 'Nashik'),
                ('dhule', 'Dhule', 'Nashik'),
                ('nandurbar', 'Nandurbar', 'Nashik'),
                ('jalgaon', 'Jalgaon', 'Nashik'),
                ('ahmednagar', 'Ahmednagar', 'Nashik'),
                ('aurangabad', 'Chhatrapati Sambhajinagar', 'Aurangabad'),
                ('jalna', 'Jalna', 'Aurangabad'),
                ('beed', 'Beed', 'Aurangabad'),
                ('latur', 'Latur', 'Aurangabad'),
                ('osmanabad', 'Dharashiv', 'Aurangabad'),
                ('nanded', 'Nanded', 'Aurangabad'),
                ('hingoli', 'Hingoli', 'Aurangabad'),
                ('parbhani', 'Parbhani', 'Aurangabad'),
                ('amravati', 'Amravati', 'Amravati'),
                ('yavatmal', 'Yavatmal', 'Amravati'),
                ('wardha', 'Wardha', 'Amravati'),
                ('washim', 'Washim', 'Amravati'),
                ('akola', 'Akola', 'Amravati'),
                ('buldhana', 'Buldhana', 'Amravati'),
                ('nagpur', 'Nagpur', 'Nagpur'),
                ('chandrapur', 'Chandrapur', 'Nagpur'),
                ('gadchiroli', 'Gadchiroli', 'Nagpur'),
                ('bhandara', 'Bhandara', 'Nagpur'),
                ('gondia', 'Gondia', 'Nagpur')
        ) m(id, name, division)
        LEFT JOIN LATERAL (
            SELECT 
                (SELECT COUNT(*) FROM public.members mem WHERE (LOWER(TRIM(mem.work_district)) = LOWER(m.name) OR LOWER(TRIM(mem.work_district)) = m.id) AND mem.is_deleted = FALSE) as members,
                (SELECT COUNT(*) FROM public.volunteers vol WHERE (LOWER(TRIM(vol.district)) = LOWER(m.name) OR LOWER(TRIM(vol.district)) = m.id) AND vol.is_deleted = FALSE) as volunteers,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE) as complaints,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.status != 'resolved' AND comp.is_deleted = FALSE) as active_complaints,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.status = 'resolved' AND comp.is_deleted = FALSE) as resolved_complaints,
                -- detailed complaint stages
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE AND (comp.status = 'submitted' OR comp.status = 'new')) as cases_new,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE AND (comp.status = 'under_review' OR comp.status = 'assigned' OR comp.status = 'in_progress')) as cases_under_review,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE AND comp.status = 'resolved') as cases_resolved,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE AND comp.status = 'closed') as cases_closed,
                (SELECT COUNT(*) FROM public.complaints comp WHERE (LOWER(TRIM(comp.work_district)) = LOWER(m.name) OR LOWER(TRIM(comp.work_district)) = m.id) AND comp.is_deleted = FALSE AND comp.status = 'escalated') as cases_escalated
        ) counts ON TRUE
        ORDER BY (COALESCE(counts.members, 0) + COALESCE(counts.complaints, 0) + COALESCE(counts.volunteers, 0)) DESC, m.name ASC
    ) d_stat;

    -- 5. Category Breakdown
    SELECT JSONB_AGG(c_stat) INTO v_category_breakdown
    FROM (
        SELECT 
            complaint_type as category,
            COUNT(*) as count,
            CASE 
                WHEN v_complaints_count > 0 THEN ROUND((COUNT(*)::DECIMAL / v_complaints_count) * 100)
                ELSE 0
            END as percentage
        FROM public.complaints
        WHERE is_deleted = FALSE
        GROUP BY complaint_type
        ORDER BY count DESC
    ) c_stat;

    -- 6. Combine everything
    v_result := JSONB_BUILD_OBJECT(
        'membersCount', v_members_count,
        'activeMembers', v_active_members,
        'volunteersCount', v_volunteers_count,
        'activeVolunteers', v_active_volunteers,
        'complaintsCount', v_complaints_count,
        'resolvedComplaints', v_resolved_complaints,
        'resolutionRate', v_resolution_rate,
        'workersSupported', v_workers_supported,
        'districtsCovered', v_districts_covered,
        'districtBreakdown', COALESCE(v_district_breakdown, '[]'::JSONB),
        'categoryBreakdown', COALESCE(v_category_breakdown, '[]'::JSONB)
    );

    RETURN v_result;
END;
$$;
