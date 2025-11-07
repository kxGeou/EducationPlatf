// Dane firmy dla paragonów/faktur
// TODO: Przenieś te dane do tabeli w Supabase dla łatwiejszej konfiguracji

export const companyInfo = {
  name: "Platforma Edukacyjna",
  address: {
    street: "ul. Przykładowa 123",
    city: "Warszawa",
    postalCode: "00-000",
    country: "Polska"
  },
  nip: "1234567890", // TODO: Wpisz prawdziwy NIP
  regon: "123456789", // TODO: Wpisz prawdziwy REGON (opcjonalnie)
  email: "kontakt@platformaedukacyjna.pl",
  phone: "+48 123 456 789",
  website: "https://platformaedukacyjna.pl"
};

// Informacje o VAT dla paragonów
export const vatInfo = {
  rate: 0.23, // 23% VAT
  // Możesz dodać różne stawki VAT dla różnych produktów jeśli potrzebne
};



