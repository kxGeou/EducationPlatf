import { create } from 'zustand'
import supabase from '../util/supabaseClient'
import { toast } from '../utils/toast'

export const useVideoReviewsStore = create((set, get) => ({
  loading: false,
  error: null,
  videoReviews: [],
  videoBase: [],
  users: [],

  fetchVideoData: async () => {
    set({ loading: true, error: null });
    
    try {
      // Fetch video reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('video_reviews')
        .select(`
          id,
          user_id,
          video_id,
          rating,
          review_text,
          created_at,
          updated_at
        `);

      if (reviewsError) {
        console.error('Error fetching video reviews:', reviewsError);
        set({ error: reviewsError.message });
      } else {
        set({ videoReviews: reviewsData || [] });
      }

      // Fetch video base data
      const { data: videoData, error: videoError } = await supabase
        .from('video_base')
        .select(`
          videoId,
          title,
          directUrl,
          course_id,
          section_title,
          section_id
        `);

      if (videoError) {
        console.error('Error fetching video base:', videoError);
        set({ error: videoError.message });
      } else {
        set({ videoBase: videoData || [] });
      }

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          user_name
        `);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        set({ error: usersError.message });
      } else {
        set({ users: usersData || [] });
      }

    } catch (error) {
      console.error('Error fetching video data:', error);
      set({ error: error.message });
      toast.error('Błąd podczas pobierania danych o recenzjach wideo');
    } finally {
      set({ loading: false });
    }
  },

  // Helper function to get reviews for a specific video
  getVideoReviews: (videoId) => {
    const { videoReviews } = get();
    return videoReviews.filter(review => review.video_id === videoId);
  },

  // Helper function to get user name
  getUserName: (userId) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    return user ? (user.user_name || user.email) : 'Nieznany użytkownik';
  },

  // Helper function to calculate average rating for a video
  calculateAverageRating: (videoId) => {
    const reviews = get().getVideoReviews(videoId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
  },

  // Get unique sections from videos with reviews
  getUniqueSections: () => {
    const { videoBase } = get();
    const videosWithReviews = videoBase.filter(video => {
      const reviews = get().getVideoReviews(video.videoId);
      return reviews.length > 0;
    });
    
    const sections = [...new Set(videosWithReviews.map(video => ({
      id: video.section_id,
      title: video.section_title
    })))];
    
    return sections;
  },

  // Filter videos to show only those with reviews and apply section filter
  getFilteredVideosWithReviews: (sectionFilter = "all") => {
    const { videoBase } = get();
    let videosWithReviews = videoBase.filter(video => {
      const reviews = get().getVideoReviews(video.videoId);
      return reviews.length > 0;
    });

    // Apply section filter
    if (sectionFilter !== "all") {
      videosWithReviews = videosWithReviews.filter(video => 
        video.section_id === sectionFilter
      );
    }

    return videosWithReviews;
  },

  // Get star data for rating display (returns data instead of JSX for flexibility)
  getStarData: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      fullStars,
      hasHalfStar,
      emptyStars,
      rating
    };
  }
}));
