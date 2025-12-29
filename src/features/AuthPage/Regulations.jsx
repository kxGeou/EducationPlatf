import React from 'react'
import Header from '../../ui/Header';

function Regulations({isDark, setIsDark}) {
  return (
    <div data-theme={isDark ? "dark" : "light"} className="min-h-screen bg-gray-100 dark:bg-blackText">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1100px] px-6">
          <Header isDark={isDark} setIsDark={setIsDark}/>
        </div>
      </div>
      
      <div className="w-full flex justify-center mt-20">
        <div className="w-full max-w-[1100px] px-4 py-16">
          <div className="bg-white dark:bg-DarkblackBorder rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Regulamin
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">1. Postanowienia ogólne</h2>
              <p className="leading-relaxed">
                Niniejszy regulamin określa zasady korzystania z platformy edukacyjnej. 
                Korzystanie z platformy oznacza akceptację postanowień niniejszego regulaminu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">2. Definicje</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Platforma</strong> - serwis internetowy oferujący kursy edukacyjne</li>
                <li><strong>Użytkownik</strong> - osoba korzystająca z platformy</li>
                <li><strong>Kurs</strong> - materiał edukacyjny dostępny na platformie</li>
                <li><strong>Konto</strong> - konto użytkownika utworzone na platformie</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">3. Rejestracja i konto użytkownika</h2>
              <p className="leading-relaxed mb-4">
                Aby korzystać z pełnej funkcjonalności platformy, użytkownik musi utworzyć konto poprzez:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Wypełnienie formularza rejestracyjnego</li>
                <li>Podanie prawdziwych danych osobowych</li>
                <li>Akceptację regulaminu i polityki prywatności</li>
                <li>Potwierdzenie adresu e-mail</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">4. Zasady korzystania z platformy</h2>
              <p className="leading-relaxed mb-4">
                Użytkownik zobowiązuje się do:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Korzystania z platformy zgodnie z przepisami prawa</li>
                <li>Nieudostępniania treści kursów osobom trzecim</li>
                <li>Niepodejmowania działań mogących zakłócić działanie platformy</li>
                <li>Przechowywania danych logowania w bezpieczny sposób</li>
                <li>Niepublikowania treści naruszających prawa autorskie</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">5. Płatności i zwroty</h2>
              <p className="leading-relaxed mb-4">
                Płatności za kursy są realizowane poprzez bezpieczne bramki płatnicze. 
                W przypadku zakupu kursu użytkownik ma prawo do zwrotu w ciągu 14 dni od daty zakupu, 
                pod warunkiem że nie rozpoczął korzystania z kursu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">6. Prawa autorskie</h2>
              <p className="leading-relaxed">
                Wszystkie treści dostępne na platformie są chronione prawem autorskim. 
                Użytkownik otrzymuje prawo do osobistego użytku materiałów edukacyjnych. 
                Zabronione jest kopiowanie, rozpowszechnianie lub udostępnianie treści kursów 
                bez pisemnej zgody właściciela platformy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">7. Ochrona danych osobowych</h2>
              <p className="leading-relaxed">
                Administratorem danych osobowych jest właściciel platformy. 
                Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się 
                w <a href="/polityka-prywatnosci" className="text-primaryBlue dark:text-primaryGreen underline">Polityce Prywatności</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">8. Rezygnacja z konta</h2>
              <p className="leading-relaxed">
                Użytkownik ma prawo w każdej chwili zrezygnować z konta poprzez kontakt 
                z administratorem platformy. W przypadku rezygnacji konto zostanie usunięte, 
                jednak dostęp do zakupionych kursów może zostać zachowany zgodnie z warunkami zakupu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">9. Zmiany regulaminu</h2>
              <p className="leading-relaxed">
                Administrator zastrzega sobie prawo do wprowadzania zmian w regulaminie. 
                O zmianach użytkownicy będą informowani poprzez wiadomość e-mail lub komunikat na platformie. 
                Kontynuacja korzystania z platformy po wprowadzeniu zmian oznacza ich akceptację.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">10. Postanowienia końcowe</h2>
              <p className="leading-relaxed mb-4">
                W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego. 
                Wszelkie spory będą rozstrzygane przez właściwy sąd powszechny.
              </p>
              <p className="leading-relaxed">
                W przypadku pytań dotyczących regulaminu prosimy o kontakt: 
                <a href="mailto:kontakt@platforma.pl" className="text-primaryBlue dark:text-primaryGreen underline ml-1">
                  kontakt@platforma.pl
                </a>
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-DarkblackText">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Regulations