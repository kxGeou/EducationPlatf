import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import supabase from '../../util/supabaseClient'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny adres email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
})

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

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

  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      if (
        loginError.message.toLowerCase().includes('invalid login credentials') ||
        loginError.message.toLowerCase().includes('invalid') ||
        loginError.status === 400
      ) {
        toast.error('Nieprawidłowy email lub hasło.')
      } else {
        toast.error(`Błąd logowania: ${loginError.message}`)
      }
      return 
    }

    toast.success('Zalogowano pomyślnie!')
    navigate('/')
  } catch {
    toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.')
  } finally {
    setLoading(false)
  }
}


  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="flex flex-col justify-center items-center space-y-4 w-full h-fit">
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
          placeholder="Wprowadź swój email"
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Hasło</label>
        <input
          type="password"
          {...register('password')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
          placeholder="Podaj swoje hasło"
        />
      </div>

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
