-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.calculate_group_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If duration_days is provided, calculate end_date
  IF NEW.duration_days IS NOT NULL AND NEW.duration_days > 0 THEN
    NEW.end_date = (NEW.created_at::date + (NEW.duration_days || ' days')::interval)::date;
  ELSE
    NEW.end_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;