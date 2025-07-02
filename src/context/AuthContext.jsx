import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../util/supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [purchasedCourses, setPurchasedCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getSessionAndUserData = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data, error } = await supabase
            .from('users')
            .select('purchased_courses')
            .eq('id', currentUser.id)
            .single()

          if (error) throw error

          setPurchasedCourses(data.purchased_courses)
        } else {
          setPurchasedCourses(null)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSessionAndUserData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        supabase
          .from('users')
          .select('purchased_courses')
          .eq('id', currentUser.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              setError(error.message)
              setPurchasedCourses(null)
            } else {
              setPurchasedCourses(data.purchased_courses)
            }
          })
      } else {
        setPurchasedCourses(null)
      }
    })

    return () => subscription.unsubscribe()
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
