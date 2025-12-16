import { ChevronDown, User } from "lucide-react";
import React from "react";

export default function ReportsSection({
  statuses,
  filteredReports,
  openDropdown,
  setOpenDropdown,
  statusFilter,
  setStatusFilter,
  showReportsCategory,
  setShowReportsCategory,
  updateStatus,
  timeAgo,
  setReplyModal,
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl text-blackText dark:text-white">
          Wszystkie zgłoszenia
        </h2>
        <div className="dropdown relative">
          <button
            onClick={() => setShowReportsCategory((prev) => !prev)}
            className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-gray-200 dark:text-white rounded-md transition text-sm w-full sm:w-auto"
          >
            {statusFilter === "all" ? "Wszystkie statusy" : statusFilter}
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
          </button>
          {showReportsCategory && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-md border border-gray-200 z-[9999] animate-slideUp">
              <div
                onClick={() => {
                  setStatusFilter("all");
                  setShowReportsCategory(false);
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
                    setShowReportsCategory(false);
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
            const currentStatus = statuses.find((s) => s.label === report.status);
            return (
              <div
                key={report.id}
                className="bg-white/80 dark:bg-DarkblackBorder backdrop-blur-md p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-DarkblackText flex flex-col justify-between"
              >
                <div className="mb-4">
                  {/* Email Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-DarkblackText rounded-md text-sm text-gray-700 dark:text-gray-300">
                      <User size={16} className="text-gray-500 dark:text-gray-400" />
                      <span>{report.user_email}</span>
                    </div>
                  </div>

                  {/* Tytuł */}
                  <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex-1">
                    {report.topic}
                  </h3>
                  <div className="dropdown relative ml-4">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === report.id ? null : report.id)
                      }
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium tracking-wide ${currentStatus?.color}`}
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

                  {/* Opis */}
                  <p className="text-gray-600 text-sm leading-relaxed dark:text-white/75">
                    <span className="font-medium">Opis:</span> {report.description}
                  </p>
                  {report.answer ? (
                    <div className="mt-3 p-3 bg-green-50 border dark:bg-green-200 dark:border-0 border-green-200 rounded-md text-sm">
                      <p className="font-medium text-green-700 dark:text-green-800">
                        Odpowiedź admina:
                      </p>
                      <p className="text-gray-700">{report.answer}</p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-400 mt-2">Brak odpowiedzi</p>
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
                  className="mt-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white text-sm px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200"
                >
                  Odpowiedz
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center italic py-12">Nie ma żadnych zgłoszeń</p>
      )}
    </div>
  );
}








