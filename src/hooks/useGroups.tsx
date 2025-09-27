import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Helper function to get local date string (not affected by timezone conversion to UTC)
const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  challenges?: GroupChallenge[];
}

export interface GroupChallenge {
  id: string;
  group_id: string;
  name: string;
  goal_amount: number;
  created_at: string;
  updated_at: string;
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
  challenge_id?: string | null;
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
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
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
      
      // Fetch group challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('group_challenges')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (challengesError) throw challengesError;
      
      setChallenges(challengesData || []);
      
      // Fetch today's push-up logs for all members with completion data
      const today = getLocalDateString();
      const { data: logsData, error: logsError } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('group_id', groupId)
        .eq('log_date', today);

      if (logsError) throw logsError;

      setPushupLogs(logsData || []);

      // Calculate total goal across all challenges
      const totalGoal = (challengesData || []).reduce((sum, challenge) => sum + challenge.goal_amount, 0);

      // Get current time for checking if day has ended (simplified to just check if it's past midnight)
      const now = new Date();
      const dayEnded = false; // For now, we'll calculate status in real-time

      // Combine member data with push-up data and completion status
      const membersWithPushups = (data || []).map(member => {
        const memberLogs = logsData?.filter(log => log.user_id === member.user_id) || [];
        const todayPushups = memberLogs.reduce((sum, log) => sum + log.pushups, 0);
        
        let completionStatus: 'completed' | 'failed' | 'pending' = 'pending';
        
        // Check if user completed all challenges
        const completedChallenges = (challengesData || []).filter(challenge => {
          const challengeLog = memberLogs.find(log => log.challenge_id === challenge.id);
          return challengeLog && challengeLog.completed_at;
        });
        
        if (completedChallenges.length === (challengesData?.length || 0) && (challengesData?.length || 0) > 0) {
          completionStatus = 'completed';
        } else if (dayEnded && todayPushups < totalGoal) {
          completionStatus = 'failed';
        }
        
        // Check if this user was first to complete all challenges
        const isFirstFinisher = memberLogs.some(log => log.is_first_finisher);
        
        return {
          ...member,
          role: member.role as 'admin' | 'member',
          todayPushups,
          completionStatus,
          isFirstFinisher
        };
      });

      setMembers(membersWithPushups);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const logPushups = async (groupId: string, challengeId: string, pushups: number) => {
    if (!user) return false;

    try {
      const today = getLocalDateString();
      
      // Get the challenge to check goal
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        console.error('Challenge not found:', challengeId, 'Available:', challenges);
        return false;
      }
      
      // Get existing log for this specific challenge
      const { data: existingLog } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('challenge_id', challengeId)
        .eq('log_date', today)
        .maybeSingle();

      const previousPushups = existingLog?.pushups || 0;
      const newTotalPushups = previousPushups + pushups;
      const goalAmount = challenge.goal_amount;
      
      // Check if user just completed this challenge
      const justCompletedChallenge = previousPushups < goalAmount && newTotalPushups >= goalAmount;
      
      let completedAt = existingLog?.completed_at;
      let isFirstFinisher = existingLog?.is_first_finisher || false;
      
      if (justCompletedChallenge) {
        completedAt = new Date().toISOString();
        
        // Check if this is the first completion for this challenge today
        const { data: otherCompletions } = await supabase
          .from('pushup_logs')
          .select('id, completed_at')
          .eq('group_id', groupId)
          .eq('challenge_id', challengeId)
          .eq('log_date', today)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: true });
        
        // If no other completions exist, this user is the first finisher for this challenge
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
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
      } else {
        // Insert new log
        const { error } = await supabase
          .from('pushup_logs')
          .insert({
            user_id: user.id,
            group_id: groupId,
            challenge_id: challengeId,
            pushups: newTotalPushups,
            log_date: today,
            completed_at: completedAt,
            is_first_finisher: isFirstFinisher
          });
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
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
    setChallenges([]); // Reset challenges first
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
    challenges,
    loading,
    selectGroup,
    refreshGroups,
    fetchGroupMembers,
    logPushups,
    leaveGroup
  };
};