-- Enable realtime for group_members table
ALTER TABLE group_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;

-- Enable realtime for pushup_logs table  
ALTER TABLE pushup_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE pushup_logs;