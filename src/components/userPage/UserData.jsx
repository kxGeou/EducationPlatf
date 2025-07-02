import { X } from 'lucide-react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function UserData({ userDataModal, setUserDataModal }) {
  return (
    <AnimatePresence>
      {userDataModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed backdrop:blur-2xl w-full h-full bg-black/20 backdrop-blur-sm flex justify-center items-center'
        >
          <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='w-[50%] h-[75%] bg-white rounded-lg p-6 flex flex-col'
          >
            <div className='w-full flex justify-between'>
              <span></span>
              <X
                className='cursor-pointer'
                onClick={() => setUserDataModal(false)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UserData
