import { useCallback } from 'react';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useSessionManagement = () => {
  
  // Generowanie unikalnego tokenu sesji
  const generateSessionToken = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  // Pobieranie informacji o urządzeniu
  const getDeviceInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    return {
      userAgent,
      deviceType,
      timestamp: new Date().toISOString()
    };
  }, []);

  // Sprawdzanie czy użytkownik ma aktywną sesję
  const checkActiveSession = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // ostatnie 24h
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Błąd sprawdzania sesji:', error);
        return { hasActiveSession: false, sessions: [] };
      }

      return {
        hasActiveSession: data && data.length > 0,
        sessions: data || []
      };
    } catch (err) {
      console.error('Błąd sprawdzania sesji:', err);
      return { hasActiveSession: false, sessions: [] };
    }
  }, []);

  // Tworzenie nowej sesji
  const createSession = useCallback(async (userId) => {
    try {
      const sessionToken = generateSessionToken();
      const deviceInfo = getDeviceInfo();

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_info: JSON.stringify(deviceInfo),
          user_agent: deviceInfo.userAgent,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Błąd tworzenia sesji:', error);
        return null;
      }

      // Zapisanie tokenu sesji w localStorage
      localStorage.setItem('session_token', sessionToken);
      
      return data;
    } catch (err) {
      console.error('Błąd tworzenia sesji:', err);
      return null;
    }
  }, [generateSessionToken, getDeviceInfo]);

  // Aktualizacja ostatniej aktywności sesji
  const updateSessionActivity = useCallback(async (sessionToken) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken)
        .eq('is_active', true);

      if (error) {
        console.error('Błąd aktualizacji sesji:', error);
      }
    } catch (err) {
      console.error('Błąd aktualizacji sesji:', err);
    }
  }, []);

  // Kończenie wszystkich sesji użytkownika
  const endAllUserSessions = useCallback(async (userId) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Błąd kończenia sesji:', error);
        return false;
      }

      // Usunięcie tokenu z localStorage
      localStorage.removeItem('session_token');
      return true;
    } catch (err) {
      console.error('Błąd kończenia sesji:', err);
      return false;
    }
  }, []);

  // Kończenie konkretnej sesji
  const endSession = useCallback(async (sessionToken) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Błąd kończenia sesji:', error);
        return false;
      }

      localStorage.removeItem('session_token');
      return true;
    } catch (err) {
      console.error('Błąd kończenia sesji:', err);
      return false;
    }
  }, []);

  // Wymuszenie wylogowania innych sesji (dla nowego logowania)
  const forceLogoutOtherSessions = useCallback(async (userId, currentSessionToken) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .neq('session_token', currentSessionToken)
        .eq('is_active', true);

      if (error) {
        console.error('Błąd wymuszania wylogowania:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Błąd wymuszania wylogowania:', err);
      return false;
    }
  }, []);

  // Sprawdzanie i walidacja aktualnej sesji
  const validateCurrentSession = useCallback(async () => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      return { isValid: false, session: null };
    }

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (error || !data) {
        localStorage.removeItem('session_token');
        return { isValid: false, session: null };
      }

      // Aktualizacja ostatniej aktywności
      await updateSessionActivity(sessionToken);
      
      return { isValid: true, session: data };
    } catch (err) {
      console.error('Błąd walidacji sesji:', err);
      localStorage.removeItem('session_token');
      return { isValid: false, session: null };
    }
  }, [updateSessionActivity]);

  return {
    checkActiveSession,
    createSession,
    updateSessionActivity,
    endAllUserSessions,
    endSession,
    forceLogoutOtherSessions,
    validateCurrentSession,
    getDeviceInfo
  };
};
