import { BookOpen, FileText, Image as ImageIcon } from 'lucide-react';

export default function EbookGridItem({ ebook, onClick }) {
  // Mock data - w przyszłości można pobierać z bazy
  const mockPages = 150;
  const mockScreenshots = [
    'https://via.placeholder.com/400x600/4A90E2/ffffff?text=Ebook+Preview+1',
    'https://via.placeholder.com/400x600/50C878/ffffff?text=Ebook+Preview+2',
  ];
  const mockTopics = ['Algorytmy', 'Struktury danych', 'Programowanie', 'Bazy danych'];

  const priceInZloty = ebook.price_cents.toFixed(2);

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-DarkblackBorder rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-DarkblackText hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-DarkblackText">
        {ebook.image_url ? (
          <img
            src={ebook.image_url}
            alt={ebook.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primaryBlue dark:bg-primaryGreen text-white px-2 py-1 rounded-md text-sm font-semibold">
          {priceInZloty} zł
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {ebook.title}
        </h3>
        
        {ebook.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {ebook.description}
          </p>
        )}

        {/* Mock Info */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{mockPages} stron</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{mockTopics.length} tematów</span>
          </div>
        </div>

        {/* Topics Preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {mockTopics.slice(0, 2).map((topic, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primaryBlue/10 dark:bg-primaryGreen/10 text-primaryBlue dark:text-primaryGreen rounded text-xs font-medium"
            >
              {topic}
            </span>
          ))}
          {mockTopics.length > 2 && (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
              +{mockTopics.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

