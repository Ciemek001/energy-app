import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// 1. IMPORTUJEMY CZCIONKĘ Z PLIKU OBOK
import { fontBase64 } from "./fonts";

// --- SŁOWNIK TŁUMACZEŃ (Ten sam co wcześniej) ---
const TRANSLATIONS: Record<string, string> = {
  "coal": "Kocioł węglowy (Stary)",
  "coal_eco": "Ekogroszek",
  "biomass": "Biomasa / Pellet",
  "gas_stary": "Kocioł gazowy (Tradycyjny)",
  "gas_condensing": "Kocioł gazowy (Kondensacyjny)",
  "electric": "Ogrzewanie elektryczne",
  "heat_pump_air": "Pompa ciepła (Powietrzna)",
  "pompa_powietrze": "Pompa ciepła (Powietrzna)",
  "heat_pump_ground": "Pompa ciepła (Gruntowa)",
  "pompa_grunt": "Pompa ciepła (Gruntowa)",
  "fireplace": "Kominek",
  "wegiel": "Kocioł węglowy",
  "prad": "Prąd elektryczny",
  "gravity": "Grawitacyjna (Naturalna)",
  "grawitacyjna": "Grawitacyjna (Naturalna)",
  "mechanical_recovery": "Mechaniczna (Rekuperacja)",
  "mechaniczna": "Mechaniczna (Rekuperacja)",
  "brak": "Brak izolacji",
  "slaba": "Słaba izolacja (5-8 cm)",
  "srednia": "Średnia izolacja",
  "dobra": "Dobra izolacja (> 15 cm)",
  "stare": "Stare (Nieszczelne)",
  "standard": "Standardowe (2-szybowe)",
  "energo": "Energooszczędne (3-szybowe)",
  "nieocieplona": "Nieocieplona",
  "ocieplona": "Ocieplona",
  "low": "Niskie (Oszczędne)",
  "medium": "Standardowe",
  "high": "Wysokie (Komfort)",
  "to_samo": "Tak jak C.O.",
  "bojler": "Bojler elektryczny",
  "gazowy": "Podgrzewacz gazowy",
  "null": "Brak danych",
  "undefined": "Brak danych",
  "true": "Tak",
  "false": "Nie"
};

const t = (key: any) => {
  if (key === null || key === undefined) return "Brak danych";
  const k = String(key);
  return TRANSLATIONS[k] || k;
};

export const generateEnergyReport = (inputData: any, results: any) => {
  const doc = new jsPDF();

  // 2. REJESTRACJA CZCIONKI (BEZ FETCH, OD RAZU Z IMPORTU)
  if (fontBase64) {
      // Dodajemy plik do wirtualnego systemu plików PDF
      doc.addFileToVFS("CustomFont.ttf", fontBase64);
      // Rejestrujemy czcionkę pod nazwą "CustomFont"
      doc.addFont("CustomFont.ttf", "CustomFont", "normal");
      // Ustawiamy ją jako aktywną
      doc.setFont("CustomFont");
  } else {
      console.error("Błąd: Pusty ciąg Base64 czcionki!");
  }

  // --- NAGŁÓWEK ---
  doc.setFontSize(20);
  doc.setTextColor(40, 116, 166);
  doc.text("Raport Energetyczny Budynku", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data generowania: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });
  
  if (inputData.name) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Nazwa projektu: ${inputData.name}`, 14, 35);
  }

  // --- 1. DANE WEJŚCIOWE ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("1. Parametry Budynku", 14, 45);

  const inputRows = [
    ["Powierzchnia", `${inputData.area} m²`],
    ["Rok budowy", `${inputData.year}`],
    ["Kondygnacje", `${inputData.floors}`],
    ["Mieszkańcy", `${inputData.inhabitants}`],
    ["Strefa klimatyczna", `${inputData.climateZone}`],
    ["Izolacja ścian", t(inputData.standards.wall)],
    ["Izolacja dachu", t(inputData.standards.roof)],
    ["Okna", t(inputData.standards.window)],
    ["Podłoga", t(inputData.standards.floor)],
    ["Ogrzewanie", t(inputData.systems.heatingPrimary)],
    ["Wentylacja", t(inputData.systems.ventilation)],
    ["Fotowoltaika (PV)", inputData.systems.pv ? "TAK" : "NIE"],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Parametr', 'Wartość']],
    body: inputRows,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133] },
    // 3. KLUCZOWE: PRZYPISANIE CZCIONKI DO TABELI
    styles: { 
        font: "CustomFont", 
        fontStyle: 'normal' 
    },
    columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
  });

  // --- 2. WYNIKI ---
  let finalY = (doc as any).lastAutoTable.finalY || 100;
  
  doc.setFontSize(14);
  doc.text("2. Wyniki Analizy", 14, finalY + 15);

  const resultsRows = [
    ["Energia Użytkowa (EU)", `${results.EU}`, "Zapotrzebowanie (izolacja)"],
    ["Energia Końcowa (EK)", `${results.EK}`, "Zużycie mediów (rachunki)"],
    ["Energia Pierwotna (EP)", `${results.EP}`, "Ekologia (Wpływ na środowisko)"],
  ];

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Wskaźnik', 'Wynik [kWh/m²rok]', 'Opis']],
    body: resultsRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { 
        font: "CustomFont",
        fontStyle: 'normal'
    },
    columnStyles: { 
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold', textColor: [200, 0, 0] }
    }
  });

  // --- 3. REKOMENDACJE ---
  finalY = (doc as any).lastAutoTable.finalY || 150;
  
  if (results.recommendations && results.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("3. Rekomendacje Modernizacyjne", 14, finalY + 15);

      const recRows = results.recommendations.map((rec: any) => [
          rec.priority === "high" ? "WYSOKI" : "Średni",
          rec.title,
          rec.description
      ]);

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Priorytet', 'Zalecenie', 'Opis']],
        body: recRows,
        headStyles: { fillColor: [211, 84, 0] },
        styles: { 
            font: "CustomFont",
            fontStyle: 'normal'
        },
        columnStyles: {
            0: { fontStyle: 'bold', width: 30 },
            1: { fontStyle: 'bold', width: 60 }
        }
      });
  }

  // STOPKA
  const pageCount = doc.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Wygenerowano przez EnergyApp - Praca Inżynierska', 105, 290, { align: 'center' });
  }

  doc.save(`Raport_Energetyczny_${new Date().toISOString().slice(0,10)}.pdf`);
};