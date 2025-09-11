import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { useAuthStore } from './authStore'
import { toast } from 'react-toastify';


export const useIdeaStore = create((set) => ({
  loading : false,
  ideas : [],

  insertIdea : async ({name, type, description, email}) => {
    set({loading : true})
    const userId = useAuthStore.getState().user?.id;
    const {error} = await supabase.from("ideas").insert({
        user_id : userId,
        user_email : email,
        type : type == null ? "Inne" : type,
        description : description,
        name : name
    })
    if (error) {
        toast.error(error.message)
    } else {
        toast.success("Wysłano pomysł")
    }
    set({loading: false})
  },
  fetchIdea : async () => {
    set({loading : true})
    const {data, error} = await supabase.from("ideas").select("*")
    if(error) {
        toast.error(error.message)
    } else {
        set({ideas : data})
    }
    set({loading : false})
  }
}))
