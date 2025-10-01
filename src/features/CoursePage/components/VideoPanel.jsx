import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Lock, ShoppingBasket } from "lucide-react";
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
}) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionPrices, setSectionPrices] = useState({});
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

  const fetchSectionPrices = async () => {
    const sectionIds = Object.values(groupedVideos).map(sectionVideos => sectionVideos[0]?.section_id).filter(Boolean);
    if (sectionIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, price_cents')
        .in('id', sectionIds);

      if (!error && data) {
        const prices = {};
        data.forEach(course => {
          prices[course.id] = course.price_cents;
        });
        setSectionPrices(prices);
      }
    } catch (err) {
      console.error('Error fetching section prices:', err);
    }
  };

  React.useEffect(() => {
    fetchSectionPrices();
  }, [videos]);

  const handleToggleWatched = async (videoId, checked) => {
    if (!user) return;
    
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
    
    saveVideoProgress(user.id, videoId, checked, courseId);
  };

  const hasSectionAccess = (sectionId, sectionIndex = 0) => {
    if (!sectionId) return true;
    
    return purchasedCourses.includes(sectionId);
  };

  const canPurchaseSection = (currentSectionId, currentSectionIndex) => {
    if (purchasedCourses.includes(currentSectionId)) {
      return false;
    }

    if (currentSectionIndex === 0) {
      return true;
    }

    if (currentSectionIndex > 0) {
      const sectionKeys = Object.keys(groupedVideos);
      const previousSectionKey = sectionKeys[currentSectionIndex - 1];
      const previousSectionVideos = groupedVideos[previousSectionKey];

      if (previousSectionVideos && previousSectionVideos.length > 0) {
        const previousSectionId = previousSectionVideos[0]?.section_id;

        if (previousSectionId && purchasedCourses.includes(previousSectionId)) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSectionPurchase = async (sectionId) => {
    if (!user) {
      toast.error("Musisz być zalogowany, żeby kupić sekcję.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Brak sesji. Zaloguj się ponownie.");
      return;
    }

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price_cents')
      .eq('id', sectionId)
      .single();

    if (courseError || !courseData) {
      toast.error("Nie udało się pobrać informacji o kursie.");
      return;
    }

    const priceCents = courseData.price_cents * 100;
    if (!priceCents || isNaN(priceCents) || priceCents < 200) {
      toast.error("Cena kursu musi wynosić co najmniej 2 zł.");
      return;
    }

    const res = await fetch(
      "https://gkvjdemszxjmtxvxlnmr.supabase.co/functions/v1/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          course_id: courseData.id,
          course_title: courseData.title,
          price_cents: priceCents,
          success_url_base: window.location.origin,
        }),
      }
    );

    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Błąd przy tworzeniu sesji płatności:", data);
    }
  };

  return (
    <div className="w-full ">
      {!selectedSection ? (
        <div className="flex flex-col gap-8 w-full  md:min-h-[96vh] p-3">
          <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
            Panel wideo
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.keys(groupedVideos).map((section, sectionIndex) => {
              const videosInSection = groupedVideos[section];
              const watchedCount = videosInSection.filter(
                (v) => userProgress[v.videoId]
              ).length;
              
              const sectionId = videosInSection[0]?.section_id;
              const hasAccess = hasSectionAccess(sectionId, sectionIndex);
              const canBuy = canPurchaseSection(sectionId, sectionIndex);

              return (
                <div
                  key={section}
                  className={`bg-white dark:bg-DarkblackText flex flex-col items-start justify-between w-full rounded-[12px] shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 dark:hover:bg-DarkblackText min-h-[200px] overflow-hidden ${
                    hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
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
                  <div className={`w-full h-6 bg-gradient-to-r ${getRandomGradient(sectionIndex)}`}></div>
                  
                  <div className="w-full p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold line-clamp-2">{section}</h3>
                      {!hasAccess && <Lock size={16} className="text-gray-500" />}
                    </div>
                    
                    {videosInSection[0]?.section_description && (
                      <p className="text-sm opacity-70 mb-3 line-clamp-2">
                        {videosInSection[0].section_description}
                      </p>
                    )}
                    
                    <p className="text-sm opacity-60 mb-4 line-clamp-3">
                      {videosInSection.length} lekcji wideo
                    </p>
                    
                    {sectionId && sectionPrices[sectionId] && !hasAccess && (
                      <div className="mb-4">
                        <span className="text-lg font-bold text-primaryBlue dark:text-primaryGreen">
                          {sectionPrices[sectionId]} zł
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full px-6 pb-6 mt-auto">
                    {hasAccess ? (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-blackText/50 dark:text-white/50">
                            Postęp
                          </span>
                          <span className="text-xs font-medium text-blackText/70 dark:text-white/70">
                            {Math.round((watchedCount / videosInSection.length) * 100) || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-secondaryBlue dark:bg-secondaryGreen h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(watchedCount / videosInSection.length) * 100 || 0}%`,
                            }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      canBuy ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSectionPurchase(sectionId);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-primaryGreen dark:to-secondaryGreen hover:from-blue-700 hover:to-blue-800 dark:hover:from-primaryGreen dark:hover:to-secondaryGreen flex items-center justify-center gap-2 rounded-[8px] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <ShoppingBasket size={16} />
                          Kup sekcję
                        </button>
                      ) : (
                        <div className="w-full py-3 text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-100 dark:bg-gray-700 rounded-[8px]">
                          Kup poprzednią sekcję, aby odblokować
                        </div>
                      )
                    )}
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
                        Ta sekcja wideo wymaga zakupu. Kup sekcję, aby uzyskać dostęp do wszystkich lekcji.
                      </p>
                      <button
                        onClick={() => handleSectionPurchase(currentVideo.section_id)}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-primaryGreen dark:to-secondaryGreen hover:from-blue-700 hover:to-blue-800 dark:hover:from-primaryGreen dark:hover:to-secondaryGreen text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm lg:text-base"
                      >
                        <ShoppingBasket size={16} className="inline mr-2 lg:w-4 lg:h-5" />
                        Kup sekcję
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
      />
    </div>
  );
}
