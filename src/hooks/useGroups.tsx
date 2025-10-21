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
  duration_days?: number | null;
  end_date?: string | null;
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
  showSkull?: boolean;
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
            updated_at,
            duration_days,
            end_date
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Get member counts for each group
      const groupIds = memberGroups?.map(mg => mg.groups.id) || [];
      const { data: memberCounts, error: countError } = await supabase
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds);

      if (countError) throw countError;

      // Count members for each group
      const memberCountMap = (memberCounts || []).reduce((acc, member) => {
        acc[member.group_id] = (acc[member.group_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const formattedGroups = memberGroups?.map(mg => ({
        ...mg.groups,
        role: mg.role as 'admin' | 'member',
        member_count: memberCountMap[mg.groups.id] || 0
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
      
      // Fetch ALL push-up logs for all members (for historical tracking)
      const today = getLocalDateString();
      const { data: logsData, error: logsError } = await supabase
        .from('pushup_logs')
        .select('*')
        .eq('group_id', groupId)
        .order('log_date', { ascending: false });

      if (logsError) throw logsError;

      setPushupLogs(logsData || []);

      // Calculate total goal across all challenges
      const totalGoal = (challengesData || []).reduce((sum, challenge) => sum + challenge.goal_amount, 0);

      // Get current time for checking if day has ended (simplified to just check if it's past midnight)
      const now = new Date();
      const dayEnded = false; // For now, we'll calculate status in real-time

      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      // Combine member data with push-up data and completion status
      const membersWithPushups = (data || []).map(member => {
        const memberLogs = logsData?.filter(log => log.user_id === member.user_id) || [];
        // Only sum today's logs for the progress bar display
        const todayPushups = memberLogs.filter(log => log.log_date === today).reduce((sum, log) => sum + log.pushups, 0);
        
        let completionStatus: 'completed' | 'failed' | 'pending' = 'pending';
        
        // Check if user completed all challenges today
        const completedChallenges = (challengesData || []).filter(challenge => {
          const challengeLog = memberLogs.find(log => log.challenge_id === challenge.id && log.log_date === today);
          return challengeLog && challengeLog.completed_at;
        });
        
        // Real-time completion status check
        if (completedChallenges.length === (challengesData?.length || 0) && (challengesData?.length || 0) > 0) {
          completionStatus = 'completed';
        } else {
          // Check if it's past a reasonable "end of day" time (e.g., 11:59 PM)
          const now = new Date();
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          
          // If it's past 11:59 PM and user hasn't completed all challenges, mark as failed
          if (now > endOfDay && completedChallenges.length < (challengesData?.length || 0)) {
            completionStatus = 'failed';
          }
        }
        
        // Check if user failed yesterday (didn't complete all challenges)
        const yesterdayLogs = memberLogs.filter(log => log.log_date === yesterdayString);
        const yesterdayCompletedChallenges = (challengesData || []).filter(challenge => {
          const challengeLog = yesterdayLogs.find(log => log.challenge_id === challenge.id);
          return challengeLog && challengeLog.completed_at;
        });
        
        // Show skull if they failed yesterday AND haven't completed all challenges today
        const failedYesterday = (challengesData?.length || 0) > 0 && yesterdayCompletedChallenges.length < (challengesData?.length || 0);
        const showSkull = failedYesterday && completionStatus !== 'completed';
        
        // Check if this user was first to complete all challenges TODAY (not historically)
        const todayLogs = memberLogs.filter(log => log.log_date === today);
        const isFirstFinisher = todayLogs.some(log => log.is_first_finisher);
        
        return {
          ...member,
          role: member.role as 'admin' | 'member',
          todayPushups,
          completionStatus,
          isFirstFinisher,
          showSkull
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
        
        // Check if user has now completed ALL challenges for today
        const { data: allUserLogs } = await supabase
          .from('pushup_logs')
          .select('challenge_id, pushups')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .eq('log_date', today);
        
        // Create a map of user's progress including this new log
        const userProgress = new Map();
        allUserLogs?.forEach(log => {
          if (log.challenge_id) {
            userProgress.set(log.challenge_id, log.pushups);
          }
        });
        // Add/update current challenge progress
        userProgress.set(challengeId, newTotalPushups);
        
        // Check if user completed all challenges
        const allChallengesCompleted = challenges.every(challenge => {
          const userPushups = userProgress.get(challenge.id) || 0;
          return userPushups >= challenge.goal_amount;
        });
        
        if (allChallengesCompleted) {
          // Check if this is the first user to complete ALL challenges today
          const { data: otherFullCompletions } = await supabase
            .from('pushup_logs')
            .select('user_id, challenge_id, completed_at, pushups')
            .eq('group_id', groupId)
            .eq('log_date', today)
            .not('completed_at', 'is', null);
          
          // Count how many unique users have completed all their challenges
          const completedUsers = new Set();
          
          // Group logs by user
          const userLogsMap = new Map();
          otherFullCompletions?.forEach(log => {
            if (!userLogsMap.has(log.user_id)) {
              userLogsMap.set(log.user_id, []);
            }
            userLogsMap.get(log.user_id).push(log);
          });
          
          // Check each user's completion status
          userLogsMap.forEach((userLogs, userId) => {
            const userCompletedChallenges = challenges.filter(challenge => {
              const challengeLog = userLogs.find(log => log.challenge_id === challenge.id);
              return challengeLog && challengeLog.pushups >= challenge.goal_amount;
            });
            
            if (userCompletedChallenges.length === challenges.length) {
              completedUsers.add(userId);
            }
          });
          
          // If no other users completed all challenges, this user is first
          isFirstFinisher = completedUsers.size === 0;
        }
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