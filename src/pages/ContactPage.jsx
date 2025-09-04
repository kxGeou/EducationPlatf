import ContactHero from "../components/contact/ContactHero";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import { LoaderCircle, ChevronDown, Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import Gmail from '../assets/gmail.svg';
import supabase from "../util/supabaseClient";

function CustomSelect({ value, onChange, options, placeholder = "-- Wybierz temat --", className = "" }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find(o => o.value === value);

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      setHighlight(Math.max(0, options.findIndex(o => o.value === value)));
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          "w-full text-left p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-between " +
          className
        }
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected ? "" : "text-gray-500 dark:text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus:outline-none"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlight;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={
                  "px-3 py-2 cursor-pointer flex items-center justify-between " +
                  (isHighlighted ? "bg-indigo-50 dark:bg-indigo-900/40 " : "") +
                  (isSelected ? "font-medium " : "") +
                  "hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                }
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="dark:text-white">{opt.label}</span>
                {isSelected && <Check size={16} className="opacity-80" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ContactPage({ isDark, setIsDark }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    topic: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

const validateForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{9}$/; // tylko 9 cyfr
  const nameRegex = /^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]+$/; 

  if (!emailRegex.test(formData.email)) {
    toast.error("Podaj poprawny adres email.");
    return false;
  }
  if (formData.name.trim().length < 3) {
    toast.error("Imię i nazwisko musi mieć co najmniej 3 znaki.");
    return false;
  }
  if (!nameRegex.test(formData.name.trim())) {
    toast.error("Imię i nazwisko może zawierać tylko litery i spacje.");
    return false;
  }
  if (!formData.topic) {
    toast.error("Wybierz temat wiadomości.");
    return false;
  }
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    toast.error("Numer telefonu musi zawierać dokładnie 9 cyfr.");
    return false;
  }
  if (formData.message.trim().length < 5) {
    toast.error("Treść wiadomości musi mieć co najmniej 5 znaków.");
    return false;
  }
  return true;
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const { email, name, phone, topic, message } = formData;

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          email,
          name,
          phone: phone || null,
          topic,
          message,
        },
      ]);

      if (error) throw error;

      toast.success("Wiadomość zapisana!");
      setFormData({ email: "", name: "", phone: "", topic: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas zapisywania wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  const topics = [
    { label: "Matura z informatyki", value: "Matura z informatyki" },
    { label: "Kurs INF 0.2", value: "Kurs INF 0.2" },
    { label: "Kurs INF 0.3", value: "Kurs INF 0.3" },
    { label: "Inne", value: "Inne" },
  ];

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="w-full bg-gradient-to-br from-indigo-400/40 to-gray-100 dark:from-indigo-700 dark:to-blackText to-30% min-h-screen flex flex-col items-center"
    >
      <Header isDark={isDark} setIsDark={setIsDark} />

      <div className="w-full max-w-[1100px] px-4 ">
        <ContactHero />

        <div className="w-full bg-white border border-gray-100 dark:border-0 dark:bg-DarkblackBorder shadow-lg rounded-xl mb-32 px-6 py-8">
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
            Skontaktuj się z nami
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Twój email..."
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="name"
              placeholder="Imię i nazwisko..."
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Numer telefonu (opcjonalnie)"
              value={formData.phone}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <CustomSelect
              value={formData.topic}
              onChange={(v) => setFormData((p) => ({ ...p, topic: v }))}
              options={topics}
              placeholder="-- Wybierz temat --"
              className=""
            />

            <textarea
              name="message"
              placeholder="Treść wiadomości..."
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            ></textarea>

            <div className="flex items-center gap-2 mt-6">
              <button
                type="submit"
                className="bg-indigo-500 w-full cursor-pointer hover:scale-[1.005] hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-300"
              >
                {loading ? (
                  <span className="flex gap-2 items-center justify-center">
                    Wysyłanie <LoaderCircle size={20} className="animate-spin" />
                  </span>
                ) : (
                  <span>Wyślij formularz</span>
                )}
              </button>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=educationplatform.supabase@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 items-center text-blackText/75 bg-white border border-gray-200 shadow-md hover:scale-[1.025] font-semibold rounded-lg transition duration-300 justify-center px-4 py-4"
              >
                <img src={Gmail} className="h-5" alt="Gmail" />
              </a>
            </div>
          </form>
        </div>
      </div>

      <Footer  />
    </div>
  );
}

export default ContactPage;
