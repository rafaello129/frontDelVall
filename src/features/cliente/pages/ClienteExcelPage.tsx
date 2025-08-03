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
  Paper,
  Container,
  useTheme,
  alpha,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Sucursal } from "../../shared/enums";
import { clienteEnumsService } from "../clienteEnumsService";
import { useExportClientesExcel } from "../../../hooks/useExportClienteExcel";
import { 
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  NavigateNext as NavigateNextIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const statusOptions = ["Activo", "Inactivo", "Suspendido"];

const sucursalOptions = Object.values(Sucursal); // Automático desde el enum

const ClienteExcelPage: React.FC = () => {
  const theme = useTheme();
  const { clientes, getAllClientes, setPagination, isLoading } = useCliente();
  const [filters, setFilters] = useState<FilterClienteDto>({
    limit: 1000,
    skip: 0,
    sortBy: "razonSocial",
    order: "asc",
  });
  const [clasificacionOptions, setClasificacionOptions] = useState<string[]>([]);
  const { exportClientesExcel } = useExportClientesExcel();
  const [isExporting, setIsExporting] = useState(false);

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
  }, [filters]);

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

  const handleExportar = async () => {
    if (!clientes.length) return;
    
    try {
      setIsExporting(true);
      await exportClientesExcel(clientes);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Count clients by status
  const activeClients = clientes.filter(c => c.status === "Activo").length;
  const suspendedClients = clientes.filter(c => c.status === "Suspendido").length;
  const inactiveClients = clientes.filter(c => c.status === "Inactivo").length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Inicio
          </MuiLink>
          <MuiLink 
            component={Link} 
            to="/clientes" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: theme.palette.primary.main,
              fontWeight: 500,
              '&:hover': { color: theme.palette.primary.dark }
            }}
          >
            <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
            Clientes
          </MuiLink>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FileDownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
            Exportar Excel
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ mb: 0.5 }}
            >
              Exportar Datos de Clientes
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Filtre y exporte la información de sus clientes a Excel
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              component={Link}
              to="/clientes"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Volver a clientes
            </Button>
            
            {clientes.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={isExporting ? 
                  <CircularProgress size={20} color="inherit" /> : 
                  <FileDownloadIcon />
                }
                onClick={handleExportar}
                disabled={isExporting || clientes.length === 0}
                sx={{ 
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                {isExporting ? 'Generando...' : 'Exportar a Excel'}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Information Cards */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3,
          mb: 4
        }}>
          <Card sx={{ 
            flex: '1 1 0',
            minWidth: { xs: '100%', sm: '300px' },
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Listado de Clientes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                El reporte incluirá información detallada de todos los clientes según los filtros seleccionados, incluyendo datos de contacto y clasificación.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={500}>
                <strong>Campos incluidos:</strong> Número de cliente, Razón social, Nombre comercial, RFC, Dirección, Contacto, Teléfono, Email, Sucursal, Estado, Clasificación
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Paper
          elevation={1}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3
          }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Filtros del Reporte
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box
            sx={{
              display: "flex",
              gap: 3,
              alignItems: "flex-start",
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            {/* Filtro Sucursal */}
            <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }}>
              <InputLabel id="sucursal-label">Sucursal</InputLabel>
              <Select
                labelId="sucursal-label"
                value={filters.sucursal ?? "ALL"}
                label="Sucursal"
                onChange={handleSucursalChange}
                size="medium"
                sx={{ borderRadius: 1 }}
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
            <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }}>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                value={filters.status ?? "ALL"}
                label="Estado"
                onChange={handleStatusChange}
                size="medium"
                sx={{ borderRadius: 1 }}
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
            <FormControl sx={{ minWidth: 200, flex: '1 1 auto' }}>
              <InputLabel id="clasificacion-label">Clasificación</InputLabel>
              <Select
                labelId="clasificacion-label"
                value={filters.clasificacion ?? "ALL"}
                label="Clasificación"
                onChange={handleClasificacionChange}
                size="medium"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="ALL">Todas</MenuItem>
                {clasificacionOptions.map((c: any) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1,
            mb: 2
          }}>
            {filters.status && (
              <Chip 
                label={`Estado: ${filters.status}`}
                color="primary"
                variant="outlined"
                onDelete={() => handleStatusChange({ target: { value: 'ALL' }} as SelectChangeEvent)}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.sucursal && (
              <Chip 
                label={`Sucursal: ${filters.sucursal}`}
                color="primary"
                variant="outlined"
                onDelete={() => handleSucursalChange({ target: { value: 'ALL' }} as SelectChangeEvent)}
                sx={{ borderRadius: 2 }}
              />
            )}
            
            {filters.clasificacion && (
              <Chip 
                label={`Clasificación: ${filters.clasificacion}`}
                color="primary"
                variant="outlined"
                onDelete={() => handleClasificacionChange({ target: { value: 'ALL' }} as SelectChangeEvent)}
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Resultados
            </Typography>
            <Chip 
              label={`${clientes.length} clientes`}
              color="primary"
              sx={{ 
                borderRadius: 10, 
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          {clientes.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={isExporting ? 
                <CircularProgress size={20} color="inherit" /> : 
                <FileDownloadIcon />
              }
              onClick={handleExportar}
              disabled={isExporting}
              sx={{ 
                borderRadius: 2,
                py: 1,
                px: 3,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {isExporting ? 'Generando...' : 'Exportar a Excel'}
            </Button>
          )}
        </Box>

        {/* Status Summary */}
        {clientes.length > 0 ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Resumen de clientes a exportar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los siguientes datos serán incluidos en el archivo Excel:
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              mb: 3
            }}>
              <Box sx={{ 
                flex: '1 1 auto',
                minWidth: { xs: '100%', sm: '180px' }
              }}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total de clientes
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {clientes.length}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: '1 1 auto',
                minWidth: { xs: '100%', sm: '180px' }
              }}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Clientes activos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {activeClients}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: '1 1 auto',
                minWidth: { xs: '100%', sm: '180px' }
              }}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Clientes suspendidos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="warning.main">
                    {suspendedClients}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: '1 1 auto',
                minWidth: { xs: '100%', sm: '180px' }
              }}>
                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Clientes inactivos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="text.secondary">
                    {inactiveClients}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Alert 
            severity="info" 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            No se encontraron clientes con los filtros seleccionados. Ajuste los filtros para ver resultados.
          </Alert>
        )}

        {/* Info Alert */}
        <Alert 
          severity="info"
          variant="outlined"
          icon={false}
          sx={{ 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.05)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <FileDownloadIcon color="info" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Sobre el reporte Excel
              </Typography>
              <Typography variant="body2">
                El archivo Excel generado incluirá información detallada de cada cliente según los filtros aplicados.
                Este reporte es útil para realizar análisis de cartera de clientes, seguimiento comercial y acciones de marketing.
              </Typography>
            </Box>
          </Box>
        </Alert>
      </Box>
    </Container>
  );
};

export default ClienteExcelPage;