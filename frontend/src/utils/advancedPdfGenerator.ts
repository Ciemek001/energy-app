import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Definicje typów (skrócone, zgodne z Twoim kodem)
interface Layer {
    materialId: number;
    thickness: number;
    // Opcjonalnie nazwa materiału, jeśli przekażesz ją z frontendu
    materialName?: string; 
    lambda?: number;
}

interface AuditData {
    input: any; // Dane wejściowe (formData)
    result: any; // Wyniki (EPResult)
    materials: any[]; // Baza materiałów (żeby połączyć ID z nazwą)
}

export const generateAdvancedReport = (data: AuditData) => {
    const doc = new jsPDF();
    const { input, result, materials } = data;

    // Helper: Znajdź nazwę materiału po ID
    const getMatName = (id: number) => {
        const m = materials.find((mat: any) => mat.id === id);
        return m ? `${m.name} (λ=${m.lambda_value})` : `Materiał ID: ${id}`;
    };

    // --- NAGŁÓWEK ---
    doc.setFillColor(2, 119, 189); // Kolor Primary (#0277bd)
    doc.rect(0, 0, 210, 20, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("RAPORT AUDYTU ENERGETYCZNEGO (WT 2021)", 105, 13, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 28);
    if(result.id) doc.text(`ID Audytu: #${result.id}`, 160, 28);

    // --- 1. WYNIKI GŁÓWNE (KOLOROWE KAFELKI) ---
    doc.setFontSize(12);
    doc.text("WYNIKI SYMULACJI", 14, 40);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);

    // Rysujemy prostokąt klasyfikacji
    const classColor = result.passed_wt2021 ? [46, 125, 50] : [198, 40, 40]; // Zielony lub Czerwony
    doc.setFillColor(classColor[0], classColor[1], classColor[2]);
    doc.roundedRect(14, 48, 40, 25, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("KLASA", 34, 55, { align: "center" });
    doc.setFontSize(22);
    doc.text(result.classification, 34, 66, { align: "center" });

    // Tekst obok klasy
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`EP (Energia Pierwotna): ${result.EP} kWh/m2rok`, 60, 53);
    doc.text(`EK (Energia Koncowa): ${result.EK} kWh/m2rok`, 60, 60);
    doc.text(`EU (Energia Uzytkowa): ${result.EU} kWh/m2rok`, 60, 67);

    // Status WT 2021
    const statusText = result.passed_wt2021 ? "ZGODNY Z WT 2021" : "NIE SPEŁNIA NORM WT 2021";
    doc.setTextColor(classColor[0], classColor[1], classColor[2]);
    doc.setFontSize(12);
    doc.text(statusText, 60, 75);

    // --- 2. FINANSE I MOC ---
    doc.setTextColor(0,0,0);
    autoTable(doc, {
        startY: 85,
        head: [['Szacunkowy Koszt Roczny', 'Moc Szczytowa (Projektowa)']],
        body: [[`${result.estimated_cost_pln} PLN`, `${result.peak_power_kw} kW`]],
        theme: 'grid',
        headStyles: { fillColor: [255, 143, 0] }, // Pomarańczowy
        styles: { halign: 'center', fontSize: 12, fontStyle: 'bold' }
    });

    // --- 3. BILANS STRAT ---
    doc.text("BILANS STRAT CIEPLA", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 12,
        head: [['Element', 'Strata (W/K)']],
        body: [
            ['Sciany Zewnetrzne', result.heat_loss_walls],
            ['Okna i Drzwi', result.heat_loss_windows],
            ['Wentylacja', result.heat_loss_ventilation]
        ],
        theme: 'striped',
        headStyles: { fillColor: [25, 118, 210] } // Niebieski
    });

    // --- 4. DANE BUDYNKU I INSTALACJE ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("PARAMETRY WEJSCIOWE", 14, finalY);

    autoTable(doc, {
        startY: finalY + 2,
        head: [['Parametr', 'Wartosc']],
        body: [
            ['Powierzchnia (Af)', `${input.area} m2`],
            ['Lokalizacja', `Strefa ${input.climateZone}`],
            ['Rok budowy', input.year],
            ['Mieszkancy', input.inhabitants],
            ['Zrodlo Ciepla', input.heatingSource.toUpperCase().replace("_", " ") + (input.hasSecondaryHeating ? " (+ Hybryda)" : "")],
            ['Wentylacja', input.ventilation === 'gravity' ? "Grawitacyjna" : "Rekuperacja"],
            ['Fotowoltaika (PV)', `${input.pvPower} kWp`],
            ['Kolektory Sloneczne', `${input.solarCollectorArea} m2`]
        ],
        theme: 'plain',
        styles: { fontSize: 9 }
    });

    // --- 5. SZCZEGÓŁY PRZEGRÓD (TABELA WARSTW) ---
    // Musimy to zrobić na nowej stronie, jeśli brakuje miejsca, autotable samo o to zadba.
    doc.text("STRUKTURA PRZEGROD", 14, (doc as any).lastAutoTable.finalY + 10);
    
    // Przygotowanie danych do tabeli przegród
    const layersRows: any[] = [];
    
    const addLayerSection = (title: string, layers: Layer[]) => {
        layersRows.push([{ content: title, colSpan: 3, styles: { fillColor: [238, 238, 238], fontStyle: 'bold' } }]);
        if (layers.length === 0) {
            layersRows.push(['Brak zdefiniowanych warstw', '-', '-']);
        } else {
            layers.forEach((l, i) => {
                layersRows.push([`${i+1}. ${getMatName(l.materialId)}`, `${l.thickness} cm`, '']);
            });
        }
    };

    addLayerSection("SCIANY ZEWNETRZNE", input.wallLayers);
    addLayerSection("DACH / STROP", input.roofLayers);
    addLayerSection("PODLOGA NA GRUNCIE", input.floorLayers);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 12,
        head: [['Material', 'Grubosc', '']],
        body: layersRows,
        theme: 'grid'
    });

    // --- STOPKA ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Strona ${i} z ${pageCount} | Wygenerowano przez EnergyApp`, 105, 290, { align: "center" });
    }

    // Zapis pliku
    doc.save(`Raport_Audyt_${input.area}m2_${new Date().toISOString().slice(0,10)}.pdf`);
};