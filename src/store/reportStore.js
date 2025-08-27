import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { toast } from 'react-toastify'
import { useAuthStore } from "./authStore";

export const useReports = create((set, get) => ({
  loading: false,
  error: null,
  reports: [],
  userReports: [],

  fetchReports: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.from("reports").select("*");
    if (error) {
      console.log(error.message);
    } else {
      set({ reports: data });
    }
    set({ loading: false });
  },

  sendReport: async (user_id, email, topic, description) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from("reports").insert({
      user_id,
      user_email: email,
      description,
      topic,
      status: "Do zrobienia",
    });
    if (error) {
      console.error("Nie udało się wysłać raportu", error.message);
    } else {
      toast.success("Zgłoszenie wysłane");
      get().fetchReports(); 
    }
    set({ loading: false });
  },

  fetchUserReports: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("Brak zalogowanego użytkownika");

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      set({ userReports: data || [] });
    } catch (err) {
      console.error(err.message);
      set({ error: err.message, userReports: [] });
      toast.error("Nie udało się pobrać Twoich raportów");
    } finally {
      set({ loading: false });
    }
  },

   updateStatus: async (reportId, newStatus) => {
    set({ loading: true });
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);

    if (error) {
      console.error("Nie udało się zaktualizować statusu", error.message);
      toast.error("Nie udało się zaktualizować statusu");
    } else {
      toast.success("Status zaktualizowany");
      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        ),
      }));
    }
    set({ loading: false });
  },
}));
