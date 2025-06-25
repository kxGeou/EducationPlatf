import { useAuth } from "../../context/AuthContext";
import supabase from "../../util/supabaseClient";
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseList() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("purchased_courses")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;
        if (!userData || !userData.purchased_courses.length) {
          setCourses([]);
          return;
        }

        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("id, title, description")
          .in("id", userData.purchased_courses);

        if (coursesError) throw coursesError;

        setCourses(coursesData || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCourses();
  }, [user, loading, navigate]);

  if (loading) return <p>Ładowanie danych użytkownika...</p>;
  if (error) return <p>Błąd: {error}</p>;

  if (!courses.length)
    return <p>Nie masz jeszcze żadnych zakupionych kursów.</p>;

  return (
    <div className="px-4">
      <h2 className="text-xl">Twoje kursy: </h2>

      <ul className="py-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <li
            key={course.id}
            className="my-2  border border-t-0 border-gray-300 rounded-lg "
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <img
              src="./react2.png"
              alt="course img"
              className="w-full h-40 rounded-t-lg"
            />
            <div className="px-4 mt-2 pb-4">
              <h2 className="font-bold text-lg">{course.title}</h2>
              <p>{course.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
