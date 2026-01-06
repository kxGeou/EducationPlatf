import { useAuthStore } from '../../../store/authStore';
import React, { useState } from "react";
import { useIdeaStore } from '../../../store/ideaStore';
import { useToast } from '../../../context/ToastContext';
import { Loader2Icon } from "lucide-react";

function IdeaPanel() {
  const toast = useToast();
  const [showOption, setShowOption] = useState(false);
  const options = ["Design", "Funkcjonalność", "Inne"];
  const { user } = useAuthStore();
  const {insertIdea, loading} = useIdeaStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState(user.email);
  const [type, setType] = useState(null);

  function resetForms() {
    setName("")
    setDescription("")
    setType(null)
  }

  return (
    <div className="w-full mt-2 dark:bg-DarkblackBorder">
      <span className="flex gap-2 text-lg items-center font-semibold border-l-4 px-3 border-primaryBlue dark:border-primaryGreen text-primaryBlue dark:text-primaryGreen md:mt-0 mt-18">
        Twoje Pomysły
      </span>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if(name.length == 0 || description.length == 0) {
            toast.error("Wpisz poprawne dane!")
            return
          } 
          insertIdea({name : name, description : description, type : type, email: email})
          resetForms()
        }}
        className="flex flex-col gap-3 bg-white dark:bg-DarkblackText dark:text-white shadow-md p-4 mt-12 rounded-2xl w-full"
      >
        <input
          placeholder="Twój email"
          readOnly={true}
          value={user.email}
          className="p-2 md:p-3 bg-gray-50/75 rounded-xl border dark:bg-DarkblackBorder dark:border-DarkblackBorder dark:text-white/75 border-gray-200/75 text-blackText/75 placeholder:text-sm"
        ></input>
        <input
          type="text"
          placeholder="Nazwa pomysłu"
          className="p-2 md:p-3 bg-gray-50/75 rounded-xl border border-gray-200/75  dark:bg-DarkblackBorder dark:border-DarkblackBorder placeholder:text-sm"
          onChange={(e) => setName(e.target.value)}
          value={name}
        ></input>
        <div onClick={() => setShowOption(!showOption)} 
             className="p-2 md:p-3 bg-gray-50/75 rounded-xl relative border border-gray-200/75 text-sm dark:bg-DarkblackBorder dark:border-DarkblackBorder mb-4"
            >
          <p>{!type ? "Kategoria pomysłu" : type}</p>
          {showOption && (
            <div className="flex flex-col gap-2 absolute top-12 bg-white dark:bg-DarkblackText  shadow-md border border-gray-200 dark:border-DarkblackBorder left-0 rounded-xl  w-full">
              {options.map((option, index) => (
                <span className="px-2 py-2 hover:bg-gray-100 dark:hover:bg-DarkblackBorder cursor-pointer" onClick={() => setType(option)} key={index}>
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>
        <textarea
          type="text"
          rows={5}
          placeholder="Opis"
          className="p-2 md:p-3 bg-gray-50/75 rounded-xl border border-gray-200/75 placeholder:text-sm dark:bg-DarkblackBorder dark:border-DarkblackBorder mb-4"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
        <button
          type="submit"
          className="bg-primaryBlue text-white dark:bg-primaryGreen py-2 md:py-3 cursor-pointer font-semibold transition-discrete duration-300 hover:-translate-y-1 rounded-xl flex items-center justify-center"
        >
          {loading ? <span className="flex items-center gap-2">Wysyłanie <Loader2Icon size={18} className="animate-spin"></Loader2Icon></span> : "Wyślij pomysł"}
        </button>
      </form>
    </div>
  );
}

export default IdeaPanel;
