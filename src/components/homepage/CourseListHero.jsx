import { BookMarked } from 'lucide-react';
import Fiszki from '../../assets/ikony/fiszki.svg';
import Test from '../../assets/ikony/test.svg';
import Video from '../../assets/ikony/video.svg';
import Zadan from '../../assets/ikony/zadan.svg';

function CourseListHero() {
  const courses = [
    {
      label: "Egzamin i nauka",
      description: "Porady dotyczące matury, egzaminów zawodowych, planowania nauki, strategii zdawania.",
      section: "Egzamin i nauka",
      icon: Fiszki,
    },
    {
      label: "Psychika i motywacja",
      description: "Zarządzanie stresem, organizacja, produktywność, skupienie, budowanie nawyków.",
      section: "Psychika i motywacja",
      icon: Test,
    },
    {
      label: "Informatyka w praktyce",
      description: "Faktyczne umiejętności: triki z Excela, Pythona, Accessa, analizowanie zadań z arkuszy.",
      section: "Informatyka w praktyce",
      icon: Video,
    },
    {
      label: "Po egzaminie",
      description: "Decyzje po maturze i egzaminie: wybór studiów, kierunki IT, co dalej z karierą, alternatywy.",
      section: "Po egzaminie",
      icon: Zadan,
    },
  ];

  return (
    <section className="w-full">
      <p className="flex gap-2 items-center w-full px-4 mb-6 text-gray-500 dark:text-white/60">
        <BookMarked size={18} className="text-gray-500 dark:text-white/60" />
        Tak wygląda nauka z PasjonatamiIT
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 w-full gap-6 px-4">
        {courses.map((course, index) => (
          <div
            key={index}
            onClick={() =>
              document
                .getElementById(course.section.replace(/\s+/g, ''))
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="border border-gray-200 shadow-md p-6 bg-white dark:bg-DarkblackBorder dark:border-DarkblackBorder dark:text-white rounded-[12px] cursor-pointer transition-all duration-300 hover:-translate-y-1"
          >
            <img src={course.icon} className="mb-2 w-10" alt={course.label} />
            <h3 className="font-semibold text-lg">{course.label}</h3>
            <p className="opacity-75 mt-2 font-light">{course.description}</p>
          </div>
        ))}
      </ul>
    </section>
  );
}

export default CourseListHero;
