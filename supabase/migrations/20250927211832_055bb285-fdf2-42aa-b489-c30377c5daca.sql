-- Fix infinite recursion by using the existing is_member security definer function
DROP POLICY IF EXISTS "Users can view members in groups they belong to" ON group_members;

CREATE POLICY "Users can view members in groups they belong to"
ON group_members
FOR SELECT
USING (
  is_member(auth.uid(), group_id)
);