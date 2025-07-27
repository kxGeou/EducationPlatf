import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import zxcvbn from 'zxcvbn'
import supabase from '../../util/supabaseClient'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    full_name: z.string().min(2),
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
  const pwd = password || '';
  const result = zxcvbn(pwd);
  const score = result.score;
  const widthPercent = ((score + 1) / 5) * 100;

  if (!pwd) return null; 

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
      <p
        className="mt-1 text-sm font-medium"
        style={{ color: strengthColors[score] }}
      >
        {strengthLabels[score]}
      </p>
    </div>
  );
}



export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
  } = useForm({ resolver: zodResolver(registerSchema) })

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const password = watch('password')

  
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

  try {
   const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name } 
  }
})


    if (signUpError) {
      toast.error(signUpError.message)
      setLoading(false)
      return
    }

    if (!signUpData.user) {
      toast.error('Nie udało się utworzyć użytkownika.')
      setLoading(false)
      return
    }

    toast.success('Rejestracja zakończona! Sprawdź maila, aby potwierdzić konto.')

  } catch (error) {
    toast.error('Wystąpił błąd. Spróbuj ponownie.')
  } finally {
    setLoading(false)
  }
}



  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-6 w-full">
      <input
        type="email"
        {...register('email')}
        placeholder="Email"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="text"
        {...register('full_name')}
        placeholder="Imię i nazwisko"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="password"
        {...register('password')}
        placeholder="Hasło"
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="password"
        {...register('confirmPassword')}
        placeholder="Powtórz hasło"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <PasswordStrength password={password} />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Rejestruję...' : 'Zarejestruj się'}
      </button>
    </form>
  )
}
