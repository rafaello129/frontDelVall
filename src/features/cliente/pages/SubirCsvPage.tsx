import React, { useEffect, useRef, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, LinearProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { usePapaParse } from 'react-papaparse';
import type { Cliente, CreateClienteDto } from '../types';
import { useCliente } from '../hooks/useCliente';
import  { Sucursal } from '../../shared/enums';



// Ayudante para parsear la sucursal desde texto a enum
function parseSucursal(input: string): Sucursal | null {
  if (!input) return null;
  const normalized = input.trim().toUpperCase().replace(/ /g, '_');
  
  // Mapear posibles variantes del CSV
  const map: Record<string, Sucursal> = {
    'ACAPULCO': Sucursal.ACAPULCO,
    'AKUMAL': Sucursal.AKUMAL,
    'BLUELINE': Sucursal.BLUELINE,
    'BLUE/LINE': Sucursal.BLUELINE,
    'BLUE LINE': Sucursal.BLUELINE,
    'BLUE_LINE': Sucursal.BLUELINE,
    ' BLUE LINE': Sucursal.BLUELINE,
    'CABOS': Sucursal.CABOS,
    'CABOS_ACAPULCO': Sucursal.CABOS_ACAPULCO,
    'CABOS-ACAPULCO': Sucursal.CABOS_ACAPULCO,
    'CANCUN': Sucursal.CANCUN,
    'CANCUN_BLUE_LINE': Sucursal.CANCUN_BLUE_LINE,
    'CANCUN/BLUE LINE': Sucursal.CANCUN_BLUE_LINE,
    'CANCUN/BLUE_LINE': Sucursal.CANCUN_BLUE_LINE,
    'CANCUN-BLUE-LINE': Sucursal.CANCUN_BLUE_LINE,
    'CANCUN PLAYA': Sucursal.CANCUN_PLAYA,
    'CANCUN_PLAYA': Sucursal.CANCUN_PLAYA,
    'CANCUN/PLAYA': Sucursal.CANCUN_PLAYA,
    'CLM': Sucursal.CLM,
    'CLMFA': Sucursal.CLMFA,
    'COACH_LINE': Sucursal.COACH_LINE,
    'COACH LINE': Sucursal.COACH_LINE,
    'COACH_LINE_CANCUN': Sucursal.COACH_LINE_CANCUN,
    'COACH LINE CANCUN': Sucursal.COACH_LINE_CANCUN,
    'COACH_LINE/CANCUN': Sucursal.COACH_LINE_CANCUN,
    'MAHAHUAL': Sucursal.MAHAHUAL,
    'MAZATLAN': Sucursal.MAZATLAN,
    'PDC': Sucursal.PDC,
    'PLAYA_DEL_CARMEN': Sucursal.PLAYA_DEL_CARMEN,
    'PLAYA DEL CARMEN': Sucursal.PLAYA_DEL_CARMEN,
    'PUERTO_AVENTURAS': Sucursal.PUERTO_AVENTURAS,
    'PUERTO AVENTURAS': Sucursal.PUERTO_AVENTURAS,
    'PUERTO_MORELOS': Sucursal.PUERTO_MORELOS,
    'PUERTO MORELOS': Sucursal.PUERTO_MORELOS,
    'TEPEAPULCO': Sucursal.TEPEAPULCO,
    'TULUM': Sucursal.TULUM,
    'VALLARTA': Sucursal.VALLARTA,
    'YUCATAN': Sucursal.YUCATAN,
  };
  // Normalización extra para variantes con guiones/baja
  if (map[normalized]) return map[normalized];
  // Intenta por coincidencia directa con el enum
  if (Sucursal[normalized as keyof typeof Sucursal]) return Sucursal[normalized as keyof typeof Sucursal];
  // Si no se encuentra, retorna null
  console.log("alerta: Sucursal no reconocida:", input);
  console.log("normalizando sucursal:", input, "->", normalized);
  return null;
}

const VISIBLE_ROWS = 50;

const SubirCsvPage: React.FC = () => {
  const { addBulkClientes } = useCliente();
  const { readString } = usePapaParse();
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headerRowIdx, setHeaderRowIdx] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowWindow, setRowWindow] = useState({ start: 0, end: VISIBLE_ROWS });
  const [uploading, setUploading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const clientesRef = useRef<CreateClienteDto[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    setRowWindow({ start: 0, end: VISIBLE_ROWS }); 
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvString = event.target?.result as string;
      parseCsv(csvString);
    };
    reader.readAsText(file);
  };

  const findHeaderRowIdx = (data: string[][]) => {
    return data.findIndex(row => !!row[0] && row[0].trim() !== '');
  };

  const isRowEmpty = (row: string[]) =>
    row.every(cell => (cell === undefined || cell === null || String(cell).trim() === ''));

  const parseCsv = (csvString: string) => {
    readString(csvString, {
      worker: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      fastMode: true,
      complete: (results) => {
        let rawData = results.data as string[][];
        rawData = rawData.filter(row => !isRowEmpty(row) && !!row[0] && row[0].trim() !== '');
        const headerIdx = findHeaderRowIdx(rawData);
        setHeaderRowIdx(headerIdx);
        setCsvData(rawData);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (csvData.length === 0) {
      clientesRef.current = [];
      return;
    }
    const datos = csvData.filter((value, index) => index !== 0);
    const clientes = datos.slice(headerRowIdx + 1).map(row => {
      let status: 'Activo' | 'Inactivo' = 'Activo';
      if (row[5] && row[5].toLowerCase() === 'inactivo') {
        status = 'Inactivo';
      } else {
        status = 'Activo';
      }

      // Aquí parsea la sucursal usando el helper
      const sucursalParsed = parseSucursal(row[4]);
      if (!sucursalParsed) {
        // Puedes notificar aquí si lo deseas, o dejar el campo vacío
        // Ejemplo: console.warn(`Sucursal no reconocida: ${row[4]}`);
      }

      return {
        noCliente: parseInt(row[0]),
        razonSocial: row[1] || '',
        comercial: row[2] || '',
        diasCredito: row[3] ? parseInt(row[3], 10) : 0,
        sucursal: sucursalParsed ?? '', // usa el valor parseado, o vacío si no reconoce
        status: status,
        clasificacion: row[6] || '',
      };
    });
    clientesRef.current = clientes;
    // comprobar si hay clientes con noCliente repetidos
    const noClienteSet = new Set();
    const hasDuplicates = clientes.some(cliente => {
      if (noClienteSet.has(cliente.noCliente)) {
        console.warn(`Cliente con noCliente duplicado: ${cliente.noCliente}`);
        return true;
      }
      noClienteSet.add(cliente.noCliente);
      return false;
    });
    //eliminar duplicados
    if (hasDuplicates) {
      clientesRef.current = clientes.filter((cliente, index, self) =>
        index === self.findIndex(c => c.noCliente === cliente.noCliente)
      );
      console.warn('Se eliminaron clientes con noCliente duplicados.');
    }
  }, [csvData, headerRowIdx]);

  // Mostrar confirmación antes de subir
  const handleBulkUpload = () => {
    setOpenConfirm(true);
  };

  // Confirmación positiva
  const handleConfirmUpload = async () => {
    const clientes = clientesRef.current;
    setOpenConfirm(false);
    if (clientes && clientes.length > 0) {
      setUploading(true);
      try {
        await addBulkClientes(clientes);
        setCsvData([]);
        setHeaderRowIdx(-1);
        setFileName(null);
        setRowWindow({ start: 0, end: VISIBLE_ROWS });
      } catch (error) {
        console.error('Error uploading clientes:', error);
      }
      finally {
        setUploading(false);
      }
    }
  };

  // Cancelar confirmación
  const handleCancelUpload = () => {
    setOpenConfirm(false);
  };

  const headers = headerRowIdx >= 0 && csvData[headerRowIdx] ? csvData[headerRowIdx] : [];
  const totalRows = headerRowIdx >= 0 ? csvData.length - (headerRowIdx + 1) : 0;
  const dataRows = headerRowIdx >= 0
    ? csvData.slice(headerRowIdx + 1 + rowWindow.start, headerRowIdx + 1 + rowWindow.end)
        .filter(row => !isRowEmpty(row) && !!row[0] && row[0].trim() !== '')
    : [];

  const handlePrevRows = () => {
    setRowWindow(prev => {
      const newStart = Math.max(0, prev.start - VISIBLE_ROWS);
      return { start: newStart, end: newStart + VISIBLE_ROWS };
    });
  };
  const handleNextRows = () => {
    setRowWindow(prev => {
      const newStart = Math.min(totalRows - VISIBLE_ROWS, prev.start + VISIBLE_ROWS);
      return { start: newStart, end: newStart + VISIBLE_ROWS };
    });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Subir y visualizar archivo CSV</Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ my: 2 }}
        disabled={loading || uploading}
      >
        Seleccionar archivo CSV
        <input
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {fileName && (
        <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
          Archivo: {fileName}
        </Typography>
      )}
      {loading && <LinearProgress sx={{ my: 3 }} />}

      {headers.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 700 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {headers.map((col, idx) => (
                    <TableCell key={idx}><strong>{col}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataRows.map((row, i) => (
                  <TableRow key={i + rowWindow.start}>
                    {headers.map((_, j) => (
                      <TableCell key={j}>{row[j] ?? ''}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalRows > VISIBLE_ROWS && (
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button
                variant="outlined"
                onClick={handlePrevRows}
                disabled={rowWindow.start === 0}
              >
                Anterior
              </Button>
              <Typography>
                Mostrando filas {rowWindow.start + 1}-{Math.min(rowWindow.end, totalRows)} de {totalRows}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleNextRows}
                disabled={rowWindow.end >= totalRows}
              >
                Siguiente
              </Button>
            </Box>
          )}
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkUpload}
              disabled={uploading || totalRows === 0}
              sx={{ minWidth: 180 }}
            >
              {uploading ? 'Subiendo clientes...' : 'Subir clientes'}
            </Button>
          </Box>
          {/* Diálogo de confirmación */}
          <Dialog
            open={openConfirm}
            onClose={handleCancelUpload}
          >
            <DialogTitle>Confirmar subida de clientes</DialogTitle> 
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro que deseas subir {clientesRef.current.length} clientes? Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelUpload} color="secondary" disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload} color="primary" variant="contained" disabled={uploading}>
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {headers.length === 0 && !loading && (
        <Typography variant="body2" sx={{ mt: 2, color: 'gray' }}>
          Selecciona un archivo CSV para visualizarlo en tabla. La cabecera se detecta automáticamente.
        </Typography>
      )}
    </Box>
  );
};

export default SubirCsvPage;