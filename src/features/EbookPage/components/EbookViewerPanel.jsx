import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useState } from 'react';

function EbookViewerPanel({ ebook }) {
  const [pdfError, setPdfError] = useState(false);
  
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

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
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ height: '100%', width: '100%' }}>
              <Viewer
                fileUrl={ebook.pdf_url}
                plugins={[defaultLayoutPluginInstance]}
                onLoadError={(error) => {
                  console.error('PDF load error:', error);
                  setPdfError(true);
                }}
              />
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
}

export default EbookViewerPanel;



