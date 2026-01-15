import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Heading2 from '../../../components/typography/Heading2';
import Description from '../../../components/typography/Description';
import RobotSiedzacyKrzes from '../../../assets/RobotSiedzacyKrzes.svg';

export default function DiscordCTA() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full max-w-[1100px] px-4 py-16 md:py-24">
      <motion.div
        className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-[0_0_6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 p-8 md:p-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-darkerBlack dark:text-white">
              Dołącz do naszego Discord!
            </h3>
            <p className="text-sm md:text-base text-blackText dark:text-white max-w-[500px] opacity-75 mb-2">
              Bądź na bieżąco z aktualnościami, poznaj innych uczniów i zadawaj pytania naszej społeczności. 
              Na naszym Discordzie znajdziesz dodatkowe materiały, wsparcie od nauczycieli i możliwość wymiany doświadczeń.
            </p>
            <a
              href="https://discord.gg/example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue dark:from-primaryGreen dark:to-secondaryGreen font-semibold text-white dark:text-blackText py-2.5 px-5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl w-fit mt-1 text-sm md:text-base"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              Dołącz do Discord
            </a>
          </div>

          <div className="hidden md:flex justify-center lg:justify-end flex-shrink-0">
            <img
              src={RobotSiedzacyKrzes}
              alt="Robot siedzący na krześle"
              className="w-full max-w-[120px] md:max-w-[150px] h-auto"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
