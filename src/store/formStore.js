import { create } from "zustand";
import supabase from "../util/supabaseClient";

export const usePollStore = create((set) => ({
  polls: [],

  fetchPolls: async () => {
    const { data: polls, error } = await supabase.from("polls").select("*");
    if (error) {
      console.error(error);
      return;
    }

    const pollsWithOptions = await Promise.all(
      polls.map(async (poll) => {
        const { data: options } = await supabase
          .from("poll_options")
          .select("*")
          .eq("poll_id", poll.id);

        return { ...poll, options: options || [] };
      })
    );

    set({ polls: pollsWithOptions });
  },

  createPoll: async (title, description, options) => {
    const { data: poll, error } = await supabase
      .from("polls")
      .insert([{ title, description }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    const { data: insertedOptions, error: optError } = await supabase
      .from("poll_options")
      .insert(
        options.map((opt) => ({
          poll_id: poll.id,
          option_text: opt,
        }))
      )
      .select();

    if (optError) {
      console.error(optError);
      return;
    }

    set((state) => ({
      polls: [...state.polls, { ...poll, options: insertedOptions }],
    }));
  },

  voteOption: async (pollId, optionId) => {
    const { data: current } = await supabase
      .from("poll_options")
      .select("votes")
      .eq("id", optionId)
      .single();

    const { data, error } = await supabase
      .from("poll_options")
      .update({ votes: current.votes + 1 })
      .eq("id", optionId)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      polls: state.polls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: data.votes } : opt
              ),
            }
          : poll
      ),
    }));
  },
}));
