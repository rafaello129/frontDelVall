import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { PagoExterno, CreatePagoExternoDto, UpdatePagoExternoDto } from '../types';
import { Sucursal, TipoPago, TipoPagoExterno } from '../../shared/enums';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { fetchBancos, selectBancos } from '../../banco/bancoSlice';
import { BancoSelector } from '../../shared/components/BancoSelector';
import { ClienteAutocomplete } from '../../shared/components/ClienteAutocomplete';

interface PagoExternoFormProps {
  initialData?: PagoExterno | null;
  onSubmit: (data: CreatePagoExternoDto | UpdatePagoExternoDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const PagoExternoForm: React.FC<PagoExternoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const dispatch = useAppDispatch();
  const bancos = useAppSelector(selectBancos);
  const [hasCliente, setHasCliente] = useState<boolean>(!!initialData?.noCliente);

  useEffect(() => {
    dispatch(fetchBancos({}));
  }, [dispatch]);

  const validationSchema = Yup.object({
    fechaPago: Yup.date().required('La fecha es obligatoria'),
    monto: Yup.number()
      .required('El monto es obligatorio')
      .positive('El monto debe ser positivo'),
    tipoCambio: Yup.number()
      .required('El tipo de cambio es obligatorio')
      .positive('El tipo de cambio debe ser positivo'),
    montoDolares: Yup.number()
      .nullable()
      .min(0, 'El monto en dólares no puede ser negativo'),
    tipo: Yup.string().required('El tipo de pago externo es obligatorio'),
    // Use test() instead of when() to break the circular dependency
    noCliente: Yup.number().nullable(),
    nombrePagador: Yup.string().nullable(),
    bancoId: Yup.number().required('El banco es obligatorio')
  }).test(
    'clienteOrPagador',
    {}, // No message here, we'll return a custom error object
    function(values: { noCliente?: number | null; nombrePagador?: string | null; }) {
      // Skip this test if the user is still switching between cliente/pagador modes
      if ((hasCliente && !values.noCliente) || (!hasCliente && !values.nombrePagador)) {
        return this.createError({
          path: hasCliente ? 'noCliente' : 'nombrePagador',
          message: 'Debe proporcionar un cliente o un nombre de pagador'
        });
      }
      return true;
    }
  );

  const formik = useFormik({
    initialValues: {
      fechaPago: initialData?.fechaPago ? new Date(initialData.fechaPago) : new Date(),
      monto: initialData?.monto || 0,
      tipoCambio: initialData?.tipoCambio || 20.0,
      montoDolares: initialData?.montoDolares || null,
      tipo: initialData?.tipo || TipoPagoExterno.COBROS_EFECTIVO_RIVIERA,
      noCliente: initialData?.noCliente || null,
      nombrePagador: initialData?.nombrePagador || '',
      sucursal: initialData?.sucursal || null,
      concepto: initialData?.concepto || '',
      codigoTransferencia: initialData?.codigoTransferencia || '',
      tipoMovimiento: initialData?.tipoMovimiento || '',
      referenciaPago: initialData?.referenciaPago || '',
      tipoPago: initialData?.tipoPago || TipoPago.TRANSFERENCIA,
      bancoId: initialData?.bancoId || (bancos.length > 0 ? bancos[0].id : 1),
      notas: initialData?.notas || '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Process values based on whether it's a create or update operation
      const processedValues = Object.entries(values).reduce((acc, [key, value]) => {
        // Convert null values to undefined for compatibility with UpdatePagoExternoDto
        acc[key] = value === null ? undefined : value;
        return acc;
      }, {} as Record<string, any>);
      
      // Handle the client/payer logic
      const dataToSubmit = {
        ...processedValues,
        noCliente: hasCliente ? processedValues.noCliente : undefined,
        nombrePagador: !hasCliente ? processedValues.nombrePagador : '',
      };
      
      onSubmit(dataToSubmit);
    },
  });

  const handleTipoCambioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tipoCambio = parseFloat(e.target.value);
    formik.setFieldValue('tipoCambio', tipoCambio);
    
    // Calcular montoDolares si el monto está establecido
    if (formik.values.monto && tipoCambio) {
      const montoDolares = formik.values.monto / tipoCambio;
      formik.setFieldValue('montoDolares', Math.round(montoDolares * 100) / 100);
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monto = parseFloat(e.target.value);
    formik.setFieldValue('monto', monto);
    
    // Calcular montoDolares si el tipo de cambio está establecido
    if (monto && formik.values.tipoCambio) {
      const montoDolares = monto / formik.values.tipoCambio;
      formik.setFieldValue('montoDolares', Math.round(montoDolares * 100) / 100);
    }
  };

  const handleMontoDolaresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const montoDolares = parseFloat(e.target.value);
    formik.setFieldValue('montoDolares', montoDolares);
    
    // Calcular monto en pesos si el tipo de cambio está establecido
    if (montoDolares && formik.values.tipoCambio) {
      const monto = montoDolares * formik.values.tipoCambio;
      formik.setFieldValue('monto', Math.round(monto * 100) / 100);
    }
  };

