import RobotKsiazka from '../../../assets/RobotKsiązka.svg';
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, ShoppingCart, BookOpenText, MessageSquareWarningIcon, BookText, ListCheck } from "lucide-react";
import React, { useState, useEffect } from "react";

function Tutorial({ isDark, setTutorialVisible, tutorialVisible }) {
  const tutorial = [
    {
      icon : <ShoppingCart className="text-primaryBlue dark:text-primaryGreen"></ShoppingCart>,
      title: "Panel 'Twoje kursy'",
      description:
        "Na tym panelu znajdziesz wszystkie kursy, które zostały przez ciebie zakupione. Zgromadziliśmy je w jednym miejscu, abyś miał łatwy i szybki dostęp do każdego z nich. Przy każdym kursie zobaczysz najważniejsze informacje – takie jak jego opis, zakres tematyczny czy dostępne materiały dodatkowe – dzięki czemu od razu będziesz wiedział, czego możesz się spodziewać i jak najlepiej z nich korzystać.",
    },
    {
      icon : <BookOpenText className="text-primaryBlue dark:text-primaryGreen"></BookOpenText>,
      title: "Panel 'Zasoby'",
      description:
        "Na tym panelu możesz zobaczyć wszystkie przydatne materiały i zasoby do nauki. Znajdziesz tutaj zarówno filmy wideo, które krok po kroku pomogą ci poszerzyć wiedzę i lepiej zrozumieć zagadnienia, jak i pliki PDF z dodatkowymi wyjaśnieniami czy przykładami.",
    },
    {
      icon : <MessageSquareWarningIcon className="text-primaryBlue dark:text-primaryGreen"></MessageSquareWarningIcon>,
      title: "Panel 'Zgłoszenia'",
      description:
        "Zauważyłeś błąd w designie lub coś nie działa tak, jak powinno? Daj nam znać! Wypełnij krótkie zgłoszenie – opisz, co się wydarzyło, jak dojść do błędu (krok po kroku) oraz na jakim urządzeniu i w jakiej przeglądarce to wystąpiło.Każde zgłoszenie uważnie sprawdzamy i na jego podstawie wprowadzamy poprawki. Dziękujemy za pomoc w ulepszaniu platformy!",
    },
    {
      icon : <BookText className="text-primaryBlue dark:text-primaryGreen"></BookText>,
      title: "Panel 'Blogi'",
      description:
        "W tym panelu znajdziesz blogi przygotowane specjalnie z myślą o uczniach. Artykuły pomogą ci lepiej uporządkować wiedzę, spojrzeć na naukę z nowej perspektywy i zrozumieć, jak łączyć teorię z praktyką. Znajdziesz tu również teksty wspierające w podejmowaniu ważnych decyzji – na przykład związanych z wyborem kierunku studiów czy ścieżki kariery.",
    },
    {
      icon : <ListCheck className="text-primaryBlue dark:text-primaryGreen"></ListCheck>,
      title: "Panel 'Ankiety'",
      description:
        "Chcemy łączyć się z naszą społecznością za pomocą ankiet, gdy tylko będziemy wprowadzić jakąś zmianę lub feature do strony to zapytamy was co o tym sądzicie",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("tutorialSeen");
    if (seen === "true") {
      setTutorialVisible(false);
    }
  }, []);

  const next = () => {
    if (index === tutorial.length - 1) {
      setTutorialVisible(false);
      localStorage.setItem("tutorialSeen", "true");
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + tutorial.length) % tutorial.length);
  };

  if (!tutorialVisible) return null;

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="fixed w-full h-screen bg-black/60 backdrop-blur-sm top-0 flex items-center justify-center"
    >
      <AnimatePresence>
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[1000px] h-[75vh] bg-slate-100 dark:bg-DarkblackBorder dark:text-white rounded-[12px] p-6 flex flex-col"
        >
          <div className="w-full flex justify-between items-start">
            <p className="text-lg font-semibold">Wyjaśnienie sekcji</p>
            <p
              onClick={() => {
                setTutorialVisible(false);
                localStorage.setItem("tutorialSeen", "true");
              }}
              className="p-1 bg-red-400 transition-colors hover:bg-red-500 cursor-pointer text-white rounded-[8px]"
            >
              <X size={20}></X>
            </p>
          </div>

          <div className="w-full flex justify-between gap-8 mt-12 items-center h-full ">
            <div className="w-full h-full bg-DarkblackText/10 dark:bg-DarkblackText rounded-[8px] p-6">
              <div className="h-full flex flex-col justify-between">
                <div>
                  {tutorial[index].icon}
                  <h2 className="text-2xl font-bold mb-2 mt-3">
                    {tutorial[index].title}
                  </h2>
                  <p className=" leading-relaxed opacity-75">
                    {tutorial[index].description}
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={prev}
                    disabled={index === 0}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-[12px] hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    <ArrowLeft size={18} /> Wstecz
                  </button>
                  <button
                    onClick={next}
                    className="flex items-center gap-2 bg-primaryBlue dark:bg-primaryGreen text-white px-4 py-2 rounded-[12px] transition"
                  >
                    {index === tutorial.length - 1 ? "Zakończ" : "Dalej"}{" "}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <img
              src={RobotKsiazka}
              className="w-60 mr-12 hidden md:block"
              alt="Robot z książką"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Tutorial;
