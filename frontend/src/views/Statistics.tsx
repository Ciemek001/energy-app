import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Paper, Card, CardContent, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BoltIcon from "@mui/icons-material/Bolt";
import HomeIcon from "@mui/icons-material/Home";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { API_URL } from "../config";

// Kolory do wykresów
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/statistics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) setData(await res.json());
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
  if (!data) return <Box p={5}>Brak danych.</Box>;

  // Karta KPI (Komponent pomocniczy)
  const StatCard = ({ title, value, icon, color }: any) => (
      <Card elevation={3} sx={{ height: '100%', borderLeft: `6px solid ${color}` }}>
          <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                      <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">{title}</Typography>
                      <Typography variant="h4" fontWeight="bold">{value}</Typography>
                  </Box>
                  {icon}
              </Stack>
          </CardContent>
      </Card>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", pb: 8 }}>
        {/* NAGŁÓWEK */}
        <Box sx={{ bgcolor: "white", py: 2, px: 3, boxShadow: 1, mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
             <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/mode-selection")}>Menu</Button>
             <Typography variant="h6" fontWeight="bold" color="primary">Statystyki i Rankingi</Typography>
        </Box>

        <Container maxWidth="lg">
            
            {/* 1. KAFELKI KPI */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="PRZEBADANYCH BUDYNKÓW" 
                        value={data.kpi.total_audits} 
                        icon={<HomeIcon sx={{ fontSize: 40, color: '#1976d2' }} />} 
                        color="#1976d2" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="INSTALACJE PV" 
                        value={data.kpi.pv_users} 
                        icon={<SolarPowerIcon sx={{ fontSize: 40, color: '#ed6c02' }} />} 
                        color="#ed6c02" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="POMPY CIEPŁA" 
                        value={data.kpi.heat_pump_users} 
                        icon={<BoltIcon sx={{ fontSize: 40, color: '#2e7d32' }} />} 
                        color="#2e7d32" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="POWIERZCHNIA ŁĄCZNA" 
                        value={`${data.kpi.total_area_m2} m²`} 
                        icon={<HomeIcon sx={{ fontSize: 40, color: '#9c27b0' }} />} 
                        color="#9c27b0" 
                    />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* 2. WYKRES KOŁOWY (ŹRÓDŁA CIEPŁA) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Struktura Źródeł Ogrzewania</Typography>
                        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.sources}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.charts.sources.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. RANKING (TOP 5 WYKRES) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Top 5 Najbardziej Energooszczędnych (EP)</Typography>
                        <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={data.leaderboard.slice(0, 5)}
                                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10}} />
                                    <RechartsTooltip />
                                    <Bar dataKey="ep" fill="#82ca9d" name="EP (kWh/m²rok)" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* 4. TABELA RANKINGOWA (PEŁNA) */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" gap={2} mb={2}>
                            <EmojiEventsIcon color="warning" fontSize="large"/>
                            <Typography variant="h5" fontWeight="bold">Ranking "Złota Modernizacja"</Typography>
                        </Stack>
                        <Typography color="text.secondary" paragraph>
                            Lista budynków o najniższym wskaźniku EP (Energii Pierwotnej). Im niższy wynik, tym bardziej ekologiczny budynek.
                        </Typography>
                        
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#eee' }}>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Nazwa / Audyt</TableCell>
                                        <TableCell>Typ</TableCell>
                                        <TableCell>Źródło Ciepła</TableCell>
                                        <TableCell align="right">Wynik EP</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.leaderboard.map((row: any, index: number) => (
                                        <TableRow key={index} hover sx={{ bgcolor: index === 0 ? '#fff8e1' : 'inherit' }}>
                                            <TableCell>
                                                {index === 0 ? <EmojiEventsIcon fontSize="small" sx={{color:'#ffb300'}}/> : index + 1}
                                            </TableCell>
                                            <TableCell fontWeight="bold">{row.name}</TableCell>
                                            <TableCell>{row.type}</TableCell>
                                            <TableCell>{row.source.replace("_", " ").toUpperCase()}</TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                    label={`${Math.round(row.ep)} kWh/m²`} 
                                                    color={row.ep < 70 ? "success" : row.ep < 150 ? "warning" : "error"} 
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    </Box>
  );
};

export default Statistics;