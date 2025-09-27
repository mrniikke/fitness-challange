-- Helper functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin_or_owner(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE user_id = _user_id AND group_id = _group_id AND role = 'admin'
    )
  ) OR (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = _group_id AND created_by = _user_id
    )
  );
$$;

-- Replace problematic policies to remove self-referential recursion
-- group_members policies
DROP POLICY IF EXISTS "Users can view group members for their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

CREATE POLICY "Users can view memberships for groups they belong to"
ON public.group_members
FOR SELECT
USING (public.is_member(auth.uid(), group_id) OR auth.uid() = user_id);

CREATE POLICY "Group admins or owners can manage members"
ON public.group_members
FOR DELETE
USING (public.is_group_admin_or_owner(auth.uid(), group_id));

-- groups select policy (use function to avoid subquery recursion and allow creators to view)
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
USING (public.is_member(auth.uid(), id) OR auth.uid() = created_by);
