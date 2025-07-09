import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import supabase from '../../util/supabaseClient'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const registerSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny email' }),
  password: z.string().min(6, { message: 'Hasło musi mieć min. 6 znaków' }),
  full_name: z.string().min(2, { message: 'Imię i nazwisko są wymagane' }),
})

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

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
          data: { full_name },
        },
      })

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('user already registered')) {
          toast.error('Użytkownik o tym adresie już istnieje.')
        } else {
          toast.error(`Błąd rejestracji: ${signUpError.message}`)
        }
        return
      }

      const userId = signUpData.user?.id

      if (userId) {
        const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          full_name,
          avatar_url: '',
          purchased_courses: []
        }])


        if (insertError) {
          toast.error('Rejestracja powiodła się, ale wystąpił błąd przy zapisie danych.')
          return
        }
      }

      toast.success('Rejestracja zakończona! Sprawdź maila, aby potwierdzić konto.')
      navigate('/authentication')
    } catch (err) {
      toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-4 w-full mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 bg-gray-50 sm:bg-transparent rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hasło</label>
        <input
          type="password"
          {...register('password')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Imię i nazwisko</label>
        <input
          type="text"
          {...register('full_name')}
          className="w-full p-2 border border-gray-300 rounded bg-gray-50 sm:bg-transparent"
        />
      </div>

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
