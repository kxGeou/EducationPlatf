import React from "react";
import "../../styles/Interactive.css";
import Description from "../typography/Description";
import Heading2 from "../typography/Heading2";
import SectionHeading from "../typography/SectionHeading";

function Stats({ Title, Description }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <span className="w-[2px] bg-blue-300"></span>
        <p className="text-m md:text-lg md:font-semibold">{Title}</p>
      </div>
      <p className="opacity-75 text-sm ml-3 md:max-w-[200px] md:w-full">
        {Description}
      </p>
    </div>
  );
}

function Interactive() {
  const stats = [
    { title: "92%", description: "Z naszych uczniów zdobywa ponad 80% na maturze z informatyki" },
    { title: "5+ lat", description: "Doświadczenia w prowadzeniu korepetycji i kursów maturalnych" },
    {
      title: "+700 uczniów",
      description: "Już przygotowanych przez nas do matury — i ciągle rośnie!",
    },
    {
      title: "100%",
      description: "Dostosowania kursów do wymagań maturalnych CKE",
    }
  ];

  return (
    <section className="bg-darkBlue dark:bg-DarkblackText  text-white py-16 pb-12 w-full px-6 ">
      <SectionHeading textColor={"text-primaryGreen"}>
        Z nami matura z informatyki to formalność
      </SectionHeading>
      <div className="mt-8 flex flex-col gap-4 md:w-full md:max-w-[400px]">
        <Heading2 margin={"mb-2"} textColor={"text-white"}>
          Statystyki, które mówią same za siebie
        </Heading2>
        <Description textColor={"text-white"}>
          Nasze kursy przygotowały już setki uczniów do matury. Dzięki
          przemyślanej strukturze, wsparciu nauczycieli i naciskowi na praktykę
          — efekty mówią same za siebie.
        </Description>
      </div>

      <ul className="flex flex-col gap-6 mt-12 md:flex-row ">
        {stats.map((s, index) => (
          <Stats
            Title={s.title}
            Description={s.description}
            key={index}
          ></Stats>
        ))}
      </ul>
    </section>
  );
}

export default Interactive;
