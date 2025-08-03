import { useEffect, useState } from "react";
import { useCliente } from "../hooks/useCliente";
import type { FilterClienteDto } from "../types";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Sucursal } from "../../shared/enums";
import { clienteEnumsService } from "../clienteEnumsService";
import { useExportClientesExcel } from "../../../hooks/useExportClienteExcel";

const statusOptions = ["Activo", "Inactivo", "Suspendido"];

const sucursalOptions = Object.values(Sucursal); // Automático desde el enum

const ClienteExcelPage: React.FC = () => {
  const { clientes, getAllClientes, setPagination } = useCliente();
  const [filters, setFilters] = useState<FilterClienteDto>({
    limit: 1000,
    skip: 0,
    sortBy: "razonSocial",
    order: "asc",
  });
  const [clasificacionOptions, setClasificacionOptions] = useState<string[]>([]);
  const { exportClientesExcel } = useExportClientesExcel(); // Usa el hook

  useEffect(() => {
    const fetchEnumValues = async () => {
      try {
        const enums = await clienteEnumsService.getEnums();
        setClasificacionOptions(enums.clasificaciones || ["TURISMO", "GRUPO HYATT", "PERSONAL"]);
        setPagination(1000, 1000);
      } catch (error) {
        console.log('Error fetching enum values:', error);
      }
    };
    fetchEnumValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAllClientes(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Ejecutar getAllClientes cada que cambie algún filtro

  // Handlers para los filtros
  const handleSucursalChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      sucursal: event.target.value === "ALL" ? undefined : event.target.value,
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      status: event.target.value === "ALL" ? undefined : (event.target.value as FilterClienteDto["status"]),
    }));
  };

  const handleClasificacionChange = (event: SelectChangeEvent) => {
    setFilters((prev) => ({
      ...prev,
      clasificacion: event.target.value === "ALL" ? undefined : event.target.value,
    }));
  };

  const handleExportar = () => {
    exportClientesExcel(clientes);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Filtro Sucursal */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="sucursal-label">Sucursal</InputLabel>
          <Select
            labelId="sucursal-label"
            value={filters.sucursal ?? "ALL"}
            label="Sucursal"
            onChange={handleSucursalChange}
            size="small"
          >
            <MenuItem value="ALL">Todas</MenuItem>
            {sucursalOptions.map((suc) => (
              <MenuItem key={suc} value={suc}>
                {suc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Filtro Status */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            value={filters.status ?? "ALL"}
            label="Status"
            onChange={handleStatusChange}
            size="small"
          >
            <MenuItem value="ALL">Todos</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Filtro Clasificación */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="clasificacion-label">Clasificación</InputLabel>
          <Select
            labelId="clasificacion-label"
            value={filters.clasificacion ?? "ALL"}
            label="Clasificación"
            onChange={handleClasificacionChange}
            size="small"
          >
            <MenuItem value="ALL">Todas</MenuItem>
            {clasificacionOptions.map((c: any) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Botón de Exportar */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportar}
          disabled={!clientes || clientes.length === 0}
        >
          Exportar Excel
        </Button>
      </Box>

      {/* Mostrar cantidad de clientes obtenidos */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {`Clientes obtenidos: ${clientes ? clientes.length : 0}`}
      </Typography>
    </Box>
  );
};

export default ClienteExcelPage;