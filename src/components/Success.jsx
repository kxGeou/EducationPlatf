import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import supabase from '../util/supabaseClient'

export default function Success() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const session_id = params.get('session_id')
    if (!session_id) return

    const confirmPayment = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert('Musisz być zalogowany.')
        navigate('/')
        return
      }

      const res = await fetch(
        'https://gkvjdemszxjmtxvxlnmr.supabase.co/functions/v1/handle-checkout-success',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ session_id }),
        }
      )

      const data = await res.json()
      if (res.ok && data.success) {
        alert('Zakup zapisany! Kurs został dodany do Twojego konta.')
        navigate('/')
      } else {
        alert('Błąd podczas zapisu płatności: ' + (data.error || ''))
      }
    }

    confirmPayment()
  }, [])

  return <p>Przetwarzanie zakupu...</p>
}
