import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useAuthStore } from '../../../store/authStore';
import supabase from '../../../util/supabaseClient';
import { Eye, EyeOff } from 'lucide-react'

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [sessionSet, setSessionSet] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const setUser = useAuthStore((state) => state.setUser)
  const fetchUserData = useAuthStore((state) => state.fetchUserData)

  useEffect(() => {
    async function setSessionFromUrl() {
      try {
        // First, try to get the current session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session?.user) {
          // If we already have a valid session, use it
          setUser(session.user)
          await fetchUserData(session.user.id)
          setSessionSet(true)
          setLoading(false)
          return
        }

        // If no session, try to parse tokens from URL
        let access_token = null
        let refresh_token = null

        // Try to get tokens from hash first (most common for Supabase)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          access_token = hashParams.get('access_token')
          refresh_token = hashParams.get('refresh_token')
        }

        // If not found in hash, try query parameters
        if ((!access_token || !refresh_token) && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search)
          access_token = access_token || searchParams.get('access_token')
          refresh_token = refresh_token || searchParams.get('refresh_token')
        }

        console.log('URL analysis:', { 
          hash: window.location.hash, 
          search: window.location.search,
          hasAccessToken: !!access_token, 
          hasRefreshToken: !!refresh_token 
        })

        // Check for error parameters in the URL
        if (window.location.hash.includes('error=')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const error = hashParams.get('error')
          const errorCode = hashParams.get('error_code')
          const errorDescription = hashParams.get('error_description')
          
          console.log('Auth error detected:', { error, errorCode, errorDescription })
          
          if (errorCode === 'otp_expired') {
            toast.error('Link resetujący hasło wygasł. Wygeneruj nowy link.')
            navigate('/update-password')
            return
          } else if (error === 'access_denied') {
            toast.error('Dostęp zabroniony. Sprawdź czy link jest poprawny.')
            navigate('/update-password')
            return
          } else {
            toast.error(`Błąd autoryzacji: ${errorDescription || error}`)
            navigate('/update-password')
            return
          }
        }

        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })

          if (error) {
            toast.error('Błąd ustawiania sesji: ' + error.message)
            navigate('/authentication')
            return
          }

          const user = data?.session?.user

          if (user) {
            setUser(user)
            await fetchUserData(user.id)
            setSessionSet(true)
            setLoading(false)
          } else {
            toast.error('Nie udało się pobrać użytkownika z sesji')
            navigate('/authentication')
          }
        } else {
          // Check if this might be a different type of auth flow
          if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
            // This might be a password recovery flow, try to get session again
            const { data: { session: recoverySession }, error: recoveryError } = await supabase.auth.getSession()
            
            if (recoverySession?.user) {
              setUser(recoverySession.user)
              await fetchUserData(recoverySession.user.id)
              setSessionSet(true)
              setLoading(false)
              return
            }
          }
          
          toast.error('Brak tokenów w URL. Sprawdź czy link jest poprawny.')
          navigate('/authentication')
        }
      } catch (err) {
        console.error('Error in setSessionFromUrl:', err)
        toast.error('Błąd podczas ustawiania sesji: ' + err.message)
        navigate('/authentication')
      }
    }
    setSessionFromUrl()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('Hasło musi mieć min. 6 znaków')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Hasło zmienione — zaloguj się ponownie')
      navigate('/authentication')
    }
  }

  if (loading || !sessionSet) {
    return <p className="text-center mt-10">Trwa uwierzytelnianie...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center space-y-4 w-full h-fit">
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Nowe hasło</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 pr-10 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded bg-gray-50 sm:bg-transparent"
            placeholder="Wprowadź nowe hasło"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Hasło musi mieć co najmniej 6 znaków
        </p>
      </div>
      
      <button
        type="submit"
        className="w-full bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen text-white p-2 rounded hover:bg-secondaryBlue transition mt-4"
        disabled={loading}
      >
        {loading ? 'Zapisuję...' : 'Zapisz nowe hasło'}
      </button>
    </form>
  )
}
