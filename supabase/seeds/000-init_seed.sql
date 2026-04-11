-- Live Learning Seed Data — Init Single Super User
-- Created: 2026-02-14
-- Description: Single user with ALL roles (Admin, Instructor, Student) to simplify development

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set app password for testing
SET session my.app_password = '12345678';

-- ============================================================================
-- AUTH USERS (Only 1 User)
-- ============================================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  -- Super Admin User
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'admin@livelearning.com',
    crypt(current_setting('my.app_password'), gen_salt('bf')),
    NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"admin","full_name":"Super Admin","role":"admin","is_active":true}',
    NOW(), NOW(),
    '', '', '', ''
  );

-- ============================================================================
-- AUTH IDENTITIES
-- ============================================================================
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  extensions.uuid_generate_v4(),
  id, id,
  format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
  'email',
  last_sign_in_at, created_at, updated_at
FROM auth.users
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ============================================================================
-- PROFILES
-- ============================================================================
-- ============================================================================
-- PROFILES
-- ============================================================================
-- Handle FK constraint: Remove default role created by trigger before updating profile ID
DELETE FROM public.profile_roles 
WHERE profile_id IN (
    SELECT id FROM public.profiles WHERE auth_id = '00000000-0000-0000-0000-000000000001'
);

-- Update the auto-created profile (from trigger) with fixed ID and Data
UPDATE public.profiles SET
  id = '10000000-0000-0000-0000-000000000001',
  username = 'admin',
  full_name = 'Super Admin',
  avatar_url = '🛡️',
  bio = 'I am the Super Admin, capable of everything.'
WHERE auth_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- ASSIGN ROLES (ALL ROLES)
-- ============================================================================
-- Insert ALL roles
INSERT INTO public.profile_roles (profile_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'admin');

-- ============================================================================
-- ADDITIONAL PROFILES (For Same Auth User)
-- ============================================================================
-- The user wants 1 Auth User, but 3 Profiles.
-- We manually create the other 2 profiles linked to the SAME auth_id.

-- 1. Instructor Profile
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (
  id, auth_id, username, full_name, avatar_url, bio
) VALUES (
  '10000000-0000-0000-0000-000000000002',       -- Profile ID
  '00000000-0000-0000-0000-000000000001',       -- Auth ID (SAME as Admin)
  'instructor',
  'Lead Instructor',
  '👨‍🏫',
  'Experienced instructor teaching advanced topics.'
);

-- Trigger automatically adds 'student' role. accessing profile_roles to change it to 'instructor'
UPDATE public.profile_roles
SET role = 'instructor'
WHERE profile_id = '10000000-0000-0000-0000-000000000002';


-- 2. Student Profile
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (
  id, auth_id, username, full_name, avatar_url, bio
) VALUES (
  '10000000-0000-0000-0000-000000000003',       -- Profile ID
  '00000000-0000-0000-0000-000000000001',       -- Auth ID (SAME as Admin)
  'student',
  'Active Student',
  '👨‍🎓',
  'Eager to learn new technologies.'
);

-- Trigger adds 'student' role, which is correct for this profile.
