import { useEffect, useState } from "react"
import { Link } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, []);

  async function fetchCourses(){
    setLoading(true)
    let {data, error} = await supabase.from('courses').select("*")
    if (error) {
      alert("Błąd przy pobieraniu kursów: " + error.message)
    } else {
      setCourses(data)
    }
    setLoading(false)
  }

  if (loading) return <p>Ładowanie kursów...</p>;

  return (
    <div>
      <h1>Dostępne kursy</h1>

      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p>Cena: {(course.price / 100).toFixed(2)} zł</p>
            <Link to={`/course/${course.id}`}>Zobacz kurs</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

