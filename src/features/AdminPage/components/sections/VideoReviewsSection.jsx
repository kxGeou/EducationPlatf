import { Video } from "lucide-react";
import React from "react";

export default function VideoReviewsSection({
  getUniqueSections,
  sectionFilter,
  setSectionFilter,
  getFilteredVideosWithReviews,
  getVideoReviews,
  calculateAverageRating,
  renderStars,
  setSelectedVideoReviews,
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-bold text-xl sm:text-2xl text-blackText dark:text-white flex items-center gap-2">
        <Video size={20} className="sm:w-6 sm:h-6" />
        Recenzje wideo użytkowników
      </h2>

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
                <h3 className="text-lg font-semibold text-blackText dark:text-white mb-3 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">ID: {video.videoId}</p>
                <div className="mb-4">
                  {hasReviews ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Średnia ocena:</p>
                        {renderStars(averageRating)}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{videoReviewsList.length} ocen</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Brak ocen</p>
                  )}
                </div>
                {hasReviews && (
                  <button
                    onClick={() => setSelectedVideoReviews({ video, reviews: videoReviewsList, averageRating })}
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
          <p className="text-lg">{sectionFilter === "all" ? "Brak wideo z recenzjami do wyświetlenia" : "Brak wideo z recenzjami w wybranej sekcji"}</p>
        </div>
      )}
    </div>
  );
}








