import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../util/supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [purchasedCourses, setPurchasedCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async (session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('users')
          .select('purchased_courses')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          setError(error.message)
          setPurchasedCourses(null)
        } else {
          setPurchasedCourses(data.purchased_courses)
        }
      } else {
        setPurchasedCourses(null)
      }
    }

    const getSession = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!session) {
          await logout() 
        } else {
          await fetchUserData(session)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        await fetchUserData(session)
      } else {
        await logout() 
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPurchasedCourses(null)
  }

  return (
    <AuthContext.Provider value={{ user, purchasedCourses, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
