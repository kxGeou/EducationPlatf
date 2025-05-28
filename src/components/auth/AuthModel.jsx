import { useState } from 'react'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-lg">×</button>
        </div>

        {mode === 'login' ? <LoginForm /> : <RegisterForm />}

        <div className="text-sm mt-4 text-center">
          {mode === 'login' ? (
            <>
              Nie masz konta?{' '}
              <button onClick={() => setMode('register')} className="text-blue-600 underline">
                Zarejestruj się
              </button>
            </>
          ) : (
            <>
              Masz już konto?{' '}
              <button onClick={() => setMode('login')} className="text-blue-600 underline">
                Zaloguj się
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
