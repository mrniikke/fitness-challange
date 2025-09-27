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
      const today = new Date().toISOString().split('T')[0];
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
    console.log("=== logPushups FUNCTION DEBUG ===");
    console.log("Parameters:", { groupId, challengeId, pushups });
    console.log("User:", user);
    console.log("Available challenges:", challenges);
    
    if (!user) {
      console.log("No user found");
      return false;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      console.log("Today's date:", today);
      
      // Get the challenge to check goal
      const challenge = challenges.find(c => c.id === challengeId);
      console.log("Found challenge:", challenge);
      
      if (!challenge) {
        console.log("Challenge not found in challenges array");
        return false;
      }
      
      // Get existing log
      console.log("Checking for existing log...");
      const { data: existingLog, error: fetchError } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .eq('challenge_id', challengeId)
        .eq('log_date', today)
        .maybeSingle();

      console.log("Existing log:", existingLog);
      console.log("Fetch error:", fetchError);

      if (fetchError) {
        console.error("Error fetching existing log:", fetchError);
        return false;
      }

      const previousPushups = existingLog?.pushups || 0;
      const newTotalPushups = previousPushups + pushups;
      const goalAmount = challenge.goal_amount;
      
      console.log("Progress calculation:", {
        previousPushups,
        newTotalPushups,
        goalAmount
      });
      
      // Check if user just completed this challenge
      const justCompletedChallenge = previousPushups < goalAmount && newTotalPushups >= goalAmount;
      console.log("Just completed challenge:", justCompletedChallenge);
      
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
        
        console.log("Other completions:", otherCompletions);
        
        // If no other completions exist, this user is the first finisher for this challenge
        isFirstFinisher = (otherCompletions?.length || 0) === 0;
        console.log("Is first finisher:", isFirstFinisher);
      }

      if (existingLog) {
        console.log("Updating existing log...");
        // Update existing log
        const { error } = await supabase
          .from('pushup_logs')
          .update({ 
            pushups: newTotalPushups,
            completed_at: completedAt,
            is_first_finisher: isFirstFinisher
          })
          .eq('id', existingLog.id);
        
        console.log("Update error:", error);
        if (error) throw error;
      } else {
        console.log("Inserting new log...");
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
        
        console.log("Insert error:", error);
        if (error) throw error;
      }

      console.log("About to refresh group members...");
      // Refresh the member data to show updated progress
      await fetchGroupMembers(groupId);
      console.log("Successfully refreshed group members");
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
    challenges,
    loading,
    selectGroup,
    refreshGroups,
    fetchGroupMembers,
    logPushups,
    leaveGroup
  };
};