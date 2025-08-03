import { useEffect, useState } from "react";
import { useFacturas } from "../hooks/useFacturas";
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import type { Factura } from "../types";
import { useExportFacturasExcel } from "../../../hooks/useExportFacturaExcel";

type Filters = {
  noFactura?: string;
  noCliente?: string;
  estado?: string;
  emisionDesde?: Date | null;
  emisionHasta?: Date | null;
  vencimientoDesde?: Date | null;
  vencimientoHasta?: Date | null;
  saldoMinimo?: number;
  soloVencidas?: boolean;
};

const estados = ["Pendiente", "Pagada", "Vencida", "Cancelada"];

const FacturaExcelPage = () => {
  const { facturas, getAllFacturas } = useFacturas();
  const [filters, setFilters] = useState<Filters>({
    emisionDesde: null,
    emisionHasta: null,
    vencimientoDesde: null,
    vencimientoHasta: null,
    saldoMinimo: undefined,
    soloVencidas: false,
  });
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Usa el hook de exportación
  const { exportFacturasExcel } = useExportFacturasExcel();

  useEffect(() => {
    getAllFacturas({ limit: 1000000, incluirCliente: true });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(facturas);
  }, [facturas]);

  useEffect(() => {
    // Filtrado en el front
    let result = facturas as Factura[];

    if (filters.noFactura) {
      result = result.filter((f) =>
        f.noFactura
          .toLowerCase()
          .includes(filters.noFactura?.toLowerCase() || "")
      );
    }
    if (filters.noCliente) {
      result = result.filter(
        (f) => String(f.noCliente) === String(filters.noCliente)
      );
    }
    if (filters.estado) {
      result = result.filter((f) => f.estado === filters.estado);
    }
    if (filters.emisionDesde) {
      result = result.filter(
        (f) => new Date(f.emision) >= new Date(filters.emisionDesde!)
      );
    }
    if (filters.emisionHasta) {
      result = result.filter(
        (f) => new Date(f.emision) <= new Date(filters.emisionHasta!)
      );
    }
    if (filters.vencimientoDesde) {
      result = result.filter(
        (f) => new Date(f.fechaVencimiento) >= new Date(filters.vencimientoDesde!)
      );
    }
    if (filters.vencimientoHasta) {
      result = result.filter(
        (f) => new Date(f.fechaVencimiento) <= new Date(filters.vencimientoHasta!)
      );
    }
    if (filters.saldoMinimo !== undefined && filters.saldoMinimo !== null) {
      result = result.filter((f) => f.saldo >= filters.saldoMinimo!);
    }
    if (filters.soloVencidas) {
      result = result.filter((f) => f.isVencida === true);
    }
    setFilteredFacturas(result);
    console.log("Facturas filtradas:", result);
  }, [facturas, filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const limpiarFiltros = () => {
    setFilters({
      emisionDesde: null,
      emisionHasta: null,
      vencimientoDesde: null,
      vencimientoHasta: null,
      saldoMinimo: undefined,
      soloVencidas: false,
      noFactura: "",
      noCliente: "",
      estado: "",
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Factura Excel Page
        </Typography>
        <Button
          variant="text"
          onClick={() => setShowFilters((v) => !v)}
          sx={{ mb: 2 }}
        >
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </Button>
        <Collapse in={showFilters}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              borderTop: "4px solid #23408E",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Filtros</Typography>
              <Button size="small" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField
                label="No. Factura"
                value={filters.noFactura || ""}
                onChange={(e) =>
                  handleFilterChange("noFactura", e.target.value)
                }
                size="small"
                sx={{ flexBasis: { xs: "100%", md: "24%" }, flexGrow: 1 }}
              />
              <TextField
                label="No. Cliente"
                value={filters.noCliente || ""}
                onChange={(e) =>
                  handleFilterChange("noCliente", e.target.value)
                }
                size="small"
                sx={{ flexBasis: { xs: "100%", md: "24%" }, flexGrow: 1 }}
              />
              <FormControl
                size="small"
                sx={{ flexBasis: { xs: "100%", md: "24%" }, flexGrow: 1 }}
              >
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={filters.estado || ""}
                  onChange={(e) =>
                    handleFilterChange("estado", e.target.value)
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                sx={{ flexBasis: { xs: "100%", md: "24%" }, flexGrow: 1 }}
                control={
                  <Switch
                    checked={!!filters.soloVencidas}
                    onChange={(e) =>
                      handleFilterChange("soloVencidas", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Solo Vencidas"
              />
              <DatePicker
                label="Emisión Desde"
                value={filters.emisionDesde}
                onChange={(date) =>
                  handleFilterChange("emisionDesde", date)
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <DatePicker
                label="Emisión Hasta"
                value={filters.emisionHasta}
                onChange={(date) =>
                  handleFilterChange("emisionHasta", date)
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <DatePicker
                label="Vencimiento Desde"
                value={filters.vencimientoDesde}
                onChange={(date) =>
                  handleFilterChange("vencimientoDesde", date)
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <DatePicker
                label="Vencimiento Hasta"
                value={filters.vencimientoHasta}
                onChange={(date) =>
                  handleFilterChange("vencimientoHasta", date)
                }
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <TextField
                label="Saldo mínimo"
                type="number"
                value={filters.saldoMinimo ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "saldoMinimo",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                size="small"
                sx={{ flexBasis: { xs: "100%", md: "24%" }, flexGrow: 1 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => exportFacturasExcel(filteredFacturas)}
                disabled={filteredFacturas.length === 0}
              >
                Exportar a Excel
              </Button>
            </Box>
          </Paper>
        </Collapse>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Facturas mostradas: {filteredFacturas.length}
        </Typography>
        <p>Esta página está en construcción.</p>
      </Box>
    </LocalizationProvider>
  );
};

export default FacturaExcelPage;