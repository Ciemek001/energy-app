import React from "react";
import {
  Paper, Stack, Typography, Button, Divider, Alert, Fade, 
  FormControl, Select, MenuItem, TextField, IconButton, Chip
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LayersIcon from "@mui/icons-material/Layers";

// --- TU BYŁ BŁĄD: Musi być 'export' przed interface ---
export interface Material {
    id: number;
    name: string;
    category: string;
    lambda_value: number;
}

export interface Layer {
    id: string;
    materialId: number;
    thickness: number;
}
// -----------------------------------------------------

interface Props {
    title: string;
    layers: Layer[];
    setLayers: (layers: Layer[]) => void;
    materials: Material[];
}

const LayerBuilder: React.FC<Props> = ({ title, layers, setLayers, materials }) => {

    const addLayer = () => {
        if (materials.length === 0) return;
        setLayers([...layers, { id: Date.now().toString(), materialId: materials[0].id, thickness: 15 }]);
    };

    const removeLayer = (id: string) => setLayers(layers.filter(l => l.id !== id));

    const updateLayer = (id: string, field: keyof Layer, value: any) => {
        setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const calculateU = () => {
        let R_layers = 0;
        layers.forEach(l => {
            const m = materials.find(mat => mat.id === l.materialId);
            if(m) R_layers += (l.thickness/100) / m.lambda_value;
        });
        return R_layers > 0 ? (1 / (0.17 + R_layers)).toFixed(3) : "-";
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: "#0277bd55", borderWidth: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                    <LayersIcon sx={{ verticalAlign: "middle", mr: 1 }}/> {title}
                </Typography>
                <Chip label={`U ≈ ${calculateU()}`} color="primary" variant="outlined" />
            </Stack>
            
            <Divider sx={{ mb: 2 }} />

            {layers.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>Nie zdefiniowano warstw {title}.</Alert>
            )}

            <Stack spacing={1}>
                {layers.map((layer, idx) => (
                    <Fade in key={layer.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={idx + 1} size="small" />
                            <FormControl fullWidth size="small">
                                <Select value={layer.materialId} onChange={(e) => updateLayer(layer.id, "materialId", e.target.value)}>
                                    {materials.map(m => (
                                        <MenuItem key={m.id} value={m.id}>{m.name} (λ {m.lambda_value})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField 
                                type="number" size="small" sx={{ width: 100 }} 
                                label="cm"
                                value={layer.thickness} 
                                onChange={(e) => updateLayer(layer.id, "thickness", Number(e.target.value))} 
                            />
                            <IconButton size="small" color="error" onClick={() => removeLayer(layer.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </Fade>
                ))}
            </Stack>

            <Button startIcon={<AddCircleIcon />} onClick={addLayer} sx={{ mt: 2 }} fullWidth variant="dashed" style={{ border: "1px dashed #ccc" }}>
                Dodaj warstwę {title}
            </Button>
        </Paper>
    );
};

export default LayerBuilder;