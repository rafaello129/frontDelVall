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
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1">
                  {proyeccion.cliente?.comercial || proyeccion.cliente?.razonSocial || `Cliente #${proyeccion.noCliente}`}
                </Typography>
                <ProyeccionEstadoChip estado={proyeccion.estado} />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" component="span" color="text.primary">
                  Fecha Proyectada: 
                </Typography>
                <Typography variant="body2" component="span">
                  {' '}{format(new Date(proyeccion.fechaProyectada), 'dd/MM/yyyy', { locale: es })}
                </Typography>
                <Typography variant="body2" display="block">
                  Monto: ${proyeccion.monto.toLocaleString('es-MX')}
                </Typography>
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider />
    </>
  );
};