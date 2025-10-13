import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react'

import { useAuthStore } from '../../../store/authStore';

const loginSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny adres email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
})

export default function LoginForm() {
  const toast = useToast();
  const {
    register,
    trigger,
    getValues,
  } = useForm({ resolver: zodResolver(loginSchema) })

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSessionConflict, setShowSessionConflict] = useState(false)
  const [isResolvingConflict, setIsResolvingConflict] = useState(false)
  const loginUser = useAuthStore((state) => state.login) 
  const user = useAuthStore((state) => state.user);
  const sessionConflict = useAuthStore((state) => state.sessionConflict);
  const resolveSessionConflict = useAuthStore((state) => state.resolveSessionConflict);

  // Handle navigation when user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  const onSubmit = async () => {
    const valid = await trigger()
    if (!valid) {
      const values = getValues()
      const validationResult = loginSchema.safeParse(values)
      if (!validationResult.success) {
        validationResult.error.errors.forEach((err) => {
          toast.error(err.message)
        })
      }
      return
    }

    setLoading(true)
    const { email, password } = getValues()

    const result = await loginUser({ email, password })
    setLoading(false)

    if (result === true) {
      navigate('/')
    } else if (result === 'session_conflict') {
      // Konflikt sesji - pokaż opcję wymuszenia wylogowania
      setShowSessionConflict(true)
    }
  }

  const handleForceLogout = async () => {
    setIsResolvingConflict(true)
    try {
      const success = await resolveSessionConflict()
      if (success) {
        navigate('/')
      }
    } finally {
      setIsResolvingConflict(false)
      setShowSessionConflict(false)
    }
  }

  const handleCancelConflict = () => {
    setShowSessionConflict(false)
    useAuthStore.getState().set({ sessionConflict: null })
  }

  return (
    <>
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex flex-col justify-center items-center space-y-4 w-full h-fit"
    >
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded bg-gray-50 sm:bg-transparent"
          placeholder="Wprowadź swój email"
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Hasło</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className="w-full p-2 pr-10 border border-gray-300 rounded bg-gray-50 sm:bg-transparent dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
            placeholder="Podaj swoje hasło"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen text-white p-2 rounded hover:bg-secondaryBlue transition mt-4"
      >
        {loading ? 'Logowanie...' : 'Zaloguj się'}
        
      </button>
      <p className="text-sm text-center mt-2">
  <a href="/update-password" className="text-primaryBlue hover:underline">
    Zapomniałeś hasła?
  </a>
</p>

    </form>

    {/* Sekcja konfliktu sesji */}
    {showSessionConflict && (
      <div className="w-full mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 text-yellow-600 dark:text-yellow-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
            Konto jest już zalogowane
          </h3>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          Twoje konto jest już zalogowane na innym urządzeniu. Aby zalogować się tutaj, musisz wylogować się z tamtego urządzenia.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleForceLogout}
            disabled={isResolvingConflict}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isResolvingConflict ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Wylogowywanie...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Wyloguj z tamtego urządzenia</span>
              </>
            )}
          </button>
          <button
            onClick={handleCancelConflict}
            disabled={isResolvingConflict}
            className="px-4 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    )}
    </>
  )
}
