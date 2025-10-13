import supabase from "../util/supabaseClient";
import { toast } from '../utils/toast';
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      purchasedCourses: [],
      userPoints: 0,
      maturaDate: null,
      loading: false,
      userProgress: {},
      userFlashcards: {},
      userPointsEarned: {}, 
      error: null,
      initialized: false,

      setUser: (user) => set({ user }),

      fetchUserData: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("purchased_courses, points, matura_date")
            .eq("id", userId)
            .single();

          if (error) throw error;
          set({ 
            purchasedCourses: data?.purchased_courses || [],
            userPoints: data?.points || 0,
            maturaDate: data?.matura_date || null
          });
        } catch (err) {
          set({ purchasedCourses: [], userPoints: 0, maturaDate: null, error: err.message });
        }
      },

      fetchUserProgress: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("user_video_progress")
            .select("video_id, watched")
            .eq("user_id", userId);

          if (error) throw error;

          const progress = {};
          data.forEach((item) => {
            progress[item.video_id] = item.watched;
          });

          set({ userProgress: progress });
        } catch (err) {
          console.error("Błąd pobierania postępu wideo:", err.message);
          set({ userProgress: {} });
        }
      },

      fetchUserFlashcards: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("user_flashcard_progress")
            .select("flashcard_id, status")
            .eq("user_id", userId);

          if (error) throw error;

          const flashcards = {};
          data.forEach((item) => {
            flashcards[item.flashcard_id] = item.status;
          });

          set({ userFlashcards: flashcards });
        } catch (err) {
          console.error("Błąd pobierania postępu fiszek:", err.message);
          set({ userFlashcards: {} });
        }
      },

      saveVideoProgress: async (userId, videoId, watched, courseId = null) => {
        try {
          const { error } = await supabase
            .from("user_video_progress")
            .upsert([{ user_id: userId, video_id: videoId, watched }], {
              onConflict: ["user_id", "video_id"],
            });

          if (error) throw error;

          set((state) => ({
            userProgress: { ...state.userProgress, [videoId]: watched },
          }));

          // Award points for checking checkbox (only once per video)
          if (watched) {
            const { userPointsEarned } = get();
            const pointsKey = `video_${videoId}`;
            
            if (!userPointsEarned[pointsKey]) {
              console.log(`Awarding 10 points for video ${videoId} - checkbox checked`);
              get().awardPoints(10, 'video', videoId, courseId);
              
              // Mark as points earned
              set((state) => ({
                userPointsEarned: { ...state.userPointsEarned, [pointsKey]: true }
              }));
            } else {
              console.log(`Video ${videoId} already earned checkbox points - no points awarded`);
            }
          }
        } catch (err) {
          toast.error("Błąd zapisu postępu wideo:", err.message);
          console.log(err.message)
        }
      },

      saveFlashcardProgress: async (userId, flashcardId, status, courseId = null) => {
        try {
          const { data, error } = await supabase
            .from("user_flashcard_progress")
            .upsert({ user_id: userId, flashcard_id: flashcardId, status });

          if (error) throw error;

          set((state) => ({
            userFlashcards: {
              ...state.userFlashcards,
              [flashcardId]: status,
            },
          }));

          // Award points for marking flashcard as "known" (only once per flashcard)
          if (status === "known") {
            const { userPointsEarned } = get();
            const pointsKey = `flashcard_${flashcardId}`;
            
            if (!userPointsEarned[pointsKey]) {
              console.log(`Awarding 5 points for flashcard ${flashcardId} - marked as known`);
              get().awardPoints(5, 'flashcard', flashcardId, courseId);
              
              // Mark as points earned
              set((state) => ({
                userPointsEarned: { ...state.userPointsEarned, [pointsKey]: true }
              }));
            } else {
              console.log(`Flashcard ${flashcardId} already earned points - no points awarded`);
            }
          }
        } catch (err) {
          toast.error("Błąd zapisywania postępu fiszki");
        }
      },

      awardPointsForReview: async (videoId, courseId = null) => {
        try {
          const { user } = get();
          if (!user) return;

          const { userPointsEarned } = get();
          const pointsKey = `review_${videoId}`;
          
          if (!userPointsEarned[pointsKey]) {
            console.log(`Awarding 20 points for video review ${videoId}`);
            get().awardPoints(20, 'review', videoId, courseId);
            
            // Mark as points earned
            set((state) => ({
              userPointsEarned: { ...state.userPointsEarned, [pointsKey]: true }
            }));
          } else {
            console.log(`Video ${videoId} already earned review points - no points awarded`);
          }
        } catch (err) {
          console.error("Error awarding review points:", err);
        }
      },

      awardPoints: async (points, sourceType, sourceId, courseId = null) => {
        try {
          const { user } = get();
          if (!user) return;

          console.log(`Attempting to award ${points} points for ${sourceType} ${sourceId}`);

          // Get current points and update directly
          const { data: currentUser, error: fetchError } = await supabase
            .from('users')
            .select('points')
            .eq('id', user.id)
            .single();

          if (fetchError) throw fetchError;

          const newPoints = (currentUser?.points || 0) + points;

          const { error: updateError } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', user.id);

          if (updateError) throw updateError;

          // Update local points
          set((state) => ({
            userPoints: newPoints
          }));

          // Show success message
          toast.success(`+${points} punktów!`);
          console.log(`Successfully awarded ${points} points. New total: ${newPoints}`);
        } catch (err) {
          console.error("Error awarding points:", err);
          toast.error("Błąd przyznawania punktów");
        }
      },

      init: async () => {
        set({ loading: true });
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            set({ user: session.user });
            await get().fetchUserData(session.user.id);
            await get().fetchUserProgress(session.user.id);
            await get().fetchUserFlashcards(session.user.id);
            
            // Check if courses should be cleaned up (in June of matura year)
            if (get().shouldCleanupCourses()) {
              await get().cleanupPurchasedCourses();
            }
          } else {
            set({
              user: null,
              purchasedCourses: [],
              userProgress: {},
              userFlashcards: {},
              maturaDate: null,
            });
          }
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ loading: false, initialized: true });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setTimeout(async () => {
              set({ user: session.user });
              await get().fetchUserData(session.user.id);
              await get().fetchUserProgress(session.user.id);
              await get().fetchUserFlashcards(session.user.id);
              
              // Check if courses should be cleaned up (in June of matura year)
              if (get().shouldCleanupCourses()) {
                await get().cleanupPurchasedCourses();
              }
            }, 100); 
          } else {
            set({
              user: null,
              purchasedCourses: [],
              userProgress: {},
              userFlashcards: {},
              maturaDate: null,
            });
          }
          set({ initialized: true });
        });
      },

      register: async ({ email, password, full_name }) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name } },
          });

          if (error) {
            toast.error(error.message);
            set({ error: error.message, loading: false });
            return false;
          }

          if (!data.user) {
            toast.error("Nie udało się utworzyć użytkownika.");
            set({ loading: false });
            return false;
          }

          toast.success(
            "Rejestracja zakończona! Sprawdź maila, aby potwierdzić konto."
          );
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd. Spróbuj ponownie.");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            toast.error(error.message);
            set({ error: error.message, loading: false });
            return false;
          }

          if (!data.user) {
            toast.error("Nie udało się zalogować.");
            set({ loading: false });
            return false;
          }

          // Sprawdź czy użytkownik ma już aktywną sesję
          const { data: existingSessions, error: sessionError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('is_active', true)
            .order('last_activity', { ascending: false });

          if (sessionError) {
            console.error('Błąd sprawdzania sesji:', sessionError);
            // Kontynuuj logowanie mimo błędu
          } else if (existingSessions && existingSessions.length > 0) {
            // Użytkownik ma aktywną sesję - zwróć informację o konflikcie
            set({ 
              loading: false, 
              sessionConflict: {
                user: data.user,
                existingSession: existingSessions[0]
              }
            });
            return 'session_conflict';
          }

          // Utwórz nową sesję
          const sessionToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: {
              width: screen.width,
              height: screen.height
            },
            timestamp: new Date().toISOString()
          };

          const { error: sessionCreateError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: data.user.id,
              session_token: sessionToken,
              device_info: deviceInfo,
              user_agent: navigator.userAgent,
              is_active: true
            });

          if (sessionCreateError) {
            console.error('Błąd tworzenia sesji:', sessionCreateError);
            // Kontynuuj logowanie mimo błędu
          } else {
            // Zapisz token sesji w localStorage
            localStorage.setItem('session_token', sessionToken);
          }

          set({ user: data.user });
          await get().fetchUserData(data.user.id);
          await get().fetchUserProgress(data.user.id);
          await get().fetchUserFlashcards(data.user.id);
          
          // Initialize notifications for the logged-in user
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          await notificationStore.fetchNotifications(data.user.id);
          
          toast.success("Zalogowano pomyślnie.");
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd. Spróbuj ponownie.");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          // Dezaktywuj sesję w bazie danych
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken) {
            await supabase
              .from('user_sessions')
              .update({ is_active: false })
              .eq('session_token', sessionToken);
            
            localStorage.removeItem('session_token');
          }

          await supabase.auth.signOut();
          
          // Clear notifications store
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          notificationStore.set({ notifications: [], userNotifications: [], unreadCount: 0 });
          
          set({
            user: null,
            purchasedCourses: [],
            userProgress: {},
            userFlashcards: {},
            sessionConflict: null,
          });
          toast.success("Wylogowano");
        } catch (error) {
          toast.error("Błąd wylogowywania");
        }
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const redirectUrl = `${window.location.origin}/reset-password`;
          console.log('Password reset redirect URL:', redirectUrl);
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
          });

          if (error) {
            console.error('Password reset error:', error);
            toast.error(error.message);
            set({ error: error.message, loading: false });
            return false;
          }

          console.log('Password reset email sent successfully');

          toast.success("Sprawdź swoją skrzynkę e-mail i kliknij link resetujący");
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd. Spróbuj ponownie.");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      updatePassword: async (newPassword) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.updateUser({ 
            password: newPassword 
          });

          if (error) {
            toast.error(error.message);
            set({ error: error.message, loading: false });
            return false;
          }

          toast.success("Hasło zostało zmienione pomyślnie");
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd podczas zmiany hasła");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      updateMaturaDate: async (maturaDate) => {
        const { user, maturaDate: currentMaturaDate } = get();
        if (!user) return false;

        // Prevent changing matura date if already set
        if (currentMaturaDate) {
          toast.error("Data matury może być ustawiona tylko raz");
          return false;
        }

        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('users')
            .update({ matura_date: maturaDate })
            .eq('id', user.id);

          if (error) {
            toast.error("Błąd aktualizacji daty matury: " + error.message);
            set({ error: error.message, loading: false });
            return false;
          }

          set({ maturaDate: maturaDate });
          toast.success("Data matury została ustawiona pomyślnie!");
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd podczas aktualizacji daty matury");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      // Check if user can purchase courses (must have matura_date set)
      canPurchaseCourses: () => {
        const { maturaDate } = get();
        return !!maturaDate;
      },

      // Get matura year from date
      getMaturaYear: () => {
        const { maturaDate } = get();
        if (!maturaDate) return null;
        return parseInt(maturaDate.split('-')[0]);
      },

      // Check if user's courses should be cleaned up (called in June)
      shouldCleanupCourses: () => {
        const { maturaDate } = get();
        if (!maturaDate) return false;
        
        const maturaYear = parseInt(maturaDate.split('-')[0]);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-11, where 5 = June
        
        // Clean up in June of the matura year
        return currentYear === maturaYear && currentMonth === 5; // May = 5, June = 5
      },

      // Cleanup purchased courses (for current matura year)
      cleanupPurchasedCourses: async () => {
        const { user } = get();
        if (!user) return false;

        try {
          const { error } = await supabase
            .from('users')
            .update({ purchased_courses: [] })
            .eq('id', user.id);

          if (error) {
            console.error("Error cleaning up purchased courses:", error);
            return false;
          }

          set({ purchasedCourses: [] });
          toast.info("Twoje zakupione kursy zostały wyczyszczone zgodnie z datą matury.");
          return true;
        } catch (err) {
          console.error("Error cleaning up purchased courses:", err);
          return false;
        }
      },

      // Wymuszenie wylogowania z innych urządzeń
      forceLogoutOtherDevices: async () => {
        try {
          const { user } = get();
          if (!user) return false;

          const sessionToken = localStorage.getItem('session_token');
          if (!sessionToken) return false;

          // Dezaktywuj inne sesje użytkownika
          const { error } = await supabase
            .rpc('deactivate_other_sessions', {
              p_user_id: user.id,
              p_current_session_token: sessionToken
            });

          if (error) throw error;

          toast.success("Wylogowano z innych urządzeń");
          return true;
        } catch (error) {
          console.error('Błąd wymuszenia wylogowania:', error);
          toast.error("Błąd wylogowywania z innych urządzeń");
          return false;
        }
      },

      // Rozwiązanie konfliktu sesji - zaloguj z wylogowaniem innych urządzeń
      resolveSessionConflict: async () => {
        try {
          const { sessionConflict } = get();
          if (!sessionConflict) return false;

          // Wymuś wylogowanie z innych urządzeń
          const sessionToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: {
              width: screen.width,
              height: screen.height
            },
            timestamp: new Date().toISOString()
          };

          // Dezaktywuj inne sesje i utwórz nową
          const { error: deactivateError } = await supabase
            .rpc('deactivate_other_sessions', {
              p_user_id: sessionConflict.user.id,
              p_current_session_token: sessionToken
            });

          if (deactivateError) throw deactivateError;

          // Utwórz nową sesję
          const { error: sessionCreateError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: sessionConflict.user.id,
              session_token: sessionToken,
              device_info: deviceInfo,
              user_agent: navigator.userAgent,
              is_active: true
            });

          if (sessionCreateError) throw sessionCreateError;

          // Zapisz token sesji
          localStorage.setItem('session_token', sessionToken);

          // Ustaw użytkownika i pobierz dane
          set({ user: sessionConflict.user, sessionConflict: null });
          await get().fetchUserData(sessionConflict.user.id);
          await get().fetchUserProgress(sessionConflict.user.id);
          await get().fetchUserFlashcards(sessionConflict.user.id);
          
          // Initialize notifications
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          await notificationStore.fetchNotifications(sessionConflict.user.id);
          
          toast.success("Zalogowano pomyślnie");
          return true;
        } catch (error) {
          console.error('Błąd rozwiązania konfliktu sesji:', error);
          toast.error("Błąd logowania");
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        purchasedCourses: state.purchasedCourses,
      }),
    }
  )
);
