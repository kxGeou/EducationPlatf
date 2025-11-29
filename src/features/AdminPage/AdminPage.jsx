import { useReports } from '../../store/reportStore';
import { usePollStore } from '../../store/formStore';
import { useIdeaStore } from '../../store/ideaStore';
import { useVideoReviewsStore } from '../../store/videoReviewsStore';
import { useTransactionStore } from '../../store/transactionStore';
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
  Bell,
  FileText,
  Gift
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import NotificationManagement from "./components/NotificationManagement";
import PromoCodeManagement from "./components/PromoCodeManagement";
import AdminNavigation from "./components/AdminNavigation";
import RewardsManagement from "./components/RewardsManagement";
import ReportsSection from "./components/sections/ReportsSection";
import PollsSection from "./components/sections/PollsSection";
import IdeasSection from "./components/sections/IdeasSection";
import TaskAnswersSection from "./components/sections/TaskAnswersSection";
import VideoReviewsSection from "./components/sections/VideoReviewsSection";
import TransactionsSection from "./components/sections/TransactionsSection";
import CalendarSection from "./components/sections/CalendarSection";
import supabase from "../../util/supabaseClient";

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
  
  // Task answers state
  const [taskAnswers, setTaskAnswers] = useState([]);
  const [taskAnswersLoading, setTaskAnswersLoading] = useState(false);
  const [taskAnswersFilter, setTaskAnswersFilter] = useState("all");
  const [selectedTaskAnswer, setSelectedTaskAnswer] = useState(null);
  const [taskFeedbackModal, setTaskFeedbackModal] = useState(null);
  const [taskFeedbackText, setTaskFeedbackText] = useState("");

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
  const { fetchTransactions } = useTransactionStore();

  const statuses = [
    { label: "Do zrobienia", color: "bg-green-100 text-green-600" },
    { label: "W trakcie", color: "bg-yellow-100 text-yellow-600" },
    { label: "Zrobione", color: "bg-red-100 text-red-500" },
  ];


  // Funkcja do pobierania odpowiedzi na zadania
  const fetchTaskAnswers = async () => {
    setTaskAnswersLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_tasks_answers')
        .select(`
          *,
          video_tasks!inner(
            task_id,
            topic,
            task,
            course_id,
            video_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Pobierz dane użytkowników osobno
      const userIds = [...new Set(data?.map(answer => answer.user_id) || [])];
      let users = {};
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', userIds);

        if (!usersError && usersData) {
          usersData.forEach(user => {
            users[user.id] = user;
          });
        }
      }

      // Połącz dane
      const enrichedData = data?.map(answer => ({
        ...answer,
        users: users[answer.user_id] || null
      })) || [];

      setTaskAnswers(enrichedData);
    } catch (err) {
      console.error('Error fetching task answers:', err);
      toast.error('Nie udało się załadować odpowiedzi na zadania');
    } finally {
      setTaskAnswersLoading(false);
    }
  };

  // Funkcja do aktualizacji statusu odpowiedzi
  const updateTaskAnswerStatus = async (answerId, newStatus) => {
    try {
      const { error } = await supabase
        .from('video_tasks_answers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId);

      if (error) throw error;
      
      // Aktualizuj lokalny stan
      setTaskAnswers(prev => 
        prev.map(answer => 
          answer.id === answerId 
            ? { ...answer, status: newStatus, updated_at: new Date().toISOString() }
            : answer
        )
      );
      
      toast.success('Status odpowiedzi został zaktualizowany');
    } catch (err) {
      console.error('Error updating task answer status:', err);
      toast.error('Nie udało się zaktualizować statusu odpowiedzi');
    }
  };

  // Funkcja do dodawania feedbacku admina
  const addTaskFeedback = async (answerId, feedback) => {
    try {
      const { error } = await supabase
        .from('video_tasks_answers')
        .update({ 
          admin_feedback: feedback,
          feedback_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId);

      if (error) throw error;
      
      // Aktualizuj lokalny stan
      setTaskAnswers(prev => 
        prev.map(answer => 
          answer.id === answerId 
            ? { 
                ...answer, 
                admin_feedback: feedback, 
                feedback_date: new Date().toISOString(),
                updated_at: new Date().toISOString() 
              }
            : answer
        )
      );
      
      toast.success('Feedback został dodany pomyślnie');
      setTaskFeedbackModal(null);
      setTaskFeedbackText("");
    } catch (err) {
      console.error('Error adding task feedback:', err);
      toast.error('Nie udało się dodać feedbacku');
    }
  };

  // Handler do wysyłania feedbacku
  const handleSendTaskFeedback = () => {
    if (!taskFeedbackText.trim()) {
      toast.error('Wpisz treść feedbacku');
      return;
    }
    addTaskFeedback(taskFeedbackModal, taskFeedbackText);
  };

  const handleLogin = () => {
    if (password === "1234") {
      setAccessGranted(true);
      fetchReports();
      fetchPolls();
      fetchIdea();
      fetchVideoData();
      fetchTaskAnswers();
      fetchTransactions();
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

  // Helper functions for task answers
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'approved': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Oczekujące';
      case 'approved': return 'Zaakceptowane';
      case 'rejected': return 'Odrzucone';
      default: return 'Nieznany';
    }
  };

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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-blackText dark:to-DarkblackText " data-theme={isDark ? "dark" : "light"}>
    
     
      {/* Sidebar + Content */}
      <AdminNavigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <div className="bg-white/90 dark:bg-DarkblackText/90 backdrop-blur-xl shadow-lg w-full md:w-[calc(100vw-260px)] md:max-w-[calc(100vw-260px)] box-border rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-DarkblackBorder/20 md:ml-[260px] md:h-[calc(100vh-1.5rem)] md:overflow-y-auto">
        {/* Reports Section */}
        {activeSection === "reports" && (
          <ReportsSection
            statuses={statuses}
            filteredReports={filteredReports}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            updateStatus={updateStatus}
            timeAgo={timeAgo}
            setReplyModal={setReplyModal}
          />
        )}

        {/* Polls Section */}
        {activeSection === "polls" && (
          <PollsSection polls={polls} setShowPollModal={setShowPollModal} />
        )}

        {/* Ideas Section */}
        {activeSection === "ideas" && (
          <IdeasSection ideas={ideas} />
        )}

        {/* Task Answers Section */}
        {activeSection === "taskAnswers" && (
          <TaskAnswersSection
            taskAnswers={taskAnswers}
            taskAnswersLoading={taskAnswersLoading}
            taskAnswersFilter={taskAnswersFilter}
            setTaskAnswersFilter={setTaskAnswersFilter}
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            updateTaskAnswerStatus={updateTaskAnswerStatus}
            timeAgo={timeAgo}
            setTaskFeedbackModal={setTaskFeedbackModal}
            setTaskFeedbackText={setTaskFeedbackText}
          />
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <NotificationManagement isDark={isDark} />
        )}

        {/* Rewards Management Section */}
        {activeSection === "rewards" && (
          <RewardsManagement isDark={isDark} />
        )}

        {/* Transactions Section */}
        {activeSection === "transactions" && (
          <TransactionsSection timeAgo={timeAgo} />
        )}

        {/* Promo Codes Section */}
        {activeSection === "promoCodes" && (
          <PromoCodeManagement isDark={isDark} />
        )}

        {/* Video Reviews Section */}
        {activeSection === "videoReviews" && (
          <VideoReviewsSection
            getUniqueSections={getUniqueSections}
            sectionFilter={sectionFilter}
            setSectionFilter={setSectionFilter}
            getFilteredVideosWithReviews={getFilteredVideosWithReviews}
            getVideoReviews={getVideoReviews}
            calculateAverageRating={calculateAverageRating}
            renderStars={renderStars}
            setSelectedVideoReviews={setSelectedVideoReviews}
          />
        )}

        {/* Calendar Section */}
        {activeSection === "calendar" && (
          <CalendarSection timeAgo={timeAgo} />
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

      {/* Task Feedback Modal */}
      {taskFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl w-full max-w-2xl animate-scaleIn">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blackText dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Feedback dla ucznia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Napisz feedback, który pomoże uczniowi zrozumieć co zrobił źle lub dobrze.
              </p>
              <textarea
                value={taskFeedbackText}
                onChange={(e) => setTaskFeedbackText(e.target.value)}
                rows="6"
                className="w-full p-3 border border-gray-200 dark:border-DarkblackBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen text-sm dark:bg-DarkblackText dark:text-white resize-none"
                placeholder="Wpisz swój feedback tutaj... Np. 'Świetna odpowiedź! Pamiętaj tylko, że...' lub 'Niestety to nie jest poprawne, ponieważ...'"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setTaskFeedbackModal(null);
                    setTaskFeedbackText("");
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition dark:border-DarkblackBorder dark:text-gray-300 dark:hover:bg-DarkblackText"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSendTaskFeedback}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white shadow hover:scale-[1.03] transition"
                >
                  Wyślij feedback
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
