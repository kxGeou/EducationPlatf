import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Heading2 from '../../../components/typography/Heading2';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Jak długo mam dostęp do kursu?",
      answer: "Po zakupie kursu masz do niego dostęp przez okres do swojej matury (lub do lipca roku, w którym zdajesz egzamin). W tym czasie możesz wracać do materiałów, oglądać lekcje wielokrotnie i rozwiązywać zadania bez limitu."
    },
    {
      question: "Czy kurs jest odpowiedni dla początkujących?",
      answer: "Tak! Nasze kursy są stworzone tak, aby osoby bez wcześniejszej wiedzy z informatyki mogły się z nich uczyć. Wszystko tłumaczymy od podstaw, krok po kroku, prostym językiem."
    },
    {
      question: "Czy mogę otrzymać fakturę?",
      answer: "Oczywiście! Po dokonaniu zakupu automatycznie otrzymujesz paragon. Jeśli potrzebujesz faktury, skontaktuj się z nami przez formularz kontaktowy, a przygotujemy ją dla Ciebie."
    },
    {
      question: "Jak wygląda nauka na kursie?",
      answer: "Kurs składa się z filmowych lekcji, zadań praktycznych i materiałów dodatkowych. Możesz uczyć się we własnym tempie - zatrzymywać film, wracać do trudniejszych fragmentów i ćwiczyć aż do skutku."
    },
    {
      question: "Czy otrzymam wsparcie podczas nauki?",
      answer: "Tak! Na naszym Discordzie możesz zadawać pytania, wymieniać się doświadczeniami z innymi uczniami i otrzymywać wsparcie od nauczycieli. Dołącz do naszej społeczności!"
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 md:py-24 mt-12 md:mt-16">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <Heading2 margin="mb-8" textColor="text-darkerBlack dark:text-white text-center">
            Najczęściej zadawane pytania
          </Heading2>

          <div className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-DarkblackBorder rounded-xl border border-gray-200 dark:border-gray-700 shadow-[0_0_6px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-DarkblackText transition-colors"
              >
                <span className="font-semibold text-base md:text-lg text-darkerBlack dark:text-white pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primaryBlue dark:text-primaryGreen flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden bg-gray-50 dark:bg-DarkblackText"
                  >
                    <div className="px-6 pb-4 pt-1">
                      <p className="text-sm md:text-base text-blackText dark:text-white/90 leading-relaxed mt-2">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
