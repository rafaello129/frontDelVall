import React from "react";
import { useTipoCambioDOF } from "../hooks/useTipoCambioDOF";
import { Box, Typography, CircularProgress, Alert, Paper, Divider } from "@mui/material";
import { format } from "date-fns";

/**
 * Componente para mostrar el tipo de cambio DOF de la fecha actual.
 */
const TipoCambioDOF: React.FC = () => {
  const hoy = format(new Date(), "dd/MM/yyyy");
  const { data, loading, error } = useTipoCambioDOF(hoy);

  return (
    <Paper elevation={3} sx={{ p: 3, width: "100%", maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Tipo de Cambio DOF (Hoy)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={60}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <Box>
          <Typography>
            <strong>Fecha:</strong> {data.fecha}
          </Typography>
          <Typography>
            <strong>Valor:</strong> ${data.valor} MXN por USD
          </Typography>
        </Box>
      ) : (
        <Alert severity="info">Sin datos disponibles.</Alert>
      )}
    </Paper>
  );
};

export default TipoCambioDOF;