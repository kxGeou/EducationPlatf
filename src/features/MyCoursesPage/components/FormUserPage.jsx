import { useEffect, useState } from "react";
import { usePollStore } from '../../../store/formStore';
import { MailQuestionIcon } from "lucide-react";

function FormUserPage() {
  const fetchPolls = usePollStore((s) => s.fetchPolls);
  const polls = usePollStore((s) => s.polls);
  const voteOption = usePollStore((s) => s.voteOption);
  const [votedPolls, setVotedPolls] = useState(() => {
    const stored = localStorage.getItem("votedPolls");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVote = (pollId, optionId) => {
    if (votedPolls.includes(pollId)) return;
    voteOption(pollId, optionId);
    const updated = [...votedPolls, pollId];
    setVotedPolls(updated);
    localStorage.setItem("votedPolls", JSON.stringify(updated));
  };

  return (
    <div className="w-full mt-2 ">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen mt-18 mb-12 md:mt-0">
        Ankiety
      </span>

      {polls.length === 0 ? (
        <div className="w-full h-[75vh] flex items-center justify-center flex-col gap-4">
            <MailQuestionIcon size={32} className="text-gray-300 dark:text-gray-400"></MailQuestionIcon>
            <p className="text-gray-400 dark:text-gray-400 ">Brak dostępnych ankiet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {polls.map((poll) => {
            const alreadyVoted = votedPolls.includes(poll.id);
            return (
              <div
                key={poll.id}
                className="bg-white dark:bg-DarkblackText rounded-2xl shadow-md p-5 flex flex-col gap-2"
              >
                <h3 className="text-xl text-blackText dark:text-white font-bold">{poll.title}</h3>
                {poll.description && (
                  <p className="text-sm text-blackText/75 dark:text-white/75 mb-4">{poll.description}</p>
                )}
                <ul className="flex flex-col gap-3">
                  {poll.options.map((opt) => (
                    <li
                      key={opt.id}
                      className="flex justify-between items-center bg-gray-100 dark:bg-DarkblackBorder px-3 py-2 rounded-lg"
                    >
                      <span className="dark:text-white">{opt.option_text}</span>
                      <button
                        onClick={() => handleVote(poll.id, opt.id)}
                        disabled={alreadyVoted}
                        className={`px-3 py-2 cursor-pointer text-sm rounded-lg transition font-medium ${
                          alreadyVoted
                            ? "bg-gray-300 dark:bg-DarkblackText dark:text-white/50 cursor-not-allowed"
                            : "bg-primaryBlue dark:bg-primaryGreen text-white hover:opacity-90"
                        }`}
                      >
                        {alreadyVoted ? `Oddano głos (${opt.votes})` : `Głosuj (${opt.votes})`}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FormUserPage;
