import { useEffect, useState } from 'react'
import  supabase  from '../util/supabaseClient'
import CourseCard from './CourseCard'

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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Dostępne kursy</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
