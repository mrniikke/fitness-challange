-- Allow users to view groups by invite code (needed for joining groups)
CREATE POLICY "Users can view groups by invite code"
ON public.groups
FOR SELECT
TO authenticated
USING (invite_code IS NOT NULL);