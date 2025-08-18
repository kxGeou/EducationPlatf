import { useAuthStore } from "../../store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpAZ, Check, ChevronLeft, X, RotateCcw, Trophy, Frown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import supabase from "../../util/supabaseClient";
import confetti from "canvas-confetti";

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

  useEffect(() => setCurrentIndex(0), [filterMode]);
  useEffect(() => setFlipped(false), [currentIndex]);

  const filteredFlashcards = useMemo(() => {
    const cards = flashcards.filter(
      (c) => !selectedCategory || c.category === selectedCategory
    );
    if (filterMode === "all") return cards;
    return cards.filter((c) => userFlashcards[c.id] === filterMode);
  }, [flashcards, userFlashcards, selectedCategory, filterMode]);

  useEffect(() => {
    if (currentIndex >= filteredFlashcards.length && filteredFlashcards.length > 0) {
      setSessionFinished(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  }, [currentIndex, filteredFlashcards.length]);

  const currentCard =
    filteredFlashcards.length > 0 && currentIndex < filteredFlashcards.length
      ? filteredFlashcards[currentIndex]
      : null;

  const knownCount = Object.values(userFlashcards).filter(
    (v) => v === "known"
  ).length;
  const totalCount = flashcards.length;
  const unknownCount = totalCount - knownCount;

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
    <div className="w-full bg-white dark:bg-DarkblackBorder p-4 h-full rounded-[12px]">
      {!selectedCategory ? (
        <>
          <h2 className="text-lg md:text-xl font-bold mb-4">
            Wybierz kategorię fiszek:
          </h2>
          {loading || authLoading ? (
            <p className="text-gray-400">Ładowanie...</p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-white dark:bg-DarkblackText px-4 py-3 md:py-8 md:text-lg font-semibold rounded-[12px] shadow-md border border-gray-100 dark:border-transparent cursor-pointer hover:bg-secondaryBlue/10 dark:hover:bg-blackText/75"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </>
      ) : !showCard ? (
        <div className="flex flex-col justify-center w-full">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex cursor-pointer items-center gap-1 text-md text-secondaryBlue dark:text-secondaryGreen mb-4 hover:underline"
          >
            <ChevronLeft size={20} /> Wróć do kategorii
          </button>

          <h3 className="text-2xl font-bold mb-2">{selectedCategory}</h3>
          <p className="mb-6">Liczba fiszek: {totalCount}</p>

          <div className="mb-4 grid md:grid-cols-3 gap-4 w-full">
            {[
              {
                mode: "all",
                icon: <ArrowUpAZ size={20} className="text-primaryGreen" />,
                label: "Wszystkie",
              },
              {
                mode: "known",
                icon: <Check size={20} className="text-secondaryGreen" />,
                label: "Potrafię",
              },
              {
                mode: "unknown",
                icon: <X size={20} className="text-red-400" />,
                label: "Nie potrafię",
              },
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex items-center justify-center gap-2 px-3 py-2 md:py-5 shadow-md border-t dark:border-transparent border-gray-100 rounded-[12px] cursor-pointer transition-all duration-300 hover:scale-[1.025] ${
                  filterMode === mode
                    ? "bg-secondaryBlue text-white dark:bg-secondaryBlue"
                    : "bg-gray-100 dark:bg-blackText"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Ładowanie fiszek...</p>
          ) : filteredFlashcards.length > 0 ? (
            <>
              <div className="mb-4 mt-6">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="text-blackText/75 dark:text-white/75">
                    Postęp:
                  </span>
                  <span className="font-semibold text-primaryGreen">
                    {Math.round((knownCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-secondaryBlue dark:bg-primaryGreen h-full transition-all duration-300"
                    style={{
                      width: `${(knownCount / totalCount) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCard(true);
                  setCurrentIndex(0);
                }}
                className="px-4 cursor-pointer bg-secondaryBlue dark:bg-primaryGreen text-white rounded-[12px] py-3 shadow hover:bg-primaryBlue/90 dark:hover:bg-secondaryGreen"
              >
                Rozpocznij naukę
              </button>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Brak fiszek w tym filtrze.
            </p>
          )}
        </div>
      ) : sessionFinished ? (
        <motion.div
          key="end-screen"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col items-center justify-center h-full gap-6 text-center"
        >
          <h2 className="text-2xl font-bold">Gratulacje 🎉</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ukończyłeś wszystkie fiszki w tej sesji!
          </p>

          <div className="flex gap-6 justify-center mt-4">
            <div className="flex flex-col items-center bg-green-100 dark:bg-green-900/40 px-4 py-2 rounded-xl shadow">
              <Trophy className="text-green-600 dark:text-green-400 mb-1" size={28} />
              <span className="font-bold text-lg text-green-700 dark:text-green-300">{knownCount}</span>
              <span className="text-sm text-green-600 dark:text-green-300">Opanowane</span>
            </div>
            <div className="flex flex-col items-center bg-red-100 dark:bg-red-900/40 px-4 py-2 rounded-xl shadow">
              <Frown className="text-red-600 dark:text-red-400 mb-1" size={28} />
              <span className="font-bold text-lg text-red-700 dark:text-red-300">{unknownCount}</span>
              <span className="text-sm text-red-600 dark:text-red-300">Do nauki</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={restartSession}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondaryBlue text-white cursor-pointer hover:bg-primaryBlue/90 transition"
            >
              <RotateCcw size={20} /> Zagraj od nowa
            </button>
            <button
              onClick={() => setShowCard(false)}
              className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-blackText hover:dark:bg-DarkblackText cursor-pointer hover:bg-gray-300 transition"
            >
              Powrót do listy
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <button
            onClick={() => {
              setShowCard(false);
              setCurrentIndex(0);
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
                  className="relative w-full max-w-xl h-64 md:h-72 bg-gradient-to-br from-secondaryBlue/10 to-primaryGreen/10 dark:from-blackText dark:to-DarkblackText rounded-[16px] shadow-lg select-none flex justify-center items-center px-8 cursor-pointer"
                  animate={flipped ? "back" : "front"}
                  variants={flipVariants}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => setFlipped((prev) => !prev)}
                >
                  <motion.div
                    className="absolute w-full h-full flex flex-col justify-center items-center backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Fiszka {currentIndex + 1} z {filteredFlashcards.length}
                    </h4>
                    <div className="text-3xl font-bold text-blackText dark:text-white text-center">
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
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Odpowiedź
                    </h4>
                    <div className="text-2xl font-semibold text-secondaryBlue dark:text-primaryGreen text-center whitespace-pre-line">
                      {currentCard.answer}
                    </div>
                  </motion.div>
                </motion.div>

                {userFlashcards[currentCard.id] && (
                  <div className="text-xs mt-2 text-gray-500 italic text-center w-full max-w-xl">
                    Status: {userFlashcards[currentCard.id] === "known" ? "✔ Potrafisz" : "✖ Nie potrafisz"}
                  </div>
                )}

                <div className="flex justify-center gap-4 mt-6 px-2 w-full max-w-xl">
                  <button
                    onClick={() => markFlashcard("unknown", currentCard.id)}
                    className="bg-red-500 flex items-center cursor-pointer justify-center gap-2 w-full hover:bg-red-600 text-white px-5 py-2 rounded-xl transition shadow"
                  >
                    <X size={20} /> Nie potrafię
                  </button>
                  <button
                    onClick={() => markFlashcard("known", currentCard.id)}
                    className="flex items-center justify-center cursor-pointer gap-2 w-full bg-primaryGreen hover:bg-secondaryGreen text-white px-5 py-2 rounded-xl transition shadow"
                  >
                    <Check size={20} /> Potrafię
                  </button>
                </div>

                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="mt-4 text-sm dark:text-gray-200  hover:underline"
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
        </>
      )}
    </div>
  );
}
