import CourseList from '../components/userPage/CourseList'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/homepage/Footer'
import UserHeader from '../components/userPage/UserHeader'
import UserData from '../components/userPage/UserData'
import { useState } from 'react'
export default function MyCourses() {
  const [userDataModal, setUserDataModal] = useState(false)
  return (
    <div className='flex justify-center bg-slate-200 relative'>
      <div className='w-full'>
        <div className='min-h-screen'>
        <UserHeader userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserHeader>
        <CourseList></CourseList>
        </div>
        <hr className='mt-26 text-gray-400' />
        <Footer padding={""}></Footer>
      </div>

      {userDataModal &&
        <UserData userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserData>
      }
    </div>
  
  )
}
