import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Lock, ShoppingBasket, Clapperboard, Check } from "lucide-react";
import { useState } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
import supabase from '../../../util/supabaseClient';
import { toast } from 'react-toastify';
import ReviewModal from './ReviewModal';

export default function VideoPanel({
  videos,
  currentVideo,
  setCurrentVideo,
  HlsPlayer,
  setActiveSection,
}) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewVideoId, setReviewVideoId] = useState(null);
  const [reviewVideoTitle, setReviewVideoTitle] = useState('');
  const { id: courseId } = useParams();
  const { user, userProgress, saveVideoProgress, purchasedCourses } = useAuthStore();

  const groupedVideos = videos.reduce((acc, video) => {
    const section = video.section_title || "Bez działu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(video);
    return acc;
  }, {});

  // Sortuj sekcje według kolejności (order) z video_base
  const sortedSections = Object.keys(groupedVideos).sort((a, b) => {
    const sectionA = groupedVideos[a][0];
    const sectionB = groupedVideos[b][0];
    const orderA = sectionA?.order || 999;
    const orderB = sectionB?.order || 999;
    return orderA - orderB;
  });

  const getRandomGradient = (index) => {
    const gradients = [
      'from-blue-300 to-blue-400',
      'from-green-300 to-green-400',
      'from-purple-300 to-purple-400',
      'from-indigo-300 to-indigo-400',
      'from-teal-300 to-teal-400',
      'from-cyan-300 to-cyan-400',
      'from-slate-300 to-slate-400',
      'from-gray-300 to-gray-400'
    ];
    return gradients[index % gradients.length];
  };


  const handleToggleWatched = async (videoId, checked) => {
    if (!user) return;
    
    // Always save progress first (this awards 10 points for checkbox)
    saveVideoProgress(user.id, videoId, checked, courseId);
    
    if (checked) {
      try {
        const { data, error } = await supabase
          .from('video_reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .single();

        if (error && error.code === 'PGRST116') {
          const video = videos.find(v => v.videoId === videoId);
          setReviewVideoId(videoId);
          setReviewVideoTitle(video?.title || 'Wideo');
          setShowReviewModal(true);
        }
      } catch (err) {
        console.error('Error checking review:', err);
      }
    }
  };

  const hasSectionAccess = (sectionId, sectionIndex = 0) => {
    if (!sectionId) return true;
    
    return purchasedCourses.includes(sectionId);
  };


  return (
    <div className="w-full ">
      {!selectedSection ? (
        <div className="flex flex-col gap-8 w-full  md:min-h-[96vh] p-3">
          <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
            Panel wideo
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedSections.map((section, sectionIndex) => {
              const videosInSection = groupedVideos[section];
              const watchedCount = videosInSection.filter(
                (v) => userProgress[v.videoId]
              ).length;
              
              const sectionId = videosInSection[0]?.section_id;
              const hasAccess = hasSectionAccess(sectionId, sectionIndex);

              return (
                <div
                  key={section}
                  className={`w-full h-80 rounded-[12px] overflow-hidden shadow-lg transition-all duration-200 ${
                    hasAccess ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (hasAccess) {
                      setSelectedSection(section);
                      const firstVideo = videosInSection[0];
                      if (firstVideo) {
                        setCurrentVideo(firstVideo);
                      }
                    }
                  }}
                >
                  {/* Sekcja z wyróżnieniem dostępu */}
                  <div className={`flex flex-col h-full transition-all duration-200 ${
                    hasAccess 
                      ? 'bg-white dark:bg-DarkblackText shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-800 shadow-md opacity-75'
                  }`}>
                    {/* Wyższy gradient z tytułem */}
                    <div className={`w-full h-12 bg-gradient-to-r ${getRandomGradient(sectionIndex)} flex items-center justify-center`}>
                      <h3 className="text-white font-bold text-lg drop-shadow-lg">{section}</h3>
                    </div>
                    
                    <div className="flex-1 p-4 flex flex-col">
                      {videosInSection[0]?.section_description && (
                        <p className={`text-sm mb-3 line-clamp-2 flex-1 ${
                          hasAccess ? 'opacity-70' : 'opacity-50'
                        }`}>
                          {videosInSection[0].section_description}
                        </p>
                      )}
                      
                      <p className={`text-sm mb-3 ${
                        hasAccess ? 'opacity-60' : 'opacity-40'
                      }`}>
                        {videosInSection.length} lekcji wideo
                      </p>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs ${
                            hasAccess ? 'text-blackText/50 dark:text-white/50' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            Postęp
                          </span>
                          <span className={`text-xs font-medium ${
                            hasAccess ? 'text-blackText/70 dark:text-white/70' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {hasAccess ? Math.round((watchedCount / videosInSection.length) * 100) || 0 : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              hasAccess 
                                ? 'bg-secondaryBlue dark:bg-secondaryGreen' 
                                : 'bg-gray-300 dark:bg-gray-500'
                            }`}
                            style={{
                              width: `${hasAccess ? (watchedCount / videosInSection.length) * 100 || 0 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Przycisk na samym dole - różny w zależności od dostępu */}
                    <div className="p-4 pt-1">
                      {hasAccess ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSection(section);
                            const firstVideo = videosInSection[0];
                            if (firstVideo) {
                              setCurrentVideo(firstVideo);
                            }
                          }}
                          className="w-full py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Clapperboard size={14} />
                          Otwórz sekcję
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSection('shop');
                          }}
                          className="w-full py-2.5 bg-primaryBlue dark:bg-primaryGreen text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <ShoppingBasket size={14} />
                          Przejdź do sklepu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full h-[96vh] rounded-[12px] p-3 lg:p-5">
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:order-1 order-2 flex flex-col h-full lg:h-full">
            <div className="flex items-center gap-3 mb-4 lg:mb-6 p-3 lg:p-4 bg-white dark:bg-DarkblackText rounded-lg shadow-sm">
              <button
                onClick={() => {
                  setSelectedSection(null);
                  setCurrentVideo(null);
                }}
                className="flex items-center gap-2 text-secondaryBlue dark:text-secondaryGreen hover:underline cursor-pointer font-medium text-sm lg:text-base"
              >
                <ChevronLeft size={18} className="lg:w-5 lg:h-5" />
                Powrót
              </button>
            </div>

            <div className="bg-white dark:bg-DarkblackText rounded-lg shadow-sm p-3 lg:p-4 mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-bold text-gray-800 dark:text-white mb-2">{selectedSection}</h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                {groupedVideos[selectedSection].length} lekcji wideo
              </p>
            </div>

            <div className="bg-white dark:bg-DarkblackText rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="p-3 lg:p-4 flex-shrink-0">
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm lg:text-base">Lista lekcji</h4>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ul>
                  {groupedVideos[selectedSection].map((video, index) => {
                    const isWatched = !!userProgress[video.videoId];
                    const hasAccess = hasSectionAccess(video.section_id, 0); 
                    
                    return (
                      <li
                        key={video.videoId}
                        className={`p-3 lg:p-4 transition-all duration-200 ${
                          hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                        } ${
                          currentVideo?.videoId === video.videoId
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-green-500"
                            : hasAccess ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""
                        }`}
                        onClick={() => hasAccess && setCurrentVideo(video)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 lg:gap-3 mb-1">
                              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white leading-tight">
                                {index + 1}. {video.title}
                              </span>
                              {!hasAccess && <Lock size={12} className="text-gray-500 flex-shrink-0 lg:w-3.5 lg:h-3.5" />}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {video.duration || "?"} min
                            </p>
                          </div>

                          {hasAccess ? (
                            <input
                              type="checkbox"
                              checked={isWatched}
                              onChange={(e) =>
                                handleToggleWatched(video.videoId, e.target.checked)
                              }
                              title="Oznacz jako obejrzany"
                              className="h-4 w-4 lg:h-5 lg:w-5 cursor-pointer text-blue-600 rounded flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-sm lg:text-lg text-gray-400 dark:text-gray-500 flex-shrink-0">
                              🔒
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {currentVideo && (
            <div className="flex-1 flex flex-col lg:order-2 order-1 h-full overflow-y-auto space-y-3 lg:space-y-4">
              <div className="w-full aspect-video lg:aspect-[4/3] rounded-lg overflow-hidden shadow-lg relative bg-black">
                {!hasSectionAccess(currentVideo.section_id, videos.findIndex(v => v.videoId === currentVideo.videoId)) ? (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                    <div className="text-center text-white p-4 lg:p-6">
                      <div className="text-3xl lg:text-5xl mb-3 lg:mb-4">🔒</div>
                      <h3 className="text-lg lg:text-2xl font-bold mb-2 lg:mb-3">Sekcja zablokowana</h3>
                      <p className="text-xs lg:text-sm opacity-80 mb-4 lg:mb-6 max-w-md">
                        Ta sekcja wideo wymaga zakupu pakietu. Przejdź do sekcji Sklep, aby kupić dostęp.
                      </p>
                      <button
                        onClick={() => setActiveSection('shop')}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-primaryGreen dark:to-secondaryGreen hover:from-blue-700 hover:to-blue-800 dark:hover:from-primaryGreen dark:hover:to-secondaryGreen text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm lg:text-base"
                      >
                        <ShoppingBasket size={16} className="inline mr-2 lg:w-4 lg:h-5" />
                        Przejdź do sklepu
                      </button>
                    </div>
                  </div>
                ) : null}
                <HlsPlayer
                  src={currentVideo.directUrl}
                  title={currentVideo.title}
                />
              </div>

              <div className="bg-white dark:bg-DarkblackText rounded-lg shadow-sm p-4 lg:p-6 space-y-3 lg:space-y-4">
                <div>
                  <h4 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white mb-2">{currentVideo.title}</h4>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentVideo.video_description}
                  </p>
                </div>

                {currentVideo.video_section_image && (
                  <img 
                    src={currentVideo.video_section_image} 
                    alt="Section" 
                    className="w-full h-32 lg:h-48 object-cover rounded-lg" 
                  />
                )}

                {currentVideo.video_section_title && (
                  <div>
                    <h5 className="text-base lg:text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {currentVideo.video_section_title}
                    </h5>
                  </div>
                )}

                {currentVideo.video_section_description && (
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentVideo.video_section_description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        videoId={reviewVideoId}
        videoTitle={reviewVideoTitle}
        courseId={courseId}
      />
    </div>
  );
}
