import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, Lock, ShoppingBasket, Clapperboard, Check } from "lucide-react";
import { useState } from "react";
import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useToast } from '../../../context/ToastContext';
import useNavigationStore from '../../../store/navigationStore';
import useVideoStore from '../../../store/videoStore';
import ReviewModal from './ReviewModal';
import SectionOverview from './SectionOverview';
import VideoListPanel from './VideoListPanel';
import VideoDetailPanel from './VideoDetailPanel';

export default function VideoPanel({
  videos,
  currentVideo,
  setCurrentVideo,
  HlsPlayer,
  setActiveSection,
}) {
  const toast = useToast();
  const { id: courseId } = useParams();
  const { user, userProgress, saveVideoProgress, purchasedCourses } = useAuthStore();
  
  // Store hooks
  const {
    currentView,
    selectedSection,
    selectedVideo,
    activeTab,
    showSections,
    showVideoList,
    showVideoDetail,
    setActiveTab
  } = useNavigationStore();

  const { fetchVideos, fetchVideoTasks, fetchTaskAnswers } = useVideoStore();

  // Stan dla modala recenzji
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewVideoId, setReviewVideoId] = useState(null);
  const [reviewVideoTitle, setReviewVideoTitle] = useState('');

  // Pobierz dane przy załadowaniu komponentu
  useEffect(() => {
    if (courseId) {
      fetchVideos(courseId);
    }
  }, [courseId, fetchVideos]);

  // Funkcja do pokazania modala recenzji
  const handleShowReviewModal = (videoId, videoTitle) => {
    setReviewVideoId(videoId);
    setReviewVideoTitle(videoTitle);
    setShowReviewModal(true);
  };

  // Ustaw funkcję w window dla dostępu z VideoDetailPanel
  useEffect(() => {
    window.showReviewModal = handleShowReviewModal;
    return () => {
      window.showReviewModal = null;
    };
  }, []);



  // Funkcja do obsługi wyboru sekcji
  const handleSectionSelect = async (section) => {
    showVideoList(section);
    
    // Pobierz zadania dla filmów w tej sekcji
    const videosInSection = videos.filter(v => v.section_title === section);
    const videoIds = videosInSection.map(v => v.videoId);
    
    if (videoIds.length > 0) {
      await fetchVideoTasks(courseId, videoIds);
      
      // Pobierz odpowiedzi użytkownika jeśli jest zalogowany
      if (user) {
        const allTasks = Object.values(useVideoStore.getState().videoTasks).flat();
        const taskIds = allTasks.map(task => task.task_id);
        await fetchTaskAnswers(user.id, courseId, taskIds);
      }
    }
  };

  // Funkcja do obsługi wyboru filmu
  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    showVideoDetail(video);
  };

  // Funkcja do powrotu do listy sekcji
  const handleBackToSections = () => {
    setCurrentVideo(null);
    showSections();
  };

  // Funkcja do przełączania między video a zadaniami
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full">
      {currentView === 'sections' && (
        <SectionOverview
          videos={videos}
          setActiveSection={setActiveSection}
          onSelectSection={handleSectionSelect}
        />
      )}
      
      {currentView === 'videoList' && (
        <VideoListPanel
          videos={videos}
          selectedSection={selectedSection}
          onVideoSelect={handleVideoSelect}
          onBackToSections={handleBackToSections}
        />
      )}
      
      {currentView === 'videoDetail' && (
        <VideoDetailPanel
          video={selectedVideo}
          videos={videos}
          selectedSection={selectedSection}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onVideoSelect={handleVideoSelect}
          onBackToSections={handleBackToSections}
          HlsPlayer={HlsPlayer}
        />
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
