// frontend/src/Statistics.tsx
import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const rankingData = [
  { id: 1, name: "Budynek A", efficiency: 95 },
  { id: 2, name: "Budynek B", efficiency: 92 },
  { id: 3, name: "Budynek C", efficiency: 90 },
  { id: 4, name: "Budynek D", efficiency: 88 },
];

const chartData = [
  { name: "Styczeń", consumption: 120 },
  { name: "Luty", consumption: 100 },
  { name: "Marzec", consumption: 140 },
  { name: "Kwiecień", consumption: 130 },
];

const Statistics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate("/mode-selection");
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Statystyki i Ranking Budynków
      </Typography>

      <Card sx={{ width: "100%", maxWidth: 900, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleChange} centered textColor="primary" indicatorColor="primary">
            <Tab label="Ranking" />
            <Tab label="Statystyki" />
          </Tabs>

          {tabValue === 0 && (
            <TableContainer
              component={Paper}
              sx={{
                mt: 3,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Miejsce</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nazwa Budynku</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Efektywność energetyczna (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.efficiency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <Box sx={{ mt: 3, height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" fill="#0277bd" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 2,
                padding: "10px 24px",
                fontWeight: 600,
                backgroundColor: "#0277bd",
                "&:hover": { backgroundColor: "#015a9c" },
              }}
              onClick={handleBack}
            >
              Powrót do strony głównej
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
