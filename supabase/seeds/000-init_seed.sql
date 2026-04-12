-- Stray Pet Map Seed Data — Init Dev User
-- Created: 2026-02-14
-- Description: Single auth user with 3 profiles (admin, moderator, user) for development

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
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated',
    'admin@straypetmap.com',
    crypt(current_setting('my.app_password'), gen_salt('bf')),
    NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"admin","full_name":"ผู้ดูแลระบบ","role":"admin","is_active":true}',
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
-- Handle FK constraint: Remove default role created by trigger before updating profile ID
DELETE FROM public.profile_roles 
WHERE profile_id IN (
    SELECT id FROM public.profiles WHERE auth_id = '00000000-0000-0000-0000-000000000001'
);

-- Update the auto-created profile (from trigger) with fixed ID and Data
UPDATE public.profiles SET
  id = '10000000-0000-0000-0000-000000000001',
  username = 'admin',
  full_name = 'ผู้ดูแลระบบ',
  avatar_url = '🛡️',
  bio = 'ผู้ดูแลระบบ Stray Pet Map'
WHERE auth_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- ASSIGN ROLES
-- ============================================================================
INSERT INTO public.profile_roles (profile_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'admin');

-- ============================================================================
-- ADDITIONAL PROFILES (For Same Auth User — 1 Auth, 3 Profiles for dev)
-- ============================================================================

-- 1. Moderator Profile (อาสาสมัครตรวจสอบ)
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (
  id, auth_id, username, full_name, avatar_url, bio
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'moderator',
  'อาสาตรวจสอบ',
  '�',
  'อาสาสมัครช่วยตรวจสอบโพสต์และดูแลชุมชน'
);

-- Trigger auto-adds 'user' role → change to 'moderator'
UPDATE public.profile_roles
SET role = 'moderator'
WHERE profile_id = '10000000-0000-0000-0000-000000000002';

-- 2. User Profile (ผู้ใช้ทั่วไป)
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (
  id, auth_id, username, full_name, avatar_url, bio
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'petlover',
  'คนรักสัตว์',
  '�',
  'คนรักน้องหมาน้องแมว ชอบช่วยเหลือสัตว์จร'
);

-- Trigger auto-adds 'user' role — correct for this profile
