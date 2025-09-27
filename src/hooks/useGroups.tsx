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
}

export interface PushupLog {
  id: string;
  user_id: string;
  group_id: string;
  pushups: number;
  log_date: string;
  created_at: string;
  updated_at: string;
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
            updated_at
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
      
      // Fetch today's push-up logs for all members
      const today = new Date().toISOString().split('T')[0];
      const { data: logsData, error: logsError } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('group_id', groupId)
        .eq('log_date', today);

      if (logsError) throw logsError;

      setPushupLogs(logsData || []);

      // Combine member data with push-up data
      const membersWithPushups = (data || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member',
        todayPushups: logsData?.find(log => log.user_id === member.user_id)?.pushups || 0
      }));

      setMembers(membersWithPushups);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const logPushups = async (groupId: string, pushups: number) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to update existing log first, if it doesn't exist, insert new one
      const { data: existingLog } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('log_date', today)
        .maybeSingle();

      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('pushup_logs')
          .update({ pushups: existingLog.pushups + pushups })
          .eq('id', existingLog.id);
        
        if (error) throw error;
      } else {
        // Insert new log
        const { error } = await supabase
          .from('pushup_logs')
          .insert({
            user_id: user.id,
            group_id: groupId,
            pushups: pushups,
            log_date: today
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
    logPushups
  };
};