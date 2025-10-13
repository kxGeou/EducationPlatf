import { Mail, BookOpen, LogOut, ShieldCheck, Key, Eye, EyeOff, Star, Calendar } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import Avatar from 'boring-avatars'
import { useAuthStore } from '../../../store/authStore';
import { useCourseStore } from '../../../store/courseStore';
import { useToast } from '../../../context/ToastContext';
import supabase from '../../../util/supabaseClient';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

function UserData() {
  const toast = useToast();
  const user = useAuthStore(state => state.user)
  const userPoints = useAuthStore(state => state.userPoints)
  const maturaDate = useAuthStore(state => state.maturaDate)
  const logout = useAuthStore(state => state.logout)
  const updateMaturaDate = useAuthStore(state => state.updateMaturaDate)
  const loading = useAuthStore(state => state.loading)
  const cleanupPurchasedCourses = useAuthStore(state => state.cleanupPurchasedCourses)

  const courses = useCourseStore(state => state.courses)
  const coursesLoading = useCourseStore(state => state.loading)
  const error = useCourseStore(state => state.error)

  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [showMaturaDate, setShowMaturaDate] = useState(false)
  const [maturaDateInput, setMaturaDateInput] = useState('')
  const [showMaturaConfirmation, setShowMaturaConfirmation] = useState(false)

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

  const handleMaturaDateUpdate = () => {
    if (!maturaDateInput) {
      toast.error('Wybierz datę matury')
      return
    }

    const currentYear = new Date().getFullYear()
    const selectedYear = parseInt(maturaDateInput)
    
    if (selectedYear < currentYear || selectedYear > currentYear + 3) {
      toast.error('Data matury może być ustawiona maksymalnie 3 lata w przód')
      return
    }

    // Pokaż modal potwierdzenia
    setShowMaturaConfirmation(true)
  }

  const handleMaturaDateConfirm = async () => {
    const selectedYear = parseInt(maturaDateInput)
    
    // Convert year to full date format (YYYY-07-01 - July instead of May)
    const fullDate = `${selectedYear}-07-01`

    const success = await updateMaturaDate(fullDate)
    if (success) {
      setShowMaturaDate(false)
      setMaturaDateInput('')
      setShowMaturaConfirmation(false)
    }
  }

  const handleTestCleanup = async () => {
    if (!user) {
      toast.error('Musisz być zalogowany')
      return
    }

    const confirmed = window.confirm(
      'Czy na pewno chcesz wyczyścić wszystkie zakupione kursy? Ta operacja jest nieodwracalna.'
    )
    
    if (!confirmed) return

    const success = await cleanupPurchasedCourses()
    if (success) {
      toast.success('Kursy zostały wyczyszczone pomyślnie!')
    } else {
      toast.error('Błąd podczas czyszczenia kursów')
    }
  }

  useEffect(() => {
    if (maturaDate) {
      // Extract year from date (YYYY-MM-DD format)
      const year = maturaDate.split('-')[0]
      setMaturaDateInput(year)
    }
  }, [maturaDate])
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

      {/* Matura Date Section */}
      <div className="w-full bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
            <h4 className="font-semibold text-gray-800 dark:text-white">Data matury</h4>
          </div>
          {!maturaDate && (
            <button
              onClick={() => setShowMaturaDate(!showMaturaDate)}
              className="px-4 py-2 bg-primaryBlue dark:bg-primaryGreen text-white rounded-lg hover:bg-secondaryBlue dark:hover:bg-secondaryGreen transition-colors text-sm font-medium"
            >
              {showMaturaDate ? 'Anuluj' : 'Ustaw'}
            </button>
          )}
        </div>

        {maturaDate && !showMaturaDate && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ustawiona data:</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{maturaDate.split('-')[0]}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Data matury może być ustawiona tylko raz. Kursy zostaną automatycznie usunięte w lipcu {maturaDate.split('-')[0]}.
            </p>
          </div>
        )}

        {showMaturaDate && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wybierz rok matury:
              </label>
              <select
                value={maturaDateInput}
                onChange={(e) => setMaturaDateInput(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText rounded-lg text-sm focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen focus:border-transparent"
              >
                <option value="">Wybierz rok</option>
                {Array.from({ length: 4 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Możesz ustawić datę matury maksymalnie 3 lata w przód. Kursy zostaną automatycznie usunięte w lipcu wybranego roku.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleMaturaDateUpdate}
                disabled={loading || !maturaDateInput}
                className="flex-1 bg-primaryBlue dark:bg-primaryGreen text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondaryBlue dark:hover:bg-secondaryGreen"
              >
                {loading ? 'Zapisywanie...' : 'Zapisz datę'}
              </button>
              <button
                onClick={() => {
                  setShowMaturaDate(false)
                  setMaturaDateInput(maturaDate || '')
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
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

      {/* Test Cleanup Button */}
      <div className="w-full bg-white dark:bg-DarkblackText rounded-[12px] shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-orange-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white">Test funkcji</h4>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Przycisk testowy do sprawdzenia funkcji czyszczenia zakupionych kursów.
        </p>
        <button
          onClick={handleTestCleanup}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Wyczyść zakupione kursy (TEST)
        </button>
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

      {/* Modal potwierdzenia daty matury */}
      <ConfirmationModal
        isOpen={showMaturaConfirmation}
        onClose={() => setShowMaturaConfirmation(false)}
        onConfirm={handleMaturaDateConfirm}
        title="Potwierdzenie daty matury"
        message={`Czy na pewno chcesz ustawić datę matury na ${maturaDateInput}?

⚠️ UWAGA: W lipcu ${maturaDateInput} wszystkie Twoje kursy zostaną automatycznie usunięte!

Ta operacja jest nieodwracalna i data matury może być ustawiona tylko raz.

Jeśli jesteś pewien swojej decyzji, kliknij "Potwierdź".`}
        confirmText="Potwierdź"
        cancelText="Anuluj"
        type="warning"
        isLoading={loading}
      />
    </div>
  )
}

export default UserData
