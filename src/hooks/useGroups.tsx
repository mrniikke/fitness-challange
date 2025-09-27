import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  daily_goal: number;
  role?: 'admin' | 'member';
  member_count?: number;
}

export interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
  };
  todayPushups?: number;
  completionStatus?: 'completed' | 'failed' | 'pending';
  isFirstFinisher?: boolean;
}

export interface PushupLog {
  id: string;
  user_id: string;
  group_id: string;
  pushups: number;
  log_date: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  is_first_finisher?: boolean;
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pushupLogs, setPushupLogs] = useState<PushupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGroups = async () => {
    if (!user) return;

    try {
      // Get groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          role,
          groups (
            id,
            name,
            description,
            invite_code,
            created_by,
            created_at,
            updated_at,
            daily_goal
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const formattedGroups = memberGroups?.map(mg => ({
        ...mg.groups,
        role: mg.role as 'admin' | 'member'
      })) as Group[];

      setGroups(formattedGroups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (
            username,
            display_name
          )
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      
      // Fetch today's push-up logs for all members with completion data
      const today = new Date().toISOString().split('T')[0];
      const { data: logsData, error: logsError } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('group_id', groupId)
        .eq('log_date', today);

      if (logsError) throw logsError;

      setPushupLogs(logsData || []);

      // Get current group to check daily goal
      const currentGroupData = groups.find(g => g.id === groupId) || currentGroup;
      const dailyGoal = currentGroupData?.daily_goal || 200;

      // Get current time for checking if day has ended (simplified to just check if it's past midnight)
      const now = new Date();
      const dayEnded = false; // For now, we'll calculate status in real-time

      // Combine member data with push-up data and completion status
      const membersWithPushups = (data || []).map(member => {
        const log = logsData?.find(log => log.user_id === member.user_id);
        const todayPushups = log?.pushups || 0;
        
        let completionStatus: 'completed' | 'failed' | 'pending' = 'pending';
        
        if (log?.completed_at) {
          completionStatus = 'completed';
        } else if (dayEnded && todayPushups < dailyGoal) {
          completionStatus = 'failed';
        }
        
        return {
          ...member,
          role: member.role as 'admin' | 'member',
          todayPushups,
          completionStatus,
          isFirstFinisher: log?.is_first_finisher || false
        };
      });

      setMembers(membersWithPushups);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const logPushups = async (groupId: string, pushups: number) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get the current group to check daily goal
      const currentGroupData = groups.find(g => g.id === groupId);
      if (!currentGroupData) return false;
      
      // Get existing log
      const { data: existingLog } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('log_date', today)
        .maybeSingle();

      const previousPushups = existingLog?.pushups || 0;
      const newTotalPushups = previousPushups + pushups;
      const dailyGoal = currentGroupData.daily_goal;
      
      // Check if user just completed their goal
      const justCompletedGoal = previousPushups < dailyGoal && newTotalPushups >= dailyGoal;
      
      let completedAt = existingLog?.completed_at;
      let isFirstFinisher = existingLog?.is_first_finisher || false;
      
      if (justCompletedGoal) {
        completedAt = new Date().toISOString();
        
        // Check if this is the first completion in the group today
        const { data: otherCompletions } = await supabase
          .from('pushup_logs')
          .select('id, completed_at')
          .eq('group_id', groupId)
          .eq('log_date', today)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true });
        
        // If no other completions exist, this user is the first finisher
        isFirstFinisher = (otherCompletions?.length || 0) === 0;
      }

      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('pushup_logs')
          .update({ 
            pushups: newTotalPushups,
            completed_at: completedAt,
            is_first_finisher: isFirstFinisher
          })
          .eq('id', existingLog.id);
        
        if (error) throw error;
      } else {
        // Insert new log
        const { error } = await supabase
          .from('pushup_logs')
          .insert({
            user_id: user.id,
            group_id: groupId,
            pushups: newTotalPushups,
            log_date: today,
            completed_at: completedAt,
            is_first_finisher: isFirstFinisher
          });
        
        if (error) throw error;
      }

      // Refresh the member data to show updated progress
      await fetchGroupMembers(groupId);
      return true;
    } catch (error) {
      console.error('Error logging push-ups:', error);
      return false;
    }
  };

  const selectGroup = (group: Group) => {
    setCurrentGroup(group);
    fetchGroupMembers(group.id);
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) throw error;

      // Refresh groups list
      await fetchGroups();
      
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshGroups = () => {
    fetchGroups();
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  return {
    groups,
    currentGroup,
    members,
    pushupLogs,
    loading,
    selectGroup,
    refreshGroups,
    fetchGroupMembers,
    logPushups,
    leaveGroup
  };
};