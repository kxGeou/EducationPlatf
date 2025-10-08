import { useEffect, useState } from "react";
import supabase from '../../../util/supabaseClient';
import CourseCard from "./CourseCard";
import { ShoppingBag } from "lucide-react";
import { useAuthStore } from '../../../store/authStore';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, canPurchaseCourses } = useAuthStore();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses_template")
          .select("id, title, description, price_cents, image_url");

        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err.message);
        setError(err.message || "Wystąpił błąd podczas pobierania kursów.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col w-full px-4 mt-24">
      <h2 className="mb-6 flex gap-2 items-center text-gray-400 dark:text-white/50 text-lg font-normal">
        <ShoppingBag size={18} />
        Kursy do zakupu
      </h2>

      {error && (
        <div className="text-red-500 bg-red-100 border border-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-12">
        {loading
          ? Array.from({ length: courses.length || 4 }).map((_, i) => (
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
          : courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
      </div>

      {!loading && !error && courses.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          Brak dostępnych kursów. 🚀
        </p>
      )}
    </div>
  );
}
