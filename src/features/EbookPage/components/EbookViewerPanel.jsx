import { useState } from 'react';

function EbookViewerPanel({ ebook }) {
  const [pdfError, setPdfError] = useState(false);

  if (!ebook?.pdf_url) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Brak pliku PDF do wyświetlenia
          </p>
        </div>
      </div>
    );
  }

  // Dodajemy parametry do URL aby ukryć toolbar i wyłączyć pobieranie/drukowanie
  const pdfUrl = `${ebook.pdf_url}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-DarkblackBorder">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {ebook.title}
        </h2>
      </div>
      
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {pdfError ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-lg text-red-600 dark:text-red-400 mb-4">
                Błąd podczas ładowania PDF
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sprawdź czy plik istnieje i czy masz do niego dostęp
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={ebook.title}
            onError={() => {
              console.error('PDF load error');
              setPdfError(true);
            }}
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  );
}

export default EbookViewerPanel;



