import jsPDF from 'jspdf';
import { companyInfo, vatInfo } from '../config/companyInfo';

/**
 * Generuje profesjonalny paragon PDF zgodny z prawem
 * @param {Object} purchase - Obiekt transakcji z bazy danych
 * @param {Object} userData - Dane użytkownika (email, imię, nazwisko)
 * @param {Array} courseTitles - Lista nazw zakupionych kursów
 */
export const generateReceiptPDF = (purchase, userData = null, courseTitles = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Kolor główny (możesz zmienić)
  const primaryColor = [59, 130, 246]; // blue-500

  // ===== NAGŁÓWEK FIRMY =====
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyInfo.address.street}`, margin, yPos);
  yPos += 5;
  doc.text(`${companyInfo.address.postalCode} ${companyInfo.address.city}`, margin, yPos);
  yPos += 5;
  doc.text(`${companyInfo.address.country}`, margin, yPos);
  yPos += 5;
  
  if (companyInfo.nip) {
    doc.text(`NIP: ${companyInfo.nip}`, margin, yPos);
    yPos += 5;
  }
  if (companyInfo.regon) {
    doc.text(`REGON: ${companyInfo.regon}`, margin, yPos);
    yPos += 5;
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, margin, yPos);
    yPos += 5;
  }
  if (companyInfo.phone) {
    doc.text(`Tel: ${companyInfo.phone}`, margin, yPos);
    yPos += 5;
  }

  yPos += 10;

  // ===== LINIA =====
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ===== TYP DOKUMENTU =====
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('PARAGON', margin, yPos);
  yPos += 10;

  // ===== NUMER PARAGONU =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nr paragonu: #${purchase.transaction_number || purchase.id.slice(0, 8)}`, margin, yPos);
  yPos += 8;

  // ===== DATA I GODZINA =====
  const purchaseDate = new Date(purchase.created_at);
  const dateStr = purchaseDate.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = purchaseDate.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data sprzedaży: ${dateStr}, ${timeStr}`, margin, yPos);
  yPos += 10;

  // ===== DANE NABYWCY =====
  if (userData) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Nabywca:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    if (userData.user_metadata?.full_name) {
      doc.text(userData.user_metadata.full_name, margin, yPos);
      yPos += 5;
    }
    if (userData.email) {
      doc.text(userData.email, margin, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  // ===== LINIA =====
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ===== POZYCJE SZCZEGÓŁOWE =====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Pozycje szczegółowe:', margin, yPos);
  yPos += 8;

  // Nagłówek tabeli
  doc.setFontSize(9);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  
  doc.text('Lp.', margin + 2, yPos);
  doc.text('Nazwa produktu/usługi', margin + 15, yPos);
  doc.text('Ilość', margin + contentWidth - 35, yPos);
  doc.text('Cena', margin + contentWidth - 18, yPos);
  yPos += 8;

  // Produkty
  doc.setFont('helvetica', 'normal');
  let lineNumber = 1;
  const itemHeight = 8;
  const totalItems = courseTitles.length;
  
  // Jeśli nie ma courseTitles, użyj course_ids
  const itemsToDisplay = courseTitles.length > 0 
    ? courseTitles.map(title => ({ name: title, price: 0 }))
    : purchase.course_ids.map((id, idx) => ({ name: `Produkt ${idx + 1}`, price: 0 }));

  // Oblicz cenę na produkt (równomierny podział jeśli nie znamy cen poszczególnych)
  const pricePerItem = Math.floor(purchase.total_amount_cents / totalItems);
  const remainingCents = purchase.total_amount_cents % totalItems;

  itemsToDisplay.forEach((item, index) => {
    // Sprawdź czy potrzeba nowej strony
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }

    const itemPrice = index === 0 
      ? pricePerItem + remainingCents 
      : pricePerItem;

    doc.text(`${lineNumber}.`, margin + 2, yPos);
    
    // Długie nazwy - zawijanie tekstu
    const maxWidth = contentWidth - 60;
    const lines = doc.splitTextToSize(item.name || item, maxWidth);
    doc.text(lines[0], margin + 15, yPos);
    if (lines.length > 1) {
      doc.text(lines.slice(1), margin + 15, yPos + 4);
      yPos += (lines.length - 1) * 4;
    }
    
    doc.text('1', margin + contentWidth - 35, yPos);
    doc.text(`${(itemPrice / 100).toFixed(2)} zł`, margin + contentWidth - 18, yPos);
    
    yPos += itemHeight + (lines.length > 1 ? (lines.length - 1) * 3 : 0);
    lineNumber++;
  });

  yPos += 5;

  // ===== LINIA =====
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // ===== PODSUMOWANIE =====
  const totalCents = purchase.total_amount_cents;
  const totalBrutto = totalCents / 100;
  const totalNetto = totalBrutto / (1 + vatInfo.rate);
  const vatAmount = totalBrutto - totalNetto;

  // Sprawdź czy potrzeba nowej strony dla podsumowania
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Wartość netto: ${totalNetto.toFixed(2)} zł`, margin + contentWidth - 60, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`VAT (${(vatInfo.rate * 100).toFixed(0)}%): ${vatAmount.toFixed(2)} zł`, margin + contentWidth - 60, yPos, { align: 'right' });
  yPos += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin + contentWidth - 60, yPos - 5, 40, 8, 'F');
  doc.text(`RAZEM: ${totalBrutto.toFixed(2)} zł`, margin + contentWidth - 20, yPos, { align: 'right' });
  yPos += 15;

  // ===== LINIA =====
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ===== STOPKA =====
  // Sprawdź czy potrzeba nowej strony
  if (yPos > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  
  const footerText = [
    'INFORMACJE PRAWNE:',
    '• Paragon podlega przepisom ustawy o prawach konsumenta.',
    '• Konsument ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podania przyczyny.',
    '• Prawo odstąpienia nie przysługuje w przypadku dostarczenia treści cyfrowych nie zapisanych na nośniku materialnym,',
    '  jeżeli spełnienie świadczenia rozpoczęło się za wyraźną zgodą konsumenta przed upływem terminu do odstąpienia od umowy.',
    '',
    `Wystawiono: ${dateStr}, ${timeStr}`,
    `Numer paragonu: #${purchase.transaction_number || purchase.id.slice(0, 8)}`
  ];

  footerText.forEach((line, index) => {
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(line, margin, yPos);
    yPos += 4;
  });

  // ===== NAZWA PLIKU I POBRANIE =====
  const fileName = `paragon_#${purchase.transaction_number || purchase.id.slice(0, 8)}.pdf`;
  doc.save(fileName);
};




