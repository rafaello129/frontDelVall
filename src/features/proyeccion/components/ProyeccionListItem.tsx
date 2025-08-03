import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Avatar,
  Card,
  Fade
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { ProyeccionEstadoChip } from './ProyeccionEstadoChip';
import type { ProyeccionPago } from '../types';

interface ProyeccionListItemProps {
  proyeccion: ProyeccionPago;
  onMarkNotificacion?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ProyeccionListItem: React.FC<ProyeccionListItemProps> = ({
  proyeccion,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleView = () => {
    navigate(`/proyecciones/${proyeccion.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(proyeccion.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(proyeccion.id);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const clienteName = proyeccion.cliente?.comercial || 
    proyeccion.cliente?.razonSocial || 
    `Cliente #${proyeccion.noCliente}`;

  return (
    <Fade in={true} timeout={300}>
      <Card 
        elevation={0} 
        sx={{ 
          mb: 1,
          borderRadius: 2,
          overflow: 'visible',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ListItem
          disablePadding
          secondaryAction={
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Ver detalles" arrow>
                <IconButton 
                  size="small"
                  onClick={handleView}
                  sx={{ 
                    color: theme.palette.info.main,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.2),
                    }
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar proyección" arrow>
                <IconButton 
                  size="small"
                  onClick={handleEdit}
                  sx={{ 
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar proyección" arrow>
                <IconButton 
                  size="small"
                  onClick={handleDelete}
                  sx={{ 
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        >
          <ListItemButton 
            onClick={handleView}
            sx={{ 
              py: 1.5, 
              px: 2,
              borderRadius: 2,
            }}
          >
            <Avatar
              sx={{
                mr: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 'bold'
              }}
            >
              {getInitials(clienteName)}
            </Avatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="medium"
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontSize: '1rem'
                    }}
                  >
                    {clienteName}
                  </Typography>
                  <ProyeccionEstadoChip estado={proyeccion.estado} />
                </Box>
              }
              secondary={
                <Box>
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Box display="flex" alignItems="center">
                      <EventIcon 
                        fontSize="small" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mr: 0.5,
                          fontSize: '0.9rem'
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        component="span" 
                        color="text.secondary"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {format(new Date(proyeccion.fechaProyectada), 'd MMM yyyy', { locale: es })}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <AttachMoneyIcon 
                        fontSize="small" 
                        sx={{ 
                          color: theme.palette.success.main,
                          mr: 0.5,
                          fontSize: '0.9rem'
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        component="span" 
                        fontWeight="medium"
                        color="success.main"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {formatCurrency(proyeccion.monto)}
                      </Typography>
                    </Box>
                  </Stack>
                  
           
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ opacity: 0.6 }} />
      </Card>
    </Fade>
  );
};