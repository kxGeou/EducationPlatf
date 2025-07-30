import CourseList from '../components/userPage/CourseList'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/homepage/Footer'
import UserHeader from '../components/userPage/UserHeader'
import UserData from '../components/userPage/UserData'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function MyCourses({isDark, setIsDark}) {
  const [userDataModal, setUserDataModal] = useState(false)
  const [pageChange, setPageChange] = useState(true)
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  return (
    <div data-theme={isDark ? "dark" : "light"} className='flex justify-center bg-slate-300 w-full'>
      <div className='flex justify-center bg-slate-300 relative w-full max-w-[1400px]'>
        <div className='w-full'>
          <div className='min-h-screen'>
            <UserHeader
              pageChange={pageChange}
              setPageChange={setPageChange}
              userDataModal={userDataModal}
              setUserDataModal={setUserDataModal}
            />
            <CourseList pageChange={pageChange} />
          </div>
          <Footer padding="" />
        </div>

        {userDataModal && (
          <UserData userDataModal={userDataModal} setUserDataModal={setUserDataModal} />
        )}
      </div>
    </div>
  )
}
