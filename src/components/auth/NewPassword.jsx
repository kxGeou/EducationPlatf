import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import supabase from '../../util/supabaseClient'

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [sessionSet, setSessionSet] = useState(false)
  const navigate = useNavigate()

  const setUser = useAuthStore((state) => state.setUser)
  const fetchUserData = useAuthStore((state) => state.fetchUserData)

  useEffect(() => {
    async function setSessionFromUrl() {
      const params = new URLSearchParams(window.location.hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        try {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })

          if (error) {
            toast.error('Błąd ustawiania sesji: ' + error.message)
            navigate('/login')
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
            navigate('/login')
          }
        } catch (err) {
          toast.error('Błąd podczas ustawiania sesji: ' + err.message)
          navigate('/login')
        }
      } else {
        toast.error('Brak tokenów w URL')
        navigate('/login')
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
      navigate('/login')
    }
  }

  if (loading || !sessionSet) {
    return <p className="text-center mt-10">Trwa uwierzytelnianie...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold">Ustaw nowe hasło</h2>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
        placeholder="Nowe hasło"
      />
      <button
        type="submit"
        className="w-full bg-primaryBlue text-white p-2 rounded hover:bg-secondaryBlue transition"
        disabled={loading}
      >
        {loading ? 'Zapisuję...' : 'Zapisz nowe hasło'}
      </button>
    </form>
  )
}
