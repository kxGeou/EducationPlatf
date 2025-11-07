import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  userTransactions: [],
  loading: false,
  error: null,

  // Pobierz wszystkie transakcje (dla admina)
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      // Najpierw pobierz transakcje
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      if (!purchases || purchases.length === 0) {
        set({ transactions: [], loading: false });
        return;
      }

      // Email jest teraz zapisany bezpośrednio w purchases, więc nie potrzebujemy pobierać z users
      // Dla pełnych danych użytkownika (full_name) nadal możemy pobrać z users jeśli potrzebne
      // Ale na razie używamy tylko email z purchases
      const transactionsWithUsers = purchases.map(purchase => ({
        ...purchase,
        // Email jest już w purchase.email, więc tworzymy prosty obiekt users tylko z email
        users: {
          id: purchase.user_id,
          email: purchase.email || null
        }
      }));

      set({ transactions: transactionsWithUsers, loading: false });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      set({ error: err.message, loading: false, transactions: [] });
      toast.error('Nie udało się pobrać transakcji');
    }
  },

  // Pobierz transakcje użytkownika
  fetchUserTransactions: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ userTransactions: data || [], loading: false });
    } catch (err) {
      console.error('Error fetching user transactions:', err);
      set({ error: err.message, loading: false, userTransactions: [] });
    }
  },

  // Ręczne dodanie uprawnień dla transakcji (admin) - z wyborem kursów
  manuallyGrantAccess: async (transactionId, selectedCourseIds) => {
    set({ loading: true, error: null });
    try {
      if (!selectedCourseIds || selectedCourseIds.length === 0) {
        throw new Error('Wybierz przynajmniej jeden kurs');
      }

      // Pobierz transakcję
      const { data: transaction, error: transactionError } = await supabase
        .from('purchases')
        .select('user_id, course_ids, status')
        .eq('id', transactionId)
        .single();

      if (transactionError) throw transactionError;

      if (!transaction || transaction.status !== 'completed') {
        throw new Error('Transakcja nie jest zakończona');
      }

      // Sprawdź czy wybrane kursy są w transakcji
      const validCourseIds = selectedCourseIds.filter(courseId => 
        transaction.course_ids.includes(courseId)
      );

      if (validCourseIds.length === 0) {
        throw new Error('Wybrane kursy nie są częścią tej transakcji');
      }

      // Pobierz aktualne purchased_courses użytkownika
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', transaction.user_id)
        .single();

      if (userError) throw userError;

      // Połącz istniejące purchases z wybranymi kursami
      const existingPurchases = userData?.purchased_courses || [];
      const mergedPurchases = [...new Set([...existingPurchases, ...validCourseIds])];

      // Zaktualizuj purchased_courses
      const { error: updateError } = await supabase
        .from('users')
        .update({ purchased_courses: mergedPurchases })
        .eq('id', transaction.user_id);

      if (updateError) throw updateError;

      set({ loading: false });
      toast.success(`Dodano ${validCourseIds.length} ${validCourseIds.length === 1 ? 'kurs' : 'kursów'} pomyślnie`);
      
      // Odśwież listę transakcji
      get().fetchTransactions();
      
      return true;
    } catch (err) {
      console.error('Error manually granting access:', err);
      set({ error: err.message, loading: false });
      toast.error('Błąd podczas dodawania uprawnień: ' + err.message);
      return false;
    }
  },
}));

