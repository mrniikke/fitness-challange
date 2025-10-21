-- First, create the missing profile for the existing user
INSERT INTO public.profiles (user_id, username, display_name)
VALUES (
  '296d7eb1-4dbc-4f18-82d7-2f8332cdd322',
  'Nike',
  'Nike'
)
ON CONFLICT (user_id) DO NOTHING;

-- Ensure the trigger exists and is working correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually sync missing profiles (for recovery)
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profiles for any auth users that don't have one
  INSERT INTO public.profiles (user_id, username, display_name)
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Run the sync to fix any existing missing profiles
SELECT public.sync_missing_profiles();