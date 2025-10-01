import { Mail, BookOpen, LogOut, ShieldCheck, Key, Eye, EyeOff, Star } from 'lucide-react'
import React, { useState } from 'react'
import Avatar from 'boring-avatars'
import { useAuthStore } from '../../../store/authStore';
import { useCourseStore } from '../../../store/courseStore';
import { toast } from 'react-toastify';
import supabase from '../../../util/supabaseClient';

function UserData() {
  const user = useAuthStore(state => state.user)
  const userPoints = useAuthStore(state => state.userPoints)
  const logout = useAuthStore(state => state.logout)
  const loading = useAuthStore(state => state.loading)

  const courses = useCourseStore(state => state.courses)
  const coursesLoading = useCourseStore(state => state.loading)
  const error = useCourseStore(state => state.error)

  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  const handlePasswordReset = async () => {
    if (!password) {
      toast.error('Wprowadź nowe hasło')
      return
    }
    
    if (password.length < 6) {
      toast.error('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        toast.error('Błąd zmiany hasła: ' + error.message)
        return
      }
      
      toast.success('Hasło zostało zmienione pomyślnie!')
      setPassword('')
      setShowPasswordReset(false)
    } catch (err) {
      toast.error('Wystąpił błąd podczas zmiany hasła')
    }
  }
  return (
    <div className="flex flex-col items-start w-full mt-2 px-3">
      <span className="flex gap-2 text-lg items-center mt-1 font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-12">
        Profil użytkownika
      </span>

      <div className="w-full bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6 mb-6">
        <div className="flex items-center gap-6">
          <Avatar
            name={user?.user_metadata?.full_name || 'Użytkownik'}
            colors={['#0056d6', '#669c35', '#ffffff', '#74a7fe', '#cce8b5']}
            variant="beam"
            size={80}
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {user?.user_metadata?.full_name || 'Nieznany użytkownik'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email || 'Brak e-maila'}</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-800 dark:text-white">{userPoints}</span>
              <span className="text-gray-600 dark:text-gray-400">punktów</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
            <h4 className="font-semibold text-gray-800 dark:text-white">Email</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email || 'Brak'}</p>
        </div>

        <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
            <h4 className="font-semibold text-gray-800 dark:text-white">Kursy</h4>
          </div>
          {coursesLoading ? (
            <p className="text-sm text-gray-400">Ładowanie...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Błąd</p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">{courses?.length || 0}</p>
          )}
        </div>

        <div className="bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck
              className={`w-6 h-6 ${user?.user_metadata?.email_verified ? 'text-green-500 dark:text-green-400' : 'text-red-500'}`}
            />
            <h4 className="font-semibold text-gray-800 dark:text-white">Status</h4>
          </div>
          <p
            className={`text-sm font-medium ${
              user?.user_metadata?.email_verified
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500'
            }`}
          >
            {user?.user_metadata?.email_verified ? 'Zweryfikowany' : 'Niezweryfikowany'}
          </p>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="w-full bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
            <h4 className="font-semibold text-gray-800 dark:text-white">Bezpieczeństwo</h4>
          </div>
          <button
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:bg-secondaryBlue dark:hover:bg-secondaryGreen transition-colors text-sm font-medium"
          >
            {showPasswordReset ? 'Anuluj' : 'Zmień hasło'}
          </button>
        </div>

        {showPasswordReset && (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź nowe hasło"
                className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText rounded-lg text-sm focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hasło musi mieć co najmniej 6 znaków
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePasswordReset}
                disabled={loading || password.length < 6}
                className="flex-1 bg-primaryBlue dark:bg-primaryGreen text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondaryBlue dark:hover:bg-secondaryGreen"
              >
                {loading ? 'Zapisywanie...' : 'Zapisz hasło'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordReset(false)
                  setPassword('')
                  setShowPassword(false)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          Wyloguj się
        </button>
      </div>
    </div>
  )
}

export default UserData
