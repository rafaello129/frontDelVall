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
  Avatar
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Comment as CommentIcon
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

  // Get first letter of the user who created the record
  const getInitial = () => {
    return bitacora.creadoPor ? bitacora.creadoPor.charAt(0).toUpperCase() : '?';
  };

  // Format comments for display - truncate if too long
  const formatComment = (text?: string, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <Box>
            <Tooltip title="Ver detalles">
              <IconButton edge="end" aria-label="view" onClick={handleView}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton edge="end" aria-label="edit" onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton edge="end" aria-label="delete" onClick={handleDelete} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <ListItemButton onClick={handleView}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {bitacora.tipo === TipoBitacora.COMENTARIO ? <CommentIcon /> : <PersonIcon />}
          </Avatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1">
                  {format(new Date(bitacora.fecha), 'dd MMM yyyy, HH:mm', { locale: es })}
                </Typography>
                <TipoBitacoraChip tipo={bitacora.tipo} />
                {bitacora.sucursal && <SucursalBadge sucursal={bitacora.sucursal} />}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" component="span" color="text.primary">
                  Cliente: 
                </Typography>
                <Typography variant="body2" component="span">
                  {' '}{bitacora.comercial || bitacora.razonSocial} (#{bitacora.noCliente})
                </Typography>
                <Box mt={0.5}>
                  {bitacora.comentario && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Comentario:</strong> {formatComment(bitacora.comentario)}
                    </Typography>
                  )}
                  {bitacora.contestacion && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Respuesta:</strong> {formatComment(bitacora.contestacion)}
                    </Typography>
                  )}
                </Box>
                <Box mt={0.5} display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {bitacora.creadoPor && (
                      <>Por: {bitacora.creadoPor} | </>
                    )}
                    {bitacora.banco && (
                      <>Banco: {bitacora.banco} | </>
                    )}
                    {bitacora.clasificacion && (
                      <>Clasificación: {bitacora.clasificacion}</>
                    )}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider />
    </>
  );
};