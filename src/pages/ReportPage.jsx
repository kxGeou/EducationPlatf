import { useReports } from "../store/reportStore";
import { User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

function timeAgo(dateString) {
  const now = new Date();
  const created = new Date(dateString);
  const diff = (now.getTime() - created.getTime()) / 1000;

  if (diff < 60) return "Przed chwilą";
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  return `${Math.floor(diff / 86400)} dni temu`;
}

export default function ReportPage() {
  const [password, setPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);

  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { fetchReports, reports, updateStatus, addAnswer } = useReports();

  const statuses = [
    { label: "Do zrobienia", color: "bg-green-100 text-green-600" },
    { label: "W trakcie", color: "bg-yellow-100 text-yellow-600" },
    { label: "Zrobione", color: "bg-red-100 text-red-500" },
  ];

  const handleLogin = () => {
    if (password === "1234") {
      setAccessGranted(true);
    } else {
      alert("Niepoprawne hasło");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

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

  if (accessGranted) {
    return (
      <div className="min-h-screen flex justify-start bg-gradient-to-br from-gray-200 to-gray-300 p-6">
        <div className="bg-white/80 backdrop-blur-xl p-8 shadow-xl w-full rounded-2xl flex flex-col gap-6 relative">
          <h2 className="font-bold text-2xl text-gray-800 tracking-wide">
            Wszystkie zgłoszenia
          </h2>

          <div className="flex gap-4 relative">
            <div className="dropdown relative">
              <button
                onClick={() => setOpenFilter((prev) => !prev)}
                className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] shadow-sm hover:shadow-md transition text-sm"
              >
                {statusFilter === "all" ? "Wszystkie statusy" : statusFilter}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {openFilter && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-200 z-50">
                  <div
                    onClick={() => {
                      setStatusFilter("all");
                      setOpenFilter(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReports.map((report, index) => {
                const currentStatus = statuses.find(
                  (s) => s.label === report.status
                );

                return (
                  <div
                    key={report.id}
                    className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between transition hover:shadow-lg hover:-translate-y-0.5 duration-300 z-0"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {report.topic}
                      </h3>
                      <p className="text-gray-500 text-sm mb-1">
                        <span className="font-medium">Email:</span>{" "}
                        {report.user_email}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {report.description}
                      </p>

                      {report.answer ? (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                          <p className="font-medium text-green-700">
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
                      <div className="dropdown relative">
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
                          <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 flex flex-col gap-2 z-50">
                            {statuses.map((s) => (
                              <div
                                key={s.label}
                                onClick={() => {
                                  updateStatus(report.id, s.label);
                                  setOpenDropdown(null);
                                }}
                                className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 "
                              >
                                {s.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end text-xs text-gray-400">
                        <span>#{index + 1}</span>
                        <span>{timeAgo(report.created_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setReplyModal(report.id)}
                      className="mt-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white text-sm px-4 py-2 rounded-lg shadow hover:scale-[1.03] transition"
                    >
                      Odpowiedz
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center italic">
              Nie ma żadnych zgłoszeń
            </p>
          )}
        </div>

        {replyModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-scaleIn">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Odpowiedź na zgłoszenie
              </h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows="4"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryBlue text-sm"
                placeholder="Wpisz odpowiedź..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setReplyModal(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-10 w-full max-w-md flex flex-col gap-6 items-center justify-center">
        <h2 className="text-2xl font-light tracking-wide text-gray-800 flex flex-col items-center gap-3">
          <User className="text-gray-400 w-10 h-10" />
          Panel zgłoszeń
        </h2>

        <input
          type="password"
          placeholder="Wpisz hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-100 w-full border border-gray-200 px-4 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />

        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-primaryBlue to-secondaryBlue cursor-pointer text-white font-medium w-full py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
        >
          Zaloguj
        </button>
      </div>
    </div>
  );
}
