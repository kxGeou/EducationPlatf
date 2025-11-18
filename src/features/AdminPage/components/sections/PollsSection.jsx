import { PlusCircle, BarChart3 } from "lucide-react";
import React from "react";

export default function PollsSection({ polls, setShowPollModal }) {
  return (
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{poll.description}</p>
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
  );
}








