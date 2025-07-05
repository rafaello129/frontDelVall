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
  Delete as DeleteIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { ProyeccionEstadoChip } from './ProyeccionEstadoChip';
import { TipoPagoChip } from '../../shared/components/TipoPagoChip';
import type { ProyeccionPago } from '../types';

interface ProyeccionListItemProps {
  proyeccion: ProyeccionPago;
  onMarkNotificacion?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ProyeccionListItem: React.FC<ProyeccionListItemProps> = ({
  proyeccion,
  onMarkNotificacion,
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

  const handleMarkNotificacion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkNotificacion) onMarkNotificacion(proyeccion.id);
  };

  return (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <Box>
            {!proyeccion.notificacionEnviada && (
              <Tooltip title="Marcar notificación como enviada">
                <IconButton edge="end" aria-label="notification" onClick={handleMarkNotificacion} color="info">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            )}
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
                {proyeccion.tipoPago && <TipoPagoChip tipoPago={proyeccion.tipoPago} />}
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
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">
                    Monto: ${proyeccion.monto.toLocaleString('es-MX')} 
                    {proyeccion.montoDolares && ` (USD $${proyeccion.montoDolares.toLocaleString('es-MX')})`}
                  </Typography>
                  {proyeccion.noFactura && (
                    <Typography variant="body2">
                      Factura: {proyeccion.noFactura}
                    </Typography>
                  )}
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