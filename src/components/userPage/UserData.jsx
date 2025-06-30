import { X } from 'lucide-react'
import React from 'react'

function UserData({userDataModal, setUserDataModal}) {
  return (
    <div className='fixed backdrop:blur-2xl w-full h-full bg-black/20 backdrop-blur-sm flex justify-center items-center'>
        <div className='w-[50%] h-[75%] bg-white rounded-lg p-6 flex flex-col'>
            <div className='w-full flex justify-between'>
                <span></span>
                <X className='cursor-pointer' onClick={()=> setUserDataModal(!userDataModal)}></X>
            </div>
        </div>
    </div>
  )
}

export default UserData