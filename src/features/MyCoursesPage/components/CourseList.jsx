import { useAuthStore } from '../../../store/authStore';
import { useCourseStore } from '../../../store/courseStore';
import Error from '../../../components/systemLayouts/Error';
import Loading from '../../../components/systemLayouts/Loading';
import ReportPanel from "./ReportPanel";
import { MessageCircleQuestionIcon, ShoppingCart, Star } from "lucide-react";
import { memo, useMemo, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogPanel from "./BlogPanel";
import FormUserPage from "./FormUserPage";
import IdeaPanel from "./IdeaPanel";
import Leaderboard from "./Leaderboard";
import Rewards from "./Rewards";
import UserData from "./UserData";
import Dashboard from "./Dashboard";
import ReferralPanel from "./ReferralPanel";

const videoResources = [
  {
    title: "Kurs Java dla początkujących",
    description:
      "Poznaj podstawy Javy krok po kroku – od instalacji środowiska po pierwsze programy i proste projekty.",
    category: "YouTube",
  },
  {
    title: "Kurs JavaScript dla początkujących",
    description:
      "Poznaj podstawy JavaScript krok po kroku, ucząc się składni, pracy z przeglądarką i tworzenia interaktywnych stron.",
    category: "YouTube",
  },
  {
    title: "Python AI",
    description:
      "Zrozum jak działa zaawansowana sztuczna inteligencja przy użyciu Pythona – od prostych algorytmów po modele uczenia maszynowego.",
    category: "Tekst",
  },
  {
    title: "Zaawansowany React",
    description:
      "Buduj skalowalne aplikacje z React + Zustand, poznając architekturę komponentów, zarządzanie stanem i dobre praktyki.",
    category: "DokumentPDF",
  },
  {
    title: "Zaawansowany TailWind",
    description:
      "Buduj skalowalne aplikacje z React + Tailwind, korzystając z gotowych klas i tworząc estetyczne, responsywne interfejsy.",
    category: "DokumentPDF",
  },
  {
    title: "Podstawy UI/UX",
    description:
      "Dowiedz się, jak tworzyć nowoczesne interfejsy, poprawiać doświadczenie użytkownika i stosować zasady projektowania.",
    category: "Tekst",
  },
];

const ResourceVideo = memo(({ videoTitle, videoDescription, category }) => {
  const userPoints = useAuthStore((state) => state.userPoints);
  
  return (
    <div className="w-full text-blackText border border-gray-200 bg-white dark:border-DarkblackBorder dark:bg-blackText dark:text-white rounded-[12px] shadow-md transition-all duration-300 flex flex-col items-start justify-between p-4 ">
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`${category == "YouTube" && "text-red-500"} ${
              category == "Tekst" && "text-blue-500"
            } ${
              category == "DokumentPDF" && "text-green-500"
            } font-semibold text-sm`}
          >
            #{category}
          </span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {userPoints || 0} pkt
            </span>
          </div>
        </div>
        <h4 className="font-bold text-lg mt-1 w-full">{videoTitle}</h4>
        <p className="text-sm opacity-70 break-words line-clamp-3 leading-snug">
          {videoDescription}
        </p>
      </div>
      <button
        className={`
          transition-transform duration-300 hover:-translate-y-1 hover:shadow-md
          ${category == "YouTube" && "bg-red-500 text-white"} ${
          category == "Tekst" && "bg-blue-500 text-white"
        } ${
          category == "DokumentPDF" && "bg-green-500 text-white"
        } w-full p-2 font-semibold mt-6 cursor-pointer rounded-[8px]`}
      >
        {category == "YouTube" && "Zobacz video"}
        {category == "Tekst" && "Przeczytaj tekst"}
        {category == "DokumentPDF" && "Zobacz dokument"}
      </button>
    </div>
  );
});

const CourseItem = memo(({ course, onClick }) => (
  <li className="flex flex-col sm:flex-row p-4 border rounded-[12px] bg-white border-blackText/10 dark:text-white dark:bg-DarkblackText shadow-md text-blackText gap-4">
    <img
      src={course.image_url}
      alt="course img"
      className="w-full sm:w-64 h-40 sm:h-auto object-cover rounded-[12px] flex-shrink-0"
    />
    <div className="px-0 sm:px-4 flex flex-1 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col justify-between pr-0 lg:pr-4 lg:border-r border-blackText/15 dark:border-white/20">
          <div>
            <h3 className="font-bold text-lg sm:text-xl w-full">
              {course.title}
            </h3>
            <p className="text-sm opacity-70 w-full break-words line-clamp-4 sm:line-clamp-6 overflow-hidden leading-snug">
              {course.description}
            </p>
          </div>
          <button
            className="w-full py-3 bg-gradient-to-br from-primaryGreen to-secondaryGreen transition-transform hover:-translate-y-1 duration-300 hover:shadow-md rounded-[12px] text-white font-semibold cursor-pointer mt-4 sm:mt-0"
            onClick={() => onClick(course.id)}
          >
            Zobacz kurs
          </button>
        </div>

        <div className="flex flex-col gap-6 pt-4 lg:pt-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Kurs zawiera</h2>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 text-center gap-2 sm:gap-4 items-center mt-2">
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-[8px]">
                4 działy
              </div>
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-[8px]">
                100+ lekcji
              </div>
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-[8px]">
                100+ zadań
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Używane narzędzia</h2>
            <ol className="list-disc pl-5 mt-2 grid gap-1 text-sm sm:text-base">
              <li className="opacity-75">Visual Studio Code</li>
              <li className="opacity-75">PyCharm</li>
              <li className="opacity-75">Xamp Control Panel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </li>
));

