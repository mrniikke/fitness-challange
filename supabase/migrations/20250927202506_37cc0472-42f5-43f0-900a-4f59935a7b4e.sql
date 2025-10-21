-- Create table for tracking daily push-up logs
CREATE TABLE public.pushup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL,
  pushups INTEGER NOT NULL DEFAULT 0,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one entry per user per group per day
  UNIQUE(user_id, group_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE public.pushup_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for pushup_logs
CREATE POLICY "Users can view pushup logs in their groups" 
ON public.pushup_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.user_id = auth.uid() 
    AND gm.group_id = pushup_logs.group_id
  )
);

CREATE POLICY "Users can insert their own pushup logs" 
ON public.pushup_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.user_id = auth.uid() 
    AND gm.group_id = pushup_logs.group_id
  )
);

CREATE POLICY "Users can update their own pushup logs" 
ON public.pushup_logs 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.user_id = auth.uid() 
    AND gm.group_id = pushup_logs.group_id
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pushup_logs_updated_at
BEFORE UPDATE ON public.pushup_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_pushup_logs_user_group_date ON public.pushup_logs(user_id, group_id, log_date);
CREATE INDEX idx_pushup_logs_group_date ON public.pushup_logs(group_id, log_date);