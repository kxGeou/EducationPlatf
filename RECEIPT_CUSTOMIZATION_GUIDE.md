
Wszystkie ustawienia wyglądu paragonu znajdują się w pliku: **`src/utils/receiptGenerator.js`**

## 🎨 Główne elementy do edycji:

### 1. **Kolor główny paragonu** (linia 18)
```javascript
const primaryColor = [59, 130, 246]; // blue-500

```

### 2. **Nazwa firmy i dane kontaktowe**
Edytuj plik: **`src/config/companyInfo.js`**
- `name` - Nazwa firmy (wyświetla się na górze paragonu)
- `address` - Adres firmy
- `nip`, `regon` - Numery rejestracyjne
- `email`, `phone` - Kontakt

### 3. **Rozmiary czcionek**

**Nagłówek firmy** (linia 21):
```javascript
doc.setFontSize(18); // Zmień na większy/mniejszy (np. 20, 16)
```

**Typ dokumentu "PARAGON"** (linia 62):
```javascript
doc.setFontSize(16); // Zmień na większy/mniejszy
```

**Numer paragonu** (linia 69):
```javascript
doc.setFontSize(12); // Zmień na większy/mniejszy
```

**Pozostały tekst** (linia 27, 75, 85, itd.):
```javascript
doc.setFontSize(10); // Standardowy rozmiar
```

### 4. **Marginesy i odstępy**

**Główny margines** (linia 13):
```javascript
const margin = 20; // Zmień na większy (np. 30) dla więcej miejsca
```

**Odstępy między sekcjami** (linia 54):
```javascript
yPos += 10; // Zwiększ dla większych odstępów
```

### 5. **Kolory linii separatorowych** (linia 57)
```javascript
doc.setDrawColor(200, 200, 200); // Szary - zmień na inny kolor RGB
// Np. [100, 100, 100] - ciemniejszy szary
// [59, 130, 246] - niebieski (dopasowany do primaryColor)
```

### 6. **Kolor tła nagłówka tabeli** (linia 121)
```javascript
doc.setFillColor(240, 240, 240); // Jasnoszary - zmień na inny
// Np. [59, 130, 246] - niebieski
// [34, 197, 94] - zielony
```

### 7. **Kolor tekstu stopki** (linia 221)
```javascript
doc.setTextColor(120, 120, 120); // Szary - zmień na inny
```

### 8. **Tekst informacji prawnych** (linia 224-233)
Możesz całkowicie zmienić treść stopki:
```javascript
const footerText = [
  'INFORMACJE PRAWNE:',
  '• Paragon podlega przepisom...',
  // Dodaj/usun/zmień linie tutaj
];
```

### 9. **Format daty i godziny** (linia 76-84)
```javascript
// Format daty polski
const dateStr = purchaseDate.toLocaleDateString('pl-PL', {
  year: 'numeric',
  month: 'long', // 'long' = "styczeń", 'short' = "sty", 'numeric' = "01"
  day: 'numeric'
});

// Format godziny
const timeStr = purchaseDate.toLocaleTimeString('pl-PL', {
  hour: '2-digit',
  minute: '2-digit'
  // Dodaj: second: '2-digit' dla sekund
});
```

### 10. **Szerokość kolumn w tabeli produktów**
Linia 125-128 - pozycje tekstu:
```javascript
doc.text('Lp.', margin + 2, yPos);
doc.text('Nazwa produktu/usługi', margin + 15, yPos);
doc.text('Ilość', margin + contentWidth - 35, yPos);
doc.text('Cena', margin + contentWidth - 18, yPos);
// Zmień wartości +2, +15, -35, -18 aby przesunąć kolumny
```

## 📝 Przykładowe zmiany:

### Zmiana koloru na zielony:
```javascript
const primaryColor = [34, 197, 94]; // green-500
// I zmień również linię separatorową:
doc.setDrawColor(34, 197, 94); // Zamiast [200, 200, 200]
```

### Większe fonty dla lepszej czytelności:
```javascript
doc.setFontSize(20); // Nagłówek firmy (było 18)
doc.setFontSize(18); // PARAGON (było 16)
doc.setFontSize(14); // Numer paragonu (było 12)
doc.setFontSize(11); // Standardowy tekst (było 10)
```

### Dodanie logo:
```javascript
// Po linii 24, przed adresem:
try {
  const logoUrl = '/path/to/logo.png'; // Zmień na ścieżkę do logo
  const img = await loadImage(logoUrl);
  doc.addImage(img, 'PNG', margin, yPos - 10, 30, 15);
  yPos += 20; // Odstęp po logo
} catch (e) {
  console.log('Logo nie załadowane');
}
```



