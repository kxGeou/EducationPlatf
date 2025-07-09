import { useEffect, useState } from 'react'
import supabase from '../../util/supabaseClient'
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

  return (
    <div className="flex flex-col w-full px-6 mt-26">
      <h2 className="mb-6 flex gap-2 items-center text-gray-500">
        <ShoppingBag size={16} />
        Kursy do zakupu
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-60 bg-gray-100 rounded-xl shadow-md animate-pulse"
            >
              <div className="h-full w-full p-4 space-y-4">
                <div className="w-3/4 h-4 bg-gray-300 rounded" />
                <div className="w-1/2 h-4 bg-gray-300 rounded" />
                <div className="w-full h-6 bg-gray-300 rounded mt-4" />
              </div>
            </div>
          ))
        ) : (
          courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  )
}
