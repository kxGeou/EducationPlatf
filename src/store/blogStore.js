import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { toast } from '../utils/toast';


export const useBlogStore = create((set) => ({
    loading : false,
    blogs : [],

    fetchBlogs : async () => {
        set({loading : true});
        const {data, error} = await supabase.from("posts").select("*")
        if(error) {
            toast.error(error.message)
        } else {
            set({blogs : data})
        }
        set({loading: false})
    }
}))
