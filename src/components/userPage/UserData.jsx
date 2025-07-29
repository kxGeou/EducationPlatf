import { X } from 'lucide-react'
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
          className='fixed backdrop:blur-2xl w-full h-full bg-black/20 backdrop-blur-sm flex justify-center items-center px-6 md:px-0'
        >
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='w-full lg:w-[50%] md:w-[75%]  h-[75%] bg-white rounded-[12px] p-6 flex flex-col'
          >
            <div className='w-full flex justify-between'>
              <span></span>
              <X
                className='cursor-pointer'
                onClick={() => setUserDataModal(false)}
              />
            </div>

            <div>
              <div className='flex flex-col gap-6'>
                <Avatar
                  name={user?.user_metadata?.full_name || "Użytkownik"}
                  colors={["#0056d6", "#669c35", "#ffffff", "#74a7fe", "#cce8b5"]}
                  variant="beam"
                  size={80}
                />

                <div className='flex flex-col gap-2'>
                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    <span className='text-darkerBlack font-semibold'>
                      {user?.user_metadata?.email_verified ? (
                        <span className='text-green-400'>Zweryfikowany</span>
                      ) : (
                        <span className='text-red-500'>Nie zweryfikowany</span>
                      )}
                    </span>
                  </p>

                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Email:
                    <span className='text-darkerBlack font-semibold'>
                      {user?.email || "Brak danych"}
                    </span>
                  </p>

                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Nazwa użytkownika:
                    <span className='text-darkerBlack font-semibold'>
                      {user?.user_metadata?.full_name || "Brak danych"}
                    </span>
                  </p>

                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Kupionych kursów:
                    <span className='text-darkerBlack font-semibold'>
                      {courses ? courses.length : 0}
                    </span>
                  </p>

                  <button
                    onClick={() => {
                      logout()
                      setUserDataModal(false)
                    }}
                    className='bg-red-400 mt-4 cursor-pointer text-white w-fit px-4 py-2 rounded-lg'
                  >
                    Wyloguj się
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UserData
