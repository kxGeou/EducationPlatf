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
          .select("id, title, description, section_title, section_description, difficulty, time_to_complete")
          .in("id", userData.purchased_courses);

        if (coursesError) throw coursesError;

        setCourses(coursesData || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCourses();
  }, [user, loading, navigate]);

  const tierStyles = {
  Trudny: "bg-[#db4266] text-white",
  Łatwy: "bg-[#3b9c4e] text-white",
  Średni: "bg-[#f5d32c] text-black/75",
};

  if (loading) return (<div className="w-full h-screen flex justify-center items-center bg-white">
    <img src="./loading.svg" alt="loading animation" className="w-30"/>
  </div>);
  if (error) return <p>Błąd: {error}</p>;

  // if (!courses.length)
  //   return <div>Nie masz jeszcze żadnych zakupionych kursów.</div>;

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="mb-10 flex justify-between items-center w-full max-w-[250px] font-semibold">
        <p className="w-[50%] border border-gray-300 py-2 flex justify-center bg-white">Twoje Kursy</p>
        <p className="w-[50%] border border-l-0 border-gray-300 py-2 flex justify-center">Zasoby</p>
      </div>
      <ul className="w-full max-w-[1100px] flex flex-col gap-16">
        {courses.map((course, index) => (
          <div className="flex justify-between items-center" key={index}>
            <div className="flex flex-col items-start gap-3 w-[50%]">
              <h3 className="font-bold text-4xl">{course.section_title}</h3>
              <p className="text-md opacity-75">{course.section_description}</p>

            </div>
            <li
              key={course.id}
              className="my-2 w-full max-w-[400px] shadow-lg cursor-pointer transiton-all duration-400 hover:scale-102 hover:shadow-xl rounded-xl h-fit pb-4 bg-white"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <img
                src="./react2.png"
                alt="course img"
                className="w-full h-40 rounded-t-xl"
              />
              <div className="px-4 rounded-b-xl flex flex-col items-start justify-start h-28 pt-4">
                <h2 className="font-bold text-lg">{course.title}</h2>
                <p>{course.description}</p>

                <div className="flex gap-3 items-center w-full mt-4">

                  <span className="bg-blue-400 text-white px-2 py-1 rounded-lg text-sm">
                    {course.time_to_complete}
                  </span>

                  {["Trudny", "Łatwy", "Średni"].includes(course.difficulty) && (
                    <span className={`px-2 py-1 text-sm rounded-lg ${tierStyles[course.difficulty]}`}>
                      {course.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
