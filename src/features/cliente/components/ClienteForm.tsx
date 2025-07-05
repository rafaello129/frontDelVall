import React, { useState, useEffect } from 'react';
import { useCliente } from '../hooks/useCliente';
import { useCorreoCliente } from '../../correoCliente/hooks/useCorreoCliente';
import { useTelefonoCliente } from '../../telefonoCliente/hooks/useTelefonoCliente';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from '../types';
import type { CreateCorreoDto } from '../../correoCliente/types';
import type { CreateTelefonoDto } from '../../telefonoCliente/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Paper, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, FormHelperText,
  Button, Chip, Divider, IconButton, InputAdornment,
  useTheme, alpha, Stack, Card, CardContent, CardHeader,
  CircularProgress
} from '@mui/material';
import type { 
SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  BusinessCenter as BusinessIcon,
  CreditCard as CreditCardIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Define enum values for sucursal and clasificacion
const SUCURSALES = [
  "ACAPULCO",
  "BLUELINE",
  "CABOS",
  "CANCUN",
  "TEPAPULCO",
  "VALLARTA",
  "YUCATAN",
];

const CLASIFICACIONES = ['AAA', 'AA', 'A', 'B', 'C', 'D'];

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: CreateClienteDto | UpdateClienteDto, correos: CreateCorreoDto[], telefonos: CreateTelefonoDto[]) => Promise<void>;
  isEdit?: boolean;
  isSaving?: boolean;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onSubmit, isEdit = false, isSaving = false }) => {
  const theme = useTheme();
  const { isLoading: clienteLoading } = useCliente();
  const { validateCorreo } = useCorreoCliente();
  
  const [formData, setFormData] = useState<CreateClienteDto | UpdateClienteDto>({
    noCliente: 0,
    razonSocial: '',
    comercial: '',
    diasCredito: 0,
    sucursal: SUCURSALES[0],
    clasificacion: CLASIFICACIONES[0],
    status: 'Activo' as 'Activo' | 'Inactivo' | 'Suspendido'
  });
  
  const [correos, setCorreos] = useState<CreateCorreoDto[]>([]);
  const [telefonos, setTelefonos] = useState<CreateTelefonoDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});
  const [enumLoaded, setEnumLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showNewEmail, setShowNewEmail] = useState(false);
  const [showNewPhone, setShowNewPhone] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEnumLoaded(true);
  }, []);
  
  useEffect(() => {
    if (cliente) {
      setFormData({
        noCliente: cliente.noCliente,
        razonSocial: cliente.razonSocial,
        comercial: cliente.comercial || '',
        diasCredito: cliente.diasCredito,
        clasificacion: cliente.clasificacion || CLASIFICACIONES[0],
        sucursal: cliente.sucursal || SUCURSALES[0],
        status: cliente.status
      });
      
      // Initialize correos
      if (cliente.correos && cliente.correos.length > 0) {
        setCorreos(cliente.correos.map(c => ({
          noCliente: c.noCliente,
          correo: c.correo
        })));
      }
      
      // Initialize telefonos
      if (cliente.telefonos && cliente.telefonos.length > 0) {
        setTelefonos(cliente.telefonos.map(t => ({
          noCliente: t.noCliente,
          telefono: t.telefono
        })));
      }
    }
  }, [cliente]);

  // Form validation
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (touchedFields.razonSocial && !formData.razonSocial) {
      errors.razonSocial = 'La razón social es requerida';
    }

    if (touchedFields.diasCredito) {
      const diasCredito = formData.diasCredito;
      if (diasCredito === undefined || diasCredito === null) {
        errors.diasCredito = 'Los días de crédito son requeridos';
      } else if (typeof diasCredito === 'number' && diasCredito < 0) {
        errors.diasCredito = 'Los días de crédito deben ser positivos';
      }
    }

    if (touchedFields.noCliente && !isEdit) {
      const noCliente = formData.noCliente;
      if (noCliente === undefined || noCliente === null) {
        errors.noCliente = 'El número de cliente es requerido';
      } else if (typeof noCliente === 'number' && noCliente <= 0) {
        errors.noCliente = 'El número de cliente debe ser positivo';
      }
    }

    setFormErrors(errors);
  }, [formData, touchedFields, isEdit]);
  
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [name as string]: true
    }));
    
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };
  
  const handleAddCorreo = async () => {
    if (!newEmail) return;

    try {
      const result = await validateCorreo(newEmail);
      if (result.isValid) {
        setCorreos(prev => [...prev, { 
          noCliente: cliente?.noCliente || 0, 
          correo: newEmail 
        }]);
        setNewEmail('');
        setShowNewEmail(false);
      } else {
        setFormErrors(prev => ({
          ...prev,
          newEmail: 'Formato de correo inválido'
        }));
      }
    } catch (error) {
      console.error('Error validando email:', error);
    }
  };
  
  const handleCorreoChange = async (index: number, value: string) => {
    const newCorreos = [...correos];
    newCorreos[index].correo = value;
    setCorreos(newCorreos);
    
    // Validate email
    try {
      if (value) {
        const result = await validateCorreo(value);
        if (!result.isValid) {
          setEmailErrors(prev => ({ ...prev, [index]: 'Formato de correo inválido' }));
        } else {
          setEmailErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      } else {
        setEmailErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validando email:', error);
    }
  };
  
  const handleRemoveCorreo = (index: number) => {
    const newCorreos = [...correos];
    newCorreos.splice(index, 1);
    setCorreos(newCorreos);
    
    setEmailErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };
  
  const handleAddTelefono = () => {
    if (!newPhone) return;
    
    setTelefonos(prev => [...prev, { 
      noCliente: cliente?.noCliente || 0, 
      telefono: newPhone 
    }]);
    setNewPhone('');
    setShowNewPhone(false);
  };
  
  const handleTelefonoChange = (index: number, value: string) => {
    const newTelefonos = [...telefonos];
    newTelefonos[index].telefono = value;
    setTelefonos(newTelefonos);
  };
  
  const handleRemoveTelefono = (index: number) => {
    const newTelefonos = [...telefonos];
    newTelefonos.splice(index, 1);
    setTelefonos(newTelefonos);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for email validation errors
    if (Object.keys(emailErrors).length > 0) {
      return;
    }

    // Mark all fields as touched for validation
    const allFields = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouchedFields(allFields);
    
    // Check if there are any form errors
    const hasErrors = Object.keys(formErrors).length > 0;
    if (hasErrors) return;

    // Remove fields that shouldn't be included in create (as per error messages)
    const cleanedFormData = { ...formData };
    if (!isEdit) {
      // Only remove for create, not for update
      delete (cleanedFormData as any).rfc;
      delete (cleanedFormData as any).limiteCredito;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(cleanedFormData, correos, telefonos);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (clienteLoading || !enumLoaded) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  const hasFormErrors = Object.keys(formErrors).length > 0;
  const hasEmailErrors = Object.keys(emailErrors).length > 0;
  const isFormValid = !hasFormErrors && !hasEmailErrors;
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: `4px solid ${theme.palette.primary.main}` }} />
      <Box p={3}>
        <Typography variant="h6" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1 }} />
          {isEdit ? 'Actualizar Cliente' : 'Crear Nuevo Cliente'}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {isEdit 
            ? 'Actualice la información del cliente y sus datos de contacto.' 
            : 'Complete el formulario para crear un nuevo cliente.'}
        </Typography>
        
        <Divider sx={{ mb: 4, mt: 2 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {/* No. Cliente */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                id="noCliente"
                name="noCliente"
                label="No. Cliente"
                type="number"
                required
                disabled={isEdit}
                value={formData.noCliente === 0 ? '' : formData.noCliente}
                onChange={handleTextFieldChange}
                error={!!formErrors.noCliente}
                helperText={formErrors.noCliente}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* Razón Social */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                id="razonSocial"
                name="razonSocial"
                label="Razón Social"
                required
                value={formData.razonSocial || ''}
                onChange={handleTextFieldChange}
                error={!!formErrors.razonSocial}
                helperText={formErrors.razonSocial}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* Nombre Comercial */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                id="comercial"
                name="comercial"
                label="Nombre Comercial"
                value={formData.comercial || ''}
                onChange={handleTextFieldChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* Días de Crédito */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                id="diasCredito"
                name="diasCredito"
                label="Días de Crédito"
                type="number"
                required
                value={formData.diasCredito === 0 ? '0' : formData.diasCredito}
                onChange={handleTextFieldChange}
                error={!!formErrors.diasCredito}
                helperText={formErrors.diasCredito}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* Clasificación */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="clasificacion-label">Clasificación</InputLabel>
                <Select
                  labelId="clasificacion-label"
                  id="clasificacion"
                  name="clasificacion"
                  value={formData.clasificacion || ''}
                  onChange={handleSelectChange}
                  label="Clasificación"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {CLASIFICACIONES.map(clasificacion => (
                    <MenuItem key={clasificacion} value={clasificacion}>
                      {clasificacion}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Debe ser uno de los siguientes: AAA, AA, A, B, C, D
                </FormHelperText>
              </FormControl>
            </Box>
            
            {/* Sucursal */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="sucursal-label">Sucursal</InputLabel>
                <Select
                  labelId="sucursal-label"
                  id="sucursal"
                  name="sucursal"
                  value={formData.sucursal || ''}
                  onChange={handleSelectChange}
                  label="Sucursal"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {SUCURSALES.map(sucursal => (
                    <MenuItem key={sucursal} value={sucursal}>
                      {sucursal.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Debe ser una sucursal válida
                </FormHelperText>
              </FormControl>
            </Box>
            
            {/* Estado */}
            <Box sx={{ flexBasis: { xs: '100%', sm: '47%', md: '30%' }, flexGrow: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status || 'Activo'}
                  onChange={handleSelectChange}
                  label="Estado"
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                  <MenuItem value="Suspendido">Suspendido</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            {/* Correos electrónicos */}
            <Card 
              variant="outlined"
              sx={{ 
                flexBasis: { xs: '100%', md: '48%' }, 
                flexGrow: 1,
                borderColor: theme.palette.divider
              }}
            >
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="subtitle1">Correos Electrónicos</Typography>
                  </Box>
                }
                action={
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    color="primary"
                    onClick={() => setShowNewEmail(true)}
                    sx={{ mr: 1 }}
                  >
                    Agregar
                  </Button>
                }
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  p: 1.5
                }}
              />
              
              <CardContent sx={{ p: 2 }}>
                <AnimatePresence>
                  {showNewEmail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Nuevo correo"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          error={!!formErrors.newEmail}
                          helperText={formErrors.newEmail}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddCorreo}
                          sx={{ minWidth: 'auto' }}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Stack spacing={1}>
                  <AnimatePresence>
                    {correos.map((correo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={correo.correo}
                            onChange={(e) => handleCorreoChange(index, e.target.value)}
                            error={!!emailErrors[index]}
                            helperText={emailErrors[index]}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon color="action" fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveCorreo(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Stack>
                
                {correos.length === 0 && !showNewEmail && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay correos registrados
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Teléfonos */}
            <Card 
              variant="outlined"
              sx={{ 
                flexBasis: { xs: '100%', md: '48%' }, 
                flexGrow: 1,
                borderColor: theme.palette.divider
              }}
            >
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="subtitle1">Teléfonos</Typography>
                  </Box>
                }
                action={
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    color="primary"
                    onClick={() => setShowNewPhone(true)}
                    sx={{ mr: 1 }}
                  >
                    Agregar
                  </Button>
                }
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  p: 1.5
                }}
              />
              
              <CardContent sx={{ p: 2 }}>
                <AnimatePresence>
                  {showNewPhone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box sx={{ display: 'flex', mb: 2, gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Nuevo teléfono"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleAddTelefono}
                          sx={{ minWidth: 'auto' }}
                        >
                          <AddIcon />
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Stack spacing={1}>
                  <AnimatePresence>
                    {telefonos.map((telefono, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={telefono.telefono}
                            onChange={(e) => handleTelefonoChange(index, e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon color="action" fontSize="small" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveTelefono(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Stack>
                
                {telefonos.length === 0 && !showNewPhone && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No hay teléfonos registrados
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || isSaving || !isFormValid}
              sx={{ minWidth: 150 }}
            >
              {isSubmitting || isSaving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default ClienteForm;