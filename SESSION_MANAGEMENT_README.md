# System Zarządzania Sesjami - Single Device Login

## Opis

Uproszczony system zabezpieczenia, który pozwala na zalogowanie tylko jednego urządzenia na raz. Gwarantuje bezpieczeństwo kont użytkowników poprzez automatyczne wylogowanie z innych urządzeń przy próbie logowania z nowego urządzenia.

## Funkcjonalności

### 🔐 Zabezpieczenia
- **Single Device Login**: Tylko jedno urządzenie może być zalogowane na raz
- **Automatyczna walidacja sesji**: Sprawdzanie aktywności sesji co 5 minut
- **Wymuszenie wylogowania**: Możliwość wylogowania z innych urządzeń
- **Proste powiadomienia**: Minimalistyczne komunikaty o konflikcie sesji

### 📱 Uproszczone zarządzanie
- **Prosta informacja**: Toast z informacją o konflikcie sesji
- **Jedna opcja**: Wymuszenie wylogowania z innego urządzenia
- **Bez zbędnych danych**: Brak szczegółowych informacji o urządzeniach

## Instalacja

### 1. Baza danych

Wykonaj poniższy skrypt SQL w bazie danych Supabase:

```sql
-- Tabela do śledzenia sesji użytkowników
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- RLS (Row Level Security) policy
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: użytkownicy mogą widzieć tylko swoje sesje
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: użytkownicy mogą tworzyć tylko swoje sesje
CREATE POLICY "Users can create their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: użytkownicy mogą aktualizować tylko swoje sesje
CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: użytkownicy mogą usuwać tylko swoje sesje
CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Funkcja do dezaktywacji innych sesji użytkownika
CREATE OR REPLACE FUNCTION deactivate_other_sessions(p_user_id UUID, p_current_session_token TEXT)
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false, last_activity = NOW()
    WHERE user_id = p_user_id 
    AND session_token != p_current_session_token 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do sprawdzania czy użytkownik ma aktywną sesję
CREATE OR REPLACE FUNCTION has_active_session(p_user_id UUID, p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_sessions 
        WHERE user_id = p_user_id 
        AND session_token = p_session_token 
        AND is_active = true 
        AND expires_at > NOW()
        AND last_activity > NOW() - INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql;
```

### 2. Komponenty

System składa się z następujących komponentów:

- `useSessionValidation.js` - Hook do zarządzania sesjami
- Zaktualizowany `authStore.js` - Store z obsługą sesji
- Zaktualizowany `LoginForm.jsx` - Formularz logowania z obsługą konfliktów

## Użycie

### Podstawowe użycie

```javascript
import { useSessionValidation } from './hooks/useSessionValidation';

function MyComponent() {
  const { validateCurrentSession } = useSessionValidation();

  // Automatyczna walidacja sesji
  useEffect(() => {
    validateCurrentSession();
  }, []);

  return <div>...</div>;
}
```

## Struktura bazy danych

### Tabela `user_sessions`

| Pole | Typ | Opis |
|------|-----|------|
| `id` | UUID | Unikalny identyfikator sesji |
| `user_id` | UUID | ID użytkownika (FK do auth.users) |
| `session_token` | TEXT | Unikalny token sesji |
| `device_info` | JSONB | Podstawowe informacje o urządzeniu |
| `is_active` | BOOLEAN | Czy sesja jest aktywna |
| `created_at` | TIMESTAMP | Data utworzenia |
| `last_activity` | TIMESTAMP | Ostatnia aktywność |
| `expires_at` | TIMESTAMP | Data wygaśnięcia |

### Funkcje SQL

- `deactivate_other_sessions(user_id, current_token)` - Dezaktywuje inne sesje użytkownika
- `has_active_session(user_id, session_token)` - Sprawdza czy sesja jest aktywna

## Przepływ działania

### 1. Logowanie
1. Użytkownik wprowadza dane logowania
2. System sprawdza czy użytkownik ma już aktywną sesję
3. Jeśli tak - wyświetla prostą informację o konflikcie z opcją wymuszenia wylogowania
4. Jeśli nie - tworzy nową sesję i loguje użytkownika

### 2. Konflikt sesji
1. Użytkownik próbuje zalogować się z nowego urządzenia
2. System wykrywa aktywną sesję na innym urządzeniu
3. Wyświetla prostą sekcję z informacją i opcją wymuszenia wylogowania
4. Po potwierdzeniu - dezaktywuje inne sesje i tworzy nową

### 3. Walidacja sesji
1. System automatycznie sprawdza sesję co 5 minut
2. Sprawdza czy token sesji jest aktywny w bazie danych
3. Jeśli sesja wygasła - wylogowuje użytkownika
4. Jeśli sesja jest aktywna - aktualizuje czas ostatniej aktywności

## Bezpieczeństwo

### Ochrona przed:
- **Wieloma sesjami**: Tylko jedna aktywna sesja na użytkownika
- **Wygasłymi sesjami**: Automatyczne czyszczenie nieaktywnych sesji
- **Nieautoryzowanym dostępem**: Walidacja tokenów sesji

### Zalecenia:
- Regularne czyszczenie wygasłych sesji
- Monitoring podejrzanej aktywności

## Rozwiązywanie problemów

### Częste problemy:

1. **Sesja nie jest rozpoznawana**
   - Sprawdź czy token sesji jest zapisany w localStorage
   - Zweryfikuj czy sesja jest aktywna w bazie danych

2. **Sekcja konfliktu nie znika**
   - Sprawdź stan `sessionConflict` w authStore
   - Upewnij się że funkcja `resolveSessionConflict` działa poprawnie

3. **Błędy walidacji sesji**
   - Sprawdź połączenie z bazą danych
   - Zweryfikuj czy funkcje SQL są poprawnie utworzone

### Debugowanie:

```javascript
// Sprawdź token sesji
console.log('Session token:', localStorage.getItem('session_token'));

// Sprawdź aktywne sesje użytkownika
const { data } = await supabase
  .from('user_sessions')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true);
console.log('Active sessions:', data);
```

## Testowanie

### Scenariusze testowe:

1. **Logowanie z jednego urządzenia** ✅
2. **Próba logowania z drugiego urządzenia** ✅
3. **Wymuszenie wylogowania z innych urządzeń** ✅
4. **Wylogowanie i ponowne logowanie** ✅
5. **Wygasanie sesji** ✅

### Testy manualne:

1. Zaloguj się na pierwszym urządzeniu
2. Spróbuj zalogować się na drugim urządzeniu
3. Sprawdź czy sekcja konfliktu się wyświetla
4. Wymuś wylogowanie z pierwszego urządzenia
5. Sprawdź czy logowanie na drugim urządzeniu działa

## Aktualizacje

### Wersja 1.1 (Uproszczona)
- Uproszczony system single device login
- Prosta sekcja konfliktu sesji zamiast modala
- Usunięte zbędne dane o urządzeniach
- Usunięte zarządzanie sesjami z panelu użytkownika

### Wersja 1.0
- Podstawowy system single device login
- Modal konfliktu sesji
- Zarządzanie sesjami z panelu użytkownika
- Automatyczna walidacja sesji

---

**Autor**: AI Assistant  
**Data**: 2024  
**Wersja**: 1.1 (Uproszczona)