function CourseList({ activePage, setActivePage, setTutorialVisible, tutorialVisible }) {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const {
    courses,
    loading: coursesLoading,
    error,
    fetchCourses,
  } = useCourseStore();
  const { initialized } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

  useEffect(() => {
    if (initialized) fetchCourses();
  }, [initialized]);

  const handleNavigate = useCallback(
    (id) => navigate(`/course/${id}`),
    [navigate]
  );

  if (!user) {
    navigate("/authentication");
    return null;
  }

  const courseList = useMemo(
    () =>
      courses.map((course) => (
        <CourseItem key={course.id} course={course} onClick={handleNavigate} />
      )),
    [courses, handleNavigate]
  );

  const filteredVideos = useMemo(() => {
    if (selectedCategory === "Wszystkie") return videoResources;
    return videoResources.filter(
      (video) => video.category === selectedCategory
    );
  }, [selectedCategory]);

  if (authLoading || coursesLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col lg:flex-row w-full">
        <div className="flex-1 order-1 lg:order-2">
          <div className="flex flex-col items-center w-full bg-gray-50 shadow-md relative dark:bg-DarkblackBorder py-2 px-4 sm:px-6 min-h-screen md:min-h-[98vh] rounded-[12px]">
              
              {/* DASHBOARD */}
              {activePage === "dashboard" && (
                <Dashboard />
              )}

              {/* TWOJE KURSY */}
              {activePage === "courses" &&
                (courses.length > 0 ? (
                  <div className="w-full flex flex-col gap-2 text-blackText">
                    <div className="w-full flex justify-between mt-2">
                      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mt-18 md:mt-0">
                        Wszystkie kursy
                      </span>
                      <span
                        className="text-primaryBlue cursor-pointer dark:text-primaryGreen"
                        onClick={() => setTutorialVisible(!tutorialVisible)}
                      >
                        <MessageCircleQuestionIcon />
                      </span>
                    </div>

                    <div className="flex flex-col mt-8 sm:mt-12">
                      <h2 className="flex gap-2 items-center text-lg font-bold uppercase mb-4 dark:text-white">
                        <ShoppingCart className="font-bold" /> Dostępne kursy :
                      </h2>
                      <div className="flex flex-col gap-8">{courseList}</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full min-h-[95vh] flex flex-col items-center justify-center gap-4">
                    <ShoppingCart
                      size={40}
                      className="opacity-50 text-blackText dark:text-white"
                    />
                    <p className="text-lg text-blackText dark:text-white">
                      Brak dostępnych kursów
                    </p>
                  </div>
                ))}

              {/* ZASOBY */}
              {activePage === "resources" && (
                <div className="flex flex-col items-start w-full mt-2">
                  <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mt-18 md:mt-0 mb-12">
                    Zasoby do nauki
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    {["Wszystkie", "YouTube", "Tekst", "DokumentPDF"].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-[8px] text-sm font-semibold transition  cursor-pointer 
                            ${
                              selectedCategory === cat
                                ? "bg-primaryBlue text-white dark:bg-primaryGreen"
                                : "bg-gray-200 dark:bg-DarkblackText text-blackText dark:text-white"
                            }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  <div className="w-full mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredVideos.map((video, index) => (
                      <ResourceVideo
                        key={video.title + index}
                        videoTitle={video.title}
                        videoDescription={video.description}
                        category={video.category}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ZGŁOSZENIA */}
              {activePage === "reports" && <ReportPanel />}

              {/* BLOGI */}
              {activePage === "blogs" && <BlogPanel />}

              {/* ANKIETY */}
              {activePage === "forms" && <FormUserPage></FormUserPage>}

              {/* POMYSŁY  */}
              {activePage === "ideas" && <IdeaPanel></IdeaPanel>}

              {/* RANKING */}
              {activePage === "leaderboard" && <Leaderboard setActivePage={setActivePage} />}

              {/* NAGRODY */}
              {activePage === "rewards" && <Rewards />}

              {/* KOD POLECAJĄCY */}
              {activePage === "referral" && <ReferralPanel />}

              {/* PROFIL */}
              {activePage === "profile" && <UserData />}
            </div>
        </div>
      </div>
    </div>
  );
}

export default CourseList;
