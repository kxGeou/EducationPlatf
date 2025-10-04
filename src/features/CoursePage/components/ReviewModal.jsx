import { useState, useEffect } from 'react';
import { X, Send, Star, Heart } from 'lucide-react';
import supabase from '../../../util/supabaseClient';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'react-toastify';

const emojiRatings = [
  { emoji: '😞', value: 1, label: 'Bardzo złe', color: 'from-red-500 to-red-600' },
  { emoji: '😐', value: 2, label: 'Złe', color: 'from-orange-500 to-orange-600' },
  { emoji: '😊', value: 3, label: 'Dobre', color: 'from-yellow-500 to-yellow-600' },
  { emoji: '😄', value: 4, label: 'Bardzo dobre', color: 'from-green-500 to-green-600' },
  { emoji: '🤩', value: 5, label: 'Doskonałe', color: 'from-primaryGreen to-secondaryGreen' }
];

export default function ReviewModal({ isOpen, onClose, videoId, videoTitle, courseId }) {
  const [selectedRating, setSelectedRating] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, awardPointsForReview } = useAuthStore();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRating(null);
      setReviewText('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast.error('Proszę wybrać ocenę');
      return;
    }

    if (!user) {
      toast.error('Musisz być zalogowany, aby dodać recenzję');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('video_reviews')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          rating: selectedRating,
          review_text: reviewText.trim() || null,
        }, { onConflict: 'user_id,video_id' });

      if (error) {
        throw error;
      }

      // Award points for review submission
      awardPointsForReview(videoId, courseId);

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.code === '23505') {
        toast.error('Już dodałeś recenzję do tego wideo');
      } else {
        toast.error('Błąd podczas dodawania recenzji');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRating(null);
    setReviewText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-DarkblackText rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Star size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Oceń wideo</h2>
                <p className="text-white/80 text-sm">Twoja opinia jest dla nas ważna</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {showSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primaryGreen to-secondaryGreen rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Dziękujemy za recenzję!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Twoja opinia pomoże innym w wyborze kursu
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                  {videoTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Jak oceniasz to wideo?
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                  Wybierz ocenę:
                </p>
                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {emojiRatings.map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => setSelectedRating(rating.value)}
                      className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 transform ${
                        selectedRating === rating.value
                          ? `bg-gradient-to-br ${rating.color} scale-110 shadow-lg text-white`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-1">{rating.emoji}</span>
                      <span className={`text-xs text-center leading-tight ${
                        selectedRating === rating.value 
                          ? 'text-white font-medium' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {rating.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twoja recenzja (opcjonalnie):
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Napisz co myślisz o tym wideo..."
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-DarkblackBorder text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primaryBlue dark:focus:ring-primaryGreen focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {reviewText.length}/500 znaków
                  </p>
                  {reviewText.length > 450 && (
                    <p className="text-xs text-orange-500">
                      Zostało {500 - reviewText.length} znaków
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedRating || isSubmitting}
                  className="flex-1 px-6 py-3 bg-primaryBlue dark:bg-primaryGreen hover:bg-secondaryBlue dark:hover:bg-secondaryGreen disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Wyślij recenzję
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
