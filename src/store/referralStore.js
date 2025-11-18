import { create } from 'zustand';
import supabase from '../util/supabaseClient';
import { toast } from '../utils/toast';

export const useReferralStore = create((set, get) => ({
  loading: false,
  error: null,

  // Get referral statistics for current user
  getReferralStats: async (userId) => {
    if (!userId) return null;

    try {
      const [promoCodeRes, userRes] = await Promise.all([
        supabase
          .from('user_promo_codes')
          .select('code, used_by_user_id, used_by_display_name, used_at')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('users')
          .select('referral_discount_available, referred_by_user_id')
          .eq('id', userId)
          .single()
      ]);

      if (promoCodeRes.error) throw promoCodeRes.error;
      if (userRes.error) throw userRes.error;

      const codeRow = promoCodeRes.data;
      const userRow = userRes.data;
      return {
        hasCode: !!codeRow?.code,
        code: codeRow?.code || null,
        isUsed: !!codeRow?.used_by_user_id,
        usedBy: codeRow?.used_by_display_name || null,
        hasDiscount: userRow?.referral_discount_available || false,
        wasReferred: !!userRow?.referred_by_user_id,
      };
    } catch (err) {
      console.error('Error fetching referral stats:', err);
      return null;
    }
  },

  // Validate referral code (calls Edge Function)
  validateReferralCode: async (code, userId, totalAmountCents) => {
    set({ loading: true, error: null });
    try {
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

      set({ loading: false });
      return data;
    } catch (err) {
      console.error('Error validating referral code:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Check if user can use referral discount (75%)
  canUseReferralDiscount: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('referral_discount_available')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data?.referral_discount_available || false;
    } catch (err) {
      console.error('Error checking referral discount:', err);
      return false;
    }
  },
}));

