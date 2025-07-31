import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import supabase from '../../util/supabaseClient'

const resetSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny adres email' }),
})

export default function PasswordResetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) })

  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: 'http://localhost:5173/reset-password',
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Sprawdź swoją skrzynkę e-mail i kliknij link resetujący')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-lg font-semibold">Resetuj hasło</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Wprowadź swój email"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primaryBlue text-white p-2 rounded hover:bg-secondaryBlue transition"
      >
        {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
      </button>
    </form>
  )
}
