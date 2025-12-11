import React from "react";

export default function IdeasSection({ ideas }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-bold text-lg text-blackText dark:text-white">
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
              className="bg-white/80 dark:bg-DarkblackBorder shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-DarkblackText"
            >
              {/* Typ pomysłu */}
              <span
                className={`inline-block mb-2 ${
                  idea.type === "Design" &&
                  "bg-indigo-500/70 text-sm text-white px-3 py-1.5 rounded-md"
                } ${
                  idea.type === "Funkcjonalność" &&
                  "bg-green-500/70 text-sm text-white px-3 py-1.5 rounded-md"
                } ${
                  idea.type === "Inne" &&
                  "bg-red-500/70 text-sm text-white px-3 py-1.5 rounded-md"
                }`}
              >
                {idea.type}
              </span>
              
              {/* Tytuł */}
              <p className="text-lg font-semibold mt-2 mb-1.5 text-blackText dark:text-white">{idea.name}</p>
              
              {/* Opis */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {idea.description}
              </p>
              
              {/* Mini badge z emailem */}
              <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-DarkblackText rounded-md">
                <span className="text-xs text-gray-600 dark:text-gray-400">{idea.user_email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}








