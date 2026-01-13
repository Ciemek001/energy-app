// frontend/src/views/Home.tsx
import React from "react";
import { Box, Card, CardContent, Typography, Button, Stack, Fade, Divider } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f7ff 0%, #f0fff4 100%)",
        p: 2,
      }}
    >
      <Fade in timeout={700}>
        <Card elevation={8} sx={{ width: "100%", maxWidth: 760, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <InfoIcon sx={{ fontSize: 56, color: "#0277bd" }} />
              <Typography variant="h4">System Analizy Efektywności Energetycznej Budynków</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
                Witaj w prototypie aplikacji. To tymczasowy ekran powitalny przygotowany na prezentację.
              </Typography>
              <Divider sx={{ width: "60%", my: 1 }} />
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/main")}
              >
                Sprawdź demo
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Home;
