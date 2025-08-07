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

      <p className="mt-1 text-sm leading-relaxed break-words text-ellipsis overflow-hidden">
        {description}
      </p>
    </div>
  );
}

export default function Reviews() {
  const reviews = [
    {
      user: "New User 3213",
      rating: 3,
      description: "Bardzo fajna aplikacja. Łatwa w obsłudze i szybka.",
    },
    {
      user: "TechLover 88",
      rating: 5,
      description: "Świetne doświadczenie! Na pewno będę polecać innym.",
    },
    {
      user: "Client 9000",
      rating: 4,
      description: "Wszystko działa jak należy, ale mogłoby być ciut szybciej.Wszystko działa jak należy, ale mogłoby być ciut szybciej.Wszystko działa jak należy, ale mogłoby być ciut szybciej./.",
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

      <button className="cursor-pointer w-full bg-darkBlue dark:text-blackText dark:bg-primaryGreen hover:scale-105 text-white py-2 rounded-[12px] mt-8 max-w-[50%] transition-all md:mt-12 duration-300">
        Więcej opinii...
      </button>
    </section>
  );
}
