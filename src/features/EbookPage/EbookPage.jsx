import Error from '../../components/systemLayouts/Error';
import Loading from '../../components/systemLayouts/Loading';
import EbookSidebar from "./components/EbookSidebar";
import EbookInfoPanel from "./components/EbookInfoPanel";
import EbookViewerPanel from "./components/EbookViewerPanel";
import EbookTasksPanel from "./components/EbookTasksPanel";
import { useEbookStore } from '../../store/ebookStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen } from 'lucide-react';

export default function EbookPage({ isDark, setIsDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("info");
  const [showSidebar, setShowSidebar] = useState(true);
  const [userEbooks, setUserEbooks] = useState([]);
  const [showEbookSelector, setShowEbookSelector] = useState(false);

  const { user, initialized, purchasedEbooks } = useAuthStore();
  const { fetchEbookById, currentEbook, loading, error, accessDenied, fetchUserEbooks } = useEbookStore();

  // Zabezpieczenia przed narzędziami developerskimi - aktywna gdy wyświetlany jest ebook lub info
  useEffect(() => {
    if (activeSection !== "ebook" && activeSection !== "info") return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
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

      // Blokuj wszystkie Ctrl+Shift kombinacje
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Dodaj event listenery z najwyższym priorytetem (capture phase)
    document.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

    // Blokuj również na body i document element
    document.body.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });
    document.documentElement.addEventListener('contextmenu', handleContextMenu, { capture: true, passive: false });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.body.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.documentElement.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [activeSection]);

  useEffect(() => {
    if (!initialized) return;

    // Sprawdź czy użytkownik ma więcej niż jeden ebook
    if (purchasedEbooks && purchasedEbooks.length > 1) {
      // Pobierz listę ebooków użytkownika
      fetchUserEbooks().then(ebooks => {
        if (ebooks.length > 0) {
          setUserEbooks(ebooks);
          // ZAWSZE pokaż selektor gdy użytkownik ma więcej niż jeden ebook
          // NIE ładuj ebooka z ID - użytkownik MUSI wybrać z selektora
          setShowEbookSelector(true);
        } else {
          // Jeśli fetch zwrócił 0 ebooków, może być błąd
          console.warn('fetchUserEbooks returned 0 ebooks but purchasedEbooks has', purchasedEbooks.length);
          setShowEbookSelector(false);
        }
      }).catch(err => {
        console.error('Error fetching user ebooks:', err);
        setShowEbookSelector(false);
      });
    } else if (purchasedEbooks && purchasedEbooks.length === 1 && id) {
      // Jeśli użytkownik ma tylko jeden ebook i jest ID, załaduj ebook
      setShowEbookSelector(false);
      fetchEbookById(id);
    } else if (purchasedEbooks && purchasedEbooks.length === 1 && !id) {
      // Jeśli użytkownik ma tylko jeden ebook i nie ma ID, załaduj ten jeden ebook
      setShowEbookSelector(false);
      fetchEbookById(purchasedEbooks[0]);
    } else if (id) {
      // Fallback - jeśli jest ID, spróbuj załadować
      setShowEbookSelector(false);
      fetchEbookById(id);
    }
  }, [initialized, id, purchasedEbooks, fetchEbookById, fetchUserEbooks]);

  const handleEbookSelect = (ebookId) => {
    navigate(`/ebook/${ebookId}`);
    setShowEbookSelector(false);
    fetchEbookById(ebookId);
  };

  if (!initialized || loading) return <Loading />;

  // Jeśli użytkownik ma więcej niż jeden ebook, ZAWSZE pokaż selektor
  // Nie renderuj ebooka bezpośrednio - użytkownik MUSI wybrać z selektora
  if (purchasedEbooks && purchasedEbooks.length > 1) {
    // Jeśli ebooki jeszcze się ładują, pokaż loading
    if (userEbooks.length === 0) {
      return <Loading />;
    }
    // ZAWSZE pokaż selektor gdy użytkownik ma więcej niż jeden ebook
    return (
      <div
        data-theme={isDark ? "dark" : "light"}
        className="flex justify-center bg-slate-300 dark:bg-blackText dark:text-white min-h-screen pt-28"
      >
        <div className="max-w-6xl w-full p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primaryBlue dark:text-primaryGreen" />
              Wybierz ebook do wyświetlenia
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Masz dostęp do kilku ebooków. Wybierz który chcesz przeglądać.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userEbooks.length > 0 ? userEbooks.map((ebook) => (
              <div
                key={ebook.id}
                onClick={() => handleEbookSelect(ebook.id)}
                className={`bg-white dark:bg-DarkblackBorder rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 ${
                  id === ebook.id
                    ? 'border-primaryBlue dark:border-primaryGreen shadow-lg'
                    : 'border-gray-200 dark:border-DarkblackText hover:-translate-y-1'
                }`}
              >
                {ebook.image_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-DarkblackText">
                    <img
                      src={ebook.image_url}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {ebook.title}
                  </h3>
                  {ebook.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {ebook.description}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                Ładowanie ebooków...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik ma tylko jeden ebook lub nie ma ebooków, sprawdź dostęp
  if (accessDenied || error || !currentEbook) return <Error />;

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className=" flex justify-center bg-slate-300 dark:bg-blackText dark:text-white min-h-screen"
    >
      <div className="flex flex-col md:flex-row h-full gap-1 w-full max-w-[1900px] min-h-screen p-1">
        <EbookSidebar
          user={user}
          ebook={currentEbook}
          isDark={isDark}
          setIsDark={setIsDark}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />

        <main 
          className={`flex flex-col w-full items-start min-h-[98vh] rounded-[12px] p-2 ${activeSection === "ebook" ? "bg-white dark:bg-DarkblackText" : "bg-gray-100 dark:bg-DarkblackBorder"}`}
          onContextMenu={(e) => {
            if (activeSection === "ebook" || activeSection === "info") {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }}
          onDragStart={(e) => {
            if (activeSection === "ebook" || activeSection === "info") {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }}
          onKeyDown={(e) => {
            if (activeSection === "ebook" || activeSection === "info") {
              if (e.key === 'F12' || 
                  ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K', 'E'].includes(e.key.toUpperCase())) ||
                  ((e.ctrlKey || e.metaKey) && ['U', 'S', 'P'].includes(e.key.toUpperCase()))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }
          }}
          style={(activeSection === "ebook" || activeSection === "info") ? { 
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          } : {}}
        >

          {activeSection === "info" && (
            <EbookInfoPanel ebook={currentEbook} />
          )}
          {activeSection === "ebook" && (
            <EbookViewerPanel ebook={currentEbook} />
          )}
          {activeSection === "tasks" && (
            <EbookTasksPanel ebookId={currentEbook.id} />
          )}
        </main>
      </div>
    </div>
  );
}













