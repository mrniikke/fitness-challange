-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create a cron job to run the challenge reminder function every 30 minutes
-- This allows checking users at different timezone hours throughout the day
SELECT cron.schedule(
  'challenge-reminders-every-30min',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://rtjyffmaldxhcrgippxn.supabase.co/functions/v1/send-challenge-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0anlmZm1hbGR4aGNyZ2lwcHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTM1NDksImV4cCI6MjA3NDU2OTU0OX0.u-kzjcHQ85Jn6WE4nBeigovJpWlb6eRjON0hM2bWa_4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);