-- Fix multi-challenge logging: make logs unique per challenge per day
ALTER TABLE public.pushup_logs DROP CONSTRAINT IF EXISTS pushup_logs_user_id_group_id_log_date_key;

-- Allow multiple logs per day across different challenges
ALTER TABLE public.pushup_logs
  ADD CONSTRAINT pushup_logs_user_group_challenge_date_unique
  UNIQUE (user_id, group_id, challenge_id, log_date);

-- Optional: ensure better query performance (helpful but not required)
CREATE INDEX IF NOT EXISTS idx_pushup_logs_group_date ON public.pushup_logs (group_id, log_date);
CREATE INDEX IF NOT EXISTS idx_pushup_logs_user_group_challenge_date ON public.pushup_logs (user_id, group_id, challenge_id, log_date);