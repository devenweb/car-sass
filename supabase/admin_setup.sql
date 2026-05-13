-- SUPABASE ADMINISTRATIVE SETUP SCRIPT
-- Purpose: Finalize security protocols and RLS for Super Admin management.

-- 1. Verify and Update User Role Constraint
-- Ensures all administrative roles are supported in the application.
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['super_admin'::text, 'admin'::text, 'secretary'::text, 'consultant'::text, 'accountant'::text]));

-- 2. Security Triggers for Super Admin Protection
-- Prevents deletion of any user with the 'super_admin' role.
CREATE OR REPLACE FUNCTION prevent_super_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'super_admin' THEN
    RAISE EXCEPTION 'CRITICAL: Super Admin accounts are permanent ecosystem pillars and cannot be deleted.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_super_admin_deletion ON public.users;
CREATE TRIGGER tr_prevent_super_admin_deletion
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION prevent_super_admin_deletion();

-- 3. Row-Level Security (RLS) Hardening
-- Grant Super Admins full visibility and control over the personnel registry.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
);

DROP POLICY IF EXISTS "Super Admins can manage users" ON public.users;
CREATE POLICY "Super Admins can manage users" 
ON public.users FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'
);

-- 4. Agents Table Synchronization
-- Ensure the operational 'agents' table is accessible to admins.
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage agents" ON public.agents;
CREATE POLICY "Admins can manage agents" 
ON public.agents FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('super_admin', 'admin')
);

-- 5. Helper Function: Check Admin Status
-- Used by Edge Functions and RLS to verify privileges.
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
