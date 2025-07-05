import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import ClienteList from '../components/ClienteList';
import ClienteFilter from '../components/ClienteFilter';
import type { FilterClienteDto } from '../types';
import { motion } from 'framer-motion';
import { 
  Box, Typography, Paper, Button, Divider, Breadcrumbs,
  Link as MuiLink, useTheme, Collapse, IconButton,
  Alert, Fab, Tooltip, alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  BarChart as BarChartIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const ClientesPage: React.FC = () => {
  const theme = useTheme();
  const { getAllClientes, resetError, isLoading } = useCliente();
  const [filters, setFilters] = useState<FilterClienteDto>({});
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force filter component refresh

  useEffect(() => {
    resetError();
    getAllClientes(filters);
  }, []);

  const handleFilter = (newFilters: FilterClienteDto) => {
    setFilters(newFilters);
    getAllClientes(newFilters);
  };

  const handleRefresh = () => {
    getAllClientes(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setRefreshKey(prev => prev + 1);
    getAllClientes({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink 
            component={Link} 
            to="/" 
            underline="hover" 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Inicio
          </MuiLink>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
            Clientes
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Clientes
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={toggleFilters}
              startIcon={showFilters ? <ExpandLessIcon /> : <FilterListIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>

            <Button
              component={Link}
              to="/reportes/clientes"
              variant="outlined"
              color="secondary"
              startIcon={<BarChartIcon />}
              sx={{ whiteSpace: 'nowrap', display: { xs: 'none', sm: 'flex' } }}
            >
              Reportes
            </Button>
            
            <Button
              component={Link}
              to="/clientes/nuevo"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nuevo Cliente
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Collapse in={showFilters}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              borderTop: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterListIcon sx={{ mr: 1 }} /> Filtros
              </Typography>
         
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ClienteFilter 
              key={refreshKey}
              onFilter={handleFilter} 
              initialFilters={filters} 
            />
          </Paper>
        </Collapse>
        
        {/* List with refresh button */}
        <Box sx={{ position: 'relative', mb: 7 }}>
          <ClienteList filters={filters} />
          
          <Tooltip title="Actualizar">
            <Fab
              color="primary"
              size="small"
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{ 
                position: 'absolute',
                bottom: -28,
                right: 16,
                boxShadow: 2
              }}
            >
              <RefreshIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ClientesPage;