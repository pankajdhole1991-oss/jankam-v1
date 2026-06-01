-- ============================================================ 
-- JANKAM — PUBLIC.ADMINS TABLE BACKUP 
-- Generated: 2026-05-31T21:05:09.782Z 
-- ============================================================ 

INSERT INTO public.admins (username, hashed_password, role, district, is_active) VALUES 
  ('superadmin', crypt('jankam2026', gen_salt('bf', 10)), 'Super Admin', NULL, TRUE),
  ('stateadmin', crypt('state2026', gen_salt('bf', 10)), 'State Admin', NULL, TRUE),
  ('puneadmin', crypt('pune2026', gen_salt('bf', 10)), 'District Admin', 'Pune', TRUE),
  ('volunmumbai', crypt('volun2026', gen_salt('bf', 10)), 'Volunteer', 'Mumbai', TRUE)
ON CONFLICT (username) DO UPDATE 
SET hashed_password = EXCLUDED.hashed_password, 
    role = EXCLUDED.role, 
    district = EXCLUDED.district, 
    is_active = EXCLUDED.is_active;
