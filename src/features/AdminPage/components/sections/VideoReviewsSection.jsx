import { ArrowUp, ArrowDown } from "lucide-react";
import React from "react";

export default function VideoReviewsSection({
  getUniqueSections,
  getAllSections,
  sectionHasReviews,
  sectionFilter,
  setSectionFilter,
  ratingSort,
  setRatingSort,
  getFilteredVideosWithReviews,
  getVideoReviews,
  calculateAverageRating,
  renderStars,
  setSelectedVideoReviews,
}) {
  const allSections = getAllSections();
  
  // Toggle rating sort: default -> asc -> desc -> default
  const handleRatingSortToggle = () => {
    if (ratingSort === "default") {
      setRatingSort("asc");
    } else if (ratingSort === "asc") {
      setRatingSort("desc");
    } else {
      setRatingSort("default");
    }
  };
  
  // Get filtered videos
  const filteredVideos = getFilteredVideosWithReviews(sectionFilter);
  
  // Sort videos based on rating sort
  const sortedVideos = React.useMemo(() => {
    if (ratingSort === "default") {
      return filteredVideos;
    }
    
    const videosWithRatings = filteredVideos.map(video => ({
      video,
      rating: calculateAverageRating(video.videoId)
    }));
    
    if (ratingSort === "asc") {
      return videosWithRatings.sort((a, b) => a.rating - b.rating).map(item => item.video);
    } else if (ratingSort === "desc") {
      return videosWithRatings.sort((a, b) => b.rating - a.rating).map(item => item.video);
    }
    
    return filteredVideos;
  }, [filteredVideos, ratingSort, calculateAverageRating]);
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-bold text-lg text-blackText dark:text-white">
        Recenzje wideo użytkowników
      </h2>

      {allSections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSectionFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              sectionFilter === "all"
                ? "bg-primaryBlue text-white"
                : "bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder"
            }`}
          >
            Wszystkie sekcje
          </button>
          {allSections.map((section) => {
            const hasReviews = sectionHasReviews(section.id);
            return (
            <button
              key={section.id}
                onClick={() => hasReviews && setSectionFilter(section.id)}
                disabled={!hasReviews}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                sectionFilter === section.id
                  ? "bg-primaryBlue text-white"
                    : hasReviews
                    ? "bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder"
                    : "bg-gray-100 dark:bg-DarkblackText/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {section.title}
            </button>
            );
          })}
          <button
            onClick={handleRatingSortToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              ratingSort !== "default"
                ? "bg-primaryBlue text-white"
                : "bg-gray-200 dark:bg-DarkblackText text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-DarkblackBorder"
            }`}
          >
            {ratingSort === "asc" && <ArrowUp size={16} />}
            {ratingSort === "desc" && <ArrowDown size={16} />}
            <span>{ratingSort === "default" ? "Sortuj oceny" : ratingSort === "asc" ? "Rosnące" : "Malejące"}</span>
          </button>
        </div>
      )}

      {sortedVideos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {sortedVideos.map((video) => {
            const videoReviewsList = getVideoReviews(video.videoId);
            const averageRating = calculateAverageRating(video.videoId);
            const hasReviews = videoReviewsList.length > 0;
            return (
              <div
                key={video.videoId}
                className="bg-white/80 dark:bg-DarkblackBorder shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-DarkblackText"
              >
                <h3 className="text-lg font-semibold text-blackText dark:text-white mb-3 line-clamp-2">
                  {video.title}
                </h3>
                <div className="mb-4">
                  {hasReviews ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Średnia ocena:</p>
                        {renderStars(averageRating)}
                      </div>
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{videoReviewsList.length} ocen</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Brak ocen</p>
                  )}
                </div>
                {hasReviews && (
                  <button
                    onClick={() => setSelectedVideoReviews({ video, reviews: videoReviewsList, averageRating })}
                    className="w-full bg-primaryBlue dark:bg-primaryGreen text-white text-sm px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition-opacity duration-200"
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
          <p className="text-lg">{sectionFilter === "all" ? "Brak wideo z recenzjami do wyświetlenia" : "Brak wideo z recenzjami w wybranej sekcji"}</p>
        </div>
      )}
    </div>
  );
}








