import { useAuthStore } from '../../../store/authStore';
import supabase from '../../../util/supabaseClient';
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Check,
  X,
  RotateCcw,
  Trophy,
  Frown,
  ArrowUpZA,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const flipVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

const fadeVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export default function FlashcardPanel({ courseId }) {
  const {
    user,
    userFlashcards,
    saveFlashcardProgress,
    loading: authLoading,
  } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showCard, setShowCard] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState("all");
  const [flipped, setFlipped] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const fetchFlashcards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, question, answer, category")
        .eq("course_id", courseId);

      if (error) throw error;
      setFlashcards(data || []);
      const uniqueCats = [...new Set((data || []).map((f) => f.category))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error("Błąd pobierania fiszek:", err.message);
      setFlashcards([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [user, courseId]);

  const cardsInCategory = useMemo(() => {
    return flashcards.filter(
      (c) => !selectedCategory || c.category === selectedCategory
    );
  }, [flashcards, selectedCategory]);

  const knownCards = useMemo(
    () => cardsInCategory.filter((c) => userFlashcards[c.id] === "known"),
    [cardsInCategory, userFlashcards]
  );
  const unknownCards = useMemo(
    () => cardsInCategory.filter((c) => userFlashcards[c.id] === "unknown"),
    [cardsInCategory, userFlashcards]
  );

  const totalCount = cardsInCategory.length;
  const knownCount = knownCards.length;
  const unknownCount = unknownCards.length;

  const filteredFlashcards = useMemo(() => {
    if (filterMode === "all") return cardsInCategory;
    if (filterMode === "known") return knownCards;
    return unknownCards;
  }, [filterMode, cardsInCategory, knownCards, unknownCards]);

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setSessionFinished(false);
  }, [filterMode]);

  useEffect(() => setFlipped(false), [currentIndex]);

  useEffect(() => {
    if (
      currentIndex >= filteredFlashcards.length &&
      filteredFlashcards.length > 0
    ) {
      setSessionFinished(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  }, [currentIndex, filteredFlashcards.length]);

  const currentCard =
    filteredFlashcards.length > 0 && currentIndex < filteredFlashcards.length
      ? filteredFlashcards[currentIndex]
      : null;

  const handleStart = (mode) => {
    setFilterMode(mode);
    setShowCard(true);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionFinished(false);
  };

  const markFlashcard = async (status, cardId) => {
    if (!user) return;
    await saveFlashcardProgress(user.id, cardId, status);
    setCurrentIndex((i) => i + 1);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setSessionFinished(false);
  };

  return (
    <div className="w-full h-full rounded-[12px] p-3">
      {!selectedCategory ? (
        <div className="w-full h-full rounded-[12px] p-3">
          <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
            Panel fiszek
          </span>
        
          {loading || authLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-primaryBlue dark:border-primaryGreen border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Ładowanie...</span>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-4 text-xl text-gray-800 dark:text-white">
                Wybierz kategorie fiszek:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="bg-white dark:bg-DarkblackText px-4 py-4 text-base font-semibold rounded-[12px] shadow-sm border border-gray-100 dark:border-transparent cursor-pointer hover:translate-y-1 hover:shadow-md transition"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : !showCard ? (
        <div className="flex flex-col w-full">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex cursor-pointer items-center gap-1 text-md text-secondaryBlue dark:text-secondaryGreen mb-4 hover:underline"
          >
            <ChevronLeft size={20} /> Powrót
          </button>

          <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mb-6">
            Nauka fiszek - {selectedCategory}
          </span>

          <div className="bg-white dark:bg-DarkblackText border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Postęp w tej kategorii:</span>
              <span className="font-semibold">{totalCount ? Math.round((knownCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-secondaryBlue dark:bg-secondaryGreen h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalCount ? (knownCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{knownCount} opanowane</span>
              <span>{unknownCount} do nauki</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
            <div className="flex flex-col justify-between items-center bg-white dark:bg-DarkblackText dark:border-DarkblackText rounded-[16px] shadow p-4 border border-gray-100">
              <h4 className="font-semibold text-lg mb-8 flex gap-2 items-center">
                <ArrowUpZA className="text-primaryBlue"></ArrowUpZA> Wszystkie
                fiszki
              </h4>
              <div className="text-center mb-6 border border-gray-100 dark:border-white/15  w-35 flex items-center justify-center flex-col h-35 rounded-[12px] shadow-md">
                <p className="opacity-75">Liczba fiszek</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="w-full mb-4">
                <div className="flex justify-between text-sm mb-2 opacity-75">
                  <span>Postęp:</span>
                  <span>
                    {totalCount
                      ? Math.round((knownCount / totalCount) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-secondaryBlue dark:bg-secondaryGreen h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        totalCount ? (knownCount / totalCount) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleStart("all")}
                className="w-full bg-secondaryBlue dark:bg-secondaryGreen cursor-pointer text-white rounded-xl py-4 transition-all duration-300 hover:scale-[1.025] disabled:opacity-50"
                disabled={!totalCount}
              >
                Rozpocznij naukę
              </button>
            </div>

            <div className="flex flex-col justify-between items-center dark:bg-DarkblackText dark:border-DarkblackText bg-white rounded-[16px] shadow-md p-4 border border-gray-100">
              <h4 className="font-semibold text-lg mb-8 flex gap-2 items-center">
                <Check className="text-primaryGreen"></Check> Potrafisz
              </h4>
              <div className="text-center mb-6 border border-gray-100 dark:border-white/15 w-35 flex items-center justify-center flex-col h-35 rounded-[12px] shadow-md">
                <p className="opacity-75">Liczba fiszek</p>
                <p className="text-2xl font-bold">{knownCount}</p>
              </div>
              <button
                onClick={() => handleStart("known")}
                className="w-full bg-secondaryBlue mt-6 dark:bg-secondaryGreen cursor-pointer text-white rounded-xl py-4 transition-all duration-300 hover:scale-[1.025] disabled:opacity-50"
                disabled={!knownCount}
              >
                Rozpocznij naukę
              </button>
            </div>

            <div className="flex flex-col justify-between items-center bg-white dark:bg-DarkblackText dark:border-DarkblackText rounded-[16px] shadow p-4 border border-gray-100">
              <h4 className="font-semibold text-lg mb-8 flex gap-2 items-center">
                <X className="text-red-500"></X> Nie potrafisz
              </h4>
              <div className="text-center mb-6 border border-gray-100 w-35 dark:border-white/15 flex items-center justify-center flex-col h-35 rounded-[12px] shadow-md">
                <p className="opacity-75">Liczba fiszek</p>
                <p className="text-2xl font-bold">{unknownCount}</p>
              </div>
              <button
                onClick={() => handleStart("unknown")}
                className="w-full bg-secondaryBlue mt-6 cursor-pointer dark:bg-secondaryGreen text-white rounded-xl py-4 transition-all duration-300 hover:scale-[1.025] disabled:opacity-50"
                disabled={!unknownCount}
              >
                Rozpocznij naukę
              </button>
            </div>
          </div>
        </div>
      ) : sessionFinished ? (
        <motion.div
          key="end-screen"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col items-center justify-center h-full gap-4 lg:gap-6 text-center px-4"
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen rounded-full flex items-center justify-center mb-4">
            <Trophy size={32} className="text-white" />
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Gratulacje! 🎉</h2>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 max-w-md">
            Ukończyłeś wszystkie fiszki w tej sesji!
          </p>

          <div className="flex flex-wrap gap-4 lg:gap-6 justify-center mt-4">
            <div className="flex flex-col items-center bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 px-4 py-3 rounded-xl border border-green-200 dark:border-green-600">
              <Trophy className="mb-2 text-green-500 dark:text-green-400" size={24} />
              <span className="font-bold text-lg text-green-600 dark:text-green-400">{knownCount}</span>
              <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Opanowane</span>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-600">
              <Frown className="mb-2 text-red-500 dark:text-red-400" size={24} />
              <span className="font-bold text-lg text-red-600 dark:text-red-400">{unknownCount}</span>
              <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Do nauki</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-6 justify-center w-full max-w-md">
            <button
              onClick={restartSession}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primaryBlue dark:bg-primaryGreen hover:bg-secondaryBlue dark:hover:bg-secondaryGreen text-white cursor-pointer transition-all duration-200 font-medium text-sm lg:text-base shadow-sm hover:shadow-md"
            >
              <RotateCcw size={18} /> Zagraj od nowa
            </button>
            <button
              onClick={() => {
                setShowCard(false);
                setSessionFinished(false);
                setCurrentIndex(0);
              }}
              className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 font-medium text-sm lg:text-base text-gray-700 dark:text-gray-300"
            >
              Powrót do listy
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="px-2 sm:px-4 pt-4">
          <button
            onClick={() => {
              setShowCard(false);
              setCurrentIndex(0);
              setSessionFinished(false);
            }}
            className="flex items-center cursor-pointer gap-1 text-secondaryBlue dark:text-primaryGreen mb-4 hover:underline"
          >
            <ChevronLeft size={20} /> Wróć do listy
          </button>

          <AnimatePresence mode="wait">
            {currentCard ? (
              <motion.div
                key={currentCard.id}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center justify-center"
              >
                <motion.div
                  className="relative w-full max-w-xl h-64 sm:h-72 bg-white dark:bg-DarkblackBorder rounded-[16px] shadow-lg select-none flex justify-center items-center px-4 sm:px-8 cursor-pointer"
                  animate={flipped ? "back" : "front"}
                  variants={flipVariants}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => setFlipped((prev) => !prev)}
                >
                  <motion.div
                    className="absolute w-full h-full flex flex-col justify-center items-center"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="absolute top-4 left-4 bg-primaryBlue/10 dark:bg-primaryGreen/10 px-3 py-1 rounded-full">
                      <h4 className="text-xs text-primaryBlue dark:text-primaryGreen font-medium">
                        Fiszka {currentIndex + 1} z {filteredFlashcards.length}
                      </h4>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-blackText dark:text-white text-center">
                      {currentCard.question}
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute w-full h-full flex flex-col justify-center items-center p-4"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="absolute top-4 left-4 bg-green-500/10 dark:bg-green-400/10 px-3 py-1 rounded-full">
                      <h4 className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Odpowiedź
                      </h4>
                    </div>
                    <div className="text-lg sm:text-2xl font-semibold text-secondaryBlue dark:text-primaryGreen text-center whitespace-pre-line">
                      {currentCard.answer}
                    </div>
                  </motion.div>
                </motion.div>

                {userFlashcards[currentCard.id] && (
                  <div className="text-xs mt-2 text-gray-500 italic text-center w-full max-w-xl">
                    Status:{" "}
                    {userFlashcards[currentCard.id] === "known"
                      ? "✔ Potrafisz"
                      : "✖ Nie potrafisz"}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 px-2 w-full max-w-xl">
                  <button
                    onClick={() => markFlashcard("unknown", currentCard.id)}
                    className="bg-red-500/75 border border-red-500 flex items-center cursor-pointer justify-center gap-2 w-full hover:bg-red-600 text-white px-5 py-3 rounded-xl transition shadow"
                  >
                    <X size={20} /> Nie potrafię
                  </button>
                  <button
                    onClick={() => markFlashcard("known", currentCard.id)}
                    className="flex items-center justify-center cursor-pointer gap-2 w-full bg-primaryGreen/75 border border-primaryGreen hover:bg-secondaryGreen text-white px-5 py-2 rounded-xl transition shadow"
                  >
                    <Check size={20} /> Potrafię
                  </button>
                </div>

                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="mt-4 text-sm dark:text-gray-200 hover:underline"
                >
                  ⏭ Pomiń
                </button>
              </motion.div>
            ) : (
              <p className="text-center text-gray-500 mt-10">
                Brak fiszek do wyświetlenia
              </p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
