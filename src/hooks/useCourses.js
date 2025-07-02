import { useState, useEffect } from "react";
import supabase from "../util/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useCourses() {
  const { purchasedCourses } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!purchasedCourses || purchasedCourses.length === 0) {
      setCourses([]);
      return;
    }

    setLoading(true);
    supabase
      .from("courses")
      .select("id, title, description, section_title, section_description, difficulty, time_to_complete")
      .in("id", purchasedCourses)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setCourses([]);
        } else {
          setCourses(data);
        }
      })
      .finally(() => setLoading(false));
  }, [purchasedCourses]);

  return { courses, loading, error };
}
