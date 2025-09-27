// import { createContext, useContext, useEffect, useState, useCallback } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'
// import supabase from '../util/supabaseClient'
// import { toast } from 'react-toastify';
// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [purchasedCourses, setPurchasedCourses] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const navigate = useNavigate()
//   const location = useLocation()

//   const fetchUserData = useCallback(async (userId) => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select('purchased_courses')
//         .eq('id', userId)
//         .single()

//       if (error) throw error

//       setPurchasedCourses(data?.purchased_courses || [])
//     } catch (err) {
//       console.error('Błąd pobierania danych użytkownika:', err)
//       setPurchasedCourses([])
//       setError(err.message)
//     }
//   }, [])

//   const handleSession = useCallback(async (session) => {
//     const currentUser = session?.user ?? null
//     setUser(currentUser)

//     if (currentUser) {
//       await fetchUserData(currentUser.id)
//     } else {
//       setPurchasedCourses([])
//     }
//   }, [fetchUserData])

//   useEffect(() => {
//     let initialized = false

//     const init = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession()
//         if (error) throw error

//         await handleSession(session)
//       } catch (err) {
//         console.error('Błąd inicjalizacji sesji:', err)
//         setError(err.message)
//       } finally {
//         if (!initialized) {
//           setLoading(false)
//           initialized = true
//         }
//       }
//     }

//     init()

//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         await handleSession(session)
//         setLoading(false) 
//       }
//     )

//     return () => {
//       authListener.subscription.unsubscribe()
//     }
//   }, [handleSession])

//   useEffect(() => {
//     if (!loading && user && location.pathname.startsWith('/auth')) {
//       navigate('/')
//     }
//   }, [user, loading, location.pathname, navigate])

//   const logout = async () => {
//     try {
//       await supabase.auth.signOut()
//       setUser(null)
//       setPurchasedCourses([])
//       toast.success('Wylogowano')
//       navigate("/");
//     } catch (err) {
//       toast.error('Błąd wylogowywania')
//     }
//   }

//   return (
//     <AuthContext.Provider value={{ user, purchasedCourses, loading, error, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)
