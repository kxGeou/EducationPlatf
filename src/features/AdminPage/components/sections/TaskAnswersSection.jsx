import { ChevronDown, FileText } from "lucide-react";
import React from "react";

export default function TaskAnswersSection({
  taskAnswers,
  taskAnswersLoading,
  taskAnswersFilter,
  setTaskAnswersFilter,
  openFilter,
  setOpenFilter,
  openDropdown,
  setOpenDropdown,
  getStatusColor,
  getStatusLabel,
  updateTaskAnswerStatus,
  timeAgo,
  setTaskFeedbackModal,
  setTaskFeedbackText,
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
          <FileText size={20} className="sm:w-6 sm:h-6" />
          Odpowiedzi na zadania ({taskAnswers.length})
        </h2>
        <div className="dropdown relative">
          <button
            onClick={() => setOpenFilter((prev) => !prev)}
            className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-DarkblackBorder dark:border-0 dark:text-white rounded-xl shadow-sm hover:shadow-md transition text-sm w-full sm:w-auto"
          >
            {taskAnswersFilter === "all" ? "Wszystkie statusy" : taskAnswersFilter}
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/80" />
          </button>
          {openFilter && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-DarkblackBorder dark:border-DarkblackText rounded-lg shadow-xl border border-gray-200 z-[9999]">
              <div
                onClick={() => {
                  setTaskAnswersFilter("all");
                  setOpenFilter(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
              >
                Wszystkie statusy
              </div>
              {['pending','approved','rejected'].map((s) => (
                <div
                  key={s}
                  onClick={() => {
                    setTaskAnswersFilter(s);
                    setOpenFilter(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackText cursor-pointer text-sm text-blackText dark:text-white transition-colors"
                >
                  {getStatusLabel(s)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {taskAnswersLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryBlue dark:border-primaryGreen mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Ładowanie odpowiedzi...</p>
          </div>
        </div>
      ) : (
        <>
          {taskAnswers.filter(a => taskAnswersFilter === 'all' || a.status === taskAnswersFilter).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {taskAnswers
                .filter(a => taskAnswersFilter === 'all' || a.status === taskAnswersFilter)
                .map((answer, index) => (
                  <div key={answer.id} className="bg-white/80 dark:bg-DarkblackBorder backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-DarkblackText flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-blackText dark:text-white flex-1">
                        {answer.video_tasks?.topic || 'Brak tematu'}
                      </h3>
                      <div className="dropdown relative ml-4">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === answer.id ? null : answer.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium tracking-wide ${getStatusColor(answer.status)}`}
                        >
                          {getStatusLabel(answer.status)}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {openDropdown === answer.id && (
                          <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-DarkblackBorder rounded-lg shadow-xl border border-gray-100 dark:border-DarkblackText py-2 flex flex-col gap-2 z-[9999]">
                            {['pending','approved','rejected'].map((status) => (
                              <div
                                key={status}
                                onClick={() => { updateTaskAnswerStatus(answer.id, status); setOpenDropdown(null); }}
                                className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-DarkblackText text-blackText dark:text-white"
                              >
                                {getStatusLabel(status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-500 text-sm mb-1 dark:text-primaryGreen/75"><span className="font-medium">Użytkownik:</span> {answer.users?.user_name || answer.users?.email || 'Nieznany'}</p>
                      <p className="text-gray-500 text-sm mb-2 dark:text-primaryGreen/75"><span className="font-medium">Email:</span> {answer.users?.email || 'Brak'}</p>
                      <p className="text-gray-600 text-sm leading-relaxed dark:text-white/75 mb-3"><span className="font-medium">Treść zadania:</span><br />{answer.video_tasks?.task || 'Brak treści zadania'}</p>
                      <div className="p-3 bg-blue-50 border dark:bg-blue-200 dark:border-0 border-blue-200 rounded-lg text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-800 mb-2">Odpowiedź ucznia:</p>
                        <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                      {answer.admin_feedback ? (
                        <div className="mt-3 p-3 bg-green-50 border dark:bg-green-200 dark:border-0 border-green-200 rounded-lg text-sm">
                          <p className="font-medium text-green-700 dark:text-green-800 mb-2">Feedback admina:</p>
                          <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap">{answer.admin_feedback}</p>
                          {answer.feedback_date && (
                            <p className="text-xs text-gray-500 dark:text-gray-600 mt-2">{timeAgo(answer.feedback_date)}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs italic text-gray-400 mt-2">Brak feedbacku admina</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col text-xs text-gray-400 dark:text-gray-500">
                        <span>#{index + 1}</span>
                        <span>{timeAgo(answer.created_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setTaskFeedbackModal(answer.id); setTaskFeedbackText(answer.admin_feedback || ""); }}
                      className="mt-4 w-full bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryBlue text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:opacity-90"
                    >
                      {answer.admin_feedback ? 'Edytuj feedback' : 'Dodaj feedback'}
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {taskAnswersFilter === 'all' ? 'Brak odpowiedzi na zadania do wyświetlenia' : `Brak odpowiedzi ze statusem "${getStatusLabel(taskAnswersFilter)}"`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}








