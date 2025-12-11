import { BarChart3 } from "lucide-react";
import React from "react";

export default function PollsSection({ polls, setShowPollModal }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-lg text-blackText dark:text-white">
          Zarządzanie ankietami ({polls.length})
        </h2>
        <button
          onClick={() => setShowPollModal(true)}
          className="px-4 py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200 w-full sm:w-auto max-w-[300px] text-sm"
        >
          Stwórz nową ankietę
        </button>
      </div>

      {polls.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {polls.map((poll) => {
            // Znajdź opcję z największą liczbą głosów
            const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
            const winningOptions = poll.options.filter(opt => opt.votes === maxVotes && opt.votes > 0);
            
            return (
              <div
                key={poll.id}
                className="bg-white/80 dark:bg-DarkblackBorder rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-DarkblackText"
              >
                <h4 className="text-lg font-semibold mb-2 text-blackText dark:text-white">{poll.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{poll.description}</p>
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const isWinning = winningOptions.some(win => win.id === opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`flex justify-between px-3 py-2 rounded-md text-blackText dark:text-white ${
                          isWinning 
                            ? 'bg-gray-300 dark:bg-DarkblackText/80' 
                            : 'bg-gray-200 dark:bg-DarkblackText'
                        }`}
                      >
                        <span className="text-sm">{opt.option_text}</span>
                        <span className="font-medium text-sm">{opt.votes} głosów</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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








