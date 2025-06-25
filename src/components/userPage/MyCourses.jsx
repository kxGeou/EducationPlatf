import Userwelcome from './Userwelcome'
import CourseList from './CourseList'
import { useAuth } from '../../context/AuthContext'
import Footer from '../Footer'
import Header from '../Header'
import UserHeader from './userHeader'
export default function MyCourses() {
  return (
    <div className='flex justify-center'>
      <div className='w-full max-w-[1100px]'>
        <div className='h-screen'>
<UserHeader></UserHeader>
        <Userwelcome></Userwelcome>
        <CourseList></CourseList>
        </div>
        
        <Footer padding={"px-4"}></Footer>
      </div>
    </div>
  
  )
}
