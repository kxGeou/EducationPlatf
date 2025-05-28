import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../util/supabaseClient';

export default function CourseCard({ course }) {
  const { user, loading } = useAuth();
  const [alreadyBought, setAlreadyBought] = useState(false);

  useEffect(() => {
    const checkIfBought = async () => {
      if (!user) return; // nie sprawdzamy, jeśli user niezalogowany
      const { data, error } = await supabase
        .from('users')
        .select('purchased_courses')
        .eq('id', user.id)
        .single();

      if (!error && data?.purchased_courses?.includes(course.id)) {
        setAlreadyBought(true);
      }
    };

    checkIfBought();
  }, [user, course.id]);

  const handleBuy = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Musisz być zalogowany, żeby kupić kurs.');
      return;
    }

    const priceCents = course.price_cents * 100;
    if (!priceCents || isNaN(priceCents) || priceCents < 200) {
      alert('Cena kursu musi wynosić co najmniej 2 zł.');
      return;
    }

    const res = await fetch('https://gkvjdemszxjmtxvxlnmr.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        course_id: course.id,
        course_title: course.title,
        price_cents: priceCents,
        success_url_base: window.location.origin,
      }),
    });

    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      alert('Coś poszło nie tak. Spróbuj ponownie.');
      console.error('Error from checkout session:', data);
    }
  };

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div className="border rounded-xl p-4 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold">{course.title}</h2>
        <p className="text-gray-600">{course.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          {(course.price_cents ? course.price_cents : course.price) + ' zł'}
        </span>
        {user && alreadyBought ? (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
          >
            Kurs kupiony
          </button>
        ) : (
          <button
            onClick={handleBuy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kup teraz
          </button>
        )}
      </div>
    </div>
  );
}
