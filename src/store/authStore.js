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
      referralCode: null,
      referralDiscountAvailable: false,
      referralUsedBy: null,
      referredBy: null,
      sessionBlocked: false, // Flaga zapobiegająca automatycznemu ustawieniu użytkownika przy blokadzie sesji

      setUser: (user) => set({ user }),

      fetchUserData: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("purchased_courses, points, matura_date, referral_discount_available, referred_by_user_id")
            .eq("id", userId)
            .single();

          if (error) throw error;

          set({ 
            purchasedCourses: data?.purchased_courses || [],
            userPoints: data?.points || 0,
            maturaDate: data?.matura_date || null,
            referralDiscountAvailable: data?.referral_discount_available || false,
            referredBy: data?.referred_by_user_id || null,
            // referralCode and referralUsedBy are fetched separately in fetchReferralData
          });
        } catch (err) {
          set({ 
            purchasedCourses: [], 
            userPoints: 0, 
            maturaDate: null, 
            referralDiscountAvailable: false,
            referredBy: null,
            error: err.message 
          });
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
              // Brak tokenu sesji - tylko wyczyść stan aplikacji (NIE wylogowuj z Supabase Auth)
              console.log('⚠️ No session token found - clearing app state only');
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

            // Sprawdź czy sesja jest aktywna (ostatnia aktywność w ciągu 2 godzin)
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            const { data: sessionData, error: sessionError } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('session_token', sessionToken)
              .eq('is_active', true)
              .gt('last_activity', twoHoursAgo)
              .single();

            if (sessionError || !sessionData) {
              // Sesja jest nieprawidłowa lub nieaktywna (starsza niż 2h)
              // Usuń wszystkie sesje tego użytkownika z bazy
              if (session?.user?.id) {
                await supabase
                  .from('user_sessions')
                  .delete()
                  .eq('user_id', session.user.id);
              }
              
              console.log('⚠️ Session inactive (older than 2h) - clearing app state and deleting sessions');
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
            await get().fetchReferralData();
            await get().fetchUserProgress(session.user.id);
            await get().fetchUserFlashcards(session.user.id);
            // Ensure free sections are granted to all users
            await get().grantFreeSectionsToUser();
            
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
          // Sprawdź czy sesja jest zablokowana - jeśli tak, nie ustawiaj użytkownika
          if (get().sessionBlocked) {
            return;
          }

          if (session?.user) {
            setTimeout(async () => {
              // Sprawdź czy sesja nie została zablokowana w międzyczasie
              if (get().sessionBlocked) {
                return;
              }

              // Sprawdź ważność sesji w bazie danych
              const sessionToken = localStorage.getItem('session_token');
              
              if (!sessionToken) {
                // Brak tokenu sesji - wyczyść stan aplikacji
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

              // Sprawdź czy sesja jest aktywna (ostatnia aktywność w ciągu 2 godzin)
              const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
              const { data: sessionData, error: sessionError } = await supabase
                .from('user_sessions')
                .select('*')
                .eq('session_token', sessionToken)
                .eq('is_active', true)
                .gt('last_activity', twoHoursAgo)
                .single();

              if (sessionError || !sessionData) {
                // Sesja została usunięta lub wygasła
                // Sprawdź czy sesja była aktywna (token istnieje, ale sesja nie) - oznacza to wylogowanie z innego urządzenia
                const sessionWasDeleted = sessionToken && sessionError?.code === 'PGRST116'; // PGRST116 = no rows returned
                
                if (sessionWasDeleted && session?.user?.id) {
                  // Sesja została usunięta z innego urządzenia - pokaż powiadomienie
                  toast.warning("Zostałeś wylogowany z tego urządzenia, ponieważ zalogowano się na innym urządzeniu.");
                }
                
                // Usuń wszystkie sesje tego użytkownika z bazy (jeśli jeszcze jakieś są)
                if (session?.user?.id) {
                  await supabase
                    .from('user_sessions')
                    .delete()
                    .eq('user_id', session.user.id);
                }
                
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
              await get().fetchReferralData();
              await get().fetchUserProgress(session.user.id);
              await get().fetchUserFlashcards(session.user.id);
              // Ensure free sections are granted to all users
              await get().grantFreeSectionsToUser();
              
              // Check if courses should be cleaned up (in June of matura year)
              if (get().shouldCleanupCourses()) {
                await get().cleanupPurchasedCourses();
              }
            }, 100); 
          } else {
            // Gdy session jest null, sprawdź czy to nie jest z powodu blokady sesji
            if (get().sessionBlocked) {
              return;
            }
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

          // Wyczyść nieaktywne sesje użytkownika (starsze niż 2 godziny)
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
          
          // Usuń nieaktywne sesje (starsze niż 2h)
          await supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', authData.user.id)
            .lt('last_activity', twoHoursAgo);

          // Sprawdź czy są jeszcze aktywne sesje (z ostatnich 2 godzin)
          const { data: activeSessions, error: sessionError } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', authData.user.id)
            .gt('last_activity', twoHoursAgo)
            .order('last_activity', { ascending: false });


          // Limit równoległych sesji: maksymalnie 2
          const MAX_SESSIONS = 2;
          const activeSessionsCount = activeSessions?.length || 0;

          // Jeśli jest już maksymalna liczba sesji, zwróć informację o aktywnych sesjach
          if (!sessionError && activeSessionsCount >= MAX_SESSIONS) {
            // Ustaw flagę blokady sesji PRZED signOut
            set({ sessionBlocked: true });
            
            // Wyloguj użytkownika z Supabase Auth, żeby nie było automatycznego przekierowania
            await supabase.auth.signOut();
            
            // Przygotuj informacje o sesjach do wyświetlenia
            const sessionsInfo = activeSessions.map(session => {
              let deviceInfo = {};
              try {
                deviceInfo = session.device_info ? JSON.parse(session.device_info) : {};
              } catch (e) {
                // Ignoruj błędy parsowania
              }
              
              return {
                sessionToken: session.session_token,
                deviceType: deviceInfo.deviceType || 'desktop',
                userAgent: session.user_agent || deviceInfo.userAgent || 'Unknown',
                lastActivity: session.last_activity,
                createdAt: session.created_at
              };
            });

            set({ loading: false });
            return {
              blocked: true,
              reason: 'max_sessions_reached',
              activeSessions: sessionsInfo,
              userId: authData.user.id,
              email: authData.user.email
            };
          }

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
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const deviceInfo = {
            userAgent: navigator.userAgent,
            deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            timestamp: new Date().toISOString()
          };

          const { error: sessionCreateError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: data.user.id,
              session_token: sessionToken,
              device_info: JSON.stringify(deviceInfo),
              user_agent: deviceInfo.userAgent,
              is_active: true
            });

          if (!sessionCreateError) {
            localStorage.setItem('session_token', sessionToken);
          }

          set({ user: data.user });
          await get().fetchUserData(data.user.id);
          await get().fetchReferralData();
          await get().fetchUserProgress(data.user.id);
          await get().fetchUserFlashcards(data.user.id);
          // Ensure free sections are granted to all users
          await get().grantFreeSectionsToUser();
          
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
          // Usuń sesję z bazy danych
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken) {
            await supabase
              .from('user_sessions')
              .delete()
              .eq('session_token', sessionToken);
          }

          // Wyloguj z Supabase Auth
          await supabase.auth.signOut();
          
          // Wyczyść stan aplikacji
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
          localStorage.removeItem('session_token');
          localStorage.removeItem('auth-storage');
          
          // Clear notifications store
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          notificationStore.set({ notifications: [], userNotifications: [], unreadCount: 0 });
          
          toast.success("Wylogowano");
        } catch (error) {
          toast.error("Błąd wylogowywania");
        }
      },

      // Wyloguj konkretną sesję (używane przy wyborze sesji do wylogowania)
      logoutSession: async (sessionToken) => {
        try {
          const { error } = await supabase
            .from('user_sessions')
            .delete()
            .eq('session_token', sessionToken);

          if (error) {
            return false;
          }

          return true;
        } catch (err) {
          return false;
        }
      },

      // Kontynuuj logowanie po wylogowaniu wybranej sesji
      continueLoginAfterSessionLogout: async ({ email, password, loggedOutSessionToken }) => {
        // Wyczyść flagę blokady sesji
        set({ sessionBlocked: false, loading: true, error: null });
        try {
          // Najpierw zaloguj się ponownie (sesja mogła wygasnąć)
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError || !authData.user) {
            toast.error(authError?.message || "Nie udało się zalogować.");
            set({ error: authError?.message || "Nie udało się zalogować.", loading: false });
            return false;
          }

          // Wyczyść nieaktywne sesje (starsze niż 2 godziny)
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
          await supabase
            .from('user_sessions')
            .delete()
            .eq('user_id', authData.user.id)
            .lt('last_activity', twoHoursAgo);

          // Utwórz nową sesję
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const deviceInfo = {
            userAgent: navigator.userAgent,
            deviceType: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            timestamp: new Date().toISOString()
          };

          const { error: sessionCreateError } = await supabase
            .from('user_sessions')
            .insert({
              user_id: authData.user.id,
              session_token: sessionToken,
              device_info: JSON.stringify(deviceInfo),
              user_agent: deviceInfo.userAgent,
              is_active: true
            });

          if (!sessionCreateError) {
            localStorage.setItem('session_token', sessionToken);
          }

          set({ user: authData.user });
          await get().fetchUserData(authData.user.id);
          await get().fetchReferralData();
          await get().fetchUserProgress(authData.user.id);
          await get().fetchUserFlashcards(authData.user.id);
          await get().grantFreeSectionsToUser();
          
          const { useNotificationStore } = await import('./notificationStore');
          const notificationStore = useNotificationStore.getState();
          await notificationStore.fetchNotifications(authData.user.id);
          
          toast.success("Zalogowano pomyślnie.");
          set({ loading: false });
          return true;
        } catch (err) {
          toast.error("Wystąpił błąd. Spróbuj ponownie.");
          set({ error: err.message, loading: false });
          return false;
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
      // Cleanup inactive sessions (called periodically)
      // Usuwa wszystkie sesje użytkowników, którzy nie byli aktywni przez 2 godziny
      cleanupInactiveSessions: async () => {
        try {
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
          
          // Znajdź wszystkich użytkowników z nieaktywnymi sesjami (starsze niż 2h)
          const { data: inactiveSessions, error: findError } = await supabase
            .from('user_sessions')
            .select('user_id')
            .lt('last_activity', twoHoursAgo);

          if (findError) {
            console.error("Error finding inactive sessions:", findError);
            return false;
          }

          if (!inactiveSessions || inactiveSessions.length === 0) {
            console.log("No inactive sessions to clean up");
            return true;
          }

          // Dla każdego użytkownika z nieaktywnymi sesjami, usuń WSZYSTKIE jego sesje z bazy
          const userIds = [...new Set(inactiveSessions.map(s => s.user_id))];
          
          for (const userId of userIds) {
            const { error: deleteError } = await supabase
              .from('user_sessions')
              .delete()
              .eq('user_id', userId);

            if (deleteError) {
              console.error(`Error deleting sessions for user ${userId}:`, deleteError);
            } else {
              console.log(`✅ Deleted all sessions for user ${userId} (inactive for 2+ hours)`);
            }
          }

          console.log(`Inactive sessions deleted successfully for ${userIds.length} users`);
          return true;
        } catch (err) {
          console.error("Error cleaning up inactive sessions:", err);
          return false;
        }
      },
      
      // Grant free sections (price_cents = 0) to every user
      grantFreeSectionsToUser: async () => {
        try {
          const { user } = get();
          if (!user) return;
          
          // Fetch user's current purchases
          const { data: userRow, error: userErr } = await supabase
            .from('users')
            .select('purchased_courses')
            .eq('id', user.id)
            .single();
          if (userErr) return;
          const existing = userRow?.purchased_courses || [];
          
          // Fetch all free sections (one per course should be configured with price 0)
          const { data: freeSections, error: freeErr } = await supabase
            .from('courses')
            .select('id')
            .eq('price_cents', 0);
          if (freeErr) return;
          const freeIds = (freeSections || []).map((s) => s.id).filter(Boolean);
          
          if (freeIds.length === 0) {
            // Nothing to merge, just ensure local state reflects existing
            set({ purchasedCourses: existing });
            return;
          }
          
          const mergedSet = new Set([...
            existing,
            ...freeIds,
          ]);
          const merged = Array.from(mergedSet);
          
          // Only update DB if changed
          const changed = merged.length !== existing.length || existing.some((id) => !mergedSet.has(id));
          if (changed) {
            const { error: updErr } = await supabase
              .from('users')
              .update({ purchased_courses: merged })
              .eq('id', user.id);
            if (updErr) {
              // If DB update fails, at least update local state for current session
              set({ purchasedCourses: merged });
              return;
            }
            set({ purchasedCourses: merged });
          } else {
            set({ purchasedCourses: existing });
          }
        } catch (_) {
          // Silent fail to avoid interrupting auth flows
        }
      },

      // Generate referral code for user
      generateReferralCode: async () => {
        const { user } = get();
        if (!user) {
          toast.error("Musisz być zalogowany");
          return false;
        }

        set({ loading: true, error: null });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error('Brak sesji. Zaloguj się ponownie.');
          }

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gkvjdemszxjmtxvxlnmr.supabase.co';
          
          const response = await fetch(
            `${supabaseUrl}/functions/v1/generate-referral-code`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                user_id: user.id
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || data.message || 'Błąd generowania kodu');
          }

          // Wait a bit for database to update
          await new Promise(resolve => setTimeout(resolve, 500));
          await get().fetchReferralData();

          if (data.already_created) {
            toast.info("Masz już wygenerowany kod polecający.");
          } else {
            toast.success("Kod polecający został wygenerowany!");
          }
          set({ loading: false });
          return true;
        } catch (err) {
          console.error('Error generating referral code:', err);
          toast.error(err.message || "Błąd generowania kodu polecającego");
          set({ error: err.message, loading: false });
          return false;
        }
      },

      // Fetch referral data (code, discount status, etc.)
      fetchReferralData: async () => {
        const { user } = get();
        if (!user) {
          console.log("fetchReferralData: No user found");
          return;
        }

        try {
          console.log("fetchReferralData: Fetching for user:", user.id);
          
          const [promoCodeRes, userRes] = await Promise.all([
            supabase
              .from("user_promo_codes")
              .select("code, used_by_user_id, used_by_display_name, used_at")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("users")
              .select("referral_discount_available, referred_by_user_id")
              .eq("id", user.id)
              .single()
          ]);

          console.log("fetchReferralData: promoCodeRes:", promoCodeRes);
          console.log("fetchReferralData: userRes:", userRes);

          if (promoCodeRes.error) {
            console.error("fetchReferralData: Error fetching promo code:", promoCodeRes.error);
            throw promoCodeRes.error;
          }
          if (userRes.error) {
            console.error("fetchReferralData: Error fetching user:", userRes.error);
            throw userRes.error;
          }

          const codeRow = promoCodeRes.data;
          const userRow = userRes.data;
          
          console.log("fetchReferralData: codeRow:", codeRow);
          console.log("fetchReferralData: userRow:", userRow);
          
          const newState = {
            referralCode: codeRow?.code || null,
            referralUsedBy: codeRow?.used_by_display_name || null,
            referralDiscountAvailable: userRow?.referral_discount_available || false,
            referredBy: userRow?.referred_by_user_id || null,
          };
          
          console.log("fetchReferralData: Setting state:", newState);
          set(newState);
        } catch (err) {
          console.error("Error fetching referral data:", err);
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
