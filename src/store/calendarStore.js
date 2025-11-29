import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useCalendarStore = create((set, get) => ({
  availability: [],
  bookings: [],
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

      if (userIds.length > 0) {
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
  createAvailability: async (date, startTime, endTime, classType, maxParticipants = 1) => {
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
          is_active: true
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
  }
}));

