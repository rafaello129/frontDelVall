import React, { useState, useCallback } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Container, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { usePapaParse } from 'react-papaparse';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import type { CreatePagoExternoDto } from '..';
import { Sucursal, TipoPagoExterno, TipoPago } from '../../shared/enums';
import { BancoSelector } from '../../shared/components/BancoSelector';
import {
    createPagoExterno,
    createManyPagoExterno,
    selectPagosExternosLoading,
  } from '../pagoExternoSlice';
import { useAppDispatch } from '../../../app/hooks';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// Helper functions for data parsing
const parseAmount = (amount: string): number => {
  if (!amount) return 0;
  // Remove currency symbols, dots in thousands and replace comma with dot for decimal
  return parseFloat(amount.replace(/[$€\s]/g, '').replace(/\./g, '').replace(/,/g, '.'));
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Try different date formats (DD/MM/YYYY or YYYY-MM-DD)
  const parts = dateStr.split(/[\/\-]/);
  
  if (parts.length !== 3) return new Date();
  
  // Check if format is DD/MM/YYYY
  if (parts[0].length <= 2 && parts[1].length <= 2) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  } 
  
  // Assume YYYY-MM-DD
  return new Date(dateStr);
};

// Validate if a string is a valid Sucursal enum value
const isValidSucursal = (value: string | undefined): boolean => {
  if (!value) return false;
  return Object.values(Sucursal).includes(value as Sucursal);
};

