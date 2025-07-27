import CourseList from '../components/userPage/CourseList'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/homepage/Footer'
import UserHeader from '../components/userPage/UserHeader'
import UserData from '../components/userPage/UserData'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../util/supabaseClient'
export default function MyCourses() {
  const [userDataModal, setUserDataModal] = useState(false)
  const navigate = useNavigate();
  const [pageChange, setPageChange] = useState(true);

    const fetchUser = async () => {
      const { error } = await supabase.auth.getUser();
      if (error) {
        navigate('/authentication')
      }
    };
 
    useEffect(() => {
      fetchUser();
    }, []);
  
  return (
    <div className='flex justify-center bg-slate-200 w-full'>
  <div className='flex justify-center bg-slate-200 relative w-full max-w-[1400px]'>
      <div className='w-full '>
        <div className='min-h-screen'>
        <UserHeader pageChange={pageChange} setPageChange={setPageChange} userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserHeader>
        <CourseList pageChange={pageChange}></CourseList>
        </div>
        <Footer padding={""}></Footer>
      </div>

      {userDataModal &&
        <UserData userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserData>
      }
    </div>
  </div>
  )
}