  const toggleClienteMode = () => {
    setHasCliente(!hasCliente);
    if (hasCliente) {
      formik.setFieldValue('noCliente', null);
    } else {
      formik.setFieldValue('nombrePagador', '');
    }
  };

  return (
    <Card>
      <CardHeader 
        title={isEditing ? "Editar Pago Externo" : "Nuevo Pago Externo"} 
        subheader={isEditing ? `ID: ${initialData?.id}` : "Complete los datos del pago externo"} 
      />
      <Divider />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {/* Primera sección - Información básica */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Fecha de Pago"
                  value={formik.values.fechaPago}
                  onChange={(date) => formik.setFieldValue('fechaPago', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: formik.touched.fechaPago && Boolean(formik.errors.fechaPago),
                      helperText: formik.touched.fechaPago && formik.errors.fechaPago as string
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Pago Externo</InputLabel>
                  <Select
                    name="tipo"
                    value={formik.values.tipo}
                    onChange={formik.handleChange}
                    label="Tipo de Pago Externo"
                    error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                  >
                    {Object.values(TipoPagoExterno).map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.tipo && formik.errors.tipo && (
                    <FormHelperText error>{formik.errors.tipo}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={hasCliente} 
                      onChange={toggleClienteMode} 
                      name="hasCliente" 
                      color="primary"
                    />
                  }
                  label="Asociar a un cliente registrado"
                />
              </Box>
            </Box>

            {/* Segunda sección - Información monetaria */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Monto (MXN)"
                  name="monto"
                  type="number"
                  value={formik.values.monto}
                  onChange={handleMontoChange}
                  error={formik.touched.monto && Boolean(formik.errors.monto)}
                  helperText={formik.touched.monto && formik.errors.monto}
                  InputProps={{
                    startAdornment: <Typography variant="body2">$ </Typography>,
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Tipo de Cambio"
                  name="tipoCambio"
                  type="number"
                  value={formik.values.tipoCambio}
                  onChange={handleTipoCambioChange}
                  error={formik.touched.tipoCambio && Boolean(formik.errors.tipoCambio)}
                  helperText={formik.touched.tipoCambio && formik.errors.tipoCambio}
                  InputProps={{
                    startAdornment: <Typography variant="body2">$ </Typography>,
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Monto (USD)"
                  name="montoDolares"
                  type="number"
                  value={formik.values.montoDolares || ''}
                  onChange={handleMontoDolaresChange}
                  error={formik.touched.montoDolares && Boolean(formik.errors.montoDolares)}
                  helperText={formik.touched.montoDolares && formik.errors.montoDolares}
                  InputProps={{
                    startAdornment: <Typography variant="body2">$ </Typography>,
                  }}
                />
              </Box>
            </Box>

            {/* Tercera sección - Cliente/Pagador y Sucursal */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 2 }}>
                {hasCliente ? (
                  <ClienteAutocomplete
                    value={formik.values.noCliente}
                    onChange={(clienteId) => formik.setFieldValue('noCliente', clienteId)}
                    error={formik.touched.noCliente && Boolean(formik.errors.noCliente)}
                    helperText={(formik.errors.noCliente as string)}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Nombre del Pagador"
                    name="nombrePagador"
                    value={formik.values.nombrePagador}
                    onChange={formik.handleChange}
                    error={formik.touched.nombrePagador && Boolean(formik.errors.nombrePagador)}
                    helperText={formik.touched.nombrePagador && formik.errors.nombrePagador}
                  />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    name="sucursal"
                    value={formik.values.sucursal || ''}
                    onChange={formik.handleChange}
                    label="Sucursal"
                    error={formik.touched.sucursal && Boolean(formik.errors.sucursal)}
                  >
                    <MenuItem value="">
                      <em>Sin sucursal</em>
                    </MenuItem>
                    {Object.values(Sucursal).map((sucursal) => (
                      <MenuItem key={sucursal} value={sucursal}>
                        {sucursal}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.sucursal && formik.errors.sucursal && (
                    <FormHelperText error>{formik.errors.sucursal}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Cuarta sección - Concepto y Código de Transferencia */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Concepto"
                  name="concepto"
                  value={formik.values.concepto}
                  onChange={formik.handleChange}
                  error={formik.touched.concepto && Boolean(formik.errors.concepto)}
                  helperText={formik.touched.concepto && formik.errors.concepto}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Código de Transferencia"
                  name="codigoTransferencia"
                  value={formik.values.codigoTransferencia}
                  onChange={formik.handleChange}
                  error={formik.touched.codigoTransferencia && Boolean(formik.errors.codigoTransferencia)}
                  helperText={formik.touched.codigoTransferencia && formik.errors.codigoTransferencia}
                />
              </Box>
            </Box>

            {/* Quinta sección - Tipo de Movimiento y Referencia de Pago */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Tipo de Movimiento"
                  name="tipoMovimiento"
                  value={formik.values.tipoMovimiento}
                  onChange={formik.handleChange}
                  error={formik.touched.tipoMovimiento && Boolean(formik.errors.tipoMovimiento)}
                  helperText={formik.touched.tipoMovimiento && formik.errors.tipoMovimiento}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Referencia de Pago"
                  name="referenciaPago"
                  value={formik.values.referenciaPago}
                  onChange={formik.handleChange}
                  error={formik.touched.referenciaPago && Boolean(formik.errors.referenciaPago)}
                  helperText={formik.touched.referenciaPago && formik.errors.referenciaPago}
                />
              </Box>
            </Box>

            {/* Sexta sección - Tipo de Pago y Banco */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Pago</InputLabel>
                  <Select
                    name="tipoPago"
                    value={formik.values.tipoPago}
                    onChange={formik.handleChange}
                    label="Tipo de Pago"
                    error={formik.touched.tipoPago && Boolean(formik.errors.tipoPago)}
                  >
                    {Object.values(TipoPago).map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.tipoPago && formik.errors.tipoPago && (
                    <FormHelperText error>{formik.errors.tipoPago}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <BancoSelector
                  value={formik.values.bancoId}
                  onChange={(bancoId) => formik.setFieldValue('bancoId', bancoId)}
                  error={formik.touched.bancoId && Boolean(formik.errors.bancoId)}
                  helperText={(formik.errors.bancoId as string)}
                />
              </Box>
            </Box>

            {/* Séptima sección - Notas */}
            <Box>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                multiline
                rows={3}
                value={formik.values.notas}
                onChange={formik.handleChange}
                error={formik.touched.notas && Boolean(formik.errors.notas)}
                helperText={formik.touched.notas && formik.errors.notas}
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={onCancel}
              sx={{ mr: 1 }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !formik.dirty || !formik.isValid}
            >
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};