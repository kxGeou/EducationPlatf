import { useEffect, useState } from 'react'
import supabase from '../util/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MyCourses() {
  const { user, loading } = useAuth()
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }

    const fetchCourses = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('purchased_courses')
          .eq('id', user.id)
          .single()

        if (userError) throw userError
        if (!userData || !userData.purchased_courses.length) {
          setCourses([])
          return
        }

        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description')
          .in('id', userData.purchased_courses)

        if (coursesError) throw coursesError

        setCourses(coursesData || [])
      } catch (err) {
        setError(err.message)
      }
    }

    fetchCourses()
  }, [user, loading, navigate])

  if (loading) return <p>Ładowanie danych użytkownika...</p>
  if (error) return <p>Błąd: {error}</p>

  if (!courses.length) return <p>Nie masz jeszcze żadnych zakupionych kursów.</p>

  return (
    <div>
      <h1>Twoje kursy</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id} className="border p-4 my-2 rounded shadow">
            <h2 className="font-bold text-lg">{course.title}</h2>
            <p>{course.description}</p>
            <button
              onClick={() => navigate(`/course/${course.id}`)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Przejdź do kursu
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
