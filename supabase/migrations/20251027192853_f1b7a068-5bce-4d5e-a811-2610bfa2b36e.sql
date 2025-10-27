-- Ensure old record data is available for UPDATE events in realtime
ALTER TABLE public.pushup_logs REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;