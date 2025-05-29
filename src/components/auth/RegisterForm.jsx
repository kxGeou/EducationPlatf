import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import supabase  from '../../util/supabaseClient'
import { useState } from 'react'

const registerSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
  full_name: z.string().min(2, { message: 'Imię i nazwisko są wymagane' }),
})

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    const { email, password, full_name } = data

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    })

    if (signUpError) {
    setError(signUpError.message)
    } else {
    const userId = signUpData.user?.id

    if (userId) {
        const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, full_name, avatar_url: '' }])

        if (insertError) {
        setError('Rejestracja powiodła się, ale wystąpił problem z zapisaniem użytkownika.')
        } else {
        setSuccess(true)
        }
    }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 bg-gray-50 sm:bg-transparent rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hasło</label>
        <input
          type="password"
          {...register('password')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Imię i nazwisko</label>
        <input
          type="text"
          {...register('full_name')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
        />
        {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Rejestracja zakończona sukcesem! Sprawdź maila, aby potwierdzić konto.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition mt-4"
      >
        {loading ? 'Rejestruję...' : 'Zarejestruj się'}
      </button>
    </form>
  )
}
