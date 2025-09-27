-- Remove daily_goal from groups table since we'll use challenges instead
ALTER TABLE public.groups DROP COLUMN daily_goal;

-- Create group_challenges table to store multiple challenges per group
CREATE TABLE public.group_challenges (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL,
    name TEXT NOT NULL,
    goal_amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Enable RLS for group_challenges
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for group_challenges
CREATE POLICY "Users can view challenges in groups they belong to" 
ON public.group_challenges 
FOR SELECT 
USING (is_member(auth.uid(), group_id));

CREATE POLICY "Group admins can create challenges" 
ON public.group_challenges 
FOR INSERT 
WITH CHECK (is_group_admin_or_owner(auth.uid(), group_id));

CREATE POLICY "Group admins can update challenges" 
ON public.group_challenges 
FOR UPDATE 
USING (is_group_admin_or_owner(auth.uid(), group_id));

-- Add challenge_id to pushup_logs to track which challenge the log is for
ALTER TABLE public.pushup_logs ADD COLUMN challenge_id UUID;
ALTER TABLE public.pushup_logs ADD CONSTRAINT fk_challenge_id 
    FOREIGN KEY (challenge_id) REFERENCES public.group_challenges(id) ON DELETE CASCADE;

-- Create trigger for group_challenges updated_at
CREATE TRIGGER update_group_challenges_updated_at
BEFORE UPDATE ON public.group_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for group_challenges
ALTER TABLE public.group_challenges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_challenges;