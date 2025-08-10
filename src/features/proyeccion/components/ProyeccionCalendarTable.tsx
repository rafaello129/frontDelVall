import React, { useState, useCallback, memo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  IconButton,
  Box,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Popover,
  Button,
  Stack,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format, isEqual, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import type { ProyeccionPago } from '../types';
import { EstadoProyeccion } from '../types';
import { ProyeccionEstadoChip } from './ProyeccionEstadoChip';
import { useProyecciones } from '../hooks/useProyecciones';

interface ClienteProyecciones {
  noCliente: number;
  nombreCliente: string;
  proyecciones: ProyeccionPago[];
}

interface ProyeccionCalendarTableProps {
  fechas: Date[];
  clientesProyecciones: ClienteProyecciones[];
  totalesPorFecha: Record<string, number>;
  totalesPorCliente: Record<number, number>;
  totalGeneral: number;
  onDataChange?: (updatedProyeccion?: ProyeccionPago, isNew?: boolean) => void;
}

interface EditableProyeccion {
  id?: number; // Optional for new proyecciones
  monto: number;
  estado: EstadoProyeccion;
}

interface NewProyeccionData {
  clienteId: number;
  clienteNombre: string;
  fecha: Date;
}

// Individual cell component to prevent unnecessary re-renders
const ProyeccionCell = memo(({ 
  cliente, 
  fecha, 
  onEdit, 
  onView, 
  onCreateStart 
}: { 
  cliente: ClienteProyecciones;
  fecha: Date;
  onEdit: (proyeccion: ProyeccionPago) => void;
  onView: (proyeccionId: number) => void;
  onCreateStart: (clienteId: number, clienteNombre: string, fecha: Date) => void;
}) => {
  // Find a projection for this cell
  const proyeccion = cliente.proyecciones.find(p => 
    isEqual(
      startOfDay(new Date(p.fechaProyectada)),
      startOfDay(fecha)
    )
  );
  
  const hasProyeccion = !!proyeccion;
  const dateKey = format(fecha, 'yyyy-MM-dd');
  const cellKey = `cell-${cliente.noCliente}-${dateKey}`;
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (proyeccion) {
      onEdit(proyeccion);
    }
  };
  
  const handleViewClick = () => {
    if (proyeccion) {
      onView(proyeccion.id);
    }
  };
  
  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateStart(cliente.noCliente, cliente.nombreCliente, fecha);
  };
  
  return (
    <TableCell 
      key={cellKey} 
      align="center" 
      sx={{
        cursor: 'pointer',
        backgroundColor: hasProyeccion ? 
          proyeccion?.estado === EstadoProyeccion.CUMPLIDA ? 'rgba(76, 175, 80, 0.1)' :
          proyeccion?.estado === EstadoProyeccion.VENCIDA ? 'rgba(244, 67, 54, 0.1)' :
          proyeccion?.estado === EstadoProyeccion.CANCELADA ? 'rgba(158, 158, 158, 0.1)' :
          'rgba(33, 150, 243, 0.1)' : 'inherit',
        '&:hover': {
          backgroundColor: hasProyeccion ? 
            proyeccion?.estado === EstadoProyeccion.CUMPLIDA ? 'rgba(76, 175, 80, 0.2)' :
            proyeccion?.estado === EstadoProyeccion.VENCIDA ? 'rgba(244, 67, 54, 0.2)' :
            proyeccion?.estado === EstadoProyeccion.CANCELADA ? 'rgba(158, 158, 158, 0.2)' :
            'rgba(33, 150, 243, 0.2)' : 'rgba(0, 0, 0, 0.04)',
        },
        position: 'relative'
      }}
    >
      {hasProyeccion ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            width="100%"
          >
            <Box
              onClick={handleViewClick}
              sx={{ flex: 1, textAlign: 'center' }}
            >
              <Typography variant="body2" fontWeight="bold">
                ${proyeccion.monto.toLocaleString('es-MX')}
              </Typography>
              <Box mt={0.5}>
                <ProyeccionEstadoChip estado={proyeccion.estado} size="small" />
              </Box>
            </Box>
            
            <Tooltip title="Editar proyección">
              <IconButton 
                size="small" 
                onClick={handleEditClick}
                sx={{ 
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                  ml: 0.5
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={handleCreateClick}
          sx={{
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 1
          }}
        >
          <Tooltip title="Crear nueva proyección">
            <IconButton size="small" color="primary">
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </TableCell>
  );
});

// Client row component to prevent unnecessary re-renders
const ClienteRow = memo(({ 
  cliente, 
  fechas, 
  totalCliente,
  onClienteClick,
  onEdit,
  onView,
  onCreateStart
}: {
  cliente: ClienteProyecciones;
  fechas: Date[];
  totalCliente: number;
  onClienteClick: (clienteId: number) => void;
  onEdit: (proyeccion: ProyeccionPago) => void;
  onView: (proyeccionId: number) => void;
  onCreateStart: (clienteId: number, clienteNombre: string, fecha: Date) => void;
}) => {
  return (
    <TableRow key={`row-${cliente.noCliente}`}>
      <TableCell 
        component="th" 
        scope="row"
        sx={{ 
          position: 'sticky',
          left: 0,
          backgroundColor: 'background.paper',
          zIndex: 2,
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="body2" fontWeight="medium">
            {cliente.nombreCliente}
          </Typography>
          <Tooltip title="Ver cliente">
            <IconButton 
              size="small" 
              onClick={() => onClienteClick(cliente.noCliente)}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
      
      {fechas.map((fecha) => (
        <ProyeccionCell
          key={`cell-${cliente.noCliente}-${format(fecha, 'yyyy-MM-dd')}`}
          cliente={cliente}
          fecha={fecha}
          onEdit={onEdit}
          onView={onView}
          onCreateStart={onCreateStart}
        />
      ))}
      
      <TableCell 
        align="center"
        sx={{ 
          fontWeight: 'bold',
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          ${totalCliente?.toLocaleString('es-MX') || '0'}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

export const ProyeccionCalendarTable = memo(({
  fechas,
  clientesProyecciones,
  totalesPorFecha,
  totalesPorCliente,
  totalGeneral,
  onDataChange
}: ProyeccionCalendarTableProps) => {
  const navigate = useNavigate();
  const { editProyeccion, addProyeccion } = useProyecciones();
  
  // State for editing
  const [editingProyeccion, setEditingProyeccion] = useState<EditableProyeccion | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editValues, setEditValues] = useState<{ monto: number; estado: EstadoProyeccion }>({
    monto: 0,
    estado: EstadoProyeccion.PENDIENTE
  });

  // State for creating
  const [newProyeccion, setNewProyeccion] = useState<NewProyeccionData | null>(null);
  const [newAnchorEl, setNewAnchorEl] = useState<HTMLElement | null>(null);
  const [newValues, setNewValues] = useState<{ monto: number; estado: EstadoProyeccion }>({
    monto: 0,
    estado: EstadoProyeccion.PENDIENTE
  });

  // Helper to format date keys consistently
  const formatDateKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Handle click on a projection cell to view details
  const handleProyeccionClick = useCallback((proyeccionId: number) => {
    navigate(`/proyecciones/${proyeccionId}`);
  }, [navigate]);

  // Handle click on client name
  const handleClienteClick = useCallback((clienteId: number) => {
    navigate(`/clientes/${clienteId}`);
  }, [navigate]);

  // Start editing a projection
  const handleEditStart = useCallback((proyeccion: ProyeccionPago) => {
    // Use document.activeElement to get the current element and set as anchor
    const activeElement = document.activeElement as HTMLElement;
    setAnchorEl(activeElement);
    
    setEditingProyeccion({
      id: proyeccion.id,
      monto: proyeccion.monto,
      estado: proyeccion.estado
    });
    setEditValues({
      monto: proyeccion.monto,
      estado: proyeccion.estado
    });
  }, []);

  // Start creating a new projection
  const handleCreateStart = useCallback((clienteId: number, clienteNombre: string, fecha: Date) => {
    // Use document.activeElement to get the current element and set as anchor
    const activeElement = document.activeElement as HTMLElement;
    setNewAnchorEl(activeElement);
    
    setNewProyeccion({
      clienteId,
      clienteNombre,
      fecha
    });
    setNewValues({
      monto: 0,
      estado: EstadoProyeccion.PENDIENTE
    });
  }, []);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingProyeccion(null);
    setAnchorEl(null);
  }, []);

  // Handle create cancel
  const handleCreateCancel = useCallback(() => {
    setNewProyeccion(null);
    setNewAnchorEl(null);
  }, []);

  // Handle edit value changes
  const handleEditChange = useCallback((field: 'monto' | 'estado', value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle new projection value changes
  const handleNewChange = useCallback((field: 'monto' | 'estado', value: any) => {
    setNewValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle save changes
  const handleSaveChanges = useCallback(async () => {
    if (!editingProyeccion?.id) return;
    
    setIsSubmitting(true);
    try {
      const updatedProyeccion = await editProyeccion(editingProyeccion.id, {
        monto: editValues.monto,
        estado: editValues.estado
      });
      
      // Close the edit popover
      setEditingProyeccion(null);
      setAnchorEl(null);
      
      // Notify parent component with updated data (instead of triggering reload)
      if (onDataChange) {
        onDataChange(updatedProyeccion);
      }
    } catch (error) {
      console.error('Error updating projection:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingProyeccion, editValues, editProyeccion, onDataChange]);

  // Handle create new proyeccion
  const handleCreateProyeccion = useCallback(async () => {
    if (!newProyeccion) return;
    
    setIsSubmitting(true);
    try {
      const createdProyeccion = await addProyeccion({
        noCliente: newProyeccion.clienteId,
        fechaProyectada: newProyeccion.fecha,
        monto: newValues.monto,
        estado: newValues.estado
      });
      
      // Close the create popover
      setNewProyeccion(null);
      setNewAnchorEl(null);
      
      // Notify parent component with new data (instead of triggering reload)
      if (onDataChange) {
        onDataChange(createdProyeccion, true);
      }
    } catch (error) {
      console.error('Error creating projection:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newProyeccion, newValues, addProyeccion, onDataChange]);

  // Check if popovers are open
  const editOpen = Boolean(anchorEl);
  const editId = editOpen ? 'proyeccion-edit-popover' : undefined;
  
  const createOpen = Boolean(newAnchorEl);
  const createId = createOpen ? 'proyeccion-create-popover' : undefined;

  return (
    <>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  minWidth: '200px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 3,
                }}
              >
                Cliente
              </TableCell>
              {fechas.map((fecha) => (
                <TableCell 
                  key={`header-${formatDateKey(fecha)}`}
                  align="center" 
                  sx={{ 
                    minWidth: '120px',
                    fontWeight: 'bold'
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {format(fecha, 'EEEE', { locale: es })}
                    </Typography>
                    <Typography variant="body2">
                      {format(fecha, 'dd/MM/yyyy', { locale: es })}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  minWidth: '100px'
                }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesProyecciones.map((cliente) => (
              <ClienteRow
                key={`row-${cliente.noCliente}`}
                cliente={cliente}
                fechas={fechas}
                totalCliente={totalesPorCliente[cliente.noCliente] || 0}
                onClienteClick={handleClienteClick}
                onEdit={handleEditStart}
                onView={handleProyeccionClick}
                onCreateStart={handleCreateStart}
              />
            ))}
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  zIndex: 2,
                }}
              >
                Total del Día
              </TableCell>
              {fechas.map((fecha) => (
                <TableCell 
                  key={`total-${formatDateKey(fecha)}`}
                  align="center"
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    ${totalesPorFecha[formatDateKey(fecha)]?.toLocaleString('es-MX') || '0'}
                  </Typography>
                </TableCell>
              ))}
              <TableCell 
                align="center"
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(66, 66, 66, 0.08)'
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  ${totalGeneral.toLocaleString('es-MX')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Edit Popover - Fixed accessibility issue */}
      <Popover
        id={editId}
        open={editOpen}
        anchorEl={anchorEl}
        onClose={handleEditCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        // Added these props to fix accessibility issues
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" gutterBottom>
            Editar Proyección
          </Typography>
          
          <Stack spacing={2} mt={1}>
            <TextField
              label="Monto"
              type="number"
              size="small"
              fullWidth
              value={editValues.monto}
              onChange={(e) => handleEditChange('monto', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: <Box component="span" mr={0.5}>$</Box>,
                inputProps: { min: 0, step: "0.01" }
              }}
            />
            
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={editValues.estado}
                onChange={(e) => handleEditChange('estado', e.target.value)}
                label="Estado"
              >
                {Object.values(EstadoProyeccion).map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          
          <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
            <Button 
              size="small"
              startIcon={<CloseIcon />}
              onClick={handleEditCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckIcon />}
              onClick={handleSaveChanges}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Create New Proyección Popover - Fixed accessibility issue */}
      <Popover
        id={createId}
        open={createOpen}
        anchorEl={newAnchorEl}
        onClose={handleCreateCancel}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        // Added these props to fix accessibility issues
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nueva Proyección
          </Typography>
          
          {newProyeccion && (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Cliente: {newProyeccion.clienteNombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha: {format(newProyeccion.fecha, 'dd/MM/yyyy', { locale: es })}
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <TextField
                  label="Monto"
                  type="number"
                  size="small"
                  fullWidth
                  value={newValues.monto}
                  onChange={(e) => handleNewChange('monto', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Box component="span" mr={0.5}>$</Box>,
                    inputProps: { min: 0, step: "0.01" }
                  }}
                />
                
                <FormControl size="small" fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={newValues.estado}
                    onChange={(e) => handleNewChange('estado', e.target.value)}
                    label="Estado"
                  >
                    {Object.values(EstadoProyeccion).map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              
              <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
                <Button 
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleCreateCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
                  onClick={handleCreateProyeccion}
                  disabled={isSubmitting || newValues.monto <= 0}
                >
                  {isSubmitting ? 'Creando...' : 'Crear'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
});