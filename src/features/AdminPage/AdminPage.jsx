import { useReports } from '../../store/reportStore';
import { usePollStore } from '../../store/formStore';
import { useIdeaStore } from '../../store/ideaStore';
import { useVideoReviewsStore } from '../../store/videoReviewsStore';
import { 
  User, 
  ChevronDown, 
  Moon, 
  Sun, 
  PlusCircle, 
  List, 
  MinusCircle, 
  PenBoxIcon,
  Settings,
  MessageSquare,
  BarChart3,
  Star,
  Video,
  Bell
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import NotificationManagement from "./components/NotificationManagement";

function timeAgo(dateString) {
  const now = new Date();
  const created = new Date(dateString);
  const diff = (now.getTime() - created.getTime()) / 1000;

  if (diff < 60) return "Przed chwilą";
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  return `${Math.floor(diff / 86400)} dni temu`;
}

export default function AdminPage({ isDark, setIsDark }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [activeSection, setActiveSection] = useState("reports");
  
  // Reports state
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // Forms state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [showPollModal, setShowPollModal] = useState(false);
  
  // Video reviews state
  const [selectedVideoReviews, setSelectedVideoReviews] = useState(null);
  const [sectionFilter, setSectionFilter] = useState("all");

  // Store hooks
  const { fetchReports, reports, updateStatus, addAnswer } = useReports();
  const createPoll = usePollStore((s) => s.createPoll);
  const fetchPolls = usePollStore((s) => s.fetchPolls);
  const { 
    fetchVideoData, 
    videoReviews, 
    videoBase, 
    users, 
    getVideoReviews, 
    getUserName, 
    calculateAverageRating, 
    getUniqueSections, 
    getFilteredVideosWithReviews, 
    getStarData,
    loading: videoLoading 
  } = useVideoReviewsStore();
  const polls = usePollStore((s) => s.polls);
  const { fetchIdea, ideas } = useIdeaStore();

  const statuses = [
    { label: "Do zrobienia", color: "bg-green-100 text-green-600" },
    { label: "W trakcie", color: "bg-yellow-100 text-yellow-600" },
    { label: "Zrobione", color: "bg-red-100 text-red-500" },
  ];


  const handleLogin = () => {
    if (password === "1234") {
      setAccessGranted(true);
      fetchReports();
      fetchPolls();
      fetchIdea();
      fetchVideoData();
    } else {
      toast.error("Niepoprawne hasło");
    }
  };

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".dropdown")) {
        setOpenDropdown(null);
        setOpenFilter(false);
      }
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    addAnswer(replyModal, replyText);
    setReplyText("");
    setReplyModal(null);
  };

  const handleSavePoll = () => {
    if (!title || options.some((o) => !o))
      return toast.error("Uzupełnij wszystkie pola!");
    if (options.length < 2) return toast.error("Musisz podać minimum 2 opcje!");
    if (options.length > 6) return toast.error("Maksymalnie 6 opcji!");

    createPoll(title, desc, options);
    setTitle("");
    setDesc("");
    setOptions(["", ""]);
    setShowPollModal(false);
    toast.success("Ankieta utworzona!");
  };

  const filteredReports = reports.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  // Helper function to render stars using Star components
  const renderStars = (rating) => {
    const starData = getStarData(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(starData.fullStars)].map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
        {starData.hasHalfStar && (
          <Star size={16} className="fill-yellow-400/50 text-yellow-400" />
        )}
        {[...Array(starData.emptyStars)].map((_, i) => (
          <Star key={i} size={16} className="text-gray-300 dark:text-gray-600" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {starData.rating.toFixed(1)}
        </span>
      </div>
    );
  };


  if (!accessGranted) {
    return (
      <div data-theme={isDark ? "dark" : "light"} className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-blackText px-4">
        <div className="bg-white dark:bg-DarkblackBorder backdrop-blur-xl shadow-xl rounded-2xl p-10 w-full max-w-md flex flex-col gap-6 items-center justify-center">
          <h2 className="text-2xl tracking-wide text-blackText opacity-80 dark:text-white flex flex-col items-center gap-3">
            <Settings className="text-blackText opacity-40 dark:text-white w-10 h-10" />
            Panel Administratora
          </h2>

          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-100 dark:bg-DarkblackText dark:border-0 dark:placeholder:text-white/50 dark:caret-primaryGreen w-full border border-gray-200 px-4 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />

          <button
            onClick={handleLogin}
            className="bg-primaryBlue dark:bg-primaryGreen cursor-pointer text-white font-medium w-full py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
          >
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-blackText dark:to-DarkblackText p-3 sm:p-4 md:p-6" data-theme={isDark ? "dark" : "light"}>
    
      <div className="bg-white/90 dark:bg-DarkblackText/90 backdrop-blur-xl p-3 sm:p-4  w-full rounded-xl shadow-md mb-4 sm:mb-6 border border-white/20 dark:border-DarkblackBorder/20">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
           <button
            className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-DarkblackBorder rounded-xl transition-all duration-300 shadow-lg"
            title="Przełącz tryb jasny/ciemny"
            role="button"
            aria-label="Przełącz tryb jasny/ciemny"
            onClick={() => {
              setIsDark((prev) => {
                const newValue = !prev;
                localStorage.setItem("theme", newValue ? "dark" : "light");
                return newValue;
              });
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setActiveSection("reports")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeSection === "reports"
                ? "bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryBlue shadow-xl"
                : "bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10"
            }`}
          >
            <MessageSquare size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Zgłoszenia</span>
            <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs font-bold">
              {filteredReports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("polls")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeSection === "polls"
                ? "bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryBlue shadow-xl"
                : "bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10"
            }`}
          >
            <BarChart3 size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Ankiety</span>
            <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs font-bold">
              {polls.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("ideas")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeSection === "ideas"
                ? "bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryBlue shadow-xl"
                : "bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10"
            }`}
          >
            <PenBoxIcon size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Pomysły</span>
            <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs font-bold">
              {ideas.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("videoReviews")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeSection === "videoReviews"
                ? "bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryBlue shadow-xl"
                : "bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10"
            }`}
          >
            <Video size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Recenzje wideo</span>
            <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs font-bold">
              {videoReviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("notifications")}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              activeSection === "notifications"
                ? "bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryBlue shadow-xl"
                : "bg-gray-100 dark:bg-DarkblackBorder text-gray-700 dark:text-gray-300 hover:bg-primaryBlue/10 dark:hover:bg-primaryGreen/10"
            }`}
          >
            <Bell size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Powiadomienia</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/90 dark:bg-DarkblackText/90 backdrop-blur-xl shadow-lg w-full rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-DarkblackBorder/20">
        {/* Reports Section */}
        {activeSection === "reports" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white">
                Wszystkie zgłoszenia
              </h2>
              <div className="dropdown relative">
                <button
                  onClick={() => setOpenFilter((prev) => !prev)}
                  className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-0 dark:text-white rounded-xl shadow-sm hover:shadow-md transition text-sm w-full sm:w-auto"
                >
                  {statusFilter === "all" ? "Wszystkie statusy" : statusFilter}
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
                </button>
                {openFilter && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-lg shadow-xl border border-gray-200 z-[9999]">
                    <div
                      onClick={() => {
                        setStatusFilter("all");
                        setOpenFilter(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                    >
                      Wszystkie statusy
                    </div>
                    {statuses.map((s) => (
                      <div
                        key={s.label}
                        onClick={() => {
                          setStatusFilter(s.label);
                          setOpenFilter(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredReports.map((report, index) => {
                  const currentStatus = statuses.find(
                    (s) => s.label === report.status
                  );

                  return (
                    <div
                      key={report.id}
                      className="bg-white/80 dark:bg-DarkblackBorder backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-DarkblackText flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Status dropdown at the top */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex-1">
                          {report.topic}
                        </h3>
                        <div className="dropdown relative ml-4">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === report.id ? null : report.id
                              )
                            }
                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium tracking-wide ${currentStatus?.color}`}
                          >
                            {report.status}
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {openDropdown === report.id && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl border border-gray-100 dark:border-DarkblackText py-2 flex flex-col gap-2 z-[9999]">
                              {statuses.map((s) => (
                                <div
                                  key={s.label}
                                  onClick={() => {
                                    updateStatus(report.id, s.label);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-DarkblackText text-blackText dark:text-white"
                                >
                                  {s.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-500 text-sm mb-1 dark:text-primaryGreen/75">
                          <span className="font-medium">Email:</span>{" "}
                          {report.user_email}
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed dark:text-white/75">
                          {report.description}
                        </p>

                        {report.answer ? (
                          <div className="mt-3 p-3 bg-green-50 border dark:bg-green-200 dark:border-0 border-green-200 rounded-lg text-sm">
                            <p className="font-medium text-green-700 dark:text-green-800">
                              Odpowiedź admina:
                            </p>
                            <p className="text-gray-700">{report.answer}</p>
                          </div>
                        ) : (
                          <p className="text-xs italic text-gray-400 mt-2">
                            Brak odpowiedzi
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-6">
                        <div className="flex flex-col text-xs text-gray-400 dark:text-gray-500">
                          <span>#{index + 1}</span>
                          <span>{timeAgo(report.created_at)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setReplyModal(report.id)}
                        className="mt-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                      >
                        Odpowiedz
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center italic py-12">
                Nie ma żadnych zgłoszeń
              </p>
            )}
          </div>
        )}

        {/* Polls Section */}
        {activeSection === "polls" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
                <BarChart3 size={20} className="sm:w-6 sm:h-6" />
                Zarządzanie ankietami ({polls.length})
              </h2>
              <button
                onClick={() => setShowPollModal(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90 w-full sm:w-auto"
              >
                <PlusCircle size={18} />
                <span className="text-sm sm:text-base">Stwórz nową ankietę</span>
              </button>
            </div>

            {polls.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {polls.map((poll) => (
                  <div
                    key={poll.id}
                    className="bg-white/80 dark:bg-DarkblackBorder rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-DarkblackText transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <h4 className="text-lg font-semibold mb-2 text-blackText dark:text-white">{poll.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {poll.description}
                    </p>
                    <div className="space-y-2">
                      {poll.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex justify-between bg-gray-200 dark:bg-DarkblackText px-3 py-2 rounded-lg text-blackText dark:text-white"
                        >
                          <span className="text-sm">{opt.option_text}</span>
                          <span className="font-medium text-sm">{opt.votes} głosów</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Brak ankiet</p>
                <p className="text-sm">Kliknij "Stwórz nową ankietę" aby rozpocząć</p>
              </div>
            )}
          </div>
        )}

        {/* Ideas Section */}
        {activeSection === "ideas" && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
              <PenBoxIcon size={20} className="sm:w-6 sm:h-6" />
              Pomysły użytkowników ({ideas.length})
            </h2>
            {ideas.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Nie ma żadnych pomysłów</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="bg-white/80 dark:bg-DarkblackBorder shadow-lg rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-DarkblackText transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <span
                      className={`${
                        idea.type === "Design" &&
                        "bg-indigo-400 text-sm text-white px-3 py-1 border border-indigo-500/50 rounded-[8px]"
                      } ${
                        idea.type === "Funkcjonalność" &&
                        "bg-green-400 text-sm text-white px-3 py-1 border border-green-500/50 rounded-[8px]"
                      } ${
                        idea.type === "Inne" &&
                        "bg-red-400 text-sm text-white px-3 py-1 border border-red-500/50 rounded-[8px]"
                      }`}
                    >
                      {idea.type}
                    </span>
                    <p className="text-md opacity-75 mt-2 text-gray-600 dark:text-gray-400">{idea.user_email}</p>
                    <p className="text-lg font-semibold mt-2 text-blackText dark:text-white">{idea.name}</p>
                    <p className="bg-gray-100 dark:bg-blackText/50 dark:text-white/75 p-3 text-blackText/75 mt-2 rounded-lg">
                      {idea.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <NotificationManagement isDark={isDark} />
        )}

        {/* Video Reviews Section */}
        {activeSection === "videoReviews" && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
              <Video size={20} className="sm:w-6 sm:h-6" />
              Recenzje wideo użytkowników
            </h2>

            {/* Section Filter */}
            {getUniqueSections().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSectionFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    sectionFilter === "all"
                      ? "bg-primaryBlue text-white"
                      : "bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder"
                  }`}
                >
                  Wszystkie sekcje
                </button>
                {getUniqueSections().map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSectionFilter(section.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      sectionFilter === section.id
                        ? "bg-primaryBlue text-white"
                        : "bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            )}

            {getFilteredVideosWithReviews(sectionFilter).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {getFilteredVideosWithReviews(sectionFilter).map((video) => {
                  const videoReviewsList = getVideoReviews(video.videoId);
                  const averageRating = calculateAverageRating(video.videoId);
                  const hasReviews = videoReviewsList.length > 0;

                  return (
                    <div
                      key={video.videoId}
                      className="bg-white/80 dark:bg-DarkblackBorder shadow-lg rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-DarkblackText transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Video Title */}
                      <h3 className="text-lg font-semibold text-blackText dark:text-white mb-3 line-clamp-2">
                        {video.title}
                      </h3>

                      {/* Video ID */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        ID: {video.videoId}
                      </p>

                      {/* Average Rating */}
                      <div className="mb-4">
                        {hasReviews ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Średnia ocena:
                              </p>
                              {renderStars(averageRating)}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {videoReviewsList.length} ocen
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Brak ocen
                          </p>
                        )}
                      </div>

                      {/* View Reviews Button */}
                      {hasReviews && (
                        <button
                          onClick={() => setSelectedVideoReviews({
                            video: video,
                            reviews: videoReviewsList,
                            averageRating: averageRating
                          })}
                          className="w-full bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                        >
                          Zobacz recenzje ({videoReviewsList.length})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Video size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {sectionFilter === "all" 
                    ? "Brak wideo z recenzjami do wyświetlenia" 
                    : "Brak wideo z recenzjami w wybranej sekcji"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-lg p-6 animate-scaleIn">
            <h3 className="text-lg font-semibold text-blackText dark:text-white mb-4">
              Odpowiedź na zgłoszenie
            </h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="4"
              className="w-full p-3 border border-gray-200 dark:border-DarkblackBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue text-sm dark:bg-DarkblackText dark:text-white"
              placeholder="Wpisz odpowiedź..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setReplyModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
              >
                Anuluj
              </button>
              <button
                onClick={handleSendReply}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white shadow hover:scale-[1.03] transition"
              >
                Wyślij odpowiedź
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-3 sm:p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex items-center gap-2">
                  <PlusCircle size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">Stwórz nową ankietę</span>
                </h3>
                <button
                  onClick={() => setShowPollModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Tytuł ankiety *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Wprowadź tytuł ankiety"
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Dodaj opis ankiety..."
                    rows="3"
                    className="w-full border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blackText dark:text-white mb-2">
                    Opcje odpowiedzi *
                  </label>
                  <div className="space-y-3">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                          Opcja {i + 1}:
                        </span>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOps = [...options];
                            newOps[i] = e.target.value;
                            setOptions(newOps);
                          }}
                          placeholder={`Wprowadź opcję ${i + 1}`}
                          className="flex-1 border rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      options.length < 6 && setOptions([...options, ""])
                    }
                    className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={options.length >= 6}
                  >
                    <PlusCircle size={18} /> Dodaj opcję
                  </button>
                  <button
                    onClick={() =>
                      options.length > 2 && setOptions(options.slice(0, -1))
                    }
                    className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg bg-red-500 text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer hover:bg-red-600 transition-all duration-300"
                    disabled={options.length <= 2}
                  >
                    <MinusCircle size={18} /> Usuń opcję
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-DarkblackBorder">
                <button
                  onClick={() => setShowPollModal(false)}
                  className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSavePoll}
                  className="px-6 py-3 rounded-lg bg-primaryBlue dark:bg-primaryGreen text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                >
                  Zapisz ankietę
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Reviews Modal */}
      {selectedVideoReviews && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-blackText dark:text-white flex items-center gap-2">
                    <Video size={24} />
                    Recenzje wideo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedVideoReviews.video.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVideoReviews(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Average Rating Summary */}
              <div className="bg-gray-50 dark:bg-DarkblackText rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Średnia ocena:
                    </p>
                    {renderStars(selectedVideoReviews.averageRating)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Łącznie ocen:
                    </p>
                    <span className="text-lg font-semibold text-blackText dark:text-white">
                      {selectedVideoReviews.reviews.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-blackText dark:text-white">
                  Recenzje użytkowników:
                </h4>
                {selectedVideoReviews.reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="bg-white/80 dark:bg-DarkblackBorder rounded-lg p-4 border border-gray-100 dark:border-DarkblackText"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primaryBlue dark:bg-primaryGreen rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {getUserName(review.user_id).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blackText dark:text-white">
                            {getUserName(review.user_id)}
                          </p>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Review Text - Only show if it exists */}
                    {review.review_text && review.review_text.trim() && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-DarkblackText rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {review.review_text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
