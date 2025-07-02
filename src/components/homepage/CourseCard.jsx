import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../util/supabaseClient';

export default function CourseCard({ course }) {
  const { user, loading } = useAuth();
  const [alreadyBought, setAlreadyBought] = useState(false);

  useEffect(() => {
    const checkIfBought = async () => {
      if (!user) return; 
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
    <div className="shadow-lg transiton-all duration-400 hover:shadow-xl hover:scale-102 flex flex-col items-start pb-4 cursor-pointer rounded-[12px]"
            onClick={handleBuy}
    >
       <img src="react2.png" alt="mockup image" className='max-h-50 w-full rounded-t-[12px] mb-3'/>
      <div className='px-4 flex flex-col'>
        <h2 className="text-xl font-semibold text-blackText">{course.title}</h2>
        <p className="text-blackText/50 text-sm">{course.description}</p>
      </div>
      <div className="flex flex-col items-start gap-1 w-full px-4 mt-3">
        <span className="flex gap-2 items-center">
          <p className='text-lg text-blackText'>{(course.price_cents ? course.price_cents : course.price) + ' zł'}</p>
          <p className='text-md text-blackText/50 line-through'>220 zł</p>
        </span>
        {user && alreadyBought ? (
          <span
            disabled
            className="text-green-300 text-sm"
          >
            Posiadasz ten kurs
          </span>
        ) : (
          <span
            className="text-red-300 text-sm transition-all rounded-[12px]"
          >
            Nie posiadasz tego kursu
          </span>
        )}
      </div>
    </div>
  );
}
