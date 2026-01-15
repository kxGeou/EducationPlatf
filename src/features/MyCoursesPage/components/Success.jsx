import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import supabase from '../../../util/supabaseClient'
import { BookOpen, FileText, ArrowRight, Home } from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAuthStore } from '../../../store/authStore'
import { useCartStore } from '../../../store/cartStore'
import confetti from 'canvas-confetti'

export default function Success() {
  const toast = useToast();
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)
  const confettiFired = useRef(false)
  const { fetchUserData, purchasedCourses: currentPurchasedCourses, purchasedEbooks: currentPurchasedEbooks } = useAuthStore()
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(true)
  const [purchasedItems, setPurchasedItems] = useState([]) // Array of { id, title, type: 'ebook' | 'course', courseId? }
  const [error, setError] = useState(null)

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

        // Zapamiętaj aktualne zakupione produkty przed aktualizacją
        const previousCourses = [...(currentPurchasedCourses || [])]
        const previousEbooks = [...(currentPurchasedEbooks || [])]

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
          setError('Błąd podczas przetwarzania odpowiedzi serwera.')
          setLoading(false)
          return
        }

        if (res.ok && data.success) {
          // Wyczyść koszyk i odśwież dane użytkownika
          clearCart()
          const userId = session.user.id
          
          // Aktualizuj dane użytkownika i poczekaj na zakończenie
          await fetchUserData(userId)
          
          // Poczekaj chwilę na propagację zmian w store
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Pobierz aktualne zakupione produkty (z store po aktualizacji)
          const { purchasedCourses: newCourses, purchasedEbooks: newEbooks } = useAuthStore.getState()
          
          // Znajdź nowo zakupione produkty
          const newPurchasedCourses = (newCourses || []).filter(id => !previousCourses.includes(id))
          const newPurchasedEbooks = (newEbooks || []).filter(id => !previousEbooks.includes(id))

          // Pobierz szczegóły zakupionych produktów
          const items = []
          
          // Pobierz szczegóły zakupionych ebooków
          if (newPurchasedEbooks.length > 0) {
            const { data: ebooksData } = await supabase
              .from('ebooks')
              .select('id, title, course_id')
              .in('id', newPurchasedEbooks)
            
            if (ebooksData) {
              ebooksData.forEach(ebook => {
                items.push({
                  id: ebook.id,
                  title: ebook.title,
                  type: 'ebook',
                  courseId: ebook.course_id
                })
              })
            }
          }

          // Pobierz szczegóły zakupionych sekcji kursu
          if (newPurchasedCourses.length > 0) {
            const { data: coursesData } = await supabase
              .from('course_packages')
              .select('id, section_title, course_id')
              .in('id', newPurchasedCourses)
            
            if (coursesData) {
              coursesData.forEach(course => {
                items.push({
                  id: course.id,
                  title: course.section_title,
                  type: 'course',
                  courseId: course.course_id
                })
              })
            }
          }

          setPurchasedItems(items)
          setLoading(false)
        } else {
          const errorMessage = data?.error || `Status: ${res.status}`
          console.error('Payment confirmation error:', errorMessage)
          toast.error('Błąd podczas zapisu płatności: ' + errorMessage)
          setError('Błąd podczas zapisu płatności: ' + errorMessage)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in confirmPayment:', error)
        toast.error('Wystąpił błąd podczas przetwarzania zakupu. Sprawdź konsolę dla szczegółów.')
        setError('Wystąpił błąd podczas przetwarzania zakupu.')
        setLoading(false)
      }
    }

    confirmPayment()
  }, [params, toast, navigate, clearCart, fetchUserData])

  // Osobny useEffect dla konfetti i toast - uruchamia się tylko raz gdy loading się kończy
  useEffect(() => {
    if (!loading && purchasedItems.length > 0 && !confettiFired.current) {
      confettiFired.current = true
      toast.success('Zakupy zapisane! Kursy zostały dodane do Twojego konta.')
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } })
    }
  }, [loading, purchasedItems.length, toast])

  const handleGoToProduct = (item) => {
    // Dla ebooków i sekcji kursu przekierowuj do strony kursu
    if (item.courseId) {
      if (item.type === 'ebook') {
        // Dla ebooków przekieruj do sekcji ebook w kursie
        navigate(`/course/${item.courseId}?section=ebook`)
      } else if (item.type === 'course') {
        // Dla sekcji kursu przekieruj do sekcji teoretycznej
        navigate(`/course/${item.courseId}?section=theoretical`)
      }
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col w-full h-screen items-center justify-center bg-gray-50 dark:bg-blackText'>
        <p className="text-gray-900 dark:text-white mb-4 text-lg font-medium">Przetwarzanie zakupu...</p>
        <img src="../loader.gif" alt="loading" className='w-20'/>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col w-full h-screen items-center justify-center bg-gray-50 dark:bg-blackText p-4'>
        <div className="max-w-md w-full bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Błąd</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            Wróć do strony głównej
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col md:flex-row w-full min-h-screen items-center justify-center gap-8 bg-gray-50 dark:bg-blackText p-4'>
      {/* Success Robot Image */}
      <div className="flex justify-center">
        <img 
          src="/successRobot.svg" 
          alt="Sukces zakupu" 
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="max-w-2xl w-full bg-white dark:bg-DarkblackBorder rounded-xl shadow-xl p-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Zakup zakończony pomyślnie!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Dziękujemy za zakup. Twoje produkty zostały dodane do Twojego konta.
          </p>
        </div>

        {/* Purchased Items */}
        {purchasedItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Zakupione produkty:
            </h2>
            <div className="space-y-3">
              {purchasedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-DarkblackText rounded-md border border-gray-200 dark:border-DarkblackBorder"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {item.type === 'ebook' ? (
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.type === 'ebook' ? 'E-book' : 'Sekcja kursu'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGoToProduct(item)}
                    className="ml-4 px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md font-medium hover:opacity-90 transition flex items-center gap-2 flex-shrink-0"
                  >
                    Otwórz
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/user_page')}
            className="px-6 py-3 bg-gray-200 dark:bg-DarkblackText text-gray-900 dark:text-white rounded-md font-medium hover:bg-gray-300 dark:hover:bg-DarkblackBorder transition flex items-center justify-center gap-2"
          >
            Moje kursy
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Strona główna
          </button>
        </div>
      </div>
    </div>
  )
}
