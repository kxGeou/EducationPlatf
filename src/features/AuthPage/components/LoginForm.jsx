import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext';
import { Eye, EyeOff } from 'lucide-react'

import { useAuthStore } from '../../../store/authStore';

const loginSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny adres email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Jeśli confirmPassword jest podane, musi być takie samo jak password
  if (data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
})

export default function LoginForm() {
  const toast = useToast();
  const {
    register,
    trigger,
    getValues,
  } = useForm({ resolver: zodResolver(loginSchema) })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showConfirmField, setShowConfirmField] = useState(false)
  const loginUser = useAuthStore((state) => state.login) 
  const user = useAuthStore((state) => state.user)

  // Handle navigation when user is already logged in
  useEffect(() => {
    if (user) {
      const returnTo = searchParams.get('returnTo')
      navigate(returnTo || "/")
    }
  }, [user, navigate, searchParams])

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
    const { email, password, confirmPassword } = getValues()

    const result = await loginUser({ email, password, confirmPassword })
    setLoading(false)

    if (result === true) {
      const returnTo = searchParams.get('returnTo')
      navigate(returnTo || '/')
    }
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
            className="w-full p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded-xl bg-gray-50 sm:bg-transparent"
            placeholder="Wprowadź swój email"
          />
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium mb-2">Hasło</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full p-2 pr-10 border border-gray-300 rounded-xl bg-gray-50 sm:bg-transparent dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
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

        {showConfirmField && (
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Potwierdź hasło (aby wylogować wszystkie inne urządzenia)
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full p-2 pr-10 border border-gray-300 rounded-xl bg-gray-50 sm:bg-transparent dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
                placeholder="Powtórz hasło"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {!showConfirmField && (
          <button
            type="button"
            onClick={() => setShowConfirmField(true)}
            className="text-sm text-primaryBlue dark:text-primaryGreen hover:underline"
          >
            Zaloguj się i wyloguj z innych urządzeń
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen text-white p-2 rounded-xl hover:bg-secondaryBlue transition mt-4"
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>

        <p className="text-sm text-center mt-2">
    <a href="/update-password" className="text-primaryBlue hover:underline">
      Zapomniałeś hasła?
    </a>
  </p>
      </form>
    </>
  )
}
