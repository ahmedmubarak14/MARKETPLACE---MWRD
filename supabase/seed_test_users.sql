-- ============================================================================
-- MWRD MARKETPLACE - TEST USERS
-- Creates 3 test users: Client, Supplier, Admin
-- ============================================================================

-- NOTE: This uses Supabase's admin functions to create auth users
-- Run this in Supabase SQL Editor after running the main migration

-- Function to create a complete user (auth + profile)
CREATE OR REPLACE FUNCTION create_test_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role user_role,
  p_company_name TEXT,
  p_verified BOOLEAN DEFAULT TRUE,
  p_status user_status DEFAULT 'ACTIVE',
  p_kyc_status kyc_status DEFAULT 'VERIFIED'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create auth user
  new_user_id := extensions.uuid_generate_v4();

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', p_name, 'role', p_role, 'companyName', p_company_name),
    FALSE,
    'authenticated'
  );

  -- Create user profile
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    company_name,
    verified,
    status,
    kyc_status
  ) VALUES (
    new_user_id,
    p_email,
    p_name,
    p_role,
    p_company_name,
    p_verified,
    p_status,
    p_kyc_status
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CREATE TEST USERS
-- ============================================================================

-- 1. CLIENT USER
-- Email: client@mwrd.com | Password: client123
SELECT create_test_user(
  'client@mwrd.com',
  'client123',
  'John Client',
  'CLIENT',
  'Tech Solutions Ltd',
  TRUE,
  'ACTIVE',
  'VERIFIED'
);

-- 2. SUPPLIER USER
-- Email: supplier@mwrd.com | Password: supplier123
SELECT create_test_user(
  'supplier@mwrd.com',
  'supplier123',
  'Sarah Supplier',
  'SUPPLIER',
  'Global Parts Inc',
  TRUE,
  'APPROVED',
  'VERIFIED'
);

-- 3. ADMIN USER
-- Email: admin@mwrd.com | Password: admin123
SELECT create_test_user(
  'admin@mwrd.com',
  'admin123',
  'Admin Alice',
  'ADMIN',
  'MWRD HQ',
  TRUE,
  'ACTIVE',
  'VERIFIED'
);

-- ============================================================================
-- VERIFY USERS CREATED
-- ============================================================================

SELECT
  id,
  email,
  name,
  role,
  company_name,
  status,
  verified
FROM users
ORDER BY role;

-- ============================================================================
-- TEST CREDENTIALS
-- ============================================================================
-- CLIENT:   client@mwrd.com   / client123
-- SUPPLIER: supplier@mwrd.com / supplier123
-- ADMIN:    admin@mwrd.com    / admin123
-- ============================================================================
