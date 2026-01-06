import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore';

const resetSchema = z.object({
  email: z.string().email({ message: 'Niepoprawny adres email' }),
})

export default function PasswordResetForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) })

  const navigate = useNavigate()
  const resetPassword = useAuthStore((state) => state.resetPassword)
  const loading = useAuthStore((state) => state.loading)

  const onSubmit = async (data) => {
    const success = await resetPassword(data.email)
    if (success) {
      navigate('/authentication')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center space-y-4 w-full h-fit">
      <div className="w-full">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full p-2 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded-xl bg-gray-50 sm:bg-transparent"
          placeholder="Wprowadź swój email"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Link resetujący będzie ważny przez 1 godzinę
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen text-white p-2 rounded-xl hover:bg-secondaryBlue transition mt-4"
      >
        {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
      </button>
      
      <p className="text-sm text-center mt-2">
        <button
          type="button"
          onClick={() => navigate('/authentication')}
          className="text-primaryBlue dark:text-primaryGreen hover:underline"
        >
          ← Powrót do logowania
        </button>
      </p>
    </form>
  )
}
