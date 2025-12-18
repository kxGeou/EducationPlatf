import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import supabase from "../../../util/supabaseClient";

export default function EbookCard({ ebook }) {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(null);

  // Pobierz course_id z ebooka jeśli nie jest już dostępne
  useEffect(() => {
    async function fetchCourseId() {
      if (ebook.course_id) {
        setCourseId(ebook.course_id);
      } else {
        // Jeśli course_id nie jest w props, pobierz z bazy
        try {
          const { data, error } = await supabase
            .from("ebooks")
            .select("course_id")
            .eq("id", ebook.id)
            .single();
          
          if (!error && data?.course_id) {
            setCourseId(data.course_id);
          }
        } catch (err) {
          console.error("Error fetching ebook course_id:", err);
        }
      }
    }
    fetchCourseId();
  }, [ebook]);

  function handleClick() {
    // Jeśli ebook ma course_id, przekieruj do kursu z panelem shop i zakładką ebooków
    if (courseId) {
      navigate(`/course/${courseId}?section=shop&tab=ebooks`);
    } else {
      // Fallback - jeśli nie ma course_id, przekieruj do strony ebooka
      navigate(`/ebook/${ebook.id}`);
    }
  }

  const priceInZloty = ebook.price_cents.toFixed(2);

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col md:flex-row cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white dark:border-DarkblackBorder dark:bg-DarkblackBorder dark:text-white hover:-translate-y-1"
    >
      {ebook.image_url && (
        <img
          src={ebook.image_url}
          alt={`Okładka ebooka ${ebook.title}`}
          className="w-full md:w-72 h-48 md:h-auto object-cover md:rounded-l-2xl rounded-t-2xl md:rounded-t-none"
          loading="lazy"
        />
      )}

      <div className="flex flex-col justify-between flex-1 p-6 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-blackText dark:text-white mb-1">
            {ebook.title}
          </h3>
          {ebook.description && (
            <p className="text-sm text-blackText/60 dark:text-white/70 line-clamp-3">
              {ebook.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Cena:</span>
            <div className="text-2xl font-bold text-primaryBlue dark:text-primaryGreen">
              {priceInZloty} zł
            </div>
          </div>
          <div className="flex items-center gap-2 text-primaryBlue dark:text-primaryGreen">
            <BookOpen size={24} />
            <span className="font-semibold">Zobacz szczegóły</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500 dark:from-blue-700 dark:via-indigo-700 dark:to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}

