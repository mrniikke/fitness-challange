-- Drop the existing function
DROP FUNCTION IF EXISTS public.delete_user_account();

-- Recreate the function with proper deletion order
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- Delete in correct order to respect foreign key constraints
  
  -- 1. Delete pushup logs (references user_id and group_id)
  DELETE FROM public.pushup_logs WHERE user_id = v_user_id;
  
  -- 2. Delete group challenges for groups the user created
  DELETE FROM public.group_challenges 
  WHERE group_id IN (SELECT id FROM public.groups WHERE created_by = v_user_id);
  
  -- 3. Delete group members (user leaving all groups)
  DELETE FROM public.group_members WHERE user_id = v_user_id;
  
  -- 4. Delete groups created by the user
  DELETE FROM public.groups WHERE created_by = v_user_id;
  
  -- 5. Delete the user's profile
  DELETE FROM public.profiles WHERE user_id = v_user_id;
  
  -- Note: We don't delete from auth.users here as it requires special permissions
  -- The auth.users deletion should be handled by Supabase Auth directly
END;
$$;