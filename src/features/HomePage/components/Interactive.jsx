import React from "react";
import "../../../styles/Interactive.css";
import RobotStat from '../../../assets/robotStat.svg';
import Description from '../../../components/typography/Description';
import Heading2 from '../../../components/typography/Heading2';
import SectionHeading from '../../../components/typography/SectionHeading';

function Stats({ Title, Description }) {
  return (
    <li className="flex flex-col gap-2 bg-secondaryBlue/25 rounded-lg border border-secondaryBlue/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <p className="text-m md:text-lg md:font-semibold">{Title}</p>
      <p className="opacity-75 text-sm md:max-w-[200px] md:w-full">
        {Description}
      </p>
    </li>
  );
}

function Interactive() {
  const stats = [
    {
      title: "92%",
      description:
        "Naszych uczniów zdobywa ponad 80% na maturze z informatyki.",
    },
    {
      title: "5+ lat",
      description:
        "Doświadczenia w prowadzeniu korepetycji i kursów maturalnych online.",
    },
    {
      title: "+700 uczniów",
      description:
        "Już przygotowanych przez nas do matury z informatyki i egzaminów INF.02 / INF.03.",
    },
    {
      title: "100%",
      description:
        "Dostosowania kursów online do wymagań maturalnych CKE.",
    },
  ];

  return (
    <section
      className="relative bg-darkBlue dark:bg-DarkblackText text-white py-20 pb-12 w-full px-4 overflow-hidden"
      aria-labelledby="stats-heading"
    >
      <img
        src={RobotStat}
        alt="Ilustracja robota z wykresami – symbol statystyk kursów informatyki"
        className="absolute top-10 right-0 md:right-40 w-[550px] dark:md:opacity-100 pointer-events-none select-none opacity-10 md:opacity-100"
        width="550"
        height="400"
      />

      <div className="relative z-10">
        <SectionHeading textColor={"text-primaryGreen"} id="stats-heading">
          Matura z informatyki? Z nami to formalność.
        </SectionHeading>

        <div className="mt-8 flex flex-col gap-4 md:w-full md:max-w-[400px]">
          <Heading2 margin={"mb-2"} textColor={"text-white"}>
            Statystyki, które mówią same za siebie
          </Heading2>
          <Description textColor={"text-white"}>
            Nasze <strong className="text-primaryGreen">kursy maturalne z informatyki</strong> przygotowały już setki uczniów.
            Dzięki przemyślanej strukturze, wsparciu nauczycieli i naciskowi na praktykę
            — efekty mówią same za siebie. To najlepsze przygotowanie do <strong className="text-primaryGreen">matury z informatyki </strong>
            oraz egzaminów zawodowych <strong className="text-primaryGreen">INF.02</strong> i <strong className="text-primaryGreen">INF.03</strong>.
          </Description>
        </div>

        <ul className="grid md:grid-cols-4 w-full mt-10 md:mt-30 gap-6">
          {stats.map((s, index) => (
            <Stats Title={s.title} Description={s.description} key={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Interactive;
