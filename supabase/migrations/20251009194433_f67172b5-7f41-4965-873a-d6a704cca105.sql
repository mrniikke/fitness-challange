-- Security fixes without changing column types
-- Phase 1: Critical Role-Based Access Control (no enum)

-- 1) Role validation trigger to prevent unauthorized role changes and invalid roles
CREATE OR REPLACE FUNCTION public.validate_group_member_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Enforce allowed role values
  IF NEW.role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Invalid role value';
  END IF;

  -- Only allow role changes if user is group creator or existing admin
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT (
      (SELECT created_by FROM public.groups WHERE id = NEW.group_id) = auth.uid()
      OR
      public.is_group_admin_or_owner(auth.uid(), NEW.group_id)
    ) THEN
      RAISE EXCEPTION 'Only group creators and admins can change member roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (drop if exists to be idempotent)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_role_changes'
  ) THEN
    DROP TRIGGER validate_role_changes ON public.group_members;
  END IF;
END $$;

CREATE TRIGGER validate_role_changes
  BEFORE UPDATE OR INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_group_member_role();

-- 2) Add RLS policy for role updates (drop if exists to avoid duplicates)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'group_members' AND policyname = 'Only admins can update member roles'
  ) THEN
    DROP POLICY "Only admins can update member roles" ON public.group_members;
  END IF;
END $$;

CREATE POLICY "Only admins can update member roles"
ON public.group_members FOR UPDATE
USING (
  public.is_group_admin_or_owner(auth.uid(), group_id)
)
WITH CHECK (
  public.is_group_admin_or_owner(auth.uid(), group_id)
);

-- Phase 2: Restrict Group Information Exposure
-- 3) Secure function to fetch limited group info by invite code
CREATE OR REPLACE FUNCTION public.get_group_by_invite(invite_code_param text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  member_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    g.id,
    g.name,
    g.description,
    COUNT(gm.id) as member_count
  FROM public.groups g
  LEFT JOIN public.group_members gm ON g.id = gm.group_id
  WHERE g.invite_code = UPPER(TRIM(invite_code_param))
  GROUP BY g.id, g.name, g.description;
$$;

-- 4) Drop broad invite-code policy if present
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'groups' AND policyname = 'Users can view groups by invite code'
  ) THEN
    DROP POLICY "Users can view groups by invite code" ON public.groups;
  END IF;
END $$;

-- Phase 3: Profile Privacy Enhancement
-- 5) Function to control profile visibility
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 WHERE auth.uid() = profile_user_id
  ) OR EXISTS (
    SELECT 1 
    FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() 
      AND gm2.user_id = profile_user_id
  );
$$;

-- 6) Replace permissive profiles policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Authenticated users can view profiles'
  ) THEN
    DROP POLICY "Authenticated users can view profiles" ON public.profiles;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view profiles in shared groups'
  ) THEN
    DROP POLICY "Users can view profiles in shared groups" ON public.profiles;
  END IF;
END $$;

CREATE POLICY "Users can view profiles in shared groups"
ON public.profiles FOR SELECT
USING (public.can_view_profile(user_id));