import { useAuthStore } from '../../../store/authStore';
import { useCourseStore } from '../../../store/courseStore';
import { useResourcesStore } from '../../../store/resourcesStore';
import Error from '../../../components/systemLayouts/Error';
import Loading from '../../../components/systemLayouts/Loading';
import ReportPanel from "./ReportPanel";
import { MessageCircleQuestionIcon, ShoppingCart, Star } from "lucide-react";
import { memo, useMemo, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogPanel from "./BlogPanel";
import FormUserPage from "./FormUserPage";
import IdeaPanel from "./IdeaPanel";
// DEV: Leaderboard and Rewards imports - odkomentuj na development, zakomentuj na main
// import Leaderboard from "./Leaderboard";
// import Rewards from "./Rewards";
// DEV: END Leaderboard and Rewards imports
import UserData from "./UserData";
import Dashboard from "./Dashboard";
import ReferralPanel from "./ReferralPanel";

const ResourceVideo = memo(({ resource }) => {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'YouTube':
        return 'text-red-500'
      case 'Tekst':
        return 'text-blue-500'
      case 'DokumentPDF':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const getCategoryBgColor = (category) => {
    switch (category) {
      case 'YouTube':
        return 'bg-red-500'
      case 'Tekst':
        return 'bg-blue-500'
      case 'DokumentPDF':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleClick = () => {
    if (resource.link) {
      window.open(resource.link, '_blank', 'noopener,noreferrer')
    }
  }
  
  return (
    <div 
      className="w-full rounded-xl shadow-[0_0_6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-[0_0_8px_rgba(0,0,0,0.15)] hover:-translate-y-1 cursor-pointer bg-white dark:bg-DarkblackBorder"
      onClick={handleClick}
    >
      {/* Image Section */}
      {resource.image_url ? (
        <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center p-4">
            <div className={`inline-block ${getCategoryBgColor(resource.category)} text-white px-4 py-2 rounded-md mb-2`}>
              #{resource.category}
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 sm:p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <span className={`font-semibold text-sm ${getCategoryColor(resource.category)}`}>
            #{resource.category}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-lg sm:text-xl text-blackText dark:text-white mb-3 line-clamp-2 leading-tight">
          {resource.title}
        </h4>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
          {resource.description}
        </p>

        {/* Action Button */}
        <button
          className={`${getCategoryBgColor(resource.category)} text-white w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]`}
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          {resource.category === "YouTube" && "Zobacz video"}
          {resource.category === "Tekst" && "Przeczytaj tekst"}
          {resource.category === "DokumentPDF" && "Zobacz dokument"}
        </button>
      </div>
    </div>
  );
});

const CourseItem = memo(({ course, onClick }) => {
  // Sprawdź czy kurs to INF.02 lub INF.03
  const isBlocked = course.title?.includes('INF.02') || course.title?.includes('INF.03');

  return (
    <li 
      className="flex flex-col sm:flex-row p-4 border rounded-xl bg-white border-blackText/10 dark:text-white dark:bg-DarkblackText shadow-md text-blackText gap-4 relative"
    >
      {/* Overlay z tekstem - POZA blur */}
      {isBlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 rounded-xl pointer-events-auto">
          <div className="bg-white dark:bg-DarkblackText px-6 py-2 rounded-lg dark:border-primaryGreen">
            <p className="text-lg font-extrabold text-primaryBlue dark:text-primaryGreen text-center whitespace-nowrap">
              Dostępne wkrótce
            </p>
          </div>
        </div>
      )}
      
      {/* Zawartość kursu z blur */}
      <div className={`w-full flex flex-col sm:flex-row gap-4 ${isBlocked ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
        <img
          src={course.image_url}
          alt="course img"
          className="w-full sm:w-64 h-40 sm:h-auto object-cover rounded-md flex-shrink-0"
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
              className={`w-full py-3 bg-gradient-to-br from-primaryGreen to-secondaryGreen transition-transform hover:-translate-y-1 duration-300 hover:shadow-md rounded-lg text-white font-semibold mt-4 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                isBlocked ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => onClick(course.id)}
              disabled={isBlocked}
            >
              Zobacz kurs
            </button>
          </div>

        <div className="flex flex-col gap-6 pt-4 lg:pt-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Kurs zawiera</h2>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 text-center gap-2 sm:gap-4 items-center mt-2">
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                4 działy
              </div>
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
                100+ lekcji
              </div>
              <div className="bg-primaryBlue dark:bg-primaryGreen/75 dark:border-primaryGreen dark:border text-white font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-lg">
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
      </div>
    </li>
  );
});

function CourseList({ activePage, setActivePage, setTutorialVisible, tutorialVisible }) {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const {
    courses,
    loading: coursesLoading,
    error,
    fetchCourses,
  } = useCourseStore();
  const { resources, loading: resourcesLoading, fetchResources } = useResourcesStore();
  const { initialized } = useAuthStore();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

  useEffect(() => {
    if (initialized) fetchCourses();
  }, [initialized]);

  useEffect(() => {
    if (initialized && activePage === "resources") {
      fetchResources();
    }
  }, [initialized, activePage, fetchResources]);

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

  const filteredResources = useMemo(() => {
    if (!resources || resources.length === 0) return [];
    if (selectedCategory === "Wszystkie") return resources;
    return resources.filter(
      (resource) => resource.category === selectedCategory
    );
  }, [resources, selectedCategory]);

  if (authLoading || coursesLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex flex-col lg:flex-row w-full h-full">
        <div className="flex-1 order-1 lg:order-2 h-full">
          <div className="flex flex-col items-center w-full h-full bg-gray-50 shadow-md relative dark:bg-DarkblackBorder py-2 px-4 sm:px-6 rounded-2xl overflow-y-auto hide-scrollbar">
              
              {/* DASHBOARD */}
              {activePage === "dashboard" && (
                <div className="w-full min-h-[96.2vh]">
                  <Dashboard />
                </div>
              )}

              {/* TWOJE KURSY */}
              {activePage === "courses" &&
                (courses.length > 0 ? (
                  <div className="w-full flex flex-col gap-2 text-blackText min-h-[96.2vh]">
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
                  <div className="w-full min-h-[96.2vh] flex flex-col items-center justify-center gap-4">
                    <ShoppingCart
                      size={40}
                      className="opacity-50 text-blackText dark:text-white"
                    />
                    <p className="text-lg text-blackText dark:text-white">
                      Brak dostępnych kursów
                    </p>
                  </div>
                ))}

              {/* DEV: ZASOBY - odkomentuj na development, zakomentuj na main */}
              {activePage === "resources" && (
                <div className="flex flex-col items-start w-full mt-2 min-h-[96.2vh] pb-8">
                  <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mt-18 md:mt-0 mb-12">
                    Zasoby do nauki
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    {["Wszystkie", "YouTube", "Tekst", "DokumentPDF"].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer 
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

                  {resourcesLoading ? (
                    <div className="w-full mt-8 text-center text-gray-500 dark:text-gray-400">
                      Ładowanie zasobów...
                    </div>
                  ) : filteredResources.length === 0 ? (
                    <div className="w-full mt-8 text-center text-gray-500 dark:text-gray-400">
                      Brak zasobów w tej kategorii
                    </div>
                  ) : (
                    <div className="w-full mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredResources.map((resource) => (
                        <ResourceVideo
                          key={resource.id}
                          resource={resource}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* DEV: END ZASOBY */}

              {/* ZGŁOSZENIA */}
              {activePage === "reports" && (
                <div className="w-full min-h-[97.2vh]">
                  <ReportPanel />
                </div>
              )}

              {/* DEV: BLOGI - odkomentuj na development, zakomentuj na main */}
              {/* {activePage === "blogs" && <BlogPanel />} */}
              {/* DEV: END BLOGI */}

              {/* ANKIETY */}
              {activePage === "forms" && (
                <div className="w-full min-h-[97.2vh]">
                  <FormUserPage></FormUserPage>
                </div>
              )}

              {/* POMYSŁY  */}
              {activePage === "ideas" && (
                <div className="w-full min-h-[97.2vh]">
                  <IdeaPanel></IdeaPanel>
                </div>
              )}

              {/* DEV: RANKING - odkomentuj na development, zakomentuj na main */}
              {/* {activePage === "leaderboard" && <Leaderboard setActivePage={setActivePage} />} */}
              {/* DEV: END RANKING */}

              {/* DEV: NAGRODY - odkomentuj na development, zakomentuj na main */}
              {/* {activePage === "rewards" && <Rewards />} */}
              {/* DEV: END NAGRODY */}

              {/* KOD POLECAJĄCY */}
              {activePage === "referral" && (
                <div className="w-full min-h-[96.2vh]">
                  <ReferralPanel />
                </div>
              )}

              {/* PROFIL */}
              {activePage === "profile" && (
                <div className="w-full min-h-[96.2vh]">
                  <UserData />
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default CourseList;
