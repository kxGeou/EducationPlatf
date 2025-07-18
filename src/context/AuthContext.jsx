import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import supabase from '../util/supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [purchasedCourses, setPurchasedCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserData = useCallback(async (user) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setPurchasedCourses(data?.purchased_courses || [])
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err.message)
      setPurchasedCourses(null)
    }
  }, [])

  const initializeSession = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) throw error

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchUserData(currentUser)
      } else {
        setPurchasedCourses(null)
      }
    } catch (err) {
      console.error('Error initializing session:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchUserData])

  useEffect(() => {
    initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchUserData(currentUser)
      } else {
        setPurchasedCourses(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeSession, fetchUserData])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
      setError(err.message)
    } finally {
      setUser(null)
      setPurchasedCourses(null)
      toast.success("Wylogowano się")
    }
  }

  return (
    <AuthContext.Provider value={{ user, purchasedCourses, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
