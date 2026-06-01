-- ============================================================
-- JANKAM — CRYPTOGRAPHIC ADMINISTRATOR SERVICES RPC ADAPTERS
-- ============================================================

-- 1. SECURE GET ADMINS LEDGER RPC
-- Bypasses the admins table direct select block (RLS) to return metadata securely
CREATE OR REPLACE FUNCTION public.get_admins()
RETURNS TABLE (
    id BIGINT,
    username VARCHAR(100),
    role VARCHAR(50),
    district VARCHAR(100),
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS restrictions securely
AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.username, a.role, a.district, a.is_active, a.last_login, a.created_at
    FROM public.admins a
    ORDER BY a.created_at DESC;
END;
$$;

-- 2. SECURE BCRYPT ADMIN CREATION RPC
-- Registers a new administrative user with custom role and district, encrypting password via bcrypt
CREATE OR REPLACE FUNCTION public.create_admin(
    p_username VARCHAR(100),
    p_password TEXT,
    p_role VARCHAR(50),
    p_district VARCHAR(100)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS restrictions securely
AS $$
BEGIN
    INSERT INTO public.admins (username, hashed_password, role, district, is_active)
    VALUES (
        TRIM(p_username),
        crypt(p_password, gen_salt('bf', 10)), -- blowfish-bcrypt cryptographic hash with cost 10
        p_role,
        p_district,
        TRUE
    );
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- 3. SECURE BCRYPT ADMIN UPDATE / PASSWORD RESET RPC
-- Modifies active status, role, district, and optionally hashes a new password for resets
CREATE OR REPLACE FUNCTION public.update_admin(
    p_id BIGINT,
    p_role VARCHAR(50),
    p_district VARCHAR(100),
    p_is_active BOOLEAN,
    p_password TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS restrictions securely
AS $$
BEGIN
    IF p_password IS NOT NULL AND p_password <> '' THEN
        UPDATE public.admins
        SET role = p_role,
            district = p_district,
            is_active = p_is_active,
            hashed_password = crypt(p_password, gen_salt('bf', 10)) -- blowfish-bcrypt reset
        WHERE id = p_id;
    ELSE
        UPDATE public.admins
        SET role = p_role,
            district = p_district,
            is_active = p_is_active
        WHERE id = p_id;
    END IF;
    RETURN FOUND;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
