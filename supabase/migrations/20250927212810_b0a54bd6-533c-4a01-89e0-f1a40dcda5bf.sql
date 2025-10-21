-- Add completion tracking to pushup_logs
ALTER TABLE pushup_logs 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_first_finisher BOOLEAN DEFAULT false;

-- Create index for faster queries on completion status
CREATE INDEX idx_pushup_logs_completion ON pushup_logs (group_id, log_date, completed_at);