-- Fix function search path security issue
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$;