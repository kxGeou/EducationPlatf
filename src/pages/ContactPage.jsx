import ContactHero from "../components/contact/ContactHero";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import { LoaderCircle, ChevronDown, Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import Gmail from '../assets/gmail.svg';
import supabase from "../util/supabaseClient";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import plLocale from "@fullcalendar/core/locales/pl";

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

function BookingCalendar() {
  const [events, setEvents] = useState([]);
  const [titleInput, setTitleInput] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [initError, setInitError] = useState("");
  const tokenClientRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  const scope = "https://www.googleapis.com/auth/calendar.events";

  useEffect(() => {
    const ensureScript = (id, src, onload) => {
      const existing = document.getElementById(id);
      if (existing) return;
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      s.defer = true;
      s.onload = onload;
      s.onerror = () => setInitError("Nie udało się załadować skryptów Google.");
      document.body.appendChild(s);
    };

    // Load Google API client (no deprecated auth2)
    ensureScript("gapi-script", "https://apis.google.com/js/api.js", async () => {
      if (window.gapi) {
        try {
          await window.gapi.load("client", async () => {
            try {
              await window.gapi.client.init({ apiKey, discoveryDocs });
              setGapiLoaded(true);
              if (accessToken) {
                window.gapi.client.setToken({ access_token: accessToken });
              }
            } catch (e) {
              console.error(e);
              setInitError("Błąd inicjalizacji Google API client.");
            }
          });
        } catch (e) {
          console.error(e);
          setInitError("Błąd ładowania Google API.");
        }
      }
    });

    // Load Google Identity Services for OAuth 2.0 tokens
    ensureScript("gis-script", "https://accounts.google.com/gsi/client", () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope,
            callback: (resp) => {
              if (resp && resp.access_token) {
                setAccessToken(resp.access_token);
                setIsAuthorized(true);
                if (window.gapi && window.gapi.client) {
                  window.gapi.client.setToken({ access_token: resp.access_token });
                }
                fetchCalendarEvents();
              } else if (resp && resp.error) {
                toast.error("Nie udało się uzyskać tokenu dostępu.");
              }
            },
          });
          setGisLoaded(true);
        } catch (e) {
          console.error(e);
          setInitError("Błąd inicjalizacji Google Identity Services.");
        }
      }
    });
  }, [apiKey, clientId, discoveryDocs, scope, accessToken]);

  const handleSignIn = async () => {
    if (!apiKey || !clientId) {
      setInitError("Brak konfiguracji Google (VITE_GOOGLE_API_KEY/CLIENT_ID).");
      return;
    }
    if (!gapiLoaded || !gisLoaded || !tokenClientRef.current) {
      toast.info("Trwa ładowanie usług Google, spróbuj ponownie za chwilę.");
      return;
    }
    try {
      tokenClientRef.current.requestAccessToken({ prompt: accessToken ? "" : "consent" });
    } catch (e) {
      console.error(e);
      toast.error("Logowanie Google nie powiodło się.");
    }
  };

  const handleSignOut = async () => {
    try {
      if (accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(accessToken, () => {});
      }
      setAccessToken("");
      setIsAuthorized(false);
      setEvents([]);
      if (window.gapi && window.gapi.client) {
        window.gapi.client.setToken(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      // @ts-ignore
      const resp = await window.gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
        timeMax: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 2500,
        orderBy: "startTime",
      });
      const mapped = (resp.result.items || []).map((ev) => ({
        id: ev.id,
        title: ev.summary || "(bez tytułu)",
        start: ev.start?.dateTime || ev.start?.date,
        end: ev.end?.dateTime || ev.end?.date,
      }));
      setEvents(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się pobrać wydarzeń z Google Kalendarza.");
    }
  };

  const createCalendarEvent = async (startDate) => {
    const title = titleInput.trim();
    if (!title) {
      toast.error("Podaj tytuł zajęć.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    try {
      // @ts-ignore
      const result = await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: {
          summary: title,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        },
      });
      const ev = result.result;
      setEvents((prev) => [
        ...prev,
        {
          id: ev.id,
          title: ev.summary || title,
          start: ev.start?.dateTime || ev.start?.date,
          end: ev.end?.dateTime || ev.end?.date,
        },
      ]);
      toast.success("Wydarzenie utworzone w Google Kalendarzu.");
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się utworzyć wydarzenia.");
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-lg bg-white dark:bg-DarkblackBorder">
      <div className="flex flex-col gap-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Tytuł zajęć..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <CustomSelect
            value={durationMinutes}
            onChange={(v) => setDurationMinutes(Number(v))}
            options={[
              { label: "30 min", value: 30 },
              { label: "60 min", value: 60 },
              { label: "90 min", value: 90 },
              { label: "120 min", value: 120 },
            ]}
            placeholder="-- Czas trwania --"
          />
          <div className="flex items-center gap-2">
            {!isAuthorized ? (
              <button
                type="button"
                onClick={handleSignIn}
                className="px-4 py-3 rounded-lg font-semibold transition bg-indigo-500 text-white w-full"
                disabled={!gapiLoaded && !initError}
              >
                Zaloguj się Google
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-3 rounded-lg font-semibold transition bg-gray-200 dark:bg-gray-700 w-full"
              >
                Wyloguj
              </button>
            )}
          </div>
        </div>
        {initError && (
          <p className="text-sm text-red-600 dark:text-red-400">{initError}</p>
        )}
        {!initError && !isAuthorized && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Zaloguj się, aby zobaczyć swój kalendarz i tworzyć wydarzenia.
          </p>
        )}
        {isAuthorized && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Wybierz dzień/godzinę w kalendarzu, aby dodać wydarzenie.
          </p>
        )}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale={plLocale}
        dateClick={async (info) => {
          if (!isAuthorized) {
            toast.info("Zaloguj się Google, aby tworzyć wydarzenia.");
            return;
          }
          await createCalendarEvent(info.date);
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        height="auto"
        eventColor="#6366F1"
        dayHeaderContent={(args) => <span className="text-gray-700 dark:text-white">{args.text}</span>}
        dayCellClassNames={() => "hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors rounded"}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        selectable={true}
      />
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
  const [mode, setMode] = useState("message"); // "message" | "calendar"

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

    if (!emailRegex.test(formData.email)) { toast.error("Podaj poprawny adres email."); return false; }
    if (formData.name.trim().length < 3 || !nameRegex.test(formData.name.trim())) { toast.error("Imię i nazwisko musi mieć co najmniej 3 litery i zawierać tylko litery/spacje."); return false; }
    if (!formData.topic) { toast.error("Wybierz temat."); return false; }
    if (formData.phone && !phoneRegex.test(formData.phone)) { toast.error("Numer telefonu musi mieć dokładnie 9 cyfr."); return false; }
    if (formData.message.trim().length < 5) { toast.error("Treść wiadomości musi mieć co najmniej 5 znaków."); return false; }
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
    <div data-theme={isDark ? "dark" : "light"} className="w-full bg-gradient-to-br from-indigo-400/40 to-gray-100 dark:from-indigo-700 dark:to-blackText to-30% min-h-screen flex flex-col items-center">
      <Header isDark={isDark} setIsDark={setIsDark} />
      <div className="w-full max-w-[1100px] px-4">
        <ContactHero />

        <div className="w-full bg-white border border-gray-100 dark:border-0 dark:bg-DarkblackBorder shadow-lg rounded-xl mb-32 px-6 py-8">
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Skontaktuj się z nami</h2>

          {/* Przełącznik trybu */}
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setMode("message")} className={`px-6 py-2 rounded-lg font-semibold transition ${mode === "message" ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>Formularz</button>
            <button onClick={() => setMode("calendar")} className={`px-6 py-2 rounded-lg font-semibold transition ${mode === "calendar" ? "bg-indigo-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>Kalendarz</button>
          </div>

          {mode === "message" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="email" name="email" placeholder="Twój email..." value={formData.email} onChange={handleChange} required className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="text" name="name" placeholder="Imię i nazwisko..." value={formData.name} onChange={handleChange} required className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="tel" name="phone" placeholder="Numer telefonu (opcjonalnie)" value={formData.phone} onChange={handleChange} className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <CustomSelect value={formData.topic} onChange={(v) => setFormData((p) => ({ ...p, topic: v }))} options={topics} placeholder="-- Wybierz temat --" />
              <textarea name="message" placeholder="Treść wiadomości..." value={formData.message} onChange={handleChange} required rows="5" className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-DarkblackText dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <div className="flex items-center gap-2 mt-6">
                <button type="submit" className="bg-indigo-500 w-full cursor-pointer hover:scale-[1.005] hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-300">{loading ? <span className="flex gap-2 items-center justify-center">Wysyłanie <LoaderCircle size={20} className="animate-spin" /></span> : <span>Wyślij formularz</span>}</button>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=educationplatform.supabase@gmail.com" target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center text-blackText/75 bg-white border border-gray-200 shadow-md hover:scale-[1.025] font-semibold rounded-lg transition duration-300 justify-center px-4 py-4">
                  <img src={Gmail} className="h-5" alt="Gmail" />
                </a>
              </div>
            </form>
          )}

          {mode === "calendar" && <BookingCalendar />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ContactPage;
