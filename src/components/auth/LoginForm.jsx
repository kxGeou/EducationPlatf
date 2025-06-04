import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import  supabase  from '../../util/supabaseClient'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const loginSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
})

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    const { email, password } = data

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center space-y-4 w-full h-fit">
      <div className='w-full'>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
          placeholder='Wprowadź swój email'
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className='w-full'>
        <label className="block text-sm font-medium mb-2">Hasło</label>
        <input
          type="password"
          {...register('password')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
          placeholder='Podaj swoje hasło'
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition mt-4"
      >
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </button>
    </form>
  )
}
