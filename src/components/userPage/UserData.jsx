import { X, Mail, BookOpen, LogOut, ShieldCheck } from 'lucide-react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from 'boring-avatars'
import { useAuthStore } from '../../store/authStore'
import { useCourseStore } from '../../store/courseStore'

function UserData({ userDataModal, setUserDataModal }) {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)

  const courses = useCourseStore(state => state.courses)
  const coursesLoading = useCourseStore(state => state.loading)
  const error = useCourseStore(state => state.error)

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

            <div className="pt-6 border-t border-blackText/25  flex justify-end">
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
