import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react'

import { useAuthStore } from '../../../store/authStore';
import SessionSelectionModal from './SessionSelectionModal';

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
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [blockedSessionData, setBlockedSessionData] = useState(null)
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' })
  const loginUser = useAuthStore((state) => state.login) 
  const user = useAuthStore((state) => state.user)

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
    setLoginCredentials({ email, password })

    const result = await loginUser({ email, password })
    setLoading(false)

    console.log('📥 Login result:', result);
    console.log('📥 Result type:', typeof result);
    console.log('📥 Is object?', typeof result === 'object');
    console.log('📥 Has blocked?', result && result.blocked);
    console.log('📥 Reason?', result && result.reason);

    // Sprawdź czy logowanie zostało zablokowane z powodu limitu sesji
    if (result && typeof result === 'object' && result.blocked && result.reason === 'max_sessions_reached') {
      console.log('🚫 Session limit reached, showing modal with sessions:', result.activeSessions);
      setBlockedSessionData(result)
      setSessionModalOpen(true)
      return
    }

    if (result === true) {
      navigate('/')
    }
  }

  const handleModalClose = () => {
    setSessionModalOpen(false)
    setBlockedSessionData(null)
  }

  const handleModalSuccess = () => {
    setSessionModalOpen(false)
    setBlockedSessionData(null)
    navigate('/')
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex flex-col justify-center items-center space-y-4 w-full"
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

      {/* Modal wyboru sesji - poza formularzem */}
      {sessionModalOpen && blockedSessionData && (
        <SessionSelectionModal
          isOpen={sessionModalOpen}
          onClose={handleModalClose}
          activeSessions={blockedSessionData.activeSessions}
          email={loginCredentials.email}
          password={loginCredentials.password}
        />
      )}
    </>
  )
}
