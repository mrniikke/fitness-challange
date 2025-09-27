-- Create default challenge for groups that don't have any challenges
INSERT INTO public.group_challenges (group_id, name, goal_amount)
SELECT g.id, 'Push-ups', 200
FROM public.groups g
LEFT JOIN public.group_challenges gc ON g.id = gc.group_id
WHERE gc.id IS NULL;