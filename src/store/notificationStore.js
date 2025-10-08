import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { toast } from '../utils/toast'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  userNotifications: [],
  loading: false,
  error: null,
  unreadCount: 0,

  // Clear all notifications (used on logout)
  set: (newState) => set(newState),

  // Fetch all notifications for logged-in user
  fetchNotifications: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    
    try {
      // Get all active notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          type,
          file_url,
          file_name,
          created_at,
          expires_at,
          is_active
        `)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

        // Get user's notification read status (exclude hidden notifications)
        const { data: userNotificationsData, error: userNotificationsError } = await supabase
          .from('user_notifications')
          .select('notification_id, read_at, hidden_at')
          .eq('user_id', userId)
          .is('hidden_at', null); // Only get notifications that are not hidden

      if (userNotificationsError) throw userNotificationsError;

      // Merge server read with localStorage fallback
      const localKey = `userNotificationReads:${userId}`;
      let localReads = [];
      try {
        localReads = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch (_) { localReads = []; }

      const readNotificationIds = new Set([
        ...localReads,
        ...(userNotificationsData?.map(un => un.notification_id) || [])
      ]);
      
      const unreadCount = notificationsData?.filter(n => !readNotificationIds.has(n.id)).length || 0;

      // Store merged userNotifications locally in state for quick checks
      const mergedUserNotifications = Array.from(readNotificationIds).map(id => ({ notification_id: id }));

      set({ 
        notifications: notificationsData || [], 
        userNotifications: mergedUserNotifications,
        unreadCount 
      });

    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ error: error.message });
      toast.error('Błąd podczas pobierania powiadomień');
    } finally {
      set({ loading: false });
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId, userId) => {
    try {
      // Use upsert with ignoreDuplicates to avoid conflicts
      const { error } = await supabase
        .from('user_notifications')
        .upsert({
          user_id: userId,
          notification_id: notificationId,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,notification_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update localStorage fallback
      try {
        const localKey = `userNotificationReads:${userId}`;
        const current = JSON.parse(localStorage.getItem(localKey) || '[]');
        if (!current.includes(notificationId)) {
          localStorage.setItem(localKey, JSON.stringify([...current, notificationId]));
        }
      } catch (_) {}

      // Update local state immediately
      const { notifications, userNotifications } = get();
      const readNotificationIds = new Set(
        [...userNotifications, { notification_id: notificationId }].map(un => un.notification_id)
      );
      const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

      set({ 
        userNotifications: [...userNotifications, { notification_id: notificationId, read_at: new Date().toISOString() }],
        unreadCount 
      });

      // Ensure persistence reflected on next load; refetch quietly
      get().fetchNotifications(userId);

    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Błąd podczas oznaczania powiadomienia jako przeczytane');
    }
  },


  // Admin: Create new notification
  createNotification: async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Powiadomienie zostało utworzone');
      return data;

    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Błąd podczas tworzenia powiadomienia');
      throw error;
    }
  },

  // Admin: Update notification
  updateNotification: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Powiadomienie zostało zaktualizowane');
      return data;

    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Błąd podczas aktualizacji powiadomienia');
      throw error;
    }
  },

  // Admin: Delete notification
  deleteNotification: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Powiadomienie zostało usunięte');

    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Błąd podczas usuwania powiadomienia');
      throw error;
    }
  },

  // Admin: Fetch all notifications for management
  fetchAllNotifications: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ notifications: data || [] });

    } catch (error) {
      console.error('Error fetching all notifications:', error);
      set({ error: error.message });
      toast.error('Błąd podczas pobierania powiadomień');
    } finally {
      set({ loading: false });
    }
  },

  // Upload file for notification
  uploadNotificationFile: async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `notifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notification-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('notification-files')
        .getPublicUrl(filePath);

      return {
        file_url: data.publicUrl,
        file_name: file.name,
        file_path: filePath
      };

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Błąd podczas przesyłania pliku');
      throw error;
    }
  }
}))
