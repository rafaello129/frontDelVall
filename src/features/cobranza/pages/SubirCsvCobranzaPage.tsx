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
import type { CreateCobranzaDto } from '../types';
import { TipoPago } from '../../shared/enums';
import { format } from 'date-fns';
import { getTipoCambioDOF } from '../../../services/dofService';
import { useCobranzas } from '../hooks/useCobranzas';

const VISIBLE_ROWS = 50;

const SubirCsvCobranzaPage: React.FC = () => {
  const {addBulkCobranzas} = useCobranzas();
  const { readString } = usePapaParse();
  const [cobranzas, setCobranzas] = useState<CreateCobranzaDto[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headerRowIdx, setHeaderRowIdx] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowWindow, setRowWindow] = useState({ start: 0, end: VISIBLE_ROWS });
  const [openConfirm, setOpenConfirm] = useState(false);

  // Handler for file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    setRowWindow({ start: 0, end: VISIBLE_ROWS }); // reset window
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvString = event.target?.result as string;
      await parseCsv(csvString);
    };
    reader.readAsText(file);
  };

  // Find first row where col 0 has some info (not empty, not just spaces)
  const findHeaderRowIdx = (data: string[][]) => {
    return data.findIndex(row => !!row[1] && row[1].trim() !== '');
  };

  // Determines if a row is completely empty (all columns are empty or whitespace)
  const isRowEmpty = (row: string[]) =>
    row.every(cell => (cell === undefined || cell === null || String(cell).trim() === ''));

  // Parse CSV, set data and header row index
  const parseCsv = async (csvString: string) => {
    readString(csvString, {
      worker: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      fastMode: true,
      complete: async (results) => {
        let rawData = results.data as string[][];
        // Filter out completely empty rows and rows with no data in the first position
        rawData = rawData.filter(row => !isRowEmpty(row) && !!row[1] && row[1].trim() !== '');
        rawData = rawData.filter(row => row[0] == "FECHA" ||(parseDDMMYYYYtoLocalDate(row[0]) instanceof Date && !isNaN(parseDDMMYYYYtoLocalDate(row[0]).getTime())) );

        const headerIdx = findHeaderRowIdx(rawData);
        setHeaderRowIdx(headerIdx);

        // Mapeo con hook asíncrono
        const mappedCobranzas: CreateCobranzaDto[] = [];
        let mapadeCambiosFecha = new Map<string, number>();
        for (const row of rawData.slice(headerIdx + 1)) {
          const fechaPago = parseDDMMYYYYtoLocalDate(row[0]);
    
          const fechaStr = format(fechaPago, 'dd/MM/yyyy');
          let tipoCambio = parseFloat(row[6]);
          let montoDolares = parseSaldo(row[7]);
          const total = parseSaldo(row[5]);

          // Si tipoCambio está vacío o es 0, obtén por API (hook) según fechaPago
          if (!tipoCambio || tipoCambio === 0) {
            try {
              // Verifica si ya tenemos el tipo de cambio para esta fecha
              if (mapadeCambiosFecha.has(fechaStr)) {
                tipoCambio = mapadeCambiosFecha.get(fechaStr)!;
              } else {
                // Si no, llama al servicio para obtenerlo
                const tcResp = await getTipoCambioDOF(fechaStr);
                tipoCambio = tcResp?.valor ? parseFloat(tcResp.valor) : 1;
                mapadeCambiosFecha.set(fechaStr, tipoCambio);
              }
            } catch (err) {
              tipoCambio = 1; // fallback
            }
          }
          // Si montoDolares está vacío o es 0, cálculalo según tipoCambio y total
          if (!montoDolares || montoDolares === 0) {
            montoDolares = tipoCambio ? (total / tipoCambio) : 0;
          }
          const facturasRaw = row[1] || '';
          let facturas: string[] = [];
          
          if (facturasRaw.includes(',')) {
            // Extraer el prefijo (por ejemplo, "CANQ-")
            const prefixMatch = facturasRaw.match(/^([A-Z]+-)/);
            const prefix = prefixMatch ? prefixMatch[1] : '';
            // Eliminar el prefijo del string para solo dejar los números
            const numbersPart = facturasRaw.replace(prefix, '');
            // Separar por comas y limpiar espacios
            const numbers = numbersPart.split(',').map(n => n.trim());
            // Reconstruir los números con el prefijo
            facturas = numbers.map(n => prefix + n);
          } else if (facturasRaw) {
            facturas = [facturasRaw];
          }
          
          // Ahora, hacer el push por cada factura:
          facturas.forEach(noFactura => {
            mappedCobranzas.push({
              fechaPago,
              noFactura,
              noCliente: parseInt(row[2], 10) || 0,
              total,
              tipoCambio,
              montoDolares,
              // eliminar los ceros del inicio del bancoId
              bancoId: parseBancoId(row[8]),
              tipoPago: TipoPago.TRANSFERENCIA
            });
          });
        }

        //eliminar filas con noFactura repetido
        // Si quieres filtrar duplicados, descomenta la siguiente línea:
        // mappedCobranzas = mappedCobranzas.filter((cb, idx, arr) => arr.findIndex(c => c.noFactura === cb.noFactura) === idx);
        console.log('Cobranzas mapeadas:', mappedCobranzas);
        setCobranzas(mappedCobranzas);
        setCsvData(rawData);
        setLoading(false);
      }
    });
  };
   function parseBancoId(input: string): number {
    if (!input) return 0;
    // Elimina todos los caracteres no números
    const digits = input.replace(/\D/g, '');
    // Elimina ceros a la izquierda
    const normalized = digits.replace(/^0+/, '');
    // Si quedó vacío, es 0
    if (!normalized) return 0;
    const num = Number(normalized);
    return Number.isNaN(num) ? 0 : num;
  }
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
    console.log(cobranzas);
    
    addBulkCobranzas(cobranzas);
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
              disabled={cobranzas.length === 0}
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
                ¿Estás seguro que deseas subir {cobranzas.length} registros? Esta acción solo hará un console.log por ahora.
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

export default SubirCsvCobranzaPage;