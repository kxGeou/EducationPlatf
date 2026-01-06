import { useAuthStore } from '../../../store/authStore';
import { useReports } from '../../../store/reportStore';
import { User, ClipboardList, CheckCircle, Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function ReportPanel() {
  const [openForm, setOpenForm] = useState(false);
  const [activePanel, setActivePanel] = useState("Do zrobienia");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(
    "Wybierz temat zgłoszenia"
  );
  const [topic, setTopic] = useState("Inne");
  const [description, setDescription] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);

  const options = [
    { value: "problem", label: "Problem techniczny" },
    { value: "feature", label: "Propozycja funkcji" },
    { value: "support", label: "Wsparcie użytkownika" },
    { value: "design", label: "Błąd graficzny" },
    { value: "inne", label: "Inne" },
  ];

  const user = useAuthStore((state) => state.user);
  const userEmail = user.email;
  const userID = user.id;

  const { sendReport, fetchUserReports, userReports } = useReports();

  useEffect(() => {
    fetchUserReports();

    const lastSent = localStorage.getItem("lastReportTime");
    if (lastSent) {
      const diff =
        200 - Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
      if (diff > 0) setTimeLeft(diff);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const reportsByStatus = useMemo(() => {
    return userReports.reduce((acc, r) => {
      acc[r.status] = acc[r.status] || [];
      acc[r.status].push(r);
      return acc;
    }, {});
  }, [userReports]);

  const displayedReports = useMemo(() => {
    if (openForm) return [];
    return reportsByStatus[activePanel] || [];
  }, [activePanel, reportsByStatus, openForm]);

  const statusStyles = {
    "Do zrobienia": {
      color: "",
      text: "text-green-700 dark:text-green-500",
      icon: <User size={18} className=" text-green-500" />,
    },
    "W trakcie": {
      color: "",
      text: "text-yellow-700 dark:text-yellow-500",
      icon: <ClipboardList size={18} className=" text-yellow-500" />,
    },
    Zrobione: {
      color: "",
      text: "text-red-700 dark:text-red-500",
      icon: <CheckCircle size={18} className=" text-red-500" />,
    },
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full mt-2 dark:bg-DarkblackBorder">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen md:mt-0 mt-18">
        Twoje zgłoszenia
      </span>
      <div className="flex gap-4 w-full flex-col md:flex-row">
          <button
            onClick={() => setOpenForm(!openForm)}
            className="border border-gray-200 flex gap-2 items-center justify-center rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg duration-300 w-full text-blackText dark:bg-blackText dark:border-0 dark:text-white bg-white py-3 md:py-0"
          >
            Napisz zgłoszenie<Plus className="w-4 h-4" /> 
          </button>




        {["Do zrobienia", "W trakcie", "Zrobione"].map((status) => (
          <button
            key={status}
            onClick={() => setActivePanel(status)}
            className={`w-full border border-gray-200 shadow-md rounded-xl flex items-center gap-2 px-4 py-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg duration-300 dark:border-0 bg-white dark:bg-blackText ${
              activePanel === status && !openForm
                ? "shadow-lg" : "opacity-75"
            }`}
          >


            <div>{statusStyles[status].icon}</div>
            <div className="flex flex-col text-left">
              <span
                className={`text-sm font-medium ${statusStyles[status].color} ${statusStyles[status].text}`}
              >
                {status}
              </span>
              <span className="text-gray-500 dark:text-gray-300 text-xs">
                {(reportsByStatus[status] || []).length} zgłoszeń
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full">
        {!openForm ? (
          <div className="w-full">
            <div className="flex flex-col gap-4 w-full">
              {displayedReports.length > 0 ? (
                displayedReports.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-DarkblackText p-4 rounded-2xl border border-gray-200 dark:border-0 shadow transition flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {statusStyles[r.status]?.icon || null}
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          {r.topic}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[r.status]?.color
                        } ${statusStyles[r.status]?.text}`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <p className="text-gray-500 dark:text-gray-300">
                      {r.description}
                    </p>

                    {r.answer ? (
                      <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Odpowiedź administratora:
                        </p>
                        <p className="text-gray-700 dark:text-gray-200 text-sm mt-1">
                          {r.answer}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-400 mt-1">
                        Brak odpowiedzi od administratora
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Brak zgłoszeń</p>
              )}
            </div>
          </div>
        ) : (
          <form
            className="bg-white dark:bg-DarkblackText p-6 rounded-2xl shadow hover:shadow-md flex flex-col gap-4 transition"
            onSubmit={(e) => {
              e.preventDefault();
              if (timeLeft > 0) return;

              sendReport(userID, userEmail, topic, description);
              setDescription("");
              setSelectedTopic("Wybierz temat zgłoszenia");
              setTopic("Inne");
              setOpenForm(false);

              localStorage.setItem("lastReportTime", Date.now().toString());
              setTimeLeft(200);
            }}
          >
            <input
              type="email"
              value={userEmail}
              readOnly
              className="p-3 rounded-xl border border-gray-200  focus:ring-1 focus:ring-blue-300 outline-none w-full text-sm bg-gray-50 dark:bg-DarkblackBorder dark:text-white dark:border-DarkblackBorder"
            />

            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full p-3 rounded-xl border border-gray-200  text-left focus:ring-1 focus:ring-blue-300 text-sm bg-gray-50 dark:bg-DarkblackBorder dark:text-white dark:border-DarkblackBorder"
              >
                {selectedTopic}
              </button>
              {dropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-DarkblackBorder dark:text-white dark:border-DarkblackBorder border border-gray-200  rounded-xl shadow">
                  {options.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        setSelectedTopic(opt.label);
                        setTopic(opt.label);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-blackText transition text-sm"
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis"
              className="p-3 rounded-xl border border-gray-200  focus:ring-1 focus:ring-blue-300 outline-none resize-none w-full text-sm bg-gray-50 dark:bg-DarkblackBorder dark:text-white dark:border-DarkblackBorder"
              rows={5}
            />

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-200  text-gray-700 hover:border-gray-300 dark:hover:border-secondaryGreen dark:text-gray-200 cursor-pointer transition"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={timeLeft > 0}
                className={`px-4 py-2 rounded-xl transition cursor-pointer hover:scale-[1.025] ${
                  timeLeft > 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-br from-primaryBlue to-secondaryBlue text-white dark:from-primaryGreen dark:to-secondaryGreen"
                }`}
              >
                {timeLeft > 0
                  ? `Odczekaj ${formatTime(timeLeft)}`
                  : "Wyślij zgłoszenie"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
