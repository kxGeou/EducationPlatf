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

export default function EbookPage({ isDark, setIsDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("info");
  const [showSidebar, setShowSidebar] = useState(true);

  const { user, initialized } = useAuthStore();
  const { fetchEbookById, currentEbook, loading, error, accessDenied } = useEbookStore();

  useEffect(() => {
    if (initialized) {
      fetchEbookById(id);
    }
  }, [initialized, id]);

  if (!initialized || loading) return <Loading />;
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

        <main className={`flex flex-col w-full items-start min-h-[98vh] rounded-[12px] p-2 ${activeSection === "ebook" ? "bg-white dark:bg-DarkblackText" : "bg-gray-100 dark:bg-DarkblackBorder"}`}>

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






