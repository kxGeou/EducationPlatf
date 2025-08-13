import ContactHero from "../components/contact/ContactHero";
import Footer from "../components/homepage/Footer";
import Header from "../components/homepage/Header";
import { LoaderCircle } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Gmail from '../assets/gmail.svg';
import supabase from "../util/supabaseClient";

function ContactPage({ isDark, setIsDark }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, name, phone, message } = formData;

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          email,
          name,
          phone: phone || null,
          message,
        },
      ]);

      if (error) throw error;

      toast.success("Wiadomość zapisana!");
      setFormData({ email: "", name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas zapisywania wiadomości.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="w-full bg-gradient-to-br from-indigo-500/50 to-white to-30% min-h-screen flex flex-col items-center"
    >
      <Header isDark={isDark} setIsDark={setIsDark} />

      <div className="w-full max-w-[1100px] px-4 ">
        <ContactHero />

        <div className="w-full bg-white dark:bg-gray-800 border border-gray-100 shadow-lg rounded-xl mb-32 px-6 py-8">
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
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="name"
              placeholder="Imię i nazwisko..."
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Numer telefonu (opcjonalnie)"
              value={formData.phone}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <textarea
              name="message"
              placeholder="Treść wiadomości..."
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            ></textarea>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-indigo-500 w-full cursor-pointer hover:scale-[1.005] hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-300"
              >
                {loading ? (
                  <span className="flex gap-2 items-center justify-center">
                    Wysyłanie{" "}
                    <LoaderCircle size={20} className="animate-spin" />
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

      <Footer padding="px-4" />
    </div>
  );
}

export default ContactPage;
