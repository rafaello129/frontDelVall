import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces actualizadas para incluir los pagos externos
interface ReporteRegionData {
  regionesTotales: Record<string, number>;
  totalGeneral: number;
  totalBancos: number;
  cobranzasPorFechaRegion: Array<{
    fecha: string;
    porRegion: Record<string, number>;
    total: number;
  }>;
  pagoExternosPorTipo?: Record<string, {
    total: number;
    porRegion: Record<string, number>;
  }>;
  totalFinal: number;
}

// Interfaces para los pagos externos
interface PagoExterno {
  id: number;
  fechaPago: Date;
  monto: number;
  tipoCambio: number;
  montoDolares?: number;
  tipo: string; // TipoPagoExterno
  noCliente?: number;
  nombrePagador?: string;
  sucursal?: string;
  concepto?: string;
  codigoTransferencia?: string;
  tipoMovimiento?: string;
  referenciaPago?: string;
  tipoPago: string; // TipoPago
  bancoId: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  banco?: {
    id: number;
    nombre: string;
    codigoBancario?: string;
  };
  cliente?: {
    noCliente: number;
    razonSocial: string;
    comercial: string;
  };
}

// Interfaces para estadísticas
interface EstadisticaAgrupada {
  categoria: string;
  total: number;
  cantidad: number;
  promedio: number;
  minimo?: number;
  maximo?: number;
  tendencia?: number;
  porcentaje?: number;
  comparacion?: ComparacionEstadistica;
  detallesPorPeriodo?: DetallePorPeriodo[];
}

interface ComparacionEstadistica {
  total: number;
  cantidad: number;
  promedio: number;
  diferencia: number;
  porcentaje: number;
}

interface DetallePorPeriodo {
  periodo: string;
  total: number;
  cantidad: number;
}

interface EstadisticasMetadata {
  total: number;
  cantidad: number;
  promedio: number;
  periodoActual?: { fechaDesde: Date; fechaHasta: Date };
  periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
}

// Datos adicionales para exportación
interface DatosAdicionales {
  pagosExternos?: PagoExterno[];
  estadisticasPorTipo?: EstadisticaAgrupada[];
  estadisticasMetadata?: EstadisticasMetadata;
}

// Estructura para unificar datos por fecha
interface DatosPorFecha {
  fecha: Date;
  fechaStr: string;
  total: number;
  valores: Record<string, number>;
  esFechaExclusiva?: boolean;
}

// Estilos para el Excel
const getExcelStyles = () => {
  return {
    title: {
      font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FF004D40' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2F1' } } as ExcelJS.Fill,
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    subtitle: {
      font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FF004D40' } },
      alignment: { horizontal: 'left' as const, vertical: 'middle' as const }
    },
    header: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004D40' } } as ExcelJS.Fill,
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    dateCell: {
      alignment: { horizontal: 'center' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    moneyCell: {
      alignment: { horizontal: 'right' as const },
      numFmt: '"$"#,##0.00',
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    moneyZeroCell: {
      alignment: { horizontal: 'right' as const },
      numFmt: '"$"#,##0.00',
      font: { name: 'Arial', size: 10, color: { argb: 'FF808080' } }, // Gris para ceros
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    dataCell: {
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    totalRow: {
      font: { name: 'Arial', size: 11, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEFD5' } } as ExcelJS.Fill,
      border: {
        top: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    totalAmount: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF004D40' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEFD5' } } as ExcelJS.Fill,
      alignment: { horizontal: 'right' as const },
      numFmt: '"$"#,##0.00',
      border: {
        top: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    }
  };
};

// Hook para exportación a Excel
export const useExcelExport = () => {
  // Función principal de exportación
  const exportReporteRegion = async (
    reporteRegion: ReporteRegionData,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    datosAdicionales?: DatosAdicionales
  ): Promise<void> => {
    if (!reporteRegion || !fechaDesde || !fechaHasta) {
      console.error('Datos insuficientes para exportar');
      return;
    }

    try {
      // Obtener las regiones desde los datos
      let regiones = Object.keys(reporteRegion.regionesTotales);
      
      // Asegurar que PACIFICO y NORTE estén incluidos como regiones
      if (!regiones.includes('PACIFICO')) {
        regiones.push('PACIFICO');
      }
      if (!regiones.includes('NORTE')) {
        regiones.push('NORTE');
      }
      
      const currentDate = new Date();
      const fileName = `Reporte_Cobranza_${format(currentDate, 'yyyyMMdd_HHmmss')}.xlsx`;
      
      // Crear libro de trabajo Excel
      const workbook = new ExcelJS.Workbook();
      
      // Configurar propiedades del documento
      workbook.creator = "Sistema de Cobranza";
      workbook.lastModifiedBy = "Sistema de Cobranza";
      workbook.created = currentDate;
      workbook.modified = currentDate;
      workbook.properties.date1904 = false;
      
      // Obtener estilos
      const styles = getExcelStyles();
      
      // Preparar datos de pagos externos y combinar todos los datos por fecha
      const { totalPacificoBanco, totalNorteBanco, datosPorFechaOrdenados } = 
        procesarDatosCobranza(reporteRegion, datosAdicionales?.pagosExternos || [], fechaDesde, fechaHasta, regiones);
      
      // ----- HOJA 1: COBRANZA POR SUCURSAL (Principal) -----
      createCobranzaSheet(
        workbook, 
        reporteRegion, 
        regiones, 
        fechaHasta, 
        styles,
        totalPacificoBanco,
        totalNorteBanco,
        datosPorFechaOrdenados,
        datosAdicionales
      );
      
      // La segunda hoja ha sido eliminada según lo solicitado
      
      // Guardar el archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buffer]), fileName);
      
      console.log(`Reporte exportado con éxito: ${fileName}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
      return Promise.reject(error);
    }
  };

  // Función para procesar y unificar todos los datos de cobranza
  const procesarDatosCobranza = (
    reporteRegion: ReporteRegionData,
    pagosExternos: PagoExterno[],
    fechaDesde: Date,
    fechaHasta: Date,
    regiones: string[]
  ) => {
    // Inicializar objetos para valores diarios
    const valoresDiariosPacifico: Record<string, number> = {};
    const valoresDiariosNorte: Record<string, number> = {};
    
    // Variables para los totales
    let totalPacificoBanco = 0;
    let totalNorteBanco = 0;
    
    // Mapa para almacenar todos los datos por fecha
    const datosPorFecha: Map<string, DatosPorFecha> = new Map();
    
    // 1. Procesar datos del reporte original
    reporteRegion.cobranzasPorFechaRegion.forEach(item => {
      const fecha = new Date(item.fecha);
      const fechaStr = format(fecha, 'dd/MM/yyyy');
      
      // Inicializar valores por región para esta fecha
      const valores: Record<string, number> = {};
      regiones.forEach(region => {
        valores[region] = item.porRegion[region] ? Number(item.porRegion[region]) : 0;
      });
      
      // Guardar esta fecha en el mapa
      datosPorFecha.set(fechaStr, {
        fecha,
        fechaStr,
        total: Number(item.total),
        valores,
        esFechaExclusiva: false
      });
    });
    
    // 2. Procesar pagos externos
    pagosExternos.forEach(pago => {
      const fechaPago = new Date(pago.fechaPago);
      const fechaStr = format(fechaPago, 'dd/MM/yyyy');
      
      // Solo procesar pagos en el rango de fechas
      if (fechaPago >= fechaDesde && fechaPago <= fechaHasta) {
        // Para Pacífico - Solo cobros de tipo banco
        if (pago.tipo === 'COBROS_PACIFICO_BANCO') {
          valoresDiariosPacifico[fechaStr] = (valoresDiariosPacifico[fechaStr] || 0) + pago.monto;
          totalPacificoBanco += pago.monto;
          
          // Si esta fecha ya existe en el mapa, actualizar el valor de Pacífico
          if (datosPorFecha.has(fechaStr)) {
            const datosExistentes = datosPorFecha.get(fechaStr)!;
            datosExistentes.valores['PACIFICO'] = valoresDiariosPacifico[fechaStr];
          } 
          // Si no existe, crear nueva entrada
          else {
            const valores: Record<string, number> = {};
            regiones.forEach(region => {
              valores[region] = region === 'PACIFICO' ? pago.monto : 0;
            });
            
            datosPorFecha.set(fechaStr, {
              fecha: fechaPago,
              fechaStr,
              total: pago.monto, // El total para esta fecha es solo este pago por ahora
              valores,
              esFechaExclusiva: true
            });
          }
        }
        
        // Para Norte - Solo cobros de tipo banco
        if (pago.tipo === 'COBRANZA_NORTE_BANCO') {
          valoresDiariosNorte[fechaStr] = (valoresDiariosNorte[fechaStr] || 0) + pago.monto;
          totalNorteBanco += pago.monto;
          
          // Si esta fecha ya existe en el mapa, actualizar el valor de Norte
          if (datosPorFecha.has(fechaStr)) {
            const datosExistentes = datosPorFecha.get(fechaStr)!;
            datosExistentes.valores['NORTE'] = valoresDiariosNorte[fechaStr];
            
            // Si es una fecha exclusiva (creada por Pacífico), actualizar el total
            if (datosExistentes.esFechaExclusiva) {
              datosExistentes.total += pago.monto;
            }
          } 
          // Si no existe, crear nueva entrada
          else {
            const valores: Record<string, number> = {};
            regiones.forEach(region => {
              valores[region] = region === 'NORTE' ? pago.monto : 0;
            });
            
            datosPorFecha.set(fechaStr, {
              fecha: fechaPago,
              fechaStr,
              total: pago.monto, // El total para esta fecha es solo este pago
              valores,
              esFechaExclusiva: true
            });
          }
        }
      }
    });
    
    // Convertir el mapa a un array ordenado por fecha
    const datosPorFechaOrdenados = Array.from(datosPorFecha.values())
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    
    return { 
      valoresDiariosPacifico, 
      valoresDiariosNorte,
      totalPacificoBanco,
      totalNorteBanco,
      datosPorFechaOrdenados
    };
  };

  // Función para crear la hoja principal de cobranza
  const createCobranzaSheet = (
    workbook: ExcelJS.Workbook,
    reporteRegion: ReporteRegionData,
    regiones: string[],
    fechaHasta: Date,
    styles: ReturnType<typeof getExcelStyles>,
    totalPacificoBanco: number,
    totalNorteBanco: number,
    datosPorFechaOrdenados: DatosPorFecha[],
    datosAdicionales?: DatosAdicionales
  ) => {
    const worksheet = workbook.addWorksheet('Cobranza por Sucursal', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1
      }
    });
    
    // Configurar columnas - Primera la fecha, luego el total, después todas las regiones
    const columns: Partial<ExcelJS.Column>[] = [
      { key: 'fecha', width: 12 }, // Fecha
      { key: 'total', width: 16 }  // Total
    ];
    
    // Agregar una columna para cada región
    regiones.forEach(region => {
      columns.push({ key: region, width: 15 });
    });
    
    // Aplicar configuración de columnas
    worksheet.columns = columns;
    
    // TÍTULO - "COBRANZA"
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'COBRANZA';
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    
    // FECHA DEL REPORTE
    const fechaCell = worksheet.getCell('A2');
    fechaCell.value = format(fechaHasta, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    fechaCell.font = { name: 'Arial', size: 12 };
    fechaCell.alignment = { horizontal: 'left', vertical: 'middle' };
    
    // SUBTÍTULO - "Cobranza x Sucursal MES AÑO"
    const mesAño = format(fechaHasta, "MMMM yyyy", { locale: es }).toUpperCase();
    const subtitleCell = worksheet.getCell(`C3`);
    subtitleCell.value = `Cobranza x Sucursal ${mesAño}`;
    subtitleCell.font = { name: 'Arial', size: 12, bold: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Combinar celdas para subtítulo
    const lastCol = String.fromCharCode(65 + regiones.length + 1);
    worksheet.mergeCells(`C3:${lastCol}3`);
    
    // ENCABEZADOS DE TABLA
    const headerRow = worksheet.addRow(['']);
    headerRow.getCell(1).value = 'FECHA';
    headerRow.getCell(1).style = styles.header;
    
    headerRow.getCell(2).value = 'TOTAL'; // Ahora ponemos "TOTAL" como texto en vez de dejarlo vacío
    headerRow.getCell(2).style = styles.header;
    
    // Encabezados para cada región
    regiones.forEach((region, index) => {
      headerRow.getCell(index + 3).value = region;
      headerRow.getCell(index + 3).style = styles.header;
    });
    
    headerRow.height = 20;
    
    // Variable para registrar la fila donde comienza la tabla
    const dataStartRow = worksheet.rowCount;
    
    // DATOS POR FECHA (ya ordenados cronológicamente)
    datosPorFechaOrdenados.forEach(datosFecha => {
      const row = worksheet.addRow(['']);
      
      // Fecha
      row.getCell(1).value = datosFecha.fechaStr;
      row.getCell(1).style = styles.dateCell;
      
      // Total
      row.getCell(2).value = datosFecha.total;
      row.getCell(2).style = styles.moneyCell;
      
      // Valores por región
      regiones.forEach((region, index) => {
        const valor = datosFecha.valores[region] || 0;
        
        row.getCell(index + 3).value = valor;
        
        // Aplicar estilo diferente si el valor es cero
        if (valor === 0) {
          row.getCell(index + 3).style = styles.moneyZeroCell;
        } else {
          row.getCell(index + 3).style = styles.moneyCell;
        }
      });
    });
    
    // Aplicar AutoFilter a las filas de datos
    const dataEndRow = worksheet.rowCount;
    const numColumns = regiones.length + 2; // +2 por la fecha y el total
    
    // Aplicar AutoFilter desde la fila de encabezado hasta la última fila de datos
    worksheet.autoFilter = {
      from: { row: dataStartRow, column: 1 },
      to: { row: dataEndRow, column: numColumns }
    };
    
    // FILA TOTAL BANCOS
    const totalBancosRow = worksheet.addRow(['Total Bancos']);
    totalBancosRow.getCell(1).style = styles.totalRow;
    
    // Total de bancos (segunda columna)
    totalBancosRow.getCell(2).value = Number(reporteRegion.totalBancos);
    totalBancosRow.getCell(2).style = styles.totalAmount;
    
    // Totales por región
    regiones.forEach((region, index) => {
      let valor = reporteRegion.regionesTotales[region] || 0;
      
      // Usar los totales calculados para PACIFICO y NORTE
      if (region === 'PACIFICO') {
        valor = totalPacificoBanco; 
      } else if (region === 'NORTE') {
        valor = totalNorteBanco;
      }
      
      totalBancosRow.getCell(index + 3).value = valor;
      totalBancosRow.getCell(index + 3).style = styles.totalAmount;
    });
    
    // Encontrar y agrupar pagos externos por tipo
    const tiposPagoExterno = obtenerTiposPagoExterno(datosAdicionales?.pagosExternos || []);
    
    // FILAS DE PAGOS ESPECÍFICOS - Generados dinámicamente desde los datos
    Object.entries(tiposPagoExterno).forEach(([tipo, datos]) => {
      const row = worksheet.addRow([formatTipoPagoExterno(tipo)]);
      row.getCell(1).style = styles.dataCell;
      
      // Total del tipo de pago
      row.getCell(2).value = datos.total;
      row.getCell(2).style = styles.moneyCell;
      
      // Inicializar todas las celdas con cero
      for (let i = 0; i < regiones.length; i++) {
        const regionActual = regiones[i];
        const valorRegion = datos.porRegion[regionActual] || 0;
        
        row.getCell(i + 3).value = valorRegion;
        
        if (valorRegion === 0) {
          row.getCell(i + 3).style = styles.moneyZeroCell;
        } else {
          row.getCell(i + 3).style = styles.moneyCell;
        }
      }
    });
    
    // FILA DE TOTAL COBRANZA
    const totalFinal = reporteRegion.totalFinal;
    const totalFinalRow = worksheet.addRow(['Total Cobranza']);
    totalFinalRow.getCell(1).style = {
      ...styles.totalRow,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } } as ExcelJS.Fill,
    };
    
    totalFinalRow.getCell(2).value = totalFinal;
    totalFinalRow.getCell(2).style = {
      ...styles.totalAmount,
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } } as ExcelJS.Fill,
    };
    
    // Calcular totales por región incluyendo pagos externos
    regiones.forEach((region, index) => {
      let totalRegion = reporteRegion.regionesTotales[region] || 0;
      
      // Añadir totales de pagos externos para cada región
      Object.values(tiposPagoExterno).forEach(datos => {
        totalRegion += datos.porRegion[region] || 0;
      });
      
      totalFinalRow.getCell(index + 3).value = totalRegion;
      totalFinalRow.getCell(index + 3).style = {
        ...styles.totalAmount,
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } } as ExcelJS.Fill,
      };
    });
    
    // Configurar vista congelada para una mejor navegación
    worksheet.views = [
      { state: 'frozen', xSplit: 1, ySplit: 4, activeCell: 'B5' }
    ];
  };

  // Función para agrupar pagos externos por tipo
  const obtenerTiposPagoExterno = (pagosExternos: PagoExterno[]) => {
    const tiposPago: Record<string, {
      total: number;
      porRegion: Record<string, number>;
    }> = {};
    
    pagosExternos.forEach(pago => {
      // Inicializar el tipo si no existe
      if (!tiposPago[pago.tipo]) {
        tiposPago[pago.tipo] = {
          total: 0,
          porRegion: {}
        };
      }
      
      // Sumar al total del tipo
      tiposPago[pago.tipo].total += pago.monto;
      
      // Sumar a la región correspondiente según el tipo
      let region = pago.sucursal || '';
      
      // Asignar la región correcta según el tipo de pago
      switch(pago.tipo) {
        case 'COBROS_EFECTIVO_RIVIERA':
          if (pago.sucursal === 'QUINTANA_ROO') {
            region = 'QUINTANA ROO';
          } else if (pago.sucursal === 'YUCATAN') {
            region = 'YUCATAN';
          }
          break;
        case 'COBROS_PACIFICO_BANCO':
        case 'COBROS_PACIFICO_EFECTIVO':
          region = 'PACIFICO';
          break;
        case 'COBRANZA_NORTE_BANCO':
          region = 'NORTE';
          break;
        case 'CUENTA_NASSIM':
          // Distribuir entre QUINTANA ROO (70%) y YUCATAN (30%)
          if (!tiposPago[pago.tipo].porRegion['QUINTANA ROO']) {
            tiposPago[pago.tipo].porRegion['QUINTANA ROO'] = 0;
          }
          if (!tiposPago[pago.tipo].porRegion['YUCATAN']) {
            tiposPago[pago.tipo].porRegion['YUCATAN'] = 0;
          }
          tiposPago[pago.tipo].porRegion['QUINTANA ROO'] += pago.monto * 0.7;
          tiposPago[pago.tipo].porRegion['YUCATAN'] += pago.monto * 0.3;
          return; // Salimos para evitar la asignación genérica de abajo
        default:
          // Si no es un tipo especial, usar la sucursal como región
          region = pago.sucursal?.replace('_', ' ') || '';
      }
      
      // Acumular en la región correspondiente
      if (region) {
        if (!tiposPago[pago.tipo].porRegion[region]) {
          tiposPago[pago.tipo].porRegion[region] = 0;
        }
        tiposPago[pago.tipo].porRegion[region] += pago.monto;
      }
    });
    
    return tiposPago;
  };

  // Función auxiliar para formatear tipos de pago externo
  const formatTipoPagoExterno = (tipo: string): string => {
    if (!tipo) return 'Desconocido';
    
    // Convertir COBROS_EFECTIVO_RIVIERA a "Cobros Efectivo Riviera"
    return tipo
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return {
    exportReporteRegion
  };
};