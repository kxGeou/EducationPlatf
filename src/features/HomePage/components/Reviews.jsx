import { Star } from "lucide-react";

function Review({ user, description, rating }) {
  const maxStars = 5;

  return (
    <div className="w-full h-full shadow-lg rounded-[12px] p-5 flex flex-col gap-3 dark:text-white dark:bg-DarkblackText bg-white transition overflow-hidden">
      <div className="flex gap-3 items-center">
        <span className="w-12 h-12 bg-darkBlue rounded-full dark:bg-primaryGreen shrink-0"></span>
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
  ];

  return (
    <section className="px-4 flex flex-col justify-start items-center mt-26 max-w-[1100px]">
      <div className="w-full">
        <h2 className="flex gap-2 items-center opacity-50 dark:opacity-100 mb-6 dark:text-white/75">
          <Star size={17} className="dark:text-white/75" />
          Opinie
        </h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {reviews.map((r, index) => (
          <li key={index} className="w-full h-full">
            <Review
              user={r.user}
              description={r.description}
              rating={r.rating}
            />
          </li>
        ))}
      </ul>

      <button className="cursor-pointer w-full bg-darkBlue dark:text-blackText dark:bg-primaryGreen hover:-translate-y-1 text-white py-3 font-semibold rounded-[12px] mt-8 max-w-[50%] transition-all md:mt-12 duration-300 shadow-lg hover:shadow-xl">
        Więcej opinii...
      </button>
    </section>
  );
}
