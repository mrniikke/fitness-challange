import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GroupNotification {
  id: string;
  type: 'member_joined' | 'pushups_logged' | 'goal_completed';
  title: string;
  message: string;
  timestamp: Date;
  groupId: string;
  groupName: string;
  userId?: string;
  userName?: string;
}

export const useNotifications = (currentGroupId?: string) => {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !currentGroupId) return;

    // Subscribe to new group members
    const memberChannel = supabase
      .channel('group-member-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${currentGroupId}`
        },
        async (payload) => {
          // Don't notify about own actions
          if ((payload.new as any)?.user_id === user.id) return;

          // Get user profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', (payload.new as any).user_id)
            .single();

          // Get group info
          const { data: group } = await supabase
            .from('groups')
            .select('name')
            .eq('id', currentGroupId)
            .single();

          const userName = profile?.display_name || profile?.username || 'Someone';
          const groupName = group?.name || 'Group';

          const notification: GroupNotification = {
            id: Date.now().toString(),
            type: 'member_joined',
            title: 'New member joined!',
            message: `${userName} joined ${groupName}`,
            timestamp: new Date(),
            groupId: currentGroupId,
            groupName,
            userId: (payload.new as any).user_id,
            userName
          };

          setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10
        }
      )
      .subscribe();

    // Subscribe to pushup log changes
    const pushupChannel = supabase
      .channel('pushup-log-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pushup_logs',
          filter: `group_id=eq.${currentGroupId}`
        },
        async (payload) => {
          // Don't notify about own actions
          if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) return;

          const isInsert = payload.eventType === 'INSERT';
          const isUpdate = payload.eventType === 'UPDATE';
          const logData = (payload.new || payload.old) as any;

          if (!logData?.user_id) return;

          // Get user profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', logData.user_id)
            .single();

          // Get group info
          const { data: group } = await supabase
            .from('groups')
            .select('name, daily_goal')
            .eq('id', currentGroupId)
            .single();

          const userName = profile?.display_name || profile?.username || 'Someone';
          const groupName = group?.name || 'Group';
          const dailyGoal = group?.daily_goal || 200;

          let notification: GroupNotification | null = null;

          // Check if someone just completed their goal
          if ((isInsert && logData.completed_at) || 
              (isUpdate && (payload.new as any)?.completed_at && !(payload.old as any)?.completed_at)) {
            
            const isFirstFinisher = logData.is_first_finisher;
            
            notification = {
              id: Date.now().toString(),
              type: 'goal_completed',
              title: isFirstFinisher ? '🎉 First to finish!' : '✅ Goal completed!',
              message: isFirstFinisher 
                ? `${userName} is the first to complete today's ${dailyGoal} push-ups!`
                : `${userName} completed today's goal of ${dailyGoal} push-ups!`,
              timestamp: new Date(),
              groupId: currentGroupId,
              groupName,
              userId: logData.user_id,
              userName
            };
          }
          // Check for regular pushup logging (only for new logs or increases)
          else if (isInsert || (isUpdate && (payload.new as any)?.pushups > (payload.old as any)?.pushups)) {
            const pushups = logData.pushups;
            const addedPushups = isUpdate ? (payload.new as any).pushups - (payload.old as any).pushups : pushups;
            
            notification = {
              id: Date.now().toString(),
              type: 'pushups_logged',
              title: 'Push-ups logged',
              message: `${userName} logged ${addedPushups} push-ups (total: ${pushups})`,
              timestamp: new Date(),
              groupId: currentGroupId,
              groupName,
              userId: logData.user_id,
              userName
            };
          }

          if (notification) {
            setNotifications(prev => [notification!, ...prev].slice(0, 10)); // Keep last 10
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(memberChannel);
      supabase.removeChannel(pushupChannel);
    };
  }, [user, currentGroupId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
};