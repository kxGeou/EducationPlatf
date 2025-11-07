import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import supabase from '../../../util/supabaseClient'
import { Cog } from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'
export default function Success() {
  const toast = useToast();
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)
  const { fetchUserData } = useAuthStore()
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    const session_id = params.get('session_id')
    if (!session_id || hasProcessed.current) return

    const confirmPayment = async () => {
      hasProcessed.current = true
      
      try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Musisz być zalogowany.')
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

        // Sprawdź czy response jest ok przed parsowaniem JSON
        let data;
        try {
          data = await res.json()
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError)
          toast.error('Błąd podczas przetwarzania odpowiedzi serwera.')
          navigate('/')
          return
        }

      if (res.ok && data.success) {
          // Wyczyść koszyk i odśwież dane użytkownika
          clearCart()
          const userId = session.user.id
          await fetchUserData(userId)
          
        // Małe opóźnienie, aby upewnić się, że wszystkie procesy się zakończą
          setTimeout(() => {
            toast.success('Zakupy zapisane! Kursy zostały dodane do Twojego konta.')
            navigate('/')
          }, 500)
        } else {
          const errorMessage = data?.error || `Status: ${res.status}`
          console.error('Payment confirmation error:', errorMessage)
          toast.error('Błąd podczas zapisu płatności: ' + errorMessage)
          // Nawiguj do strony głównej nawet przy błędzie
          setTimeout(() => {
            navigate('/')
          }, 2000)
        }
      } catch (error) {
        console.error('Error in confirmPayment:', error)
        toast.error('Wystąpił błąd podczas przetwarzania zakupu. Sprawdź konsolę dla szczegółów.')
        // Nawiguj do strony głównej nawet przy błędzie
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    }

    confirmPayment()
  }, [params, toast, navigate])

  return <div className='flex flex-col w-full h-screen items-center justify-center bg-blackText dark:bg-blackText'>
    <p className="text-white mb-4 text-lg font-medium">Przetwarzanie zakupu...</p>
    <img src="../loader.gif" alt="loading" className='w-20'/>
  </div>
}
