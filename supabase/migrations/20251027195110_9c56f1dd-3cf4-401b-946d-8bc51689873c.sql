-- Add tables to Supabase Realtime publication (idempotent)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pushup_logs';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
