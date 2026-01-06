import { useState, useEffect } from 'react';
import { X, BookOpen, FileText, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

export default function EbookDetailModal({ ebook, isOpen, onClose, isDark }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);

  // Blokuj scroll na stronie gdy modal jest otwarty
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Mock data - w przyszłości można pobierać z bazy
  const mockPages = 150;
  const mockScreenshots = [
    'https://via.placeholder.com/800x1200/4A90E2/ffffff?text=Ebook+Preview+1',
    'https://via.placeholder.com/800x1200/50C878/ffffff?text=Ebook+Preview+2',
    'https://via.placeholder.com/800x1200/F39C12/ffffff?text=Ebook+Preview+3',
  ];
  const mockTopics = [
    'Algorytmy i struktury danych',
    'Programowanie obiektowe',
    'Bazy danych SQL',
    'Wzorce projektowe',
    'Testowanie oprogramowania',
    'Architektura aplikacji',
  ];

  const priceInZloty = ebook.price_cents.toFixed(2);

  if (!isOpen || !ebook) return null;

  const handleBuyClick = () => {
    // Jeśli użytkownik nie jest zalogowany, przekieruj do logowania z returnTo
    if (!user) {
      let returnTo = '/ebooks';
      if (ebook.course_id) {
        returnTo = `/course/${ebook.course_id}?section=shop&tab=ebooks`;
      }
      onClose();
      navigate(`/authentication?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    // Jeśli użytkownik jest zalogowany, przekieruj do sklepu
    if (ebook.course_id) {
      navigate(`/course/${ebook.course_id}?section=shop&tab=ebooks`);
    } else {
      // Fallback - przekieruj do strony głównej sklepu
      navigate('/ebooks');
    }
    onClose();
  };

  const handlePreviousScreenshot = (e) => {
    e.stopPropagation();
    setCurrentScreenshotIndex((prev) => 
      prev === 0 ? mockScreenshots.length - 1 : prev - 1
    );
  };

  const handleNextScreenshot = (e) => {
    e.stopPropagation();
    setCurrentScreenshotIndex((prev) => 
      prev === mockScreenshots.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-DarkblackBorder rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/90 dark:bg-DarkblackText/90 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-lg"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" />
        </button>

        <div className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Side - Screenshots */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-DarkblackText rounded-xl overflow-hidden">
                <img
                  src={mockScreenshots[currentScreenshotIndex]}
                  alt={`Preview ${currentScreenshotIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Navigation Arrows */}
                {mockScreenshots.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousScreenshot}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextScreenshot}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Screenshot Indicators */}
                {mockScreenshots.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    {mockScreenshots.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentScreenshotIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentScreenshotIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Screenshot Thumbnails */}
              {mockScreenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mockScreenshots.map((screenshot, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreenshotIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        index === currentScreenshotIndex
                          ? 'border-primaryBlue dark:border-primaryGreen'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={screenshot}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {ebook.title}
                </h2>
                
                {ebook.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {ebook.description}
                  </p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-DarkblackText rounded-xl">
                  <FileText className="w-5 h-5 text-primaryBlue dark:text-primaryGreen flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Stron</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {mockPages}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-DarkblackText rounded-xl">
                  <BookOpen className="w-5 h-5 text-primaryBlue dark:text-primaryGreen flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tematy</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {mockTopics.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Tematy w ebooku:
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {mockTopics.slice(0, 4).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded-xl text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                  {mockTopics.length > 4 && (
                    <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                      +{mockTopics.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Buy Button */}
              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-DarkblackText">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cena</div>
                    <div className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen">
                      {priceInZloty} zł
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleBuyClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primaryBlue dark:bg-primaryGreen text-white font-semibold text-base rounded-xl hover:shadow-xl hover:-translate-y-1 duration-300 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {user ? 'Kup ebook' : 'Zaloguj się, aby kupić'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

