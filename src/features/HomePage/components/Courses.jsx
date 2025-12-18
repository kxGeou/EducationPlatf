import { useEffect, useState } from "react";
import supabase from '../../../util/supabaseClient';
// DEV: CourseCard import - odkomentuj na development, zakomentuj na main
// import CourseCard from "./CourseCard";
import EbookCard from "./EbookCard";
import { ShoppingBag, BookOpen } from "lucide-react";
import { useAuthStore } from '../../../store/authStore';

export default function Courses() {
  // DEV: Courses state - odkomentuj na development, zakomentuj na main
  // const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, canPurchaseCourses } = useAuthStore();

  useEffect(() => {
    // DEV: fetchCourses - odkomentuj na development, zakomentuj na main
    // async function fetchCourses() {
    //   try {
    //     setLoading(true);
    //     const { data, error } = await supabase
    //       .from("courses_template")
    //       .select("id, title, description, price_cents, image_url");

    //     if (error) throw error;
    //     setCourses(data || []);
    //   } catch (err) {
    //     console.error("Failed to fetch courses:", err.message);
    //     setError(err.message || "Wystąpił błąd podczas pobierania kursów.");
    //   } finally {
    //     setLoading(false);
    //   }
    // }

    // fetchCourses();

    // DEV: fetchEbooks - odkomentuj na development, zakomentuj na main
    async function fetchEbooks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("ebooks")
          .select("id, title, description, price_cents, image_url, course_id")
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEbooks(data || []);
      } catch (err) {
        console.error("Failed to fetch ebooks:", err.message);
        setError(err.message || "Wystąpił błąd podczas pobierania ebooków.");
      } finally {
        setLoading(false);
      }
    }

    fetchEbooks();
  }, []);

  return (
    <div className="flex flex-col w-full px-4 mt-24">
      {/* DEV: Courses header - odkomentuj na development, zakomentuj na main */}
      {/* <h2 className="mb-6 flex gap-2 items-center text-gray-400 dark:text-white/50 text-lg font-normal">
        <ShoppingBag size={18} />
        Kursy do zakupu
      </h2> */}
      {/* DEV: END Courses header */}
      
      {/* DEV: Ebooks header - odkomentuj na development, zakomentuj na main */}
      <h2 className="mb-6 flex gap-2 items-center text-gray-400 dark:text-white/50 text-lg font-normal">
        <BookOpen size={18} />
        Ebooki do zakupu
      </h2>
      {/* DEV: END Ebooks header */}

      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-12">
        {loading
          ? Array.from({ length: ebooks.length || 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-64 bg-gray-100 dark:bg-gray-500 rounded-xl shadow animate-pulse"
              >
                <div className="h-full w-full p-4 space-y-4">
                  <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-400 rounded" />
                  <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-400 rounded" />
                  <div className="w-full h-24 bg-gray-300 dark:bg-gray-400 rounded mt-4" />
                </div>
              </div>
            ))
          : (
            // DEV: Courses mapping - odkomentuj na development, zakomentuj na main
            // courses.map((course) => (
            //   <CourseCard key={course.id} course={course} />
            // ))
            // DEV: END Courses mapping
            // DEV: Ebooks mapping - odkomentuj na development, zakomentuj na main
            ebooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))
            // DEV: END Ebooks mapping
          )}
      </div>

      {!loading && !error && ebooks.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          Brak dostępnych ebooków. 🚀
        </p>
      )}
    </div>
  );
}
