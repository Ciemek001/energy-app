// frontend/views/SimpleCalculator.tsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Fade,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";

const SimpleCalculator: React.FC = () => {
  // Podstawowe dane budynku
  const [area, setArea] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [floors, setFloors] = useState<number | "">("");
  const [buildingType, setBuildingType] = useState("");

  // Konstrukcja i izolacja
  const [walls, setWalls] = useState("");
  const [roof, setRoof] = useState("");
  const [windows, setWindows] = useState("");
  const [floorInsulation, setFloorInsulation] = useState("");

  // Instalacje
  const [heating, setHeating] = useState("");
  const [hotWater, setHotWater] = useState("");
  const [ventilation, setVentilation] = useState("");

  // Zużycie energii
  const [electricity, setElectricity] = useState<number | "">("");
  const [heat, setHeat] = useState<number | "">("");
  const [residents, setResidents] = useState<number | "">("");

  const handleCalculate = () => {
    // Tu w przyszłości podłącz backend / logikę obliczeń
    alert(
      `Obliczenia dla budynku:\nPowierzchnia: ${area} m²\nRok budowy: ${year}\nLiczba kondygnacji: ${floors}\nTyp budynku: ${buildingType}`
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
      }}
    >
      <Fade in timeout={700}>
        <Card sx={{ width: "100%", maxWidth: 800, borderRadius: 3, p: 3 }} elevation={8}>
          <CardContent>
            <Stack spacing={3} alignItems="stretch">
              <Typography variant="h4" textAlign="center">
                Kalkulator Uproszczony
              </Typography>

              {/* Podstawowe dane o budynku */}
              <Typography variant="h6">1. Podstawowe dane o budynku</Typography>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <TextField
                  label="Powierzchnia użytkowa (m²)"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Rok budowy"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Liczba kondygnacji"
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  fullWidth
                />
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Typ budynku</InputLabel>
                <Select
                  value={buildingType}
                  label="Typ budynku"
                  onChange={(e) => setBuildingType(e.target.value)}
                >
                  <MenuItem value="dom">Dom jednorodzinny</MenuItem>
                  <MenuItem value="blok">Blok mieszkalny</MenuItem>
                  <MenuItem value="biuro">Biurowy</MenuItem>
                  <MenuItem value="inne">Inny</MenuItem>
                </Select>
              </FormControl>
                

              {/* Konstrukcja i izolacja */}
              <Typography variant="h6">2. Konstrukcja i izolacja</Typography>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <FormControl fullWidth>
                  <InputLabel>Ściany zewnętrzne</InputLabel>
                  <Select value={walls} label="Ściany zewnętrzne" onChange={(e) => setWalls(e.target.value)}>
                    <MenuItem value="cegla">Cegła</MenuItem>
                    <MenuItem value="pustak">Pustak</MenuItem>
                    <MenuItem value="beton">Beton</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Dach / stropodach</InputLabel>
                  <Select value={roof} label="Dach / stropodach" onChange={(e) => setRoof(e.target.value)}>
                    <MenuItem value="dach_ceramiczny">Dach ceramiczny</MenuItem>
                    <MenuItem value="dach_blacha">Blacha</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <FormControl fullWidth>
                  <InputLabel>Okna i drzwi</InputLabel>
                  <Select value={windows} label="Okna i drzwi" onChange={(e) => setWindows(e.target.value)}>
                    <MenuItem value="jednoszybowe">Jednoszybowe</MenuItem>
                    <MenuItem value="dwuszybowe">Dwuszybowe</MenuItem>
                    <MenuItem value="trzyszybowe">Trzyszybowe</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Podłoga na gruncie/piwnicy</InputLabel>
                  <Select
                    value={floorInsulation}
                    label="Podłoga na gruncie/piwnicy"
                    onChange={(e) => setFloorInsulation(e.target.value)}
                  >
                    <MenuItem value="ocieplona">Ocieplona</MenuItem>
                    <MenuItem value="nieocieplona">Nieocieplona</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Instalacje energetyczne */}
              <Typography variant="h6">3. Instalacje energetyczne</Typography>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <FormControl fullWidth>
                  <InputLabel>Rodzaj ogrzewania</InputLabel>
                  <Select value={heating} label="Rodzaj ogrzewania" onChange={(e) => setHeating(e.target.value)}>
                    <MenuItem value="gaz">Gaz</MenuItem>
                    <MenuItem value="prad">Prąd</MenuItem>
                    <MenuItem value="paliwo">Paliwo stałe</MenuItem>
                    <MenuItem value="pompa_ciepla">Pompa ciepła</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Ciepła woda użytkowa</InputLabel>
                  <Select value={hotWater} label="Ciepła woda" onChange={(e) => setHotWater(e.target.value)}>
                    <MenuItem value="bojler">Bojler elektryczny</MenuItem>
                    <MenuItem value="kociol_gazowy">Kocioł gazowy</MenuItem>
                    <MenuItem value="kolektory">Kolektory słoneczne</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Wentylacja</InputLabel>
                <Select value={ventilation} label="Wentylacja" onChange={(e) => setVentilation(e.target.value)}>
                  <MenuItem value="naturalna">Naturalna</MenuItem>
                  <MenuItem value="mechaniczna">Mechaniczna z odzyskiem ciepła</MenuItem>
                </Select>
              </FormControl>

              {/* Dane o zużyciu energii */}
              <Typography variant="h6">4. Dane o zużyciu energii (opcjonalnie)</Typography>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <TextField
                  label="Zużycie energii elektrycznej (kWh)"
                  type="number"
                  value={electricity}
                  onChange={(e) => setElectricity(Number(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Zużycie energii cieplnej (kWh)"
                  type="number"
                  value={heat}
                  onChange={(e) => setHeat(Number(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Liczba mieszkańców"
                  type="number"
                  value={residents}
                  onChange={(e) => setResidents(Number(e.target.value))}
                  fullWidth
                />
              </Stack>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                sx={{ mt: 3 }}
              >
                Oblicz efektywność
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default SimpleCalculator;
