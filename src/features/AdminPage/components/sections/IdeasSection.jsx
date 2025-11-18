import { PenBoxIcon } from "lucide-react";
import React from "react";

export default function IdeasSection({ ideas }) {
  return (
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
  );
}








