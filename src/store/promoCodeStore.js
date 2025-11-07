import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const usePromoCodeStore = create((set, get) => ({
  promoCodes: [],
  loading: false,
  error: null,

  // Pobierz wszystkie kody promocyjne (dla admina)
  fetchPromoCodes: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ promoCodes: data || [], loading: false });
    } catch (err) {
      console.error('Error fetching promo codes:', err);
      set({ error: err.message, loading: false, promoCodes: [] });
      toast.error('Nie udało się pobrać kodów promocyjnych');
    }
  },

  // Utwórz nowy kod promocyjny
  createPromoCode: async (promoCodeData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert([{
          code: promoCodeData.code.toUpperCase().trim(),
          discount_type: promoCodeData.discount_type,
          discount_value: promoCodeData.discount_value,
          is_active: promoCodeData.is_active !== undefined ? promoCodeData.is_active : true,
          valid_from: promoCodeData.valid_from || null,
          valid_until: promoCodeData.valid_until || null,
          max_uses_global: promoCodeData.max_uses_global || null,
          max_uses_per_user: promoCodeData.max_uses_per_user || null,
          is_single_use: promoCodeData.is_single_use || false,
          description: promoCodeData.description || null
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        promoCodes: [data, ...state.promoCodes],
        loading: false
      }));

      toast.success('Kod promocyjny utworzony pomyślnie');
      return data;
    } catch (err) {
      console.error('Error creating promo code:', err);
      set({ error: err.message, loading: false });
      toast.error('Błąd podczas tworzenia kodu: ' + err.message);
      throw err;
    }
  },

  // Aktualizuj kod promocyjny
  updatePromoCode: async (id, promoCodeData) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .update({
          code: promoCodeData.code.toUpperCase().trim(),
          discount_type: promoCodeData.discount_type,
          discount_value: promoCodeData.discount_value,
          is_active: promoCodeData.is_active,
          valid_from: promoCodeData.valid_from || null,
          valid_until: promoCodeData.valid_until || null,
          max_uses_global: promoCodeData.max_uses_global || null,
          max_uses_per_user: promoCodeData.max_uses_per_user || null,
          is_single_use: promoCodeData.is_single_use || false,
          description: promoCodeData.description || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        promoCodes: state.promoCodes.map(code =>
          code.id === id ? data : code
        ),
        loading: false
      }));

      toast.success('Kod promocyjny zaktualizowany pomyślnie');
      return data;
    } catch (err) {
      console.error('Error updating promo code:', err);
      set({ error: err.message, loading: false });
      toast.error('Błąd podczas aktualizacji kodu: ' + err.message);
      throw err;
    }
  },

  // Usuń kod promocyjny
  deletePromoCode: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        promoCodes: state.promoCodes.filter(code => code.id !== id),
        loading: false
      }));

      toast.success('Kod promocyjny usunięty pomyślnie');
    } catch (err) {
      console.error('Error deleting promo code:', err);
      set({ error: err.message, loading: false });
      toast.error('Błąd podczas usuwania kodu: ' + err.message);
      throw err;
    }
  },

  // Przełącz status aktywności
  toggleActive: async (id) => {
    const code = get().promoCodes.find(c => c.id === id);
    if (!code) return;

    try {
      await get().updatePromoCode(id, {
        ...code,
        is_active: !code.is_active
      });
    } catch (err) {
      // Error handling już w updatePromoCode
    }
  },

  // Pobierz statystyki użyć kodu
  getUsageStats: async (codeId) => {
    try {
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select('*', { count: 'exact' })
        .eq('promo_code_id', codeId);

      if (error) throw error;

      // Grupuj po użytkownikach
      const userUsage = {};
      let totalDiscount = 0;

      data?.forEach(usage => {
        if (!userUsage[usage.user_id]) {
          userUsage[usage.user_id] = 0;
        }
        userUsage[usage.user_id]++;
        totalDiscount += usage.discount_amount_cents || 0;
      });

      return {
        totalUses: data?.length || 0,
        uniqueUsers: Object.keys(userUsage).length,
        totalDiscount: totalDiscount,
        userUsage: userUsage
      };
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      return {
        totalUses: 0,
        uniqueUsers: 0,
        totalDiscount: 0,
        userUsage: {}
      };
    }
  },

  // Waliduj kod promocyjny (dla frontendu - przed wysłaniem do Edge Function)
  validatePromoCode: async (code, userId, totalAmountCents) => {
    try {
      // Pobierz token sesji użytkownika
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Brak sesji. Zaloguj się ponownie.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gkvjdemszxjmtxvxlnmr.supabase.co';
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/validate-promo-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            code: code.toUpperCase().trim(),
            user_id: userId,
            total_amount_cents: totalAmountCents
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd walidacji kodu');
      }

      return data;
    } catch (err) {
      console.error('Error validating promo code:', err);
      throw err;
    }
  }
}));

