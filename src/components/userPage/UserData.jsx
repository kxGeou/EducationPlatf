import { X } from 'lucide-react'
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import Avatar from 'boring-avatars';

function UserData({ userDataModal, setUserDataModal }) {
    const { user, logout } = useAuth();
    const { courses, loading: coursesLoading, error } = useCourses();

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
                    name="Mary Edwards"
                    colors={["#0056d6", "#669c35", "#ffffff", "#74a7fe", "#cce8b5"]}
                    variant="beam"
                    size={80}
                  />
                  
                  <div className='flex flex-col gap-2'>
                     <p className='flex items-center gap-1 text-md text-gray-500'>
                    <span className='text-darkerBlack font-semibold'>
                      {user.user_metadata.email_verified ? <span className='text-green-400'>Zweryfikowany</span> : <span className='text-red-500'>Nie zweryfikowany</span>}
                    </span>
                  </p>
                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Email: 
                    <span className='text-darkerBlack font-semibold'>
                      {user.email}
                    </span>
                  </p>
                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Nazwa użytkownika: 
                    <span className='text-darkerBlack font-semibold'>
                      {user.user_metadata.full_name}
                    </span>
                  </p>
                  <p className='flex items-center gap-1 text-md text-gray-500'>
                    Kupionych kursów: 
                    <span className='text-darkerBlack font-semibold'>
                      {courses.length}
                    </span>
                  </p>
                 

                 <button onClick={() => logout()} className='bg-red-400 text-white  w-fit px-4 py-2 rounded-lg'>Wyloguj się</button>
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
