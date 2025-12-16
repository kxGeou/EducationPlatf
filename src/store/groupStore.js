import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useGroupStore = create((set, get) => ({
  groups: [],
  userGroups: [],
  loading: false,
  error: null,
  newGroupsCount: 0,

  // Fetch all groups (for admin)
  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ groups: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching groups:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować grup');
      return [];
    }
  },

  // Fetch user's groups
  fetchUserGroups: async (userId) => {
    if (!userId) return [];
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          *,
          groups (
            id,
            name,
            discord_link,
            class_type,
            date,
            start_time,
            end_time,
            description,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Get last checked timestamp from localStorage
      const lastCheckedKey = `userGroupsLastChecked:${userId}`;
      const lastChecked = localStorage.getItem(lastCheckedKey);
      const lastCheckedTime = lastChecked ? new Date(lastChecked) : null;

      // Extract groups from user_groups join, handling null cases
      const groups = (data || [])
        .map(item => {
          // Handle both nested structure and direct structure
          if (item.groups) {
            return {
              ...item.groups,
              assigned_at: item.assigned_at // Include assigned_at for new group detection
            };
          }
          return item;
        })
        .filter(Boolean)
        .filter(group => group && group.id); // Ensure group has an id
      
      // Count new groups (assigned after last check)
      let newGroupsCount = 0;
      if (lastCheckedTime) {
        newGroupsCount = groups.filter(group => {
          if (!group.assigned_at) return false;
          const assignedAt = new Date(group.assigned_at);
          return assignedAt > lastCheckedTime;
        }).length;
      } else {
        // If never checked, all groups are "new" but we'll only show badge if there are any
        newGroupsCount = groups.length > 0 ? 1 : 0;
      }
      
      console.log('Fetched user groups:', groups, 'new groups count:', newGroupsCount);
      set({ userGroups: groups, newGroupsCount, loading: false });
      return groups;
    } catch (err) {
      console.error('Error fetching user groups:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować grup użytkownika');
      return [];
    }
  },

  // Create group
  createGroup: async (groupData, skipToast = false) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: groupData.name,
          discord_link: groupData.discord_link,
          class_type: groupData.class_type,
          description: groupData.description || null,
          date: groupData.date,
          start_time: groupData.start_time,
          end_time: groupData.end_time
        }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        groups: [...state.groups, data].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.start_time.localeCompare(b.start_time);
        }),
        loading: false
      }));

      if (!skipToast) {
        toast.success('Grupa została utworzona');
      }
      return data;
    } catch (err) {
      console.error('Error creating group:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się utworzyć grupy');
      throw err;
    }
  },

  // Update group
  updateGroup: async (groupId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, ...data } : g
        ),
        loading: false
      }));

      toast.success('Grupa została zaktualizowana');
      return data;
    } catch (err) {
      console.error('Error updating group:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się zaktualizować grupy');
      throw err;
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        loading: false
      }));

      toast.success('Grupa została usunięta');
      return true;
    } catch (err) {
      console.error('Error deleting group:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się usunąć grupy');
      throw err;
    }
  },

  // Assign users to group
  assignUsersToGroup: async (groupId, userIds, skipToast = false) => {
    set({ loading: true, error: null });
    try {
      if (!userIds || userIds.length === 0) {
        throw new Error('Brak użytkowników do przypisania');
      }

      const assignments = userIds.map(userId => ({
        group_id: groupId,
        user_id: userId
      }));

      // First, check which assignments already exist
      const { data: existing } = await supabase
        .from('user_groups')
        .select('user_id, group_id')
        .eq('group_id', groupId)
        .in('user_id', userIds);

      const existingKeys = new Set(
        (existing || []).map(e => `${e.user_id}-${e.group_id}`)
      );

      // Filter out existing assignments
      const newAssignments = assignments.filter(
        a => !existingKeys.has(`${a.user_id}-${a.group_id}`)
      );

      if (newAssignments.length === 0) {
        if (!skipToast) {
          toast.success('Wszyscy użytkownicy są już przypisani do grupy');
        }
        return [];
      }

      const { data, error } = await supabase
        .from('user_groups')
        .insert(newAssignments)
        .select();

      if (error) throw error;

      if (!skipToast) {
        toast.success(`Przypisano ${userIds.length} użytkowników do grupy`);
      }
      return data;
    } catch (err) {
      console.error('Error assigning users to group:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się przypisać użytkowników do grupy');
      throw err;
    }
  },

  // Remove user from group
  removeUserFromGroup: async (groupId, userId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      set((state) => ({
        userGroups: state.userGroups.filter((g) => g.id !== groupId)
      }));

      toast.success('Użytkownik został usunięty z grupy');
      return true;
    } catch (err) {
      console.error('Error removing user from group:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się usunąć użytkownika z grupy');
      throw err;
    }
  },

  // Get group members
  getGroupMembers: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      return (data || []).map(item => item.users).filter(Boolean);
    } catch (err) {
      console.error('Error fetching group members:', err);
      toast.error('Nie udało się pobrać członków grupy');
      return [];
    }
  },

  // Mark groups as viewed (update last checked timestamp)
  markGroupsAsViewed: (userId) => {
    if (!userId) return;
    const lastCheckedKey = `userGroupsLastChecked:${userId}`;
    localStorage.setItem(lastCheckedKey, new Date().toISOString());
    set({ newGroupsCount: 0 });
  }
}));

