import { useEffect, useRef, useState } from "react";
import { Wrench, Bot, Cable, Settings } from "lucide-react";
import Heading2 from '../../../components/typography/Heading2';
import SectionHeading from '../../../components/typography/SectionHeading';
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <Wrench className="text-3xl" />,
    title: "Jak zdać egzamin na ponad 90%?",
    description: "Poznaj konkretne strategie, które pomogły naszym uczniom osiągnąć topowe wyniki z matury i egzaminów zawodowych.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Bot className="text-3xl" />,
    title: "5 najczęstszych błędów uczniów podczas nauki",
    description: "Nie trać czasu na to, co nie działa. Sprawdź, co robi większość uczniów źle - i jak możesz tego uniknąć.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Cable className="text-3xl" />,
    title: "Jak radzić sobie ze stresem przed egzaminem?",
    description: "Egzamin to nie tylko wiedza, ale też psychika. Podpowiadamy, jak zachować spokój i skupienie w kluczowym momencie.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Settings className="text-3xl" />,
    title: "Jak zaplanować naukę do egzaminu w 4 tygodnie?",
    description: "Masz mało czasu? Ten wpis pokaże Ci, jak rozłożyć materiał i wykorzystać ostatni miesiąc na maksymalne efekty.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
];

const FeatureCard = ({ icon, title, description, link, href }) => (
  <div className="flex flex-col gap-2">
    {icon}
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-blue-100 dark:text-blue-200 text-sm">{description}</p>
    <a href={href} className="text-green-300 text-sm mt-1 inline-block" aria-label={`Czytaj więcej: ${title}`}>
      {link}
    </a>
  </div>
);

export default function StripeHero() {
  const [startTyping, setStartTyping] = useState(false);
  const [displayedCode, setDisplayedCode] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const codeLines = [
    "const kurs = new PasjonaciIT({",
    "cel: 'egzamin ',",
    "poziom: 'od zera',",
    "wynik: '90+',",
    "tryb: 'bez stresu'",
    "});",
    "kurs.start();"
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    if (ref.current) observer.observe(ref.current);
  }, []);

  useEffect(() => {
    if (!startTyping || lineIndex >= codeLines.length) return;

    const currentLine = codeLines[lineIndex];

    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + currentLine[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 40);
      return () => clearTimeout(timeout);
    } else if (charIndex === currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + "\n");
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex, startTyping]);

  return (
    <div className="bg-gradient-to-br from-darkBlue to-indigo-900 dark:from-DarkblackBorder dark:to-DarkblackText text-white w-full mt-24 pt-12">
      <div className="flex flex-col md:flex-row justify-between max-w-[1100px] px-4 mx-auto items-center gap-12">
        <div className="w-full md:mb-12">
          <SectionHeading textColor="text-primaryGreen">Chcesz wiedzieć więcej?</SectionHeading>
          <Heading2 margin="mb-2" textColor="text-white">
            Sprawdź naszego bloga i ucz się jeszcze skuteczniej
          </Heading2>
          <p className="text-blue-100 dark:text-blue-200 mb-6 w-full max-w-[500px]">
            Na blogu PasjonaciIT dzielimy się poradami, analizami zadań egzaminacyjnych, wskazówkami do matury i egzaminów zawodowych oraz konkretnymi trikami z Pythona, Excela i Accessa.
            Jeśli chcesz być o krok przed innymi - to miejsce dla Ciebie.
          </p>
          <button
            className="bg-primaryGreen dark:text-black hover:-translate-y-1 transition-discrete duration-300 cursor-pointer text-white font-semibold px-4 py-2 rounded-md"
            onClick={() => navigate("/blog")}
          >
            Zobacz blogi »
          </button>
        </div>

        <div
          ref={ref}
          className="bg-blue-950 dark:bg-gray-800 text-green-200 h-72 font-mono w-full text-sm rounded-lg shadow-lg mt-8 md:mt-0 md:w-1/2 p-4 overflow-auto mb-12 md:mb-0"
        >
          <pre className="whitespace-pre-wrap">{displayedCode}</pre>
        </div>
      </div>

      <div className="bg-primaryBlue dark:bg-DarkblackText text-white py-12 w-full flex justify-center">
        <div className="max-w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
