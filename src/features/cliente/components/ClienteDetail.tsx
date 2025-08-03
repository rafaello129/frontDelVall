import React from 'react';
import { Link } from 'react-router-dom';
import type { Cliente } from '../types';
import {
  Paper, Typography, Box, Card, CardContent, CardHeader,
  Chip, Avatar, Divider, IconButton, List,
  ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Tooltip, useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  BusinessCenter as BusinessIcon,
  CreditCard as CreditCardIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import FacturasPendientesTable from './FacturasPendientesTable';

interface ClienteDetailProps {
  cliente: Cliente;
  showActions?: boolean;
}

const ClienteDetail: React.FC<ClienteDetailProps> = ({ cliente, showActions = true }) => {
  const theme = useTheme();
  
  const formatDateTime = (date: Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return {
          bg: theme.palette.success.main,
          text: theme.palette.success.contrastText
        };
      case 'Suspendido':
        return {
          bg: theme.palette.warning.main,
          text: theme.palette.warning.contrastText
        };
      default:
        return {
          bg: theme.palette.error.main,
          text: theme.palette.error.contrastText
        };
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Card elevation={2} sx={{ mb: 4, overflow: 'visible' }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <BusinessIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Información General</Typography>
            </Box>
          }
          action={
            showActions && (
              <IconButton 
                component={Link} 
                to={`/clientes/${cliente.noCliente}/editar`}
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
            )
          }
          sx={{ 
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        />
        <CardContent>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3
          }}>
            {/* No. Cliente */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                No. Cliente
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cliente.noCliente}
              </Typography>
            </Box>
            
            {/* Razón Social */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Razón Social
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cliente.razonSocial}
              </Typography>
            </Box>
            
            {/* Nombre Comercial */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Nombre Comercial
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cliente.comercial || '-'}
              </Typography>
            </Box>
            
            {/* RFC */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                RFC
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cliente.rfc || '-'}
              </Typography>
            </Box>
            
            {/* Días de Crédito */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Días de Crédito
                </Box>
              </Typography>
              <Chip 
                label={`${cliente.diasCredito} días`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
            
            {/* Límite de Crédito */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Límite de Crédito
                </Box>
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {cliente.limiteCredito ? `$${cliente.limiteCredito.toFixed(2)}` : '-'}
              </Typography>
            </Box>
            
            {/* Clasificación */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Clasificación
                </Box>
              </Typography>
              {cliente.clasificacion ? (
                <Chip 
                  label={cliente.clasificacion}
                  color="default"
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200]
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">-</Typography>
              )}
            </Box>
            
            {/* Sucursal */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Sucursal
                </Box>
              </Typography>
              {cliente.sucursal ? (
                <Chip 
                  label={cliente.sucursal}
                  color="info"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">-</Typography>
              )}
            </Box>
            
            {/* Estado */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Estado
              </Typography>
              <Chip 
                label={cliente.status}
                size="small"
                sx={{ 
                  backgroundColor: getStatusColor(cliente.status).bg,
                  color: getStatusColor(cliente.status).text
                }}
              />
            </Box>
            
            {/* Fecha de Registro */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Fecha de Registro
                </Box>
              </Typography>
              <Typography variant="body2">
                {formatDateTime(cliente.createdAt)}
              </Typography>
            </Box>
            
            {/* Última Actualización */}
            <Box sx={{ minWidth: '200px', flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
                  Última Actualización
                </Box>
              </Typography>
              <Typography variant="body2">
                {formatDateTime(cliente.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Contact Information */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {/* Email Section */}
        <Card elevation={2} sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Correos Electrónicos</Typography>
              </Box>
            }
            sx={{ 
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          />
          <CardContent sx={{ p: 0 }}>
            {cliente.correos && cliente.correos.length > 0 ? (
              <List dense>
                {cliente.correos.map((correo) => (
                  <ListItem key={correo.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={correo.correo}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Enviar correo">
                        <IconButton 
                          edge="end" 
                          aria-label="email"
                          component="a"
                          href={`mailto:${correo.correo}`}
                          color="primary"
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No hay correos registrados
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Phone Section */}
        <Card elevation={2} sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Teléfonos</Typography>
              </Box>
            }
            sx={{ 
              backgroundColor: theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          />
          <CardContent sx={{ p: 0 }}>
            {cliente.telefonos && cliente.telefonos.length > 0 ? (
              <List dense>
                {cliente.telefonos.map((telefono) => (
                  <ListItem key={telefono.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={telefono.telefono}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Llamar">
                        <IconButton 
                          edge="end" 
                          aria-label="call"
                          component="a"
                          href={`tel:${telefono.telefono}`}
                          color="primary"
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  No hay teléfonos registrados
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* Facturas Pendientes */}
      <Card elevation={2}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <CreditCardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Facturas Pendientes</Typography>
            </Box>
          }
          subheader="Listado de facturas con saldo pendiente"
          sx={{ 
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        />
        <CardContent>
          <FacturasPendientesTable noCliente={cliente.noCliente} cliente= {cliente} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClienteDetail;