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
}

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
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
      setMembers((data || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member'
      })));
    } catch (error) {
      console.error('Error fetching group members:', error);
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
    loading,
    selectGroup,
    refreshGroups,
    fetchGroupMembers
  };
};