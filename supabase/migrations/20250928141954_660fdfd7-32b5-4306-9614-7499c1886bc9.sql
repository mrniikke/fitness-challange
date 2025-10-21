-- Fix security vulnerability: Restrict profile visibility to authenticated users only
-- Currently profiles are viewable by everyone (including anonymous users)
-- This exposes usernames and display names to potential bad actors

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- This ensures that:
-- 1. Only logged-in users can see profile information
-- 2. Anonymous users cannot harvest user data
-- 3. Follows the principle of least privilege