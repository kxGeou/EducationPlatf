import ContactHero from "../components/contact/ContactHero";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import { LoaderCircle, ChevronDown, Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Gmail from "../assets/gmail.svg";
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

  const selected = options.find((o) => o.value === value);

  const handleKeyDown = (e) => {
    if (!open && ["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      setHighlight(Math.max(0, options.findIndex((o) => o.value === value)));
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") setHighlight((h) => (h + 1) % options.length);
    else if (e.key === "ArrowUp") setHighlight((h) => (h - 1 + options.length) % options.length);
    else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          "w-full text-left p-4 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-primaryBlue flex items-center justify-between transition shadow-sm hover:shadow-md " +
          className
        }
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? "" : "text-gray-400 dark:text-gray-500"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl focus:outline-none"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlight;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition ${
                  isHighlighted ? "bg-indigo-50 dark:bg-indigo-900/40" : ""
                } ${isSelected ? "font-semibold" : ""} hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="dark:text-white">{opt.label}</span>
                {isSelected && <Check size={16} className="opacity-80 text-indigo-500" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Calendly() {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg">
      <div
        className="calendly-inline-widget w-full h-[700px]"
        data-url="https://calendly.com/educationplatform-supabase/30min?text_color=0a2540&primary_color=00498a"
      ></div>
      <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
    </div>
  );
}

function ContactPage({ isDark, setIsDark }) {
  const [formData, setFormData] = useState({ email: "", name: "", phone: "", topic: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("message");

  const topics = [
    { label: "Matura z informatyki", value: "Matura z informatyki" },
    { label: "Kurs INF 0.2", value: "Kurs INF 0.2" },
    { label: "Kurs INF 0.3", value: "Kurs INF 0.3" },
    { label: "Inne", value: "Inne" },
  ];

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{9}$/;
    const nameRegex = /^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]+$/;

    if (!emailRegex.test(formData.email)) {
      toast.error("Podaj poprawny adres email.");
      return false;
    }
    if (formData.name.trim().length < 3 || !nameRegex.test(formData.name.trim())) {
      toast.error("Imię i nazwisko musi mieć co najmniej 3 litery i zawierać tylko litery/spacje.");
      return false;
    }
    if (!formData.topic) {
      toast.error("Wybierz temat.");
      return false;
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Numer telefonu musi mieć dokładnie 9 cyfr.");
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

    try {
      const { error } = await supabase.from("contact_messages").insert([formData]);
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

  return (
    <div data-theme={isDark ? "dark" : "light"} className="w-full min-h-screen bg-gray-100 dark:bg-blackText flex flex-col items-center">
      <Header isDark={isDark} setIsDark={setIsDark} />
      <div className="w-full max-w-[1100px] px-4 mt-8">
        <ContactHero />

        <div className="w-full bg-white dark:bg-DarkblackBorder rounded-2xl shadow-xl p-8 mt-12">
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Skontaktuj się z nami</h2>

          <div className="flex justify-center gap-6 mb-8">
            {["message", "calendar"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  mode === m ? "bg-primaryBlue dark:bg-primaryGreen text-white shadow-lg" : "bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-300"
                } hover:scale-105`}
              >
                {m === "message" ? "Formularz" : "Kalendarz"}
              </button>
            ))}
          </div>

          {mode === "message" && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="email" name="email" placeholder="Twój email..." value={formData.email} onChange={handleChange} required className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition" />
              <input type="text" name="name" placeholder="Imię i nazwisko..." value={formData.name} onChange={handleChange} required className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition" />
              <input type="tel" name="phone" placeholder="Numer telefonu (opcjonalnie)" value={formData.phone} onChange={handleChange} className="p-4 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition" />
              <CustomSelect value={formData.topic} onChange={(v) => setFormData((p) => ({ ...p, topic: v }))} options={topics} placeholder="-- Wybierz temat --" />

              <textarea name="message" placeholder="Treść wiadomości..." value={formData.message} onChange={handleChange} required rows="5" className="p-4 col-span-1 md:col-span-2 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition" />

              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                <button type="submit" className="bg-primaryBlue dark:bg-primaryGreen w-full md:w-auto flex-1 text-white font-semibold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                  {loading ? <LoaderCircle size={20} className="animate-spin" /> : "Wyślij formularz"}
                </button>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=educationplatform.supabase@gmail.com" target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center justify-center w-full md:w-auto px-6 py-4 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:scale-105 transition">
                  <img src={Gmail} className="h-5" alt="Gmail" /> Wyślij przez Gmail
                </a>
              </div>
            </form>
          )}

          {mode === "calendar" && <Calendly />}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContactPage;
