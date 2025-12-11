import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useCalendarStore = create((set, get) => ({
  availability: [],
  bookings: [],
  preferences: [],
  labels: [],
  overlappingHours: [],
  loading: false,
  error: null,

  // Fetch available slots for a date range
  fetchAvailability: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_availability')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_active', true)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ availability: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching availability:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować dostępnych terminów');
      return [];
    }
  },

  // Fetch all availability (for admin)
  fetchAllAvailability: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_availability')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ availability: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching all availability:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować terminów');
      return [];
    }
  },

  // Fetch user's bookings
  fetchUserBookings: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .select(`
          *,
          class_availability (
            date,
            start_time,
            end_time,
            class_type,
            max_participants
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ bookings: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować rezerwacji');
      return [];
    }
  },

  // Fetch all bookings (for admin)
  fetchAllBookings: async () => {
    set({ loading: true, error: null });
    try {
      // First fetch bookings with availability
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('class_bookings')
        .select(`
          *,
          class_availability (
            date,
            start_time,
            end_time,
            class_type,
            max_participants
          )
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Then fetch users data separately
      const userIds = [...new Set(bookingsData?.map(b => b.user_id).filter(Boolean) || [])];
      let usersData = {};

      if (userIds.length > 0 && userIds.every(id => id && typeof id === 'string')) {
        try {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('id', userIds);

          if (usersError) {
            console.error('Error fetching users in fetchAllBookings:', usersError);
            // Fallback: ustaw puste dane
            userIds.forEach(userId => {
              usersData[userId] = {
                id: userId,
                email: '',
                full_name: ''
              };
            });
          } else if (users && users.length > 0) {
            users.forEach(user => {
              usersData[user.id] = {
                id: user.id,
                email: user.email || '',
                full_name: user.full_name || ''
              };
            });
            
            // Dla użytkowników, których nie znaleźliśmy
            userIds.forEach(userId => {
              if (!usersData[userId]) {
                usersData[userId] = {
                  id: userId,
                  email: '',
                  full_name: ''
                };
              }
            });
          } else {
            // Jeśli nie ma danych
            userIds.forEach(userId => {
              usersData[userId] = {
                id: userId,
                email: '',
                full_name: ''
              };
            });
          }
        } catch (err) {
          console.error('Error in fetchAllBookings user fetch:', err);
          userIds.forEach(userId => {
            usersData[userId] = {
              id: userId,
              email: '',
              full_name: ''
            };
          });
        }
      }

      // Combine the data - zawsze zwracaj obiekt użytkownika
      const enrichedBookings = bookingsData?.map(booking => ({
        ...booking,
        users: usersData[booking.user_id] || {
          id: booking.user_id,
          email: '',
          full_name: ''
        }
      })) || [];

      set({ bookings: enrichedBookings, loading: false });
      return enrichedBookings;
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować rezerwacji');
      return [];
    }
  },

  // Create booking
  createBooking: async (availabilityId, userId, classType, notes = null) => {
    set({ loading: true, error: null });
    try {
      // First check if slot is still available
      const { data: availability, error: availError } = await supabase
        .from('class_availability')
        .select('*')
        .eq('id', availabilityId)
        .eq('is_active', true)
        .single();

      if (availError || !availability) {
        throw new Error('Ten termin nie jest już dostępny');
      }

      // Count current bookings
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('class_bookings')
        .select('*')
        .eq('availability_id', availabilityId)
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) throw bookingsError;

      if (existingBookings && existingBookings.length >= availability.max_participants) {
        throw new Error('Ten termin jest już zajęty');
      }

      // Check if user already has a booking for this slot
      const { data: userBooking, error: userBookingError } = await supabase
        .from('class_bookings')
        .select('*')
        .eq('availability_id', availabilityId)
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed'])
        .single();

      if (userBooking && !userBookingError) {
        throw new Error('Masz już rezerwację na ten termin');
      }

      // Create booking
      const { data, error } = await supabase
        .from('class_bookings')
        .insert({
          availability_id: availabilityId,
          user_id: userId,
          class_type: classType,
          notes: notes,
          status: 'pending'
        })
        .select(`
          *,
          class_availability (
            date,
            start_time,
            end_time,
            class_type,
            max_participants
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        bookings: [data, ...state.bookings],
        loading: false
      }));

      toast.success('Rezerwacja została utworzona pomyślnie!');
      return data;
    } catch (err) {
      console.error('Error creating booking:', err);
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Nie udało się utworzyć rezerwacji');
      throw err;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId
        })
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, ...data } : b
        ),
        loading: false
      }));

      toast.success('Rezerwacja została anulowana');
      return data;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się anulować rezerwacji');
      throw err;
    }
  },

  // Admin: Create availability slot
  createAvailability: async (date, startTime, endTime, classType, maxParticipants = 1, isWebinar = false) => {
    set({ loading: true, error: null });
    try {
      // Validate max_participants based on class_type
      if (classType === 'individual' && maxParticipants !== 1) {
        throw new Error('Zajęcia indywidualne mogą mieć maksymalnie 1 uczestnika');
      }
      if (classType === 'group' && maxParticipants <= 1) {
        throw new Error('Zajęcia grupowe muszą mieć więcej niż 1 uczestnika');
      }

      const { data, error } = await supabase
        .from('class_availability')
        .insert({
          date,
          start_time: startTime,
          end_time: endTime,
          class_type: classType,
          max_participants: maxParticipants,
          is_active: true,
          is_webinar: isWebinar || false
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        availability: [...state.availability, data].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.start_time.localeCompare(b.start_time);
        }),
        loading: false
      }));

      toast.success('Dostępny termin został dodany');
      return data;
    } catch (err) {
      console.error('Error creating availability:', err);
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Nie udało się dodać dostępnego terminu');
      throw err;
    }
  },

  // Admin: Update availability slot
  updateAvailability: async (availabilityId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_availability')
        .update(updates)
        .eq('id', availabilityId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        availability: state.availability.map((a) =>
          a.id === availabilityId ? { ...a, ...data } : a
        ),
        loading: false
      }));

      toast.success('Termin został zaktualizowany');
      return data;
    } catch (err) {
      console.error('Error updating availability:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się zaktualizować terminu');
      throw err;
    }
  },

  // Admin: Delete availability slot
  deleteAvailability: async (availabilityId) => {
    set({ loading: true, error: null });
    try {
      // Check if there are any bookings for this slot
      const { data: bookings, error: bookingsError } = await supabase
        .from('class_bookings')
        .select('*')
        .eq('availability_id', availabilityId)
        .in('status', ['pending', 'confirmed']);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        // Instead of deleting, mark as inactive
        const { data, error } = await supabase
          .from('class_availability')
          .update({ is_active: false })
          .eq('id', availabilityId)
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          availability: state.availability.map((a) =>
            a.id === availabilityId ? { ...a, ...data } : a
          ),
          loading: false
        }));

        toast.success('Termin został dezaktywowany');
        return data;
      } else {
        // No bookings, can delete
        const { error } = await supabase
          .from('class_availability')
          .delete()
          .eq('id', availabilityId);

        if (error) throw error;

        set((state) => ({
          availability: state.availability.filter((a) => a.id !== availabilityId),
          loading: false
        }));

        toast.success('Termin został usunięty');
        return null;
      }
    } catch (err) {
      console.error('Error deleting availability:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się usunąć terminu');
      throw err;
    }
  },

  // Admin: Update booking status
  updateBookingStatus: async (bookingId, status) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .update({ status })
        .eq('id', bookingId)
        .select(`
          *,
          class_availability (
            date,
            start_time,
            end_time,
            class_type,
            max_participants
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, ...data } : b
        ),
        loading: false
      }));

      toast.success('Status rezerwacji został zaktualizowany');
      return data;
    } catch (err) {
      console.error('Error updating booking status:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się zaktualizować statusu rezerwacji');
      throw err;
    }
  },

  // Get booking count for a slot
  getBookingCount: async (availabilityId) => {
    try {
      const { count, error } = await supabase
        .from('class_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('availability_id', availabilityId)
        .in('status', ['pending', 'confirmed']);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('Error getting booking count:', err);
      return 0;
    }
  },

  // Get bookings for a specific availability slot
  getBookingsForSlot: async (availabilityId) => {
    try {
      // First fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('class_bookings')
        .select('*')
        .eq('availability_id', availabilityId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: true });

      if (bookingsError) throw bookingsError;

      // Then fetch users data separately
      const userIds = [...new Set(bookingsData?.map(b => b.user_id).filter(Boolean) || [])];
      let usersData = {};

      if (userIds.length > 0) {
        // Spróbuj pobrać z tabeli users
        try {
          // Pobierz dane użytkowników - używamy .in() tak jak w innych miejscach w kodzie
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('id', userIds);

          if (!usersError && users && users.length > 0) {
            users.forEach(user => {
              usersData[user.id] = {
                id: user.id,
                email: user.email || '',
                full_name: user.full_name || ''
              };
            });
          } else if (usersError) {
            console.error('Error fetching users in getBookingsForSlot:', usersError);
          }
          
          // Dla każdego user_id, ustaw dane (nawet jeśli puste)
          userIds.forEach(userId => {
            if (!usersData[userId]) {
              usersData[userId] = {
                id: userId,
                email: '',
                full_name: ''
              };
            }
          });
        } catch (err) {
          console.error('Error in getBookingsForSlot user fetch:', err);
          // Ustaw puste dane dla wszystkich
          userIds.forEach(userId => {
            usersData[userId] = {
              id: userId,
              email: '',
              full_name: ''
            };
          });
        }
      }

      // Combine the data - zawsze zwracaj obiekt użytkownika
      const enrichedBookings = bookingsData?.map(booking => {
        const userData = usersData[booking.user_id];
        return {
          ...booking,
          users: userData || {
            id: booking.user_id,
            email: booking.user_id || '', // Można użyć user_id jako tymczasowego identyfikatora
            full_name: ''
          }
        };
      }) || [];

      return enrichedBookings;
    } catch (err) {
      console.error('Error getting bookings for slot:', err);
      return [];
    }
  },

  // ========== TIME PREFERENCES FUNCTIONS ==========

  // Fetch user's time preferences
  fetchUserPreferences: async (userId, startDate = null, endDate = null) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('user_time_preferences')
        .select(`
          *,
          preference_labels (
            id,
            name,
            color,
            type,
            topic
          )
        `)
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ preferences: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować preferencji');
      return [];
    }
  },

  // Create time preference
  createPreference: async ({ userId, labelId, date, startTime, endTime, description, skipToast = false }) => {
    // Only set loading if not already loading (to avoid conflicts with batch operations)
    const currentState = get();
    if (!currentState.loading) {
      set({ loading: true, error: null });
    }
    
    try {
      const { data, error } = await supabase
        .from('user_time_preferences')
        .insert({
          user_id: userId,
          label_id: labelId || null,
          date,
          start_time: startTime,
          end_time: endTime,
          description: description || null
        })
        .select(`
          *,
          preference_labels (
            id,
            name,
            color,
            type,
            topic
          )
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        preferences: [...state.preferences, data].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.start_time.localeCompare(b.start_time);
        }),
        loading: false
      }));

      if (!skipToast) {
        toast.success('Preferencja została dodana');
      }
      return data;
    } catch (err) {
      console.error('Error creating preference:', err);
      set({ error: err.message, loading: false });
      if (!skipToast) {
        toast.error(err.message || 'Nie udało się dodać preferencji');
      }
      throw err;
    }
  },

  // Update time preference
  updatePreference: async (preferenceId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_time_preferences')
        .update(updates)
        .eq('id', preferenceId)
        .select(`
          *,
          preference_labels (
            id,
            name,
            color,
            type,
            topic
          )
        `)
        .single();

      if (error) throw error;

      set((state) => ({
        preferences: state.preferences.map((p) =>
          p.id === preferenceId ? { ...p, ...data } : p
        ),
        loading: false
      }));

      toast.success('Preferencja została zaktualizowana');
      return data;
    } catch (err) {
      console.error('Error updating preference:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się zaktualizować preferencji');
      throw err;
    }
  },

  // Delete time preference
  deletePreference: async (preferenceId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_time_preferences')
        .delete()
        .eq('id', preferenceId);

      if (error) throw error;

      set((state) => ({
        preferences: state.preferences.filter((p) => p.id !== preferenceId),
        loading: false
      }));

      toast.success('Preferencja została usunięta');
      return true;
    } catch (err) {
      console.error('Error deleting preference:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się usunąć preferencji');
      throw err;
    }
  },

  // Fetch all preferences (for admin)
  fetchAllPreferences: async () => {
    set({ loading: true, error: null });
    try {
      // First fetch preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_time_preferences')
        .select(`
          *,
          preference_labels (
            id,
            name,
            color,
            type,
            topic
          )
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (preferencesError) throw preferencesError;

      // Then fetch users separately
      const userIds = [...new Set(preferencesData?.map(p => p.user_id).filter(Boolean) || [])];
      let usersData = {};

      if (userIds.length > 0 && userIds.every(id => id && typeof id === 'string')) {
        try {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('id', userIds);

          if (!usersError && users) {
            users.forEach(user => {
              usersData[user.id] = {
                id: user.id,
                email: user.email || '',
                full_name: user.full_name || ''
              };
            });
          }
        } catch (err) {
          console.error('Error fetching users in fetchAllPreferences:', err);
        }
      }

      // Combine data
      const enrichedPreferences = preferencesData?.map(pref => ({
        ...pref,
        users: usersData[pref.user_id] || {
          id: pref.user_id,
          email: '',
          full_name: ''
        }
      })) || [];

      set({ preferences: enrichedPreferences, loading: false });
      return enrichedPreferences;
    } catch (err) {
      console.error('Error fetching all preferences:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować preferencji');
      return [];
    }
  },

  // Fetch overlapping hours - calculated on frontend
  fetchOverlappingHours: async (startDate = null, endDate = null, labelId = null) => {
    set({ loading: true, error: null });
    try {
      // Get all preferences first
      const { preferences } = get();
      
      // Filter preferences by date range and label if provided
      let filteredPrefs = preferences || [];
      
      if (startDate) {
        filteredPrefs = filteredPrefs.filter(p => p.date >= startDate);
      }
      if (endDate) {
        filteredPrefs = filteredPrefs.filter(p => p.date <= endDate);
      }
      if (labelId) {
        filteredPrefs = filteredPrefs.filter(p => p.label_id === labelId);
      }

      // Group preferences by date
      const prefsByDate = {};
      filteredPrefs.forEach(pref => {
        if (!prefsByDate[pref.date]) {
          prefsByDate[pref.date] = [];
        }
        prefsByDate[pref.date].push(pref);
      });

      // Find overlapping time slots
      const overlaps = [];
      
      Object.keys(prefsByDate).forEach(date => {
        const dayPrefs = prefsByDate[date];
        
        // Compare each pair of preferences
        for (let i = 0; i < dayPrefs.length; i++) {
          for (let j = i + 1; j < dayPrefs.length; j++) {
            const pref1 = dayPrefs[i];
            const pref2 = dayPrefs[j];
            
            // Check if time ranges overlap
            const start1 = pref1.start_time;
            const end1 = pref1.end_time;
            const start2 = pref2.start_time;
            const end2 = pref2.end_time;
            
            // Times overlap if: start1 < end2 AND start2 < end1
            if (start1 < end2 && start2 < end1) {
              // Calculate overlap
              const overlapStart = start1 > start2 ? start1 : start2;
              const overlapEnd = end1 < end2 ? end1 : end2;
              
              // Check if this overlap already exists
              const existingOverlap = overlaps.find(o => 
                o.date === date && 
                o.start_time === overlapStart && 
                o.end_time === overlapEnd
              );
              
              if (existingOverlap) {
                // Add users if not already in the list
                if (!existingOverlap.user_ids.includes(pref1.user_id)) {
                  existingOverlap.user_ids.push(pref1.user_id);
                }
                if (!existingOverlap.user_ids.includes(pref2.user_id)) {
                  existingOverlap.user_ids.push(pref2.user_id);
                }
                existingOverlap.user_count = existingOverlap.user_ids.length;
              } else {
                overlaps.push({
                  date,
                  start_time: overlapStart,
                  end_time: overlapEnd,
                  user_count: 2,
                  user_ids: [pref1.user_id, pref2.user_id],
                  label_ids: []
                });
              }
            }
          }
        }
      });

      // Merge overlapping slots that have common users
      const mergedOverlaps = [];
      overlaps.forEach(overlap => {
        // Find if this overlap can be merged with existing ones
        let merged = false;
        for (let mergedOverlap of mergedOverlaps) {
          if (mergedOverlap.date === overlap.date &&
              mergedOverlap.start_time === overlap.start_time &&
              mergedOverlap.end_time === overlap.end_time) {
            // Merge user_ids
            overlap.user_ids.forEach(userId => {
              if (!mergedOverlap.user_ids.includes(userId)) {
                mergedOverlap.user_ids.push(userId);
              }
            });
            mergedOverlap.user_count = mergedOverlap.user_ids.length;
            merged = true;
            break;
          }
        }
        if (!merged) {
          mergedOverlaps.push(overlap);
        }
      });

      // Filter to only show overlaps with 2+ users
      const finalOverlaps = mergedOverlaps.filter(o => o.user_count >= 2);

      set({ overlappingHours: finalOverlaps, loading: false });
      return finalOverlaps;
    } catch (err) {
      console.error('Error calculating overlapping hours:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się obliczyć części wspólnych godzin: ' + (err.message || 'Nieznany błąd'));
      return [];
    }
  },

  // Fetch all labels
  fetchLabels: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('preference_labels')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      set({ labels: data || [], loading: false });
      return data || [];
    } catch (err) {
      console.error('Error fetching labels:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się załadować etykiet');
      return [];
    }
  },

  // Create label (admin only)
  createLabel: async ({ name, type, topic, color }) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('preference_labels')
        .insert({
          name,
          type: type || 'individual',
          topic: topic || '',
          color: color || null
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        labels: [...state.labels, data].sort((a, b) => a.name.localeCompare(b.name)),
        loading: false
      }));

      toast.success('Etykieta została dodana');
      return data;
    } catch (err) {
      console.error('Error creating label:', err);
      set({ error: err.message, loading: false });
      toast.error(err.message || 'Nie udało się dodać etykiety');
      throw err;
    }
  },

  // Update label (admin only)
  updateLabel: async (labelId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('preference_labels')
        .update(updates)
        .eq('id', labelId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        labels: state.labels.map((l) =>
          l.id === labelId ? { ...l, ...data } : l
        ),
        loading: false
      }));

      toast.success('Etykieta została zaktualizowana');
      return data;
    } catch (err) {
      console.error('Error updating label:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się zaktualizować etykiety');
      throw err;
    }
  },

  // Delete label (admin only)
  deleteLabel: async (labelId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('preference_labels')
        .delete()
        .eq('id', labelId);

      if (error) throw error;

      set((state) => ({
        labels: state.labels.filter((l) => l.id !== labelId),
        loading: false
      }));

      toast.success('Etykieta została usunięta');
      return true;
    } catch (err) {
      console.error('Error deleting label:', err);
      set({ error: err.message, loading: false });
      toast.error('Nie udało się usunąć etykiety');
      throw err;
    }
  },

  // Get next webinar (is_webinar = true)
  getNextWebinar: async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('class_availability')
        .select('*')
        .eq('is_webinar', true)
        .eq('is_active', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // If no webinar found, return null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      // Check if the webinar hasn't passed yet (check date and time)
      const webinarDateTime = new Date(`${data.date}T${data.end_time}`);
      if (webinarDateTime < new Date()) {
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching next webinar:', err);
      return null;
    }
  }
}));

