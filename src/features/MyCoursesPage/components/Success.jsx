import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import supabase from '../../../util/supabaseClient'
import { Cog } from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAuthStore } from '../../../store/authStore'
export default function Success() {
  const toast = useToast();
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)

  useEffect(() => {
    const session_id = params.get('session_id')
    if (!session_id || hasProcessed.current) return

    const confirmPayment = async () => {
      hasProcessed.current = true
      
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

      const data = await res.json()
      if (res.ok && data.success) {
        // Małe opóźnienie, aby upewnić się, że wszystkie procesy się zakończą
        setTimeout(() => {
          toast.success('Zakup zapisany! Kurs został dodany do Twojego konta.')
          navigate('/')
        }, 500)
      } else {
        toast.error('Błąd podczas zapisu płatności: ' + (data.error || ''))
      }
    }

    confirmPayment()
  }, [params, toast, navigate])

  return <div className='flex flex-col w-full h-screen items-center justify-center bg-blackText dark:bg-blackText'>
    <p className="text-white mb-4 text-lg font-medium">Przetwarzanie zakupu...</p>
    <img src="../loader.gif" alt="loading" className='w-20'/>
  </div>
}
