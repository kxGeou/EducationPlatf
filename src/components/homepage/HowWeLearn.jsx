import Fiszki from '../../assets/ikony/fiszki.svg';
import Test from '../../assets/ikony/test.svg';
import Video from '../../assets/ikony/video.svg';
import Zadan from '../../assets/ikony/zadan.svg';

function HowWeLearn() {
  const learnData = [
    {
      img: Video,
      title: "Nagrania wideo",
      description: "Krótkie, konkretne lekcje z informatyki krok po kroku – tłumaczymy, pokazujemy i rozwiązujemy zadania maturalne.",
      alt: "Ikona wideo – nagrania do nauki informatyki"
    },
    {
      img: Zadan,
      title: "Zadania i testy",
      description: "Zestawy ćwiczeń oraz zadania z matury i egzaminów INF.02 i INF.03 – z pełnymi rozwiązaniami i komentarzami.",
      alt: "Ikona zeszytu – zadania i testy z informatyki"
    },
    {
      img: Test,
      title: "Materiały tekstowe",
      description: "Każde zagadnienie z informatyki opisane prostym językiem. Nie musisz robić notatek – wszystko masz gotowe.",
      alt: "Ikona dokumentu – materiały tekstowe z informatyki"
    },
    {
      img: Fiszki,
      title: "Fiszki i powtórki",
      description: "Szybka nauka i utrwalanie kluczowych pojęć przed maturą i egzaminami INF.02 / INF.03.",
      alt: "Ikona fiszek – powtórki do matury z informatyki"
    },
  ];

  return (
    <section
      className="px-4 "
      aria-label="Jak uczymy się informatyki – metody nauki"
    >
      <ul className="grid grid-cols-1 grid-rows-4 md:grid-rows-2 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 gap-6">
        {learnData.map((l, index) => (
          <li
            key={index}
            className="border border-gray-100 bg-white  dark:border-DarkblackBorder dark:bg-DarkblackBorder dark:text-white p-6 flex flex-col items-start justify-start shadow-lg rounded-[12px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <img
              src={l.img}
              alt={l.alt}
              className="w-12"

            />
            <h3 className="text-lg font-semibold mt-3">{l.title}</h3>
            <p className="opacity-75 font-light mt-2">{l.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HowWeLearn;
