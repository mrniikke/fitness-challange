-- Create a function to delete user account and all related data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all user's data (cascade will handle related records)
  DELETE FROM public.profiles WHERE user_id = auth.uid();
  DELETE FROM public.pushup_logs WHERE user_id = auth.uid();
  DELETE FROM public.group_members WHERE user_id = auth.uid();
  
  -- Delete groups created by the user (cascade will handle related records)
  DELETE FROM public.groups WHERE created_by = auth.uid();
  
  -- Delete the auth user (this will cascade to any remaining records)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;