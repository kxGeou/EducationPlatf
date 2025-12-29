import { Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

function Review({ user, description, rating }) {
  const maxStars = 5;

  return (
    <div className="w-full h-full shadow-lg rounded-lg p-5 flex flex-col gap-3 dark:text-white dark:bg-DarkblackText bg-white transition overflow-hidden">
      <div className="flex gap-3 items-center">
        <span className="w-10 h-10 bg-darkBlue rounded-md dark:bg-primaryGreen shrink-0"></span>
        <div className="flex flex-col">
          <p className="text-base font-semibold break-words">{user}</p>
          <div className="flex gap-[2px] mt-1">
            {Array.from({ length: maxStars }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={`transition-all ${
                  i < rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-1 text-sm leading-relaxed break-words text-ellipsis overflow-hidden italic">
        {description}
      </p>
    </div>
  );
}

export default function Reviews() {
  const [displayedCount, setDisplayedCount] = useState(3);
  
  const reviews = [
    {
      user: "Franek",
      rating: 5,
      description: "Zacząłem kurs 3 miesiące przed maturą, totalnie od zera. Serio, nie ogarniałem ani Excela, ani Pythona. Dzięki lekcjom wszystko było jasno wytłumaczone, krok po kroku. Matura poszła mi świetnie - 86%! Jestem mega wdzięczny, bo bez tego kursu bym się pogubił.",
    },
    {
      user: "Zofia ",
      rating: 5,
      description: "W szkole nic nie rozumiałam z inforatyki, a tutaj wszystko w końcu miało sens. Kurs do matury to złoto!",
    },
    {
      user: "Robert",
      rating: 5,
      description: "Mega się cieszę, że trafiłem na ten kurs. Wszystko, co potrzebne na egzamin, było w jednym miejscu. Szczerze polecam!",
    },
    {
      user: "Anna",
      rating: 5,
      description: "Kurs super przygotowany, wszystkie materiały są na miejscu. Uczyłem się systematycznie i matura poszła mi bardzo dobrze. Polecam każdemu!",
    },
    {
      user: "Marek",
      rating: 5,
      description: "Najlepszy kurs online jaki miałem. Wszystko wytłumaczone w przystępny sposób, dużo praktycznych przykładów. Matura zdana z wynikiem 82%!",
    },
    {
      user: "Kasia",
      rating: 5,
      description: "Zaczynałam od zera i teraz rozumiem informatyke. Lekcje są bardzo pomocne, a zadania świetnie przygotowane. Na pewno polecę znajomym!",
    },
    {
      user: "Tomek",
      rating: 5,
      description: "Przygotowywałem się do egzaminu INF.02 i ten kurs był idealny. Wszystkie zagadnienia pokryte, duża ilość praktycznych zadań. Egzamin zdany!",
    },
    {
      user: "Magda",
      rating: 5,
      description: "Bardzo polecam! Kurs jest bardzo dobrze zorganizowany, wszystko jasno wytłumaczone. Dzięki niemu zdałam maturę z informatyki na 88%.",
    },
    {
      user: "Piotr",
      rating: 5,
      description: "Świetny kurs, który pomógł mi przygotować się do matury. Materiały są zawsze aktualne, a sposób prowadzenia lekcji bardzo przystępny. Polecam!",
    },
  ];

  const displayedReviews = reviews.slice(0, displayedCount);
  const hasMore = displayedCount < reviews.length;

  const handleLoadMore = () => {
    setDisplayedCount(prev => Math.min(prev + 3, reviews.length));
  };

  return (
    <section className="px-4 flex flex-col justify-start items-center mt-26 max-w-[1100px]">
      <div className="w-full">
        <h2 className="flex gap-2 items-center opacity-50 dark:opacity-100 mb-6 dark:text-white/75">
          <Star size={17} className="dark:text-white/75" />
          Opinie
        </h2>
      </div>
      <motion.ul
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {displayedReviews.map((r, index) => (
          <motion.li
            key={index}
            className="w-full h-full"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.5,
                  ease: "easeOut",
                },
              },
            }}
          >
            <Review
              user={r.user}
              description={r.description}
              rating={r.rating}
            />
          </motion.li>
        ))}
      </motion.ul>

      {hasMore && (
        <button 
          onClick={handleLoadMore}
          className="cursor-pointer w-full bg-darkBlue dark:text-blackText dark:bg-primaryGreen hover:-translate-y-1 text-white py-3 font-semibold rounded-md mt-8 max-w-[50%] transition-all md:mt-12 duration-300 shadow-lg hover:shadow-xl"
        >
          Więcej opinii...
        </button>
      )}
    </section>
  );
}
