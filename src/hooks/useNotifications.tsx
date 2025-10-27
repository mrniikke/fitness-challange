import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface GroupNotification {
  id: string;
  type: 'member_joined' | 'pushups_logged' | 'goal_completed' | 'challenge_reminder';
  title: string;
  message: string;
  timestamp: Date;
  groupId: string;
  groupName: string;
  userId?: string;
  userName?: string;
  read?: boolean;
}

export const useNotifications = (currentGroupId?: string) => {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !currentGroupId) return;

    console.log('🔔 Setting up notifications for group:', currentGroupId, 'user:', user.id);

    // Load existing scheduled notifications
    const loadScheduledNotifications = async () => {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('group_id', currentGroupId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading scheduled notifications:', error);
        return;
      }

      if (data && data.length > 0) {
        const scheduledNotifs: GroupNotification[] = data.map(notif => ({
          id: notif.id,
          type: notif.notification_type as any,
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.created_at),
          groupId: notif.group_id || currentGroupId,
          groupName: '',
          read: notif.read
        }));
        
        console.log('📬 Loaded scheduled notifications:', scheduledNotifs);
        setNotifications(prev => [...scheduledNotifs, ...prev]);
      }
    };

    loadScheduledNotifications();

    // Subscribe to new group members with unique channel name
    const memberChannel = supabase
      .channel(`group-members-${currentGroupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${currentGroupId}`
        },
        async (payload) => {
          console.log('🔔 Group member INSERT event:', payload);
          // Don't notify about own actions
          if ((payload.new as any)?.user_id === user.id) {
            console.log('🔔 Ignoring own member join');
            return;
          }

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

          console.log('🔔 Added member notification:', notification);
          setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10
        }
      )
      .subscribe();

    // Subscribe to pushup log changes with unique channel name
    const pushupChannel = supabase
      .channel(`pushup-logs-${currentGroupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pushup_logs',
          filter: `group_id=eq.${currentGroupId}`
        },
        async (payload) => {
          console.log('🔔 Pushup log event:', payload.eventType, payload);
          // Don't notify about own actions
          if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
            console.log('🔔 Ignoring own pushup action');
            return;
          }

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
            .select('name')
            .eq('id', currentGroupId)
            .single();

          const userName = profile?.display_name || profile?.username || 'Someone';
          const groupName = group?.name || 'Group';

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
                ? `${userName} is the first to complete a challenge today!`
                : `${userName} completed a challenge!`,
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
              title: 'Progress logged',
              message: `${userName} logged ${addedPushups} progress (total: ${pushups})`,
              timestamp: new Date(),
              groupId: currentGroupId,
              groupName,
              userId: logData.user_id,
              userName
            };
          }

          if (notification) {
            console.log('🔔 Added pushup notification:', notification);
            setNotifications(prev => [notification!, ...prev].slice(0, 10)); // Keep last 10
          }
        }
      )
      .subscribe();

    // Subscribe to scheduled notifications with unique channel name
    const scheduledChannel = supabase
      .channel(`scheduled-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scheduled_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New scheduled notification:', payload);
          const notif = payload.new as any;
          
          if (notif.group_id === currentGroupId) {
            const notification: GroupNotification = {
              id: notif.id,
              type: notif.notification_type,
              title: notif.title,
              message: notif.message,
              timestamp: new Date(notif.created_at),
              groupId: notif.group_id,
              groupName: '',
              read: notif.read
            };
            
            console.log('📬 Added scheduled notification:', notification);
            setNotifications(prev => [notification, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    console.log('🔔 Subscribed to channels for group:', currentGroupId);

    return () => {
      console.log('🔔 Cleaning up notification channels for group:', currentGroupId);
      supabase.removeChannel(memberChannel);
      supabase.removeChannel(pushupChannel);
      supabase.removeChannel(scheduledChannel);
    };
  }, [user, currentGroupId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Mark scheduled notification as read in database
    const notif = notifications.find(n => n.id === id);
    if (notif?.type === 'challenge_reminder') {
      await supabase
        .from('scheduled_notifications')
        .update({ read: true })
        .eq('id', id);
    }
  };

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
};