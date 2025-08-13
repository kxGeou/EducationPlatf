import { useEffect, useRef, useState } from "react";
import { Wrench, Bot, Cable, Settings } from "lucide-react";
import Heading2 from "../typography/Heading2";
import SectionHeading from "../typography/SectionHeading";
const features = [
  {
    icon: <Wrench className="text-3xl mb-2"></Wrench>,
    title: "Jak zdać egzamin na ponad 90%?",
    description: "Poznaj konkretne strategie, które pomogły naszym uczniom osiągnąć topowe wyniki z matury i egzaminów zawodowych.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Bot className="text-3xl mb-2"></Bot>,
    title: "5 najczęstszych błędów uczniów podczas nauki",
    description: "Nie trać czasu na to, co nie działa. Sprawdź, co robi większość uczniów źle - i jak możesz tego uniknąć.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Cable className="text-3xl mb-2"></Cable>,
    title: "Jak radzić sobie ze stresem przed egzaminem?",
    description: "Egzamin to nie tylko wiedza, ale też psychika. Podpowiadamy, jak zachować spokój i skupienie w kluczowym momencie.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
  {
    icon: <Settings className="text-3xl mb-2"></Settings>,
    title: "Jak zaplanować naukę do egzaminu w 4 tygodnie?",
    description: "Masz mało czasu? Ten wpis pokaże Ci, jak rozłożyć materiał i wykorzystać ostatni miesiąc na maksymalne efekty.",
    link: "Dowiedz się więcej »",
    href: "#",
  },
];

const FeatureCard = ({ icon, title, description, link, href }) => (
  <div className="flex flex-col ">
    {icon}
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-blue-100 text-sm">{description}</p>
    <a href={href} className="text-green-300 text-sm mt-2 inline-block">
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

  const codeLines = [
    "const kurs = new PasjonaciIT({",
    "cel: 'egzamin '",
    "poziom: 'od zera'",
    "wynik: '90+'",
    "tryb: 'bez stresu'",
    "});",

  "  kurs.start();"
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartTyping(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
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
    } else {
      setDisplayedCode((prev) => prev + "\n");
      setLineIndex((prev) => prev + 1);
      setCharIndex(0);
    }
  }, [charIndex, lineIndex, startTyping]);

  return (
    <div ref={ref} className="bg-gradient-to-br from-darkBlue to-indigo-900 dark:from-DarkblackText dark:to-blackText text-white w-full mt-26 pt-12">
      <div className="flex flex-col md:flex-row justify-between max-w-[1100px] px-4 mx-auto items-center gap-12">
        <div className="w-full md:mb-12">
          <SectionHeading textColor={"text-primaryGreen"}>Chcesz wiedzieć więcej?</SectionHeading>
          <Heading2 margin={"mb-2"} textColor={"text-white"}>
            Sprawdź naszego bloga i ucz się jeszcze skuteczniej
          </Heading2>
          <p className="text-blue-100 mb-6 w-full max-w-[500px]">
           Na blogu PasjonaciIT dzielimy się poradami, analizami zadań egzaminacyjnych, wskazówkami do matury i egzaminów zawodowych oraz konkretnymi trikami z Pythona, Excela i Accessa.
Jeśli chcesz być o krok przed innymi - to miejsce dla Ciebie.
          </p>
          <button className="bg-primaryGreen dark:text-blackText hover:bg-secondaryGreen cursor-pointer text-white font-semibold px-4 py-2 rounded-md">
            Zobacz blogi »
          </button>
        </div>

        <div className="bg-blue-950 dark:bg-DarkblackBorder text-green-200 h-72 font-mono w-full text-sm rounded-lg shadow-lg mt-8 md:mt-0 p-4 md:w-1/2  overflow-hidden mb-12 md:mb-0">
          <pre className="whitespace-pre-wrap ">{displayedCode}</pre>
        </div>
      </div>

      <div className="bg-primaryBlue dark:bg-DarkblackBorder text-white py-12  w-full flex justify-center">
        <div className="max-w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}
