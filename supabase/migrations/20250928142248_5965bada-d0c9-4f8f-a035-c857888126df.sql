-- Fix security vulnerability: Remove public access to group invite codes
-- Currently anyone can see all groups with invite codes, exposing private group information
-- This allows unauthorized users to discover private groups and their invite codes

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view groups they created, are members of, or have inv" ON public.groups;

-- Create a new policy that only allows access to group creators and members
CREATE POLICY "Users can view groups they created or are members of" 
ON public.groups 
FOR SELECT 
USING ((auth.uid() = created_by) OR is_member(auth.uid(), id));

-- This ensures that:
-- 1. Only group creators can see their own groups
-- 2. Only group members can see groups they belong to  
-- 3. Invite codes are no longer publicly discoverable
-- 4. Groups remain joinable via invite codes through the JoinGroupDialog