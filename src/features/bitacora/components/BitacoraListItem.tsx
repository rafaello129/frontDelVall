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
  Avatar,
  useTheme,
  alpha,
  Paper,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { TipoBitacoraChip } from './TipoBitacoraChip';
import { SucursalBadge } from '../../shared/components/SucursalBadge';
import { TipoBitacora, type BitacoraPago } from '../types';

interface BitacoraListItemProps {
  bitacora: BitacoraPago;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const BitacoraListItem: React.FC<BitacoraListItemProps> = ({
  bitacora,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleView = () => {
    navigate(`/bitacora/${bitacora.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(bitacora.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(bitacora.id);
  };

  // Get color based on tipo
  const getColorByTipo = () => {
    switch (bitacora.tipo) {
      case TipoBitacora.COMENTARIO:
        return theme.palette.info.main;
      case TipoBitacora.SEGUIMIENTO:
        return theme.palette.primary.main;
      case TipoBitacora.CONTACTO:
        return theme.palette.success.main;
      default:
        return theme.palette.text.primary;
    }
  };

  // Format comments for display - truncate if too long
  const formatComment = (text?: string, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 1,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: alpha(getColorByTipo(), 0.03),
        borderLeft: `4px solid ${getColorByTipo()}`,
        '&:hover': {
          backgroundColor: alpha(getColorByTipo(), 0.08),
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <ListItem
        disablePadding
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Ver detalles" arrow>
              <IconButton 
                size="small"
                aria-label="view" 
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
            <Tooltip title="Editar" arrow>
              <IconButton 
                size="small"
                aria-label="edit" 
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
            <Tooltip title="Eliminar" arrow>
              <IconButton 
                size="small"
                aria-label="delete" 
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
          </Box>
        }
      >
        <ListItemButton 
          onClick={handleView}
          sx={{ 
            py: 1.5, 
            px: 2,
            borderRadius: 1
          }}
        >
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: alpha(getColorByTipo(), 0.1),
              color: getColorByTipo()
            }}
          >
            {bitacora.tipo === TipoBitacora.COMENTARIO ? <CommentIcon /> : <PersonIcon />}
          </Avatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                <Typography 
                  variant="subtitle1" 
                  component="span"
                  fontWeight="medium"
                >
                  {format(new Date(bitacora.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
                </Typography>
                <TipoBitacoraChip tipo={bitacora.tipo} />
                {bitacora.sucursal && <SucursalBadge sucursal={bitacora.sucursal} />}
              </Box>
            }
            secondary={
              <Box component="span">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon fontSize="small" sx={{ color: alpha(theme.palette.text.primary, 0.6) }} />
                  <Typography 
                    variant="body2" 
                    component="span" 
                    fontWeight={500}
                    color="text.primary"
                  >
                    {bitacora.comercial || bitacora.razonSocial}
                  </Typography>
                  <Chip 
                    label={`#${bitacora.noCliente}`}
                    size="small"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                {bitacora.comentario && (
                  <Typography 
                    variant="body2" 
                    component="span" 
                    color="text.secondary" 
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Comentario: 
                    </Box>
                    {' '}{formatComment(bitacora.comentario)}
                  </Typography>
                )}

                {bitacora.contestacion && (
                  <Typography 
                    variant="body2" 
                    component="span" 
                    color="text.secondary" 
                    display="block"
                  >
                    <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Respuesta: 
                    </Box>
                    {' '}{formatComment(bitacora.contestacion)}
                  </Typography>
                )}

                <Box sx={{ 
                  mt: 0.5, 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 1.5,
                  alignItems: 'center' 
                }}>
                  {bitacora.creadoPor && (
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{ 
                        color: alpha(theme.palette.text.secondary, 0.8),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <PersonIcon fontSize="inherit" />
                      {bitacora.creadoPor}
                    </Typography>
                  )}

                  {bitacora.banco && (
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{ 
                        color: alpha(theme.palette.text.secondary, 0.8),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Banco: {bitacora.banco}
                    </Typography>
                  )}
                  
                  {bitacora.clasificacion && (
                    <Chip
                      label={bitacora.clasificacion}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        borderColor: alpha(theme.palette.primary.main, 0.5)
                      }}
                    />
                  )}
                </Box>
              </Box>
            }
            secondaryTypographyProps={{ component: 'span' }} 
          />
        </ListItemButton>
      </ListItem>
    </Paper>
  );
};