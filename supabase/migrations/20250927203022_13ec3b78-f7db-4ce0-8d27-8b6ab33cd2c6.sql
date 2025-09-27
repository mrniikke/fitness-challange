-- Add daily_goal column to groups table
ALTER TABLE public.groups 
ADD COLUMN daily_goal INTEGER NOT NULL DEFAULT 200;

-- Add index for better performance when querying by daily goal
CREATE INDEX idx_groups_daily_goal ON public.groups(daily_goal);