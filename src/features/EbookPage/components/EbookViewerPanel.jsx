import { useState, useEffect, useRef } from 'react';

function EbookViewerPanel({ ebook }) {
  const [pdfError, setPdfError] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Zabezpieczenia przed pobieraniem i narzędziami developerskimi
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e) => {
      // F12 - DevTools
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+Shift+I - DevTools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+Shift+J - Console
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+Shift+C - Inspect Element
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+Shift+K - Console (Firefox)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+Shift+E - Network (Edge)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Cmd+Option+I (Mac DevTools)
      if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+U - View Source
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+S - Save
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+P - Print
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+A - Select All
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+C - Copy
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+V - Paste (opcjonalnie, ale blokujemy)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Ctrl+X - Cut
      if ((e.ctrlKey || e.metaKey) && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Blokuj inne potencjalnie niebezpieczne kombinacje
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        // Blokuj wszystkie Ctrl+Shift+[key] kombinacje
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      // Blokuj kombinacje z Alt
      if (e.altKey && (e.key === 'F4' || e.key === 'F12')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handlePrint = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // Dodaj event listenery do całego dokumentu z capture phase
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('beforeprint', handlePrint, true);

    // Dodaj również do window
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('keydown', handleKeyDown, true);

    // Dodaj również do kontenera
    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu, true);
      container.addEventListener('keydown', handleKeyDown, true);
      container.addEventListener('dragstart', handleDragStart, true);
      container.addEventListener('selectstart', handleSelectStart, true);
      container.addEventListener('copy', handleCopy, true);
      container.addEventListener('cut', handleCut, true);
      container.addEventListener('paste', handlePaste, true);
    }

    // Agresywna detekcja otwarcia DevTools przez zmianę rozmiaru okna
    let devtools = {
      open: false,
      orientation: null
    };
    
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        devtools.open = true;
        // Natychmiast ukryj zawartość
        document.body.style.display = 'none';
        // Przekieruj na inną stronę lub odśwież
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 50);
      }
    };

    // Sprawdzaj częściej (co 100ms)
    const checkDevTools = setInterval(detectDevTools, 100);

    // Dodatkowa detekcja przez console - gdy ktoś używa console.log
    let consoleOpen = false;
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    
    console.log = function(...args) {
      consoleOpen = true;
      // Nie blokuj całkowicie, ale można tu dodać logikę
      originalConsoleLog.apply(console, args);
    };

    // Sprawdzaj czy console jest używany intensywnie (może oznaczać DevTools)
    const checkConsoleUsage = setInterval(() => {
      if (consoleOpen) {
        consoleOpen = false;
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(checkDevTools);
      clearInterval(checkConsoleUsage);
      
      // Przywróć oryginalne funkcje console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('beforeprint', handlePrint, true);
      
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu, true);
        container.removeEventListener('keydown', handleKeyDown, true);
        container.removeEventListener('dragstart', handleDragStart, true);
        container.removeEventListener('selectstart', handleSelectStart, true);
        container.removeEventListener('copy', handleCopy, true);
        container.removeEventListener('cut', handleCut, true);
        container.removeEventListener('paste', handlePaste, true);
      }
    };
  }, []);

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
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col"
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto'
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onSelectStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onCopy={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onCut={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onPaste={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onKeyDown={(e) => {
        const isDevToolsShortcut = 
          e.key === 'F12' || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K', 'E'].includes(e.key.toUpperCase())) ||
          ((e.ctrlKey || e.metaKey) && ['U', 'S', 'P'].includes(e.key.toUpperCase()));
        
        if (isDevToolsShortcut) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-DarkblackBorder">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {ebook.title}
        </h2>
      </div>
      
      <div 
        className="flex-1 overflow-hidden relative" 
        style={{ 
          height: 'calc(100vh - 120px)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onSelectStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onKeyDown={(e) => {
          const isDevToolsShortcut = 
            e.key === 'F12' || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K', 'E'].includes(e.key.toUpperCase()));
          
          if (isDevToolsShortcut) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }}
      >
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
          <>
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full"
              title={ebook.title}
              onError={() => {
                console.error('PDF load error');
                setPdfError(true);
              }}
              style={{ 
                border: 'none',
                pointerEvents: 'auto',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              onLoad={() => {
                // Dodatkowe zabezpieczenia dla iframe
                try {
                  const iframe = iframeRef.current;
                  if (iframe && iframe.contentDocument) {
                    iframe.contentDocument.addEventListener('contextmenu', (e) => e.preventDefault());
                    iframe.contentDocument.addEventListener('keydown', (e) => {
                      if (e.key === 'F12' || 
                          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
                          (e.ctrlKey && ['u', 's', 'p', 'a', 'c'].includes(e.key.toLowerCase()))) {
                        e.preventDefault();
                      }
                    });
                  }
                } catch (e) {
                  // Cross-origin - nie można uzyskać dostępu
                }
              }}
            />
            {/* Overlay z watermark - utrudnia screenshoty */}
            <div 
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                background: 'transparent',
                zIndex: 1,
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(0,0,0,0.1) 10px,
                    rgba(0,0,0,0.1) 20px
                  )`,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EbookViewerPanel;



