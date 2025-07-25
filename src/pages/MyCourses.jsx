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
    <div className='flex justify-center bg-slate-200 relative'>
      <div className='w-full'>
        <div className='min-h-screen'>
        <UserHeader userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserHeader>
        <CourseList></CourseList>
        </div>
        <Footer padding={""}></Footer>
      </div>

      {userDataModal &&
        <UserData userDataModal={userDataModal} setUserDataModal={setUserDataModal}></UserData>
      }
    </div>
  
  )
}
