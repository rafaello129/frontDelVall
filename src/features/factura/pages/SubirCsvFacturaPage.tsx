import React, { useState } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { usePapaParse } from 'react-papaparse';
import type { CreateFacturaDto } from '../types';
import { useFacturas } from '../hooks/useFacturas';

// Renders only a window of rows for large CSVs
const VISIBLE_ROWS = 50;

const SubirCsvFacturaPage: React.FC = () => {
  const { readString } = usePapaParse();
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headerRowIdx, setHeaderRowIdx] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowWindow, setRowWindow] = useState({ start: 0, end: VISIBLE_ROWS });
  const [facturas, setFacturas] = useState<CreateFacturaDto[]>([]);
  const [openConfirm, setOpenConfirm] = useState(false);
    const {addBulkFacturas} = useFacturas();
  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    setRowWindow({ start: 0, end: VISIBLE_ROWS }); // reset window
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvString = event.target?.result as string;
      parseCsv(csvString);
    };
    reader.readAsText(file);
  };

  // Find first row where col 0 has some info (not empty, not just spaces)
  const findHeaderRowIdx = (data: string[][]) => {
    return data.findIndex(row => !!row[0] && row[0].trim() !== '');
  };

  // Determines if a row is completely empty (all columns are empty or whitespace)
  const isRowEmpty = (row: string[]) =>
    row.every(cell => (cell === undefined || cell === null || String(cell).trim() === ''));

  // Parse CSV, set data and header row index
  const parseCsv = (csvString: string) => {
    readString(csvString, {
      worker: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      fastMode: true,
      complete: (results) => {
        let rawData = results.data as string[][];
        // Filter out completely empty rows and rows with no data in the first position
        rawData = rawData.filter(row => !isRowEmpty(row) && !!row[0] && row[0].trim() !== '');
        const headerIdx = findHeaderRowIdx(rawData);
        setHeaderRowIdx(headerIdx);
        // Map to CreateFacturaDto if needed
        let mappedFacturas = rawData.slice(headerIdx + 1).map(row => ({
          noCliente: parseInt(row[0], 10),
          // comprobar que noFactura exista
          noFactura: row[4].trim()?  row[4] : ('Sin número de factura ' + new Date().toISOString()),
          emision: parseDDMMYYYYtoLocalDate(row[5]),
          fechaVencimiento: parseDDMMYYYYtoLocalDate(row[7]),
          //comprobar que el monto sea un número válido tomando en cuenta que los decimales son con comas y los enteros con puntos
          saldo: Math.max(parseSaldo(row[9]), parseSaldo(row[10])+ parseSaldo(row[11])),    
          concepto: row[17].trim() ? row[17] : 'Sin concepto',
          estado: (parseInt(row[8]) > 0) ? 'Pendiente' : 'Vencida',
        }));
        //eliminar filas con noFactura repetido
        const uniqueFacturasMap = new Map<string, CreateFacturaDto>();
        mappedFacturas.forEach(factura => {
          if (!uniqueFacturasMap.has(factura.noFactura)) {
            uniqueFacturasMap.set(factura.noFactura, factura);
          }
        });
        mappedFacturas = Array.from(uniqueFacturasMap.values());
        setFacturas(mappedFacturas);
        setCsvData(rawData);
        setLoading(false);
      }
    });
  };
  function parseSaldo(s: string): number {
    // Elimina espacios, quita puntos de miles, cambia la coma decimal por punto
    if (!s) return 0;
    const normalized = s.replace(/\./g, '').replace(',', '.').replace('$','').trim();
    const num = parseFloat(normalized);
    return !isNaN(num) ? num : 0;
  }
  function parseDDMMYYYYtoLocalDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    // Mes en Date es 0-indexado
    return new Date(year, month - 1, day);
  }

  // Get headers and data rows according to headerRowIdx
  const headers = headerRowIdx >= 0 && csvData[headerRowIdx] ? csvData[headerRowIdx] : [];
  const totalRows = headerRowIdx >= 0 ? csvData.length - (headerRowIdx + 1) : 0;
  const dataRows = headerRowIdx >= 0
    ? csvData.slice(headerRowIdx + 1 + rowWindow.start, headerRowIdx + 1 + rowWindow.end)
      .filter(row => !isRowEmpty(row) && !!row[0] && row[0].trim() !== '')
    : [];

  // Navigation for windowed rendering
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

  // Confirm dialog handlers
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };
  const handleCloseConfirm = () => {

    setOpenConfirm(false);
  };
  const handleConfirmUpload = () => {
    // Por ahora solo loguea los datos en facturas
  
    addBulkFacturas(facturas);
    setOpenConfirm(false);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Subir y visualizar archivo CSV</Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ my: 2 }}
        disabled={loading}
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
          {/* Botón de subir datos */}
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenConfirm}
              disabled={facturas.length === 0}
              sx={{ minWidth: 180 }}
            >
              Subir datos
            </Button>
          </Box>
          {/* Diálogo de confirmación */}
          <Dialog open={openConfirm} onClose={handleCloseConfirm}>
            <DialogTitle>Confirmar subida de datos</DialogTitle>
            <DialogContent>
              <DialogContentText>
                ¿Estás seguro que deseas subir {facturas.length} registros?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirm} color="secondary">
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload} color="primary" variant="contained">
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

export default SubirCsvFacturaPage;