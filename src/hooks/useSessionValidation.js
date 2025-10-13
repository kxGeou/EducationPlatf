import { useState, useEffect, useCallback } from 'react';
import supabase from '../util/supabaseClient';
import { useAuthStore } from '../store/authStore';

export const useSessionValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [sessionBlocked, setSessionBlocked] = useState(false);
  const { user, logout } = useAuthStore();

  // Generowanie unikalnego tokenu sesji
  const generateSessionToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Pobieranie informacji o urządzeniu
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: new Date().toISOString()
    };
  };

  // Tworzenie nowej sesji
  const createUserSession = async (userId) => {
    try {
      const sessionToken = generateSessionToken();
      const deviceInfo = getDeviceInfo();
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo,
          ip_address: null, // Można dodać logikę do pobierania IP
          user_agent: navigator.userAgent,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Zapisz token sesji w localStorage
      localStorage.setItem('session_token', sessionToken);
      
      return { sessionToken, sessionId: data.id };
    } catch (error) {
      console.error('Błąd tworzenia sesji:', error);
      throw error;
    }
  };

  // Sprawdzanie czy użytkownik ma już aktywną sesję
  const checkExistingSession = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Błąd sprawdzania istniejącej sesji:', error);
      throw error;
    }
  };

  // Dezaktywacja innych sesji użytkownika
  const deactivateOtherSessions = async (userId, currentSessionToken) => {
    try {
      const { error } = await supabase
        .rpc('deactivate_other_sessions', {
          p_user_id: userId,
          p_current_session_token: currentSessionToken
        });

      if (error) throw error;
    } catch (error) {
      console.error('Błąd dezaktywacji innych sesji:', error);
      throw error;
    }
  };

  // Aktualizacja aktywności sesji
  const updateSessionActivity = useCallback(async (sessionToken) => {
    if (!sessionToken) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken);
    } catch (error) {
      console.error('Błąd aktualizacji aktywności sesji:', error);
    }
  }, []);

  // Weryfikacja aktualnej sesji
  const validateCurrentSession = async () => {
    if (!user) return true;

    setIsValidating(true);
    
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (!sessionToken) {
        // Brak tokenu sesji - sprawdź czy użytkownik ma inne aktywne sesje
        const existingSession = await checkExistingSession(user.id);
        if (existingSession) {
          setSessionBlocked(true);
          return false;
        }
        // Utwórz nową sesję
        await createUserSession(user.id);
        return true;
      }

      // Sprawdź czy token sesji jest aktywny
      const { data, error } = await supabase
        .rpc('has_active_session', {
          p_user_id: user.id,
          p_session_token: sessionToken
        });

      if (error) throw error;

      if (!data) {
        // Sesja wygasła lub została dezaktywowana
        localStorage.removeItem('session_token');
        
        // Sprawdź czy użytkownik ma inne aktywne sesje
        const existingSession = await checkExistingSession(user.id);
        if (existingSession) {
          setSessionBlocked(true);
          return false;
        }
        
        // Utwórz nową sesję
        await createUserSession(user.id);
      } else {
        // Aktualizuj aktywność sesji
        await updateSessionActivity(sessionToken);
      }

      return true;
    } catch (error) {
      console.error('Błąd walidacji sesji:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Wymuszenie wylogowania z innych urządzeń
  const forceLogoutOtherDevices = async () => {
    if (!user) return false;

    try {
      const sessionToken = localStorage.getItem('session_token');
      await deactivateOtherSessions(user.id, sessionToken);
      return true;
    } catch (error) {
      console.error('Błąd wymuszenia wylogowania:', error);
      return false;
    }
  };

  // Wylogowanie z aktualnej sesji
  const logoutFromCurrentSession = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionToken) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken);
        
        localStorage.removeItem('session_token');
      }
      
      await logout();
    } catch (error) {
      console.error('Błąd wylogowania z sesji:', error);
      await logout(); // Wyloguj mimo błędu
    }
  };

  // Automatyczna walidacja sesji co 5 minut
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      validateCurrentSession();
    }, 5 * 60 * 1000); // 5 minut

    return () => clearInterval(interval);
  }, [user]);

  return {
    isValidating,
    sessionBlocked,
    validateCurrentSession,
    forceLogoutOtherDevices,
    logoutFromCurrentSession,
    createUserSession,
    updateSessionActivity
  };
};