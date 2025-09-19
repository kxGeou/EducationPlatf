import { X, Mail, BookOpen, LogOut, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from 'boring-avatars'
import { useAuthStore } from '../../store/authStore'
import { useCourseStore } from '../../store/courseStore'
import { toast } from 'react-toastify'
import supabase from '../../util/supabaseClient'

function UserData({ userDataModal, setUserDataModal }) {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const resetPassword = useAuthStore(state => state.resetPassword)
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
    <AnimatePresence>
      {userDataModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-50 inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{  opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md bg-white dark:bg-DarkblackBorder dark:text-white rounded-2xl shadow-xl p-6 flex flex-col gap-6"
          >
            <div className="flex justify-between mb-2 items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/75">Dane użytkownika</h2>
                <p className="text-sm text-gray-500 dark:text-white/50">Twoje informacje i status konta</p>
              </div>
              <X className="cursor-pointer text-gray-500 dark:text-white hover:text-black" onClick={() => setUserDataModal(false)} />
            </div>

            <div className="flex items-center gap-4 border-b border-blackText/25 pb-4">
              <Avatar
                name={user?.user_metadata?.full_name || 'Użytkownik'}
                colors={['#0056d6', '#669c35', '#ffffff', '#74a7fe', '#cce8b5']}
                variant="beam"
                size={64}
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  {user?.user_metadata?.full_name || 'Nieznany użytkownik'}
                </span>
                <span className="text-sm text-gray-500 dark:text-white">{user?.email || 'Brak e-maila'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-white">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  Email:
                </span>
                <span className="font-medium text-gray-800 dark:text-white/75">{user?.email || 'Brak'}</span>
              </div>

              <div className="flex items-center justify-between ">
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Kursy:
                </span>
                {coursesLoading ? (
                  <span className="italic text-gray-400 ">Ładowanie...</span>
                ) : error ? (
                  <span className="text-red-500">Błąd</span>
                ) : (
                  <span className="font-medium text-gray-800 dark:text-white/75">{courses?.length || 0}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className={user?.user_metadata?.email_verified ? 'text-green-500 dark:text-green-400' : 'text-red-500'}
                  />
                  Status:
                </span>
                <span
                  className={
                    user?.user_metadata?.email_verified
                      ? 'text-green-600 font-medium dark:text-green-400'
                      : 'text-red-500 font-medium'
                  }
                >
                  {user?.user_metadata?.email_verified ? 'Zweryfikowany' : 'Niezweryfikowany'}
                </span>
              </div>
            </div>

            {/* Password Reset Section */}
            <div className="pt-4 border-t border-blackText/25">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                  <Key size={16} />
                  Bezpieczeństwo:
                </span>
                <button
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="text-xs text-primaryBlue dark:text-primaryGreen hover:underline"
                >
                  {showPasswordReset ? 'Anuluj' : 'Zmień hasło'}
                </button>
              </div>

              {showPasswordReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wprowadź nowe hasło"
                      className="w-full p-2 pr-10 border border-gray-300 dark:border-DarkblackBorder dark:bg-DarkblackBorder/50 rounded bg-gray-50 sm:bg-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hasło musi mieć co najmniej 6 znaków
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordReset}
                      disabled={loading || password.length < 6}
                      className="flex-1 bg-primaryBlue dark:bg-primaryGreen dark:hover:bg-secondaryGreen text-white px-3 py-2 rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondaryBlue"
                    >
                      {loading ? 'Zapisywanie...' : 'Zapisz hasło'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordReset(false)
                        setPassword('')
                        setShowPassword(false)
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-DarkblackBorder rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-DarkblackBorder/50 transition"
                    >
                      Anuluj
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="pt-6 border-t border-blackText/25 flex justify-end">
              <button
                onClick={() => {
                  logout()
                  setUserDataModal(false)
                }}
                className="flex items-center gap-2 bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <LogOut size={16} />
                Wyloguj się
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UserData
