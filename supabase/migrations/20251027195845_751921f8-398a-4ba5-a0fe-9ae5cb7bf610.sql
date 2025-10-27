-- Add timezone field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Create notifications table for scheduled/system notifications
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text NOT NULL DEFAULT 'reminder',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own scheduled notifications"
ON public.scheduled_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update their own scheduled notifications"
ON public.scheduled_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Set replica identity for realtime
ALTER TABLE public.scheduled_notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_notifications';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_read 
ON public.scheduled_notifications(user_id, read, created_at DESC);