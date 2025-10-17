import { create } from 'zustand';

const useNavigationStore = create((set, get) => ({
  // Stan nawigacji
  currentView: 'sections', // 'sections', 'videoList', 'videoDetail'
  selectedSection: null,
  selectedVideo: null,
  activeTab: 'video', // 'video', 'tasks'

  showSections: () => {
    set({
      currentView: 'sections',
      selectedSection: null,
      selectedVideo: null,
      activeTab: 'video'
    });
  },

  showVideoList: (section) => {
    set({
      currentView: 'videoList',
      selectedSection: section,
      selectedVideo: null,
      activeTab: 'video'
    });
  },

  showVideoDetail: (video) => {
    set({
      currentView: 'videoDetail',
      selectedVideo: video,
      activeTab: 'video'
    });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  // Reset nawigacji
  resetNavigation: () => {
    set({
      currentView: 'sections',
      selectedSection: null,
      selectedVideo: null,
      activeTab: 'video'
    });
  }
}));

export default useNavigationStore;