const SubirCsvPagosExternosPage: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [parsedPayments, setParsedPayments] = useState<CreatePagoExternoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tipoPagoExterno, setTipoPagoExterno] = useState<TipoPagoExterno>(TipoPagoExterno.COBROS_EFECTIVO_RIVIERA);
  const [bancoId, setBancoId] = useState<number>(0);
  const [sucursal, setSucursal] = useState<Sucursal | ''>('');
  
  const { readString } = usePapaParse();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSuccess(false);
    setParsedPayments([]);
    
    if (acceptedFiles.length === 0) {
      setError('No se seleccionó ningún archivo CSV.');
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('El archivo debe ser de tipo CSV.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      readString(content, {
        header: false,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
        },
        error: (error) => {
          setError(`Error al leer el CSV: ${error.message}`);
        }
      });
    };
    
    reader.onerror = () => {
      setError('Error al leer el archivo.');
    };
    
    reader.readAsText(file);
  }, [readString]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });
  
  const processCSVData = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!csvData || csvData.length === 0) {
        throw new Error('No hay datos CSV para procesar.');
      }
      
      // Detect CSV format by checking header
      const headerRow = csvData[0];
      let format: 'format1' | 'format2' | 'format3' | 'format4' | 'unknown' = 'unknown';
      
      if (headerRow.includes('FECHA') && headerRow.includes('CLIENTE') && headerRow.includes('TOTAL') && headerRow.includes('SUCURSAL')) {
        format = 'format1'; // First example format
      } else if (headerRow.includes('FECHA') && headerRow.includes('CLIENTE') && headerRow.includes('TOTAL') && !headerRow.includes('SUCURSAL')) {
        format = 'format2'; // Second example format
      } else if (headerRow.includes('id_movimiento') && headerRow.includes('f_elaboracion') && headerRow.includes('monto_importe')) {
        format = 'format3'; // Third and fourth example formats
      } else if (headerRow.includes('Fecha') && headerRow.includes('Movimiento') && headerRow.includes('Cód. Trans.')) {
        format = 'format4'; // Fifth example format
      }
      
      const payments: CreatePagoExternoDto[] = [];
      
      // Skip header row
      const dataRows = csvData.slice(1);
      
      // Process data based on detected format
      for (const row of dataRows) {
        if (!row || row.length === 0 || row.every((cell: any) => !cell)) {
          continue; // Skip empty rows
        }
        
        try {
          let payment: CreatePagoExternoDto;
          
          switch (format) {
            case 'format1': // FECHA;CLIENTE;TOTAL;SUCURSAL
              if (row[0] && row[2] && !isNaN(parseAmount(row[2]))) {
                payment = {
                  fechaPago: parseDate(row[0]),
                  monto: parseAmount(row[2]),
                  tipoCambio: 20, // Default exchange rate
                  tipo: tipoPagoExterno,
                  bancoId: bancoId,
                  nombrePagador: row[1] || undefined,
                  // Only set sucursal if it's a valid value from the enum
                  sucursal: isValidSucursal(row[3]) ? (row[3] as Sucursal) : undefined,
                  concepto: row[1] || undefined,
                  tipoPago: TipoPago.TRANSFERENCIA
                };
                payments.push(payment);
              }
              break;
            
            case 'format2': // FECHA;CLIENTE;TOTAL
              if (row[0] && row[2] && !isNaN(parseAmount(row[2]))) {
                payment = {
                  fechaPago: parseDate(row[0]),
                  monto: parseAmount(row[2]),
                  tipoCambio: 20, // Default exchange rate
                  tipo: tipoPagoExterno,
                  bancoId: bancoId,
                  nombrePagador: row[1] || undefined,
                  // Use selected sucursal if provided
                  sucursal: sucursal || undefined,
                  concepto: row[1] || undefined,
                  tipoPago: TipoPago.TRANSFERENCIA
                };
                payments.push(payment);
              }
              break;
              
            case 'format3': // id_movimiento;f_elaboracion;monto_importe;id_cliente;num_movimiento;nombre
              if (row[1] && row[2] && !isNaN(parseAmount(row[2]))) {
                payment = {
                  fechaPago: parseDate(row[1]),
                  monto: parseAmount(row[2]),
                  tipoCambio: 20, // Default exchange rate
                  tipo: tipoPagoExterno,
                  bancoId: bancoId,
                  noCliente: row[3] ? parseInt(row[3], 10) : undefined,
                  nombrePagador: row[5] || undefined,
                  // Use selected sucursal if provided
                  sucursal: sucursal || undefined,
                  concepto: `Movimiento ${row[0]}`,
                  referenciaPago: row[4] || undefined,
                  tipoPago: TipoPago.TRANSFERENCIA
                };
                payments.push(payment);
              }
              break;
              
            case 'format4': // Fecha;Movimiento;Cód. Trans.;Concepto;Depósitos
              if (row[0] && row[4] && !isNaN(parseAmount(row[4]))) {
                payment = {
                  fechaPago: parseDate(row[0]),
                  monto: parseAmount(row[4]),
                  tipoCambio: 20, // Default exchange rate
                  tipo: tipoPagoExterno,
                  bancoId: bancoId,
                  codigoTransferencia: row[2] || undefined,
                  concepto: row[3] || undefined,
                  referenciaPago: row[1] || undefined,
                  // Use selected sucursal if provided
                  sucursal: sucursal || undefined,
                  tipoPago: row[2] === '0' ? TipoPago.EFECTIVO : TipoPago.TRANSFERENCIA
                };
                payments.push(payment);
              }
              break;
              
            case 'unknown':
              // Try to guess format based on data patterns
              if (row.length >= 3 && !isNaN(parseAmount(row[2]))) {
                payment = {
                  fechaPago: parseDate(row[0]),
                  monto: parseAmount(row[2]),
                  tipoCambio: 20, // Default exchange rate
                  tipo: tipoPagoExterno,
                  bancoId: bancoId,
                  // Use selected sucursal if provided
                  sucursal: sucursal || undefined,
                  nombrePagador: row[1] || undefined,
                  tipoPago: TipoPago.TRANSFERENCIA
                };
                payments.push(payment);
              }
              break;
          }
        } catch (rowError) {
          console.error('Error processing row:', row, rowError);
          // Continue with next row instead of failing completely
        }
      }
      
      setParsedPayments(payments);
      setSuccess(true);
    } catch (err: any) {
      setError(`Error al procesar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const dispatch = useAppDispatch();
  const navigate = useNavigate();   
  const handleSubmit = () => {
    // Just log the parsed payments as required
    dispatch(createManyPagoExterno(parsedPayments))
    .unwrap()
    .then(() => {
      navigate('/pagos-externos');
    })
    .catch(error => {
      toast.error('Error al crear el pago externo');
    });
    console.log(parsedPayments);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Subir CSV de Pagos Externos
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="tipo-pago-externo-label">Tipo de Pago Externo</InputLabel>
              <Select
                labelId="tipo-pago-externo-label"
                value={tipoPagoExterno}
                label="Tipo de Pago Externo"
                onChange={(e) => setTipoPagoExterno(e.target.value as TipoPagoExterno)}
              >
                {Object.values(TipoPagoExterno).map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <BancoSelector
                  value={bancoId}
                  onChange={(e) => setBancoId(Number(e))}
              
                />
            </FormControl>
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="sucursal-label">Sucursal</InputLabel>
            <Select
              labelId="sucursal-label"
              value={sucursal}
              label="Sucursal"
              onChange={(e) => setSucursal(e.target.value as Sucursal)}
            >
              <MenuItem value="">
                <em>No especificada</em>
              </MenuItem>
              {Object.values(Sucursal).map((suc) => (
                <MenuItem key={suc} value={suc}>{suc}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box 
            {...getRootProps()} 
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.400',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.50' : 'grey.50',
              '&:hover': {
                bgcolor: 'primary.50',
                borderColor: 'primary.main'
              },
              transition: 'all 0.2s ease',
              mt: 2
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            {isDragActive ? (
              <Typography>Suelta el archivo aquí...</Typography>
            ) : (
              <Typography>
                Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar un archivo
              </Typography>
            )}
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              Solo archivos CSV
            </Typography>
          </Box>
          
          {csvData.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success">
                Archivo CSV cargado correctamente. {csvData.length} filas detectadas.
              </Alert>
              
              <Box mt={2} display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={processCSVData}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : undefined}
                >
                  {loading ? 'Procesando...' : 'Procesar CSV'}
                </Button>
              </Box>
            </Box>
          )}
          
          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          
          {success && parsedPayments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success">
                Se han identificado {parsedPayments.length} pagos externos en el CSV.
              </Alert>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Resumen de pagos detectados:
                </Typography>
                
                <Stack spacing={2} sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                  {parsedPayments.slice(0, 10).map((payment, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box sx={{ flex: '1 1 0' }}>
                          <Typography variant="caption" color="text.secondary">Fecha:</Typography>
                          <Typography variant="body2">
                            {payment.fechaPago.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 0' }}>
                          <Typography variant="caption" color="text.secondary">Monto:</Typography>
                          <Typography variant="body2">
                            ${payment.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '2 1 0' }}>
                          <Typography variant="caption" color="text.secondary">Concepto/Cliente:</Typography>
                          <Typography variant="body2" noWrap>
                            {payment.concepto || payment.nombrePagador || 'N/A'}
                          </Typography>
                        </Box>
                        {payment.sucursal && (
                          <Box sx={{ flex: '1 1 0' }}>
                            <Typography variant="caption" color="text.secondary">Sucursal:</Typography>
                            <Typography variant="body2">
                              {payment.sucursal}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                  
                  {parsedPayments.length > 10 && (
                    <Chip 
                      label={`Y ${parsedPayments.length - 10} pagos más...`} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ alignSelf: 'center' }}
                    />
                  )}
                </Stack>
                
                <Box mt={3} display="flex" justifyContent="center">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmit}
                    startIcon={<SendIcon />}
                    size="large"
                  >
                    Enviar Pagos
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SubirCsvPagosExternosPage;