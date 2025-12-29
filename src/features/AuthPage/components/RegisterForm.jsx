import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import zxcvbn from 'zxcvbn'
import { useState } from 'react'
import { useToast } from '../../../context/ToastContext';

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore';

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    full_name: z.string().min(2),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Musisz zaakceptować regulamin' }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: 'Musisz wyrazić zgodę na przetwarzanie danych' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być takie same',
    path: ['confirmPassword'],
  })
  .refine((data) => zxcvbn(data.password).score >= 2, {
    message: 'Hasło jest zbyt słabe',
    path: ['password'],
  })


const strengthLabels = [
  'Bardzo słabe',
  'Słabe',
  'Średnie',
  'Dobre',
  'Bardzo dobre',
]

const strengthColors = [
  '#ff4d4f',
  '#ff7a45',
  '#ffa940',
  '#73d13d',
  '#389e0d',
]

function PasswordStrength({ password }) {
  const pwd = password || ''
  const result = zxcvbn(pwd)
  const score = result.score
  const widthPercent = ((score + 1) / 5) * 100

  if (!pwd) return null

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-300 rounded h-3 overflow-hidden">
        <div
          className="h-3 rounded transition-all duration-300"
          style={{
            width: `${widthPercent}%`,
            backgroundColor: strengthColors[score],
          }}
        />
      </div>
      <p className="mt-1 text-sm font-medium" style={{ color: strengthColors[score] }}>
        {strengthLabels[score]}
      </p>
    </div>
  )
}

export default function RegisterForm() {
  const {
    register,
    getValues,
    trigger,
    watch,
  } = useForm({ resolver: zodResolver(registerSchema) })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const password = watch('password')

  const registerUser = useAuthStore((state) => state.register)

  const onSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) {
      const result = registerSchema.safeParse(getValues())
      if (!result.success) {
        result.error.errors.forEach((err) => toast.error(err.message))
      }
      return
    }

    setLoading(true)
    const { email, password, full_name } = getValues()

    const success = await registerUser({ email, password, full_name })
    setLoading(false)

    if (success) {
      const returnTo = searchParams.get('returnTo')
      // Jeśli użytkownik musi potwierdzić email, przekieruj do logowania z returnTo
      // Jeśli jest automatycznie zalogowany, przekieruj bezpośrednio
      const user = useAuthStore.getState().user
      if (user) {
        navigate(returnTo || '/')
      } else {
        // Użytkownik musi potwierdzić email - przekieruj do logowania z returnTo
        if (returnTo) {
          navigate(`/authentication?returnTo=${encodeURIComponent(returnTo)}`)
        }
      }
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-6 w-full"
    >
      <input
        type="email"
        {...register('email')}
        placeholder="Email"
        className="w-full p-2 border border-gray-300 rounded dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
      />

      <input
        type="text"
        {...register('full_name')}
        placeholder="Imię i nazwisko"
        className="w-full p-2 border border-gray-300 rounded dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
      />

      <input
        type="password"
        {...register('password')}
        placeholder="Hasło"
        className="w-full p-2 border border-gray-300 rounded dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
      />

      <input
        type="password"
        {...register('confirmPassword')}
        placeholder="Powtórz hasło"
        className="w-full p-2 border border-gray-300 rounded dark:border-DarkblackBorder dark:bg-DarkblackBorder/50"
      />
      <PasswordStrength password={password} />
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    {...register('acceptTerms')}
    id="acceptTerms"
  />
  <label htmlFor="acceptTerms" className='flex gap-1'>
    Akceptuję <a href="/regulamin" className="underline text-primaryBlue font-semibold dark:text-primaryGreen">regulamin</a>
  </label>
</div>

<div className="flex items-center gap-2">
  <input
    type="checkbox"
    {...register('acceptPrivacy')}
    id="acceptPrivacy"
  />
  <label htmlFor="acceptPrivacy">
    Wyrażam zgodę na przetwarzanie danych osobowych
  </label>
</div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primaryBlue text-white p-2 rounded hover:bg-secondaryBlue cursor-pointer transition"
      >
        {loading ? 'Rejestruję...' : 'Zarejestruj się'}
      </button>
    </form>
  )
}
