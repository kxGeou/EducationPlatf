import { useState, useEffect } from 'react';
import { useEbookStore } from '../../store/ebookStore';
import EbookDetailModal from './components/EbookDetailModal';
import EbookGridItem from './components/EbookGridItem';
import Loading from '../../components/systemLayouts/Loading';
import PageLayout from '../../components/systemLayouts/PageLayout';
import { BookOpen } from 'lucide-react';

export default function EbooksListPage({ isDark, setIsDark }) {
  const { ebooks, loading, fetchAllEbooks } = useEbookStore();
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllEbooks();
  }, [fetchAllEbooks]);

  const handleEbookClick = (ebook) => {
    setSelectedEbook(ebook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEbook(null);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <PageLayout isDark={isDark} setIsDark={setIsDark}>
      <div className="w-full py-8 mt-28">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ebooki
            </h1>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Przeglądaj naszą kolekcję ebooków i wybierz ten, który najlepiej odpowiada Twoim potrzebom
          </p>
        </div>

        {/* Ebooks Grid */}
        {ebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ebooks.map((ebook) => (
              <EbookGridItem
                key={ebook.id}
                ebook={ebook}
                onClick={() => handleEbookClick(ebook)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Brak dostępnych ebooków
            </p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedEbook && (
          <EbookDetailModal
            ebook={selectedEbook}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            isDark={isDark}
          />
        )}
      </div>
    </PageLayout>
  );
}

