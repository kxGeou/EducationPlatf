import { usePollStore } from '../../store/formStore';
import { useIdeaStore } from '../../store/ideaStore';
import PageLayout from '../../components/systemLayouts/PageLayout';
import {
  User,
  PlusCircle,
  List,
  Sun,
  Moon,
  MinusCircle,
  PenBoxIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

function FormPage({ isDark, setIsDark }) {
  const [password, setPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const createPoll = usePollStore((s) => s.createPoll);
  const fetchPolls = usePollStore((s) => s.fetchPolls);
  const polls = usePollStore((s) => s.polls);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { fetchIdea, ideas } = useIdeaStore();
  useEffect(() => {
    if (accessGranted) {
      fetchPolls();
      fetchIdea();
    }
  }, [accessGranted, fetchPolls]);

  const handleLogin = () => {
    if (password === "1234") {
      setAccessGranted(true);
    } else {
      toast.error("Niepoprawne hasło");
    }
  };
  console.log(ideas);

  const handleSave = () => {
    if (!title || options.some((o) => !o))
      return toast.error("Uzupełnij wszystkie pola!");
    if (options.length < 2) return toast.error("Musisz podać minimum 2 opcje!");
    if (options.length > 6) return toast.error("Maksymalnie 6 opcji!");

    createPoll(title, desc, options);
    setTitle("");
    setDesc("");
    setOptions(["", ""]);
    toast.success("Ankieta utworzona!");
  };

  if (!accessGranted) {
    return (
      <PageLayout isDark={isDark} setIsDark={setIsDark}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white dark:bg-DarkblackBorder backdrop-blur-xl shadow-xl rounded-2xl p-10 w-full max-w-md flex flex-col gap-6 items-center justify-center">
          <h2 className="text-2xl tracking-wide text-blackText opacity-80 dark:text-white flex flex-col items-center gap-3">
            <User className="text-blackText opacity-40 dark:text-white w-10 h-10" />
            Panel Admina
          </h2>

          <input
            type="password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-100 dark:bg-DarkblackText dark:border-0 dark:placeholder:text-white/50 dark:caret-primaryGreen w-full border border-gray-200 px-4 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />

          <button
            onClick={handleLogin}
            className="bg-primaryBlue dark:bg-primaryGreen cursor-pointer text-white font-medium w-full py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
          >
            Zaloguj
          </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout isDark={isDark} setIsDark={setIsDark} showFooter={false}>
      {/* NAWIGACJA */}
      <div className="flex gap-4 p-4 bg-white/80 dark:bg-DarkblackBorder/80 backdrop-blur-sm shadow-sm justify-center -mx-4 mb-8 rounded-b-2xl">
        <div className="w-full max-w-[1650px] flex gap-4 items-center">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] transition ${
              activeTab === "create"
                ? "bg-primaryBlue text-white dark:bg-primaryGreen"
                : "opacity-75"
            }`}
          >
            <PlusCircle size={16} /> Stwórz ankietę
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] transition ${
              activeTab === "list"
                ? "bg-primaryBlue text-white dark:bg-primaryGreen"
                : "opacity-75"
            }`}
          >
            <List size={16} /> Lista ankiet
          </button>
          <button
            onClick={() => setActiveTab("ideas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] transition ${
              activeTab === "ideas"
                ? "bg-primaryBlue text-white dark:bg-primaryGreen"
                : "opacity-75"
            }`}
          >
            <PenBoxIcon size={16} /> Pomysły użytkowników
          </button>
          <button
            className="cursor-pointer p-2 hover:text-gray-300 transition-all"
            title="Przełącz tryb jasny/ciemny"
            role="button"
            aria-label="Przełącz tryb jasny/ciemny"
            onClick={() => {
              setIsDark((prev) => {
                const newValue = !prev;
                localStorage.setItem("theme", newValue ? "dark" : "light");
                return newValue;
              });
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* ZAWARTOŚC */}

      <div className="space-y-8">
        {activeTab === "create" && (
          <div className="max-w-[700px] mx-auto bg-white dark:bg-DarkblackBorder rounded-2xl shadow-lg p-8 space-y-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł ankiety"
              className="w-full border  rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Opis (opcjonalnie)"
              className="w-full border  rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText"
            />

            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => {
                  const newOps = [...options];
                  newOps[i] = e.target.value;
                  setOptions(newOps);
                }}
                placeholder={`Opcja ${i + 1}`}
                className="w-full border  rounded-lg p-3 bg-gray-50 border-gray-200 dark:border-DarkblackBorder dark:bg-DarkblackText"
              />
            ))}

            <div className="flex gap-2 mt-4 w-full justify-between">
              <button
                onClick={() =>
                  options.length < 6 && setOptions([...options, ""])
                }
                className="flex items-center gap-2 justify-center px-3 py-3 rounded-lg bg-green-400 text-white cursor-pointer hover:shadow-sm transition-all duration-300 disabled:opacity-40 w-full"
                disabled={options.length >= 6}
              >
                <PlusCircle size={18}></PlusCircle> Dodaj opcję
              </button>
              <button
                onClick={() =>
                  options.length > 2 && setOptions(options.slice(0, -1))
                }
                className="flex items-center gap-2 justify-center px-3 py-3 rounded-lg bg-red-400 border text-white disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer w-full  hover:shadow-sm transition-all duration-300 "
                disabled={options.length <= 2}
              >
                <MinusCircle size={18}></MinusCircle> Usuń opcję
              </button>
            </div>

            <button
              onClick={handleSave}
              className="bg-primaryBlue dark:bg-primaryGreen text-white font-medium py-3 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              Zapisz ankietę
            </button>
          </div>
        )}

        {activeTab === "list" && (
          <div className="grid md:grid-cols-2 gap-6">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white dark:bg-DarkblackBorder rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-DarkblackText"
              >
                <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {poll.description}
                </p>
                <ul className="flex flex-col gap-3">
                  {poll.options.map((opt) => (
                    <li
                      key={opt.id}
                      className="flex justify-between bg-gray-200 dark:bg-DarkblackText px-3 py-2 rounded-lg"
                    >
                      <span>{opt.option_text}</span>
                      <span className="font-medium">{opt.votes} głosów</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === "ideas" && (
          <div className="w-full">
            {ideas.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Nie ma żadnych pomysłów</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-DarkblackBorder shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-DarkblackText"
                  >
                    <span
                      className={`${
                        idea.type === "Design" &&
                        "bg-indigo-400 text-sm text-white px-3 py-1 border border-indigo-500/50 rounded-[8px]"}
                        ${
                        idea.type === "Funkcjonalność" &&
                        "bg-green-400 text-sm text-white px-3 py-1 border border-green-500/50 rounded-[8px]"}
                        ${
                        idea.type === "Inne" &&
                        "bg-red-400 text-sm text-white px-3 py-1 border border-red-500/50 rounded-[8px]"}
                      `}
                    >
                      {idea.type}
                    </span>
                    <p className="text-md opacity-75 mt-2">{idea.user_email}</p>
                    <p className="text-lg font-semibold mt-2">{idea.name}</p>
                    <p className="bg-gray-100 dark:bg-blackText/50 dark:text-white/75 p-2 text-blackText/75 mt-1">
                      {idea.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default FormPage;
