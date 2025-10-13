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
            // Sprawdź ważność sesji w bazie danych
            const sessionToken = localStorage.getItem('session_token');
            
            if (!sessionToken) {
              // Brak tokenu sesji - wyloguj użytkownika
              console.log('⚠️ No session token found - logging out');
              await supabase.auth.signOut();
              localStorage.removeItem('auth-storage');
              set({
                user: null,
                purchasedCourses: [],
                userProgress: {},
                userFlashcards: {},
                maturaDate: null,
              });
              set({ loading: false, initialized: true });
              return;
            }

            const { data: sessionData, error: sessionError } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('session_token', sessionToken)
              .eq('is_active', true)
              .gt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
              .single();

            if (sessionError || !sessionData) {
              // Sesja jest nieprawidłowa - wyloguj użytkownika
              console.log('⚠️ Invalid session - logging out');
              await supabase.auth.signOut();
              localStorage.removeItem('session_token');
              localStorage.removeItem('auth-storage');
              set({
                user: null,
                purchasedCourses: [],
                userProgress: {},
                userFlashcards: {},
                maturaDate: null,
              });
              set({ loading: false, initialized: true });
              return;
            }

            // Aktualizuj ostatnią aktywność sesji
            await supabase
              .from('user_sessions')
              .update({ last_activity: new Date().toISOString() })
              .eq('session_token', sessionToken);

            set({ user: session.user });
            await get().fetchUserData(session.user.id);
            await get().fetchUserProgress(session.user.id);
            await get().fetchUserFlashcards(session.user.id);
            
            // Check if courses should be cleaned up (in June of matura year)
            if (get().shouldCleanupCourses()) {
              await get().cleanupPurchasedCourses();
            }

            // Cleanup inactive sessions (do this periodically)
            await get().cleanupInactiveSessions();
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
              // Sprawdź ważność sesji w bazie danych
              const sessionToken = localStorage.getItem('session_token');
              
              if (!sessionToken) {
                // Brak tokenu sesji - wyloguj użytkownika
                console.log('⚠️ No session token in onAuthStateChange - logging out');
                await supabase.auth.signOut();
                localStorage.removeItem('auth-storage');
                set({
                  user: null,
                  purchasedCourses: [],
                  userProgress: {},
                  userFlashcards: {},
                  maturaDate: null,
                });
                return;
              }

              const { data: sessionData, error: sessionError } = await supabase
                .from('user_sessions')
                .select('*')
                .eq('session_token', sessionToken)
                .eq('is_active', true)
                .gt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .single();

              if (sessionError || !sessionData) {
                // Sesja jest nieprawidłowa - wyloguj użytkownika
                console.log('⚠️ Invalid session in onAuthStateChange - logging out');
                await supabase.auth.signOut();
                localStorage.removeItem('session_token');
                localStorage.removeItem('auth-storage');
                set({
                  user: null,
                  purchasedCourses: [],
                  userProgress: {},
                  userFlashcards: {},
                  maturaDate: null,
                });
                return;
              }

              // Aktualizuj ostatnią aktywność sesji
              await supabase
                .from('user_sessions')
                .update({ last_activity: new Date().toISOString() })
                .eq('session_token', sessionToken);

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
          // Najpierw spróbuj zalogować się aby uzyskać user_id
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            toast.error(authError.message);
            set({ error: authError.message, loading: false });
            return false;
          }

          if (!authData.user) {
            toast.error("Nie udało się zalogować.");
            set({ loading: false });
            return false;
          }

          // Teraz sprawdź czy użytkownik ma już aktywną sesję
          console.log('🔍 Checking active sessions for user:', authData.user.id);
          const { data: activeSessions, error: sessionError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('is_active', true)
            .gt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          console.log('📊 Active sessions found:', activeSessions);
          console.log('🔢 Number of active sessions:', activeSessions?.length || 0);

          if (sessionError) {
            console.error('❌ Error checking sessions:', sessionError);
          }

          if (!sessionError && activeSessions && activeSessions.length > 0) {
            // Wyloguj użytkownika, ponieważ ma już aktywną sesję
            console.log('🚫 User already has active session, blocking login');
            await supabase.auth.signOut();
            toast.error("To konto jest już zalogowane na innym urządzeniu. Możesz się zalogować tylko z jednego urządzenia na raz.");
            set({ loading: false });
            return false;
          }

          console.log('✅ No active sessions found, proceeding with login');

          const { data, error } = { data: authData, error: authError };

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

          // Utwórz nową sesję
          console.log('🔐 Creating new session for user:', data.user.id);
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const deviceInfo = {
            userAgent: navigator.userAgent,
            deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            timestamp: new Date().toISOString()
          };

          console.log('📱 Device type:', deviceInfo.deviceType);

          const { error: sessionCreateError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: data.user.id,
              session_token: sessionToken,
              device_info: JSON.stringify(deviceInfo),
              user_agent: deviceInfo.userAgent,
              is_active: true
            });

          if (sessionCreateError) {
            console.error('❌ Błąd tworzenia sesji:', sessionCreateError);
            // Kontynuuj logowanie nawet jeśli nie udało się utworzyć sesji
          } else {
            console.log('✅ Session created successfully:', sessionToken.substring(0, 10) + '...');
            // Zapisanie tokenu sesji w localStorage
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
          console.log('🚪 Logging out user...');
          
          // Zakończ sesję w bazie danych
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken) {
            console.log('🔒 Deactivating session in database...');
            const { error: sessionError } = await supabase
              .from('user_sessions')
              .update({ is_active: false })
              .eq('session_token', sessionToken);

            if (sessionError) {
              console.error('❌ Błąd kończenia sesji:', sessionError);
            } else {
              console.log('✅ Session deactivated successfully');
            }
          }

          // Wyloguj z Supabase Auth
          console.log('🔓 Signing out from Supabase...');
          await supabase.auth.signOut();
          
          // Wyczyść stan aplikacji
          console.log('🧹 Clearing application state...');
          set({
            user: null,
            purchasedCourses: [],
            userProgress: {},
            userFlashcards: {},
            userPoints: 0,
            maturaDate: null,
            userPointsEarned: {},
          });
          
          // Usuń wszystkie dane z localStorage
          console.log('🗑️ Clearing localStorage...');
          localStorage.removeItem('session_token');
          localStorage.removeItem('auth-storage'); // Usuń Zustand persist storage
          
          // Clear notifications store
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          notificationStore.set({ notifications: [], userNotifications: [], unreadCount: 0 });
          
          console.log('✅ Logout completed successfully');
          toast.success("Wylogowano");
        } catch (error) {
          console.error('❌ Logout error:', error);
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

      // Cleanup inactive sessions (called periodically)
      cleanupInactiveSessions: async () => {
        try {
          const { error } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('is_active', true)
            .lt('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // starsze niż 24h

          if (error) {
            console.error("Error cleaning up inactive sessions:", error);
            return false;
          }

          console.log("Inactive sessions cleaned up successfully");
          return true;
        } catch (err) {
          console.error("Error cleaning up inactive sessions:", err);
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
