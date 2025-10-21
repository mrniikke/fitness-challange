-- Add duration and end date columns to groups table
ALTER TABLE public.groups 
ADD COLUMN duration_days integer NULL,
ADD COLUMN end_date date NULL;

-- Add a function to calculate end date when creating groups with duration
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set end_date when inserting groups
CREATE TRIGGER set_group_end_date
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_group_end_date();