# Zarządzanie branchami - Funkcje w rozwoju

## Strategia branchy

- **Branch `main` (production)**: Zawiera tylko kod gotowy do publikacji. Funkcje w rozwoju są zakomentowane.
- **Branch `development`**: Zawiera wszystkie funkcje, w tym te w rozwoju (odkomentowane).

## Funkcje ukryte na main

Na branchu `main` następujące funkcje są zakomentowane:

1. **Blog** (`/blog`, `/blog/:id`)
   - Routes w `src/App.jsx`
   - Linki w `src/ui/Header.jsx` (desktop i mobile)
   - Linki w `src/features/MyCoursesPage/components/Navigation.jsx`
   - Renderowanie w `src/features/MyCoursesPage/components/CourseList.jsx`
   - Link w `src/features/HomePage/components/StripeHero.jsx`
   - W sekcji URL w `src/features/MyCoursesPage/MyCourses.jsx`

2. **Zasoby testowe** (`/zasoby`)
   - Route w `src/App.jsx`
   - Linki w `src/ui/Header.jsx` (desktop i mobile)
   - Linki w `src/features/MyCoursesPage/components/Navigation.jsx`
   - Renderowanie w `src/features/MyCoursesPage/components/CourseList.jsx`
   - W sekcji URL w `src/features/MyCoursesPage/MyCourses.jsx`

3. **Kalendarz** (`/calendar`)
   - Route w `src/App.jsx`
   - Linki w `src/ui/Header.jsx` (desktop i mobile)

4. **Kursy Landing Page** (`/kurs/:id`)
   - Route w `src/App.jsx`
   - Dropdown "Kursy" w `src/ui/Header.jsx` (desktop i mobile)
   - Import CourseLandingPage w `src/App.jsx`

5. **Kursy na stronie głównej**
   - Komponent `src/features/HomePage/components/Courses.jsx` - wyświetla ebooki zamiast kursów na main
   - Import CourseCard jest zakomentowany, używany jest EbookCard
   - fetchCourses jest zakomentowany, używany jest fetchEbooks
   - Komponent `src/features/HomePage/components/EbookCard.jsx` - po kliknięciu przekierowuje do `/course/${courseId}?section=shop&tab=ebooks`

6. **Panel Video w CoursePage**
   - VideoPanel jest zakomentowany w `src/features/CoursePage/CoursePage.jsx`
   - Link "Wideo" w CourseSidebar jest zakomentowany
   - Automatyczne zamykanie sidebara dla video jest zakomentowane
   - Domyślny activeSection zmieniony z "video" na "info"

7. **Sklep w CoursePage**
   - `src/features/CoursePage/components/ShopPanel.jsx` - pokazuje tylko ebooki (bez sekcji kursu)
   - Zakładki "Sekcje" i "E-booki" są zakomentowane - zawsze pokazuje ebooki
   - fetchCoursePackages jest zakomentowany
   - fetchEbooks pobiera ebooki filtrowane po course_id
   - Po kliknięciu na zakupiony ebook, otwiera go bezpośrednio w CoursePage (zamiast przekierowywać na /ebook/:id)

8. **Panel E-book w CoursePage**
   - Panel "E-book" jest zawsze widoczny w CourseSidebar (niezależnie od purchasedEbooks)
   - Po kliknięciu na "E-book" otwiera pierwszy ebook powiązany z kursem
   - Ebook wyświetlany jest bezpośrednio w CoursePage używając EbookViewerPanel, EbookInfoPanel, EbookTasksPanel

9. **Fiszki (Flashcards)**
   - Import FlashcardPanel zakomentowany w `src/features/CoursePage/CoursePage.jsx`
   - Renderowanie FlashcardPanel zakomentowane w CoursePage
   - Link "Fiszki" zakomentowany w `src/features/CoursePage/components/CourseSidebar.jsx`

10. **Postęp (Chart)**
   - Import ChartPanel zakomentowany w `src/features/CoursePage/CoursePage.jsx`
   - Renderowanie ChartPanel zakomentowane w CoursePage
   - Link "Postęp" zakomentowany w `src/features/CoursePage/components/CourseSidebar.jsx`

11. **Ranking (Leaderboard)**
   - Import Leaderboard zakomentowany w `src/features/MyCoursesPage/components/CourseList.jsx`
   - Renderowanie Leaderboard zakomentowane w CourseList
   - Linki "Ranking" zakomentowane w `src/features/MyCoursesPage/components/Navigation.jsx` (desktop, mobile collapsed, mobile menu)
   - Usunięte z listy dozwolonych sekcji w `src/features/MyCoursesPage/MyCourses.jsx`

12. **Nagrody (Rewards)**
   - Import Rewards zakomentowany w `src/features/MyCoursesPage/components/CourseList.jsx`
   - Renderowanie Rewards zakomentowane w CourseList
   - Linki "Nagrody" zakomentowane w `src/features/MyCoursesPage/components/Navigation.jsx` (desktop, mobile collapsed, mobile menu)
   - Usunięte z listy dozwolonych sekcji w `src/features/MyCoursesPage/MyCourses.jsx`

13. **Statystyki kursu (Course Statistics)**
   - Sekcja ze statystykami kursu (Liczba lekcji, Liczba działów, Czas kursu) zakomentowana w `src/features/CoursePage/components/CourseInfo.jsx`

## Format komentarzy

Wszystkie komentarze używają formatu:

```javascript
{/* DEV: [Nazwa funkcji] - odkomentuj na development, zakomentuj na main */}
{/* 
  [kod do ukrycia]
*/}
{/* DEV: END [Nazwa funkcji] */}
```

lub dla importów:

```javascript
// DEV: [Nazwa funkcji] - odkomentuj na development, zakomentuj na main
// import ...
// DEV: END [Nazwa funkcji]
```

## Proces przed mergem do main

1. **Przed mergem z development do main:**
   - Upewnij się, że wszystkie funkcje DEV są zakomentowane
   - Sprawdź wszystkie pliki z listy poniżej
   - Przetestuj aplikację, aby upewnić się, że ukryte funkcje nie są dostępne

2. **Przed mergem z main do development:**
   - Odkomentuj wszystkie funkcje DEV
   - Sprawdź wszystkie pliki z listy poniżej
   - Przetestuj aplikację, aby upewnić się, że wszystkie funkcje działają

## Lista plików do sprawdzenia

Przed każdym mergem sprawdź następujące pliki:

- `src/App.jsx` - routes i importy (Blog, Zasoby, Kalendarz, CourseLandingPage)
- `src/ui/Header.jsx` - linki nawigacyjne (desktop i mobile) - Blog, Zasoby, Kalendarz, Kursy dropdown
- `src/features/MyCoursesPage/components/Navigation.jsx` - linki w sidebarze (desktop, mobile collapsed, mobile menu) - Blogi, Zasoby
- `src/features/MyCoursesPage/components/CourseList.jsx` - renderowanie sekcji (Blogi, Zasoby, Ranking, Nagrody)
- `src/features/HomePage/components/StripeHero.jsx` - link do bloga
- `src/features/MyCoursesPage/MyCourses.jsx` - lista dozwolonych sekcji (blogs, resources, leaderboard, rewards)
- `src/features/MyCoursesPage/components/Navigation.jsx` - linki nawigacyjne (Ranking, Nagrody) - desktop, mobile collapsed, mobile menu
- `src/features/HomePage/components/Courses.jsx` - wyświetlanie kursów/ebooków na stronie głównej
- `src/features/CoursePage/CoursePage.jsx` - VideoPanel zakomentowany, FlashcardPanel zakomentowany, ChartPanel zakomentowany, domyślny activeSection, ebook sections
- `src/features/CoursePage/components/CourseSidebar.jsx` - link "Wideo" zakomentowany, link "Fiszki" zakomentowany, link "Postęp" zakomentowany, ebook zawsze widoczny
- `src/features/CoursePage/components/ShopPanel.jsx` - zakładki sekcji zakomentowane, tylko ebooki
- `src/features/CoursePage/components/CourseInfo.jsx` - statystyki kursu (Liczba lekcji, Liczba działów, Czas kursu) zakomentowane

## Przykład zmian

### Na main (zakomentowane):
```javascript
// DEV: Blog routes - odkomentuj na development, zakomentuj na main
// <Route path='/blog' element={<BlogMainPage ... />} />
// <Route path='/blog/:id' element={<BlogPage ... />} />
// DEV: END Blog routes
```

### Na development (odkomentowane):
```javascript
<Route path='/blog' element={<BlogMainPage ... />} />
<Route path='/blog/:id' element={<BlogPage ... />} />
```

## Uwagi

- Nie zapomnij o komentowaniu/odkomentowaniu importów, jeśli są używane tylko w komentowanych sekcjach
- Sprawdź również komponenty, które mogą importować te funkcje
- Testuj nawigację - upewnij się, że zakomentowane funkcje nie są dostępne przez bezpośrednie linki URL

