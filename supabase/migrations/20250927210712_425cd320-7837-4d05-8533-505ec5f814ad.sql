-- Update the RLS policy for groups to allow users to view groups by invite code
DROP POLICY IF EXISTS "Users can view groups they created or are members of" ON groups;

CREATE POLICY "Users can view groups they created, are members of, or have invite code access" 
ON groups 
FOR SELECT 
USING (
  (auth.uid() = created_by) OR 
  is_member(auth.uid(), id) OR 
  (invite_code IS NOT NULL)
);