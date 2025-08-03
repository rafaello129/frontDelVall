import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  useTheme,
  Stack,
  Divider,
  alpha,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';
import { TipoBitacora } from '../types';
import { Sucursal } from '../../shared/enums';
import { useCliente } from '../../cliente/hooks/useCliente';
import { useProyecciones } from '../../proyeccion/hooks/useProyecciones';
import type { CreateBitacoraPagoDto, UpdateBitacoraPagoDto, BitacoraPago } from '../types';
import { 
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  ReplyAll as ReplyAllIcon,
  Phone as PhoneIcon,
  BusinessCenter as BusinessCenterIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';

interface BitacoraFormProps {
  initialData?: BitacoraPago;
  onSubmit: (data: CreateBitacoraPagoDto | UpdateBitacoraPagoDto) => Promise<void>;
  isLoading?: boolean;
  proyeccionId?: number;
  noCliente?: number;
}

export const BitacoraForm: React.FC<BitacoraFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading = false,
  proyeccionId,
  noCliente
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isEditing = !!initialData;
  const { getClienteById } = useCliente();
  const { getProyeccionById } = useProyecciones();

  // Form state
  const [formData, setFormData] = useState<CreateBitacoraPagoDto | UpdateBitacoraPagoDto>({
    fecha: initialData?.fecha || new Date(),
    noCliente: initialData?.noCliente || noCliente || 0,
    razonSocial: initialData?.razonSocial || '',
    comercial: initialData?.comercial || '',
    sucursal: initialData?.sucursal,
    ubicacion: initialData?.ubicacion || '',
    banco: initialData?.banco || '',
    moneda: initialData?.moneda || '',
    envioCorreo: initialData?.envioCorreo || '',
    comentario: initialData?.comentario || '',
    contestacion: initialData?.contestacion || '',
    timbrado: initialData?.timbrado || '',
    proyeccionId: initialData?.proyeccionId || proyeccionId,
    tipo: initialData?.tipo || TipoBitacora.COMENTARIO,
    telefono: initialData?.telefono || '',
    clasificacion: initialData?.clasificacion || '',
    creadoPor: initialData?.creadoPor || ''
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  
  // Load client data when cliente changes
  useEffect(() => {
    const loadClienteData = async () => {
      if (formData.noCliente && formData.noCliente > 0) {
        try {
          const cliente = await getClienteById(formData.noCliente);
          setFormData(prev => ({
            ...prev,
            razonSocial: cliente.razonSocial,
            comercial: cliente.comercial || cliente.razonSocial,
            sucursal: cliente.sucursal as Sucursal,
            clasificacion: cliente.clasificacion || '',
          }));
        } catch (error) {
          console.error('Error loading cliente data:', error);
        }
      }
    };
    
    // Only load client data if we're creating a new record or the client changed
    if ((!initialData || !initialData.noCliente) && formData.noCliente) {
      loadClienteData();
    }
  }, [formData.noCliente, getClienteById, initialData]);
  
  // Load proyeccion data when proyeccionId changes
  useEffect(() => {
    const loadProyeccionData = async () => {
      if (formData.proyeccionId && formData.proyeccionId > 0) {
        try {
          const proyeccion = await getProyeccionById(formData.proyeccionId);
          // Only update client if not already set
          if (!formData.noCliente) {
            setFormData(prev => ({
              ...prev,
              noCliente: proyeccion.noCliente,
              razonSocial: proyeccion.cliente?.razonSocial || '',
              comercial: proyeccion.cliente?.comercial || proyeccion.cliente?.razonSocial || '',
              sucursal: proyeccion.cliente?.sucursal as Sucursal,
              clasificacion: proyeccion.cliente?.clasificacion || '',
              banco: proyeccion.banco?.nombre || ''
            }));
          }
        } catch (error) {
          console.error('Error loading proyeccion data:', error);
        }
      }
    };
    
    if (formData.proyeccionId && !initialData?.proyeccionId) {
      loadProyeccionData();
    }
  }, [formData.proyeccionId, getProyeccionById, initialData?.proyeccionId, formData.noCliente]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name]: true }));
      if (errors[name]) {
        validateField(name, value);
      }
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setTouched(prev => ({ ...prev, [name as string]: true }));
      if (errors[name as string]) {
        validateField(name as string, value);
      }
    }
  };

  const handleClienteChange = (clienteId: number | null) => {
    setFormData(prev => ({ ...prev, noCliente: clienteId || 0 }));
    setTouched(prev => ({ ...prev, noCliente: true }));
    if (errors.noCliente) {
      validateField('noCliente', clienteId);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, fecha: date }));
      setTouched(prev => ({ ...prev, fecha: true }));
      if (errors.fecha) {
        validateField('fecha', date);
      }
    }
  };
  
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName as keyof typeof formData]);
  };

  // Validate a single field
  const validateField = (fieldName: string, value: any): boolean => {
    let error = '';

    switch (fieldName) {
      case 'noCliente':
        if (!value || value <= 0) {
          error = 'El cliente es requerido';
        }
        break;
      
      case 'fecha':
        if (!value) {
          error = 'La fecha es requerida';
        }
        break;
      
      case 'razonSocial':
        if (!value) {
          error = 'La razón social es requerida';
        }
        break;
      
      case 'comercial':
        if (!value) {
          error = 'El nombre comercial es requerido';
        }
        break;
      
      case 'tipo':
        if (!value) {
          error = 'El tipo de registro es requerido';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  // Validate form
  const validateForm = (): boolean => {
    const requiredFields = ['noCliente', 'fecha', 'razonSocial', 'comercial', 'tipo'];
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
      const value = formData[fieldName as keyof typeof formData];
      if (!validateField(fieldName, value)) {
        newErrors[fieldName] = errors[fieldName] || `Este campo es requerido`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    const requiredFields = ['noCliente', 'fecha', 'razonSocial', 'comercial', 'tipo'];
    const newTouched = { ...touched };
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar la bitácora:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Information Alert */}
      {!isEditing && (
        <Alert 
          severity="info" 
          variant="outlined"
          icon={<InfoIcon />}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.04)
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Sobre los registros en la bitácora
          </Typography>
          <Typography variant="body2">
            La bitácora permite registrar interacciones, comentarios y seguimientos relacionados a pagos de los clientes. Complete todos los campos marcados con <Box component="span" color="error.main">*</Box> para continuar.
          </Typography>
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          {/* Client Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                color: theme.palette.primary.main,
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 4,
                  height: 20,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1,
                  marginRight: 1
                }
              }}
            >
              <PersonIcon sx={{ mr: 1 }} />
              Información del Cliente
            </Typography>
            
            <Stack spacing={2.5}>
              {/* Cliente */}
              <ClienteAutocomplete
                value={formData.noCliente || ''}
                onChange={handleClienteChange}
                error={touched.noCliente && !!errors.noCliente}
                helperText={touched.noCliente && errors.noCliente ? errors.noCliente : ''}
                // Disable if coming from a client page or already editing
              />

              {/* Fecha */}
              <DateTimePicker
                label="Fecha y Hora del Registro *"
                value={formData.fecha ? new Date(formData.fecha) : null}
                onChange={handleDateChange}
                onClose={() => handleBlur('fecha')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.fecha && !!errors.fecha,
                    helperText: touched.fecha && errors.fecha ? errors.fecha : '',
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                    }
                  }
                }}
              />

              {/* Razón Social */}
              <TextField
                name="razonSocial"
                label="Razón Social *"
                fullWidth
                value={formData.razonSocial || ''}
                onChange={handleChange}
                onBlur={() => handleBlur('razonSocial')}
                error={touched.razonSocial && !!errors.razonSocial}
                helperText={touched.razonSocial && errors.razonSocial ? errors.razonSocial : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessCenterIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Nombre Comercial */}
              <TextField
                name="comercial"
                label="Nombre Comercial *"
                fullWidth
                value={formData.comercial || ''}
                onChange={handleChange}
                onBlur={() => handleBlur('comercial')}
                error={touched.comercial && !!errors.comercial}
                helperText={touched.comercial && errors.comercial ? errors.comercial : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessCenterIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Teléfono and Clasificación */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name="telefono"
                    label="Teléfono"
                    fullWidth
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    name="clasificacion"
                    label="Clasificación"
                    fullWidth
                    value={formData.clasificacion || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
          
          {/* Comments Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                color: theme.palette.primary.main,
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 4,
                  height: 20,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1,
                  marginRight: 1
                }
              }}
            >
              <CommentIcon sx={{ mr: 1 }} />
              Comentarios y Respuestas
            </Typography>
            
            <Stack spacing={2.5}>
              {/* Tipo de Registro */}
              <FormControl 
                fullWidth 
                error={touched.tipo && !!errors.tipo}
              >
                <InputLabel>Tipo de Registro *</InputLabel>
                <Select
                  name="tipo"
                  value={formData.tipo || ''}
                  onChange={handleSelectChange}
                  onBlur={() => handleBlur('tipo')}
                  label="Tipo de Registro *"
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {Object.values(TipoBitacora).map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
                {touched.tipo && errors.tipo && (
                  <FormHelperText>{errors.tipo}</FormHelperText>
                )}
              </FormControl>

              {/* Comentario */}
              <TextField
                name="comentario"
                label="Comentario"
                fullWidth
                multiline
                rows={4}
                value={formData.comentario || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: 1.5 }}>
                      <CommentIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Ingrese aquí el comentario principal o la descripción del registro"
              />

              {/* Contestación */}
              <TextField
                name="contestacion"
                label="Contestación/Respuesta"
                fullWidth
                multiline
                rows={4}
                value={formData.contestacion || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: 1.5 }}>
                      <ReplyAllIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Ingrese aquí la respuesta o contestación al comentario principal"
              />
            </Stack>
          </Box>
        </Box>
        
        {/* Right Column */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          {/* Payment Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                color: theme.palette.primary.main,
                '&::before': {
                  content: '""',
                  display: 'block',
                  width: 4,
                  height: 20,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1,
                  marginRight: 1
                }
              }}
            >
              <AccountBalanceIcon sx={{ mr: 1 }} />
              Información de Pago
            </Typography>
            
            <Stack spacing={2.5}>
              {/* Sucursal */}
              <FormControl fullWidth>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  name="sucursal"
                  value={formData.sucursal || ''}
                  onChange={handleSelectChange}
                  label="Sucursal"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Ninguna</em>
                  </MenuItem>
                  {Object.values(Sucursal).map((sucursal) => (
                    <MenuItem key={sucursal} value={sucursal}>
                      {sucursal}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Banco y Moneda */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name="banco"
                    label="Banco"
                    fullWidth
                    value={formData.banco || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    name="moneda"
                    label="Moneda"
                    fullWidth
                    value={formData.moneda || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Ubicación */}
              <TextField
                name="ubicacion"
                label="Ubicación"
                fullWidth
                value={formData.ubicacion || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Estado de Envío de Correo */}
              <TextField
                name="envioCorreo"
                label="Estado de Envío de Correo"
                fullWidth
                value={formData.envioCorreo || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Estado de Timbrado */}
              <TextField
                name="timbrado"
                label="Estado de Timbrado"
                fullWidth
                value={formData.timbrado || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Creado Por */}
              <TextField
                name="creadoPor"
                label="Registrado Por"
                fullWidth
                value={formData.creadoPor || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AdminPanelSettingsIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nombre del usuario que realiza el registro"
              />

              {/* Proyección ID */}
              {(proyeccionId || formData.proyeccionId) && (
                <TextField
                  name="proyeccionId"
                  label="ID Proyección"
                  fullWidth
                  value={formData.proyeccionId || proyeccionId || ''}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Stack>
          </Box>
          
          {/* Help Information */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.default, 0.7),
              borderColor: alpha(theme.palette.divider, 0.6),
              mb: 4
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <HelpIcon color="action" sx={{ mt: 0.5 }} />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                Información de ayuda
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              La bitácora permite dar seguimiento a los pagos y comunicaciones con los clientes. Registre cualquier interacción, llamada, acuerdo o recordatorio relacionado con los pagos del cliente.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Form Actions */}
      <Box sx={{ 
        mt: 4, 
        pt: 3,
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`
      }}>
        <Button
          variant="outlined"
          onClick={() => navigate(noCliente 
            ? `/clientes/${noCliente}` 
            : proyeccionId 
              ? `/proyecciones/${proyeccionId}` 
              : '/bitacora')}
          disabled={isLoading}
          startIcon={<CancelIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
        </Button>
      </Box>
    </form>
  );
};