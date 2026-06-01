-- ============================================================
-- JANKAM PLATFORM — COMPLETE DATABASE SCHEMA & AUTH BLUEPRINTS
-- ============================================================

-- 1. ENABLE CRYPTOGRAPHIC SECURITY EXTENSION
-- Enables strong Blowfish/Bcrypt hashing inside PostgreSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. SECURE ADMINISTRATORS LEDGER
CREATE TABLE IF NOT EXISTS public.admins (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,              -- 'Super Admin', 'State Admin', 'District Admin', 'Volunteer'
    district VARCHAR(100),                  -- Assigned district lockdown boundary (nullable if state/super)
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enforce strict Row Level Security (RLS) on Admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Lockdown Admins: Block all anonymous read/write accesses
CREATE POLICY "Admins lockdown policy" 
ON public.admins FOR ALL TO public USING (false);

-- 3. CRYPTOGRAPHIC AUTHENTICATION RPC FUNCTION
-- Authenticates administrators securely inside the database without exposing hashes or passwords to client code
CREATE OR REPLACE FUNCTION public.authenticate_admin(
    p_username VARCHAR(100),
    p_password TEXT
)
RETURNS TABLE (
    id BIGINT,
    username VARCHAR(100),
    role VARCHAR(50),
    district VARCHAR(100)
)
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to search table securely within owner boundaries
AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.username, a.role, a.district
    FROM public.admins a
    WHERE a.username = p_username 
      AND a.is_active = TRUE
      AND a.hashed_password = crypt(p_password, a.hashed_password); -- Cryptographic bcrypt check

    -- Record administrative login footprint on matching success
    IF FOUND THEN
        UPDATE public.admins
        SET last_login = timezone('utc'::text, now())
        WHERE public.admins.username = p_username;
    END IF;
END;
$$;

-- 4. SEED ADMIN INITIAL AUTHORIZATION ROLES (BCRYPT ENCRYPTED)
-- Seeds standard administrative tiers securely hashed with blowfish-bcrypt (bf) salt cost factor 10
INSERT INTO public.admins (username, hashed_password, role, district)
VALUES 
  ('superadmin', crypt('jankam2026', gen_salt('bf', 10)), 'Super Admin', NULL),
  ('stateadmin', crypt('state2026', gen_salt('bf', 10)), 'State Admin', NULL),
  ('puneadmin', crypt('pune2026', gen_salt('bf', 10)), 'District Admin', 'Pune'),
  ('volunmumbai', crypt('volun2026', gen_salt('bf', 10)), 'Volunteer', 'Mumbai')
ON CONFLICT (username) DO NOTHING;


-- 5. COMPLAINTS SCHEMAS WITH SOFT-DELETES
CREATE TABLE IF NOT EXISTS public.complaints (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(20),
    age INT,
    home_state VARCHAR(100),
    home_district VARCHAR(100),
    work_state VARCHAR(100),
    work_district VARCHAR(100) NOT NULL,
    industry_type VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    worker_type VARCHAR(100),
    education_level VARCHAR(100),
    preferred_language VARCHAR(50),
    complaint_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    priority_level VARCHAR(20) DEFAULT 'Medium',
    document_type VARCHAR(50),
    document_url TEXT,
    
    -- Employer/Contractor info
    employer_name VARCHAR(255) NOT NULL,
    employer_mobile VARCHAR(20),
    employer_email VARCHAR(255),
    company_address TEXT,
    work_site_address TEXT,
    supervisor_name VARCHAR(255),
    supervisor_mobile VARCHAR(20),
    hr_mobile VARCHAR(20),
    hr_email VARCHAR(255),
    incident_date VARCHAR(50),
    complaint_against VARCHAR(100),
    approx_financial_loss VARCHAR(50),
    witness_name VARCHAR(255),
    witness_mobile VARCHAR(20),
    witness_designation VARCHAR(255),
    evidence_notes TEXT,

    -- Stepper audit & verification checks
    worker_mobile_verified BOOLEAN DEFAULT FALSE,
    last_notification_sent TIMESTAMP WITH TIME ZONE,
    notification_type VARCHAR(50) DEFAULT 'WhatsApp',
    internal_notes TEXT,
    public_update TEXT,
    current_stage VARCHAR(100) DEFAULT 'submitted',
    assigned_volunteer VARCHAR(255),
    assigned_district_team VARCHAR(255),
    assigned_officer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete markers
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Apply row level security locks on complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public complaints submission" ON public.complaints FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anonymous read blockage" ON public.complaints FOR SELECT TO public USING (false);


-- 6. UNION MEMBERS SCHEMAS WITH SOFT-DELETES
CREATE TABLE IF NOT EXISTS public.members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(20),
    age INT,
    work_state VARCHAR(100),
    work_district VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    industry_type VARCHAR(100),
    worker_type VARCHAR(100),
    experience INT,
    document_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public members submission" ON public.members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anonymous member read blockage" ON public.members FOR SELECT TO public USING (false);


-- 7. VOLUNTEERS SCHEMAS WITH SOFT-DELETES
CREATE TABLE IF NOT EXISTS public.volunteers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    state VARCHAR(100),
    district VARCHAR(100) NOT NULL,
    industry_type VARCHAR(100),
    skills TEXT[],
    document_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public volunteers submission" ON public.volunteers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anonymous volunteer read blockage" ON public.volunteers FOR SELECT TO public USING (false);


-- 8. OUTFLOW NOTIFICATION QUEUE LEDGER
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,              -- 'WhatsApp', 'SMS', 'Email'
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'sent', 'failed', 'retry'
    retry_count INT DEFAULT 0,
    error_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications lock" ON public.notifications FOR ALL TO public USING (false);


-- 9. ADMINISTRATIVE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    device VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs insertion" ON public.audit_logs FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Audit logs selector lockdown" ON public.audit_logs FOR SELECT TO public USING (false);
