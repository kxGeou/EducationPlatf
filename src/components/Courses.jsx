import { useEffect, useState } from 'react'
import  supabase  from '../util/supabaseClient'
import CourseCard from './CourseCard'
import { ShoppingBag } from 'lucide-react'
export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (!error) setCourses(data)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  if (loading) return <p>Ładowanie kursów...</p>

  return (
    <div className="flex flex-col w-full px-6 mt-14">
      <h2 className='mb-6 flex gap-2 items-center opacity-50'><ShoppingBag size={16}></ShoppingBag>Kursy do zakupu</h2>
      <div className="flex flex-col gap-8">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
