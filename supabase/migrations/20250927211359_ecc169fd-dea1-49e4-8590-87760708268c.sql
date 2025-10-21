-- Update RLS policy to allow users to see all members in groups they belong to
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_members;

CREATE POLICY "Users can view members in groups they belong to"
ON group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.user_id = auth.uid() 
    AND gm.group_id = group_members.group_id
  )
);