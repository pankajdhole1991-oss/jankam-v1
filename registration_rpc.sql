-- ============================================================
-- JANKAM — CRYPTOGRAPHIC REGISTRATION SEQUENTIAL ID ADAPTERS
-- ============================================================

-- 1. SECURE MEMBER ID GENERATION RPC
-- Safely counts existing members inside work_district and loops to verify primary key uniqueness
CREATE OR REPLACE FUNCTION public.get_next_member_id(p_district VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass SELECT RLS restriction securely
AS $$
DECLARE
    v_count INT;
    v_clean_district VARCHAR;
    v_next_id VARCHAR;
BEGIN
    -- Standardize district abbreviation (e.g. Pune -> PUN, Mumbai City -> MUM)
    v_clean_district := UPPER(TRIM(p_district));
    v_clean_district := SUBSTRING(v_clean_district FROM 1 FOR 3);
    
    -- Count the number of existing members in this district
    SELECT COUNT(*) INTO v_count
    FROM public.members
    WHERE UPPER(work_district) = UPPER(p_district) OR work_district = v_clean_district;
    
    -- Loop to ensure absolutely zero primary key collisions
    LOOP
        v_next_id := 'JKM-' || v_clean_district || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
        PERFORM 1 FROM public.members WHERE id = v_next_id;
        IF NOT FOUND THEN
            EXIT;
        END IF;
        v_count := v_count + 1;
    END LOOP;

    RETURN v_next_id;
END;
$$;

-- 2. SECURE VOLUNTEER ID GENERATION RPC
-- Safely counts existing volunteers and loops to verify primary key uniqueness
CREATE OR REPLACE FUNCTION public.get_next_volunteer_id()
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass SELECT RLS restriction securely
AS $$
DECLARE
    v_count INT;
    v_next_id VARCHAR;
BEGIN
    -- Count all active volunteers
    SELECT COUNT(*) INTO v_count
    FROM public.volunteers;
    
    -- Loop to ensure absolutely zero primary key collisions
    LOOP
        v_next_id := 'JKL-' || LPAD((v_count + 1)::TEXT, 3, '0');
        PERFORM 1 FROM public.volunteers WHERE id = v_next_id;
        IF NOT FOUND THEN
            EXIT;
        END IF;
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_next_id;
END;
$$;
