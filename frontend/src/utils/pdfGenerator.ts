// frontend/src/utils/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Funkcja usuwająca polskie znaki (dla kompatybilności ze standardową czcionką PDF)
const removeAccents = (str: string | number | null | undefined) => {
  if (typeof str !== 'string') return String(str || "");
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0142/g, "l");
};

export const generateEnergyReport = (inputData: any, results: any) => {
  const doc = new jsPDF();

  // --- NAGŁÓWEK ---
  doc.setFontSize(20);
  doc.setTextColor(40, 116, 166); // Niebieski
  doc.text("Raport Energetyczny Budynku", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data generowania: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });
  
  // Nazwa budynku jeśli jest
  if (inputData.name) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Nazwa projektu: ${removeAccents(inputData.name)}`, 14, 35);
  }

  // --- 1. DANE WEJŚCIOWE ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("1. Parametry Budynku", 14, 45);

  const inputRows = [
    ["Powierzchnia", `${inputData.area} m2`],
    ["Rok budowy", `${inputData.year}`],
    ["Kondygnacje", `${inputData.floors}`],
    ["Mieszkancy", `${inputData.inhabitants}`],
    ["Strefa klimatyczna", `${inputData.climateZone}`],
    ["Izolacja scian", removeAccents(inputData.standards.wall)],
    ["Izolacja dachu", removeAccents(inputData.standards.roof)],
    ["Okna", removeAccents(inputData.standards.window)],
    ["Ogrzewanie", removeAccents(inputData.systems.heatingPrimary)],
    ["Wentylacja", removeAccents(inputData.systems.ventilation)],
    ["Fotowoltaika (PV)", inputData.systems.pv ? "TAK" : "NIE"],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Parametr', 'Wartosc']],
    body: inputRows,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] }, // Zielony
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
  });

  // --- 2. WYNIKI ---
  let finalY = (doc as any).lastAutoTable.finalY || 100;
  
  doc.setFontSize(14);
  doc.text("2. Wyniki Analizy", 14, finalY + 15);

  const resultsRows = [
    ["Energia Uzytkowa (EU)", `${results.EU}`, "Zapotrzebowanie (izolacja)"],
    ["Energia Koncowa (EK)", `${results.EK}`, "Zuzycie mediow (rachunki)"],
    ["Energia Pierwotna (EP)", `${results.EP}`, "Ekologia (Wplyw na srodowisko)"],
  ];

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Wskaznik', 'Wynik [kWh/m2rok]', 'Opis']],
    body: resultsRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }, // Niebieski
    columnStyles: { 
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold', textColor: [200, 0, 0] } // Czerwony wynik
    }
  });

  // --- 3. REKOMENDACJE ---
  finalY = (doc as any).lastAutoTable.finalY || 150;
  
  if (results.recommendations && results.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("3. Rekomendacje Modernizacyjne", 14, finalY + 15);

      const recRows = results.recommendations.map((rec: any) => [
          rec.priority === "high" ? "WYSOKI" : "Sredni",
          removeAccents(rec.title),
          removeAccents(rec.description)
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Priorytet', 'Zalecenie', 'Opis']],
        body: recRows,
        headStyles: { fillColor: [211, 84, 0] }, // Pomarańczowy
        columnStyles: {
            0: { fontStyle: 'bold', width: 30 },
            1: { fontStyle: 'bold', width: 60 }
        }
      });
  }

  // --- STOPKA ---
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Wygenerowano przez EnergyApp - Praca Inzynierska', 105, 290, { align: 'center' });
  }

  doc.save(`Raport_Energetyczny_${new Date().toISOString().slice(0,10)}.pdf`);
};