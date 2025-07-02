import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../hooks/useCourses";
import { useNavigate } from "react-router-dom";
import {useState} from 'react'
import YouTubeEmbed from "react-youtube-embed";
function CourseList() {
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading, error } = useCourses();
  const [pageChange,setPageChange] = useState(true)
  const navigate = useNavigate();

  if (authLoading || coursesLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-slate-200">
        <img src="./loading.svg" alt="loading animation" className="w-30" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (error) return <p>Błąd: {error}</p>;

  if (!courses.length) return <p>Nie masz żadnych kursów.</p>;

  const tierStyles = {
    Trudny: "bg-[#db4266] text-white",
    Łatwy: "bg-[#3b9c4e] text-white",
    Średni: "bg-[#f5d32c] text-black/75",
  };
 
  const videoResources = [
    {
      id: "xTtL8E4LzTQ",
      title : "Kurs Java dla początkujących",
      description: "Wszystkie przydatne inforamcje są zawarte w tym kursie"
    },
    {
      id: "xTtL8E4LzTQ",
      title : "Kurs Java dla początkujących",
      description: "Wszystkie przydatne inforamcje są zawarte w tym kursie"
    },
    {
      id: "xTtL8E4LzTQ",
      title : "Kurs Java dla początkujących",
      description: "Wszystkie przydatne inforamcje są zawarte w tym kursie"
    },
    {
      id: "xTtL8E4LzTQ",
      title : "Kurs Java dla początkujących",
      description: "Wszystkie przydatne inforamcje są zawarte w tym kursie"
    },
    {
      id: "xTtL8E4LzTQ",
      title : "Kurs Java dla początkujących",
      description: "Wszystkie przydatne inforamcje są zawarte w tym kursie"
    },
  ]

  const ResourceVideo = ({videoID, videoTitle, videoDescription}) => {
    return (
      <div className="w-full max-w-[350px] bg-white rounded-xl shadow-lg transition-all duration-400 hover:scale-103">
        <div>
          <YouTubeEmbed id={videoID}></YouTubeEmbed>
        </div>

        <div className="px-4 py-6">
          <p className="font-bold text-lg ">{videoTitle}</p>
          <span className="text-md opacity-50">{videoDescription}</span>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col items-center mt-8 ">
      <div className="mb-10 flex justify-between items-center w-full max-w-[300px] font-semibold">
        <p className={`w-[50%] border border-gray-300 py-2 flex justify-center ${pageChange? "bg-white" : "bg-transparent"} cursor-pointer`} onClick={()=> setPageChange(true)} >
          📚 Twoje Kursy
        </p>
        <p className={`w-[50%] border border-gray-300 py-2 flex justify-center ${pageChange? "bg-transparent" : "bg-white"} cursor-pointer`} onClick={()=> setPageChange(false)} >
          🗂️ Zasoby
        </p>
      </div>
      {pageChange ? 
      <ul className="w-full max-w-[1100px] flex flex-col gap-16">
        {courses.map((course) => (
          <div className="flex justify-center md:justify-between items-center px-6" key={course.id}>
            <div className="md:flex flex-col items-start gap-3 w-[50%] hidden">
              <h3 className="font-bold text-4xl">{course.section_title}</h3>
              <p className="text-md opacity-75">{course.section_description}</p>
            </div>
            <li
              className="my-2  w-full max-w-[400px] shadow-lg cursor-pointer transiton-all duration-400 hover:scale-102 hover:shadow-xl rounded-xl h-fit pb-4 bg-white"
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
                    <span
                      className={`px-2 py-1 text-sm rounded-lg ${
                        tierStyles[course.difficulty]
                      }`}
                    >
                      {course.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </li>
          </div>
        ))}
      </ul>
      : 
      <div className=" w-full max-w-[1100px] grid grid-cols-3 gap-8">
       {videoResources.map((video,index) => (
        <ResourceVideo key={index} videoID={video.id} videoDescription={video.description} videoTitle={video.title}></ResourceVideo>
       ))}
      </div>
      }
      
    </div>
  );
}

export default CourseList;
