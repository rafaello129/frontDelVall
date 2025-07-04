import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types for the reporte region
interface ReporteRegionData {
    regionesTotales: Record<string, number>;
    totalGeneral: number;
    totalBancos: number; // Añadido para el error de totalBancos
    cobranzasPorFechaRegion: Array<{
      fecha: string;
      porRegion: Record<string, number>;
      total: number;
    }>;
    // Nuevos campos para pagos externos
    pagoExternosPorTipo?: Record<string, {
      total: number;
      porRegion: Record<string, number>;
    }>;
    totalFinal: number; // Añadido para el total final
  }

// Excel styling definitions
const getExcelStyles = () => {
  return {
    title: {
      font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FF303F9F' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } } as ExcelJS.Fill,
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    subtitle: {
      font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FF303F9F' } },
      alignment: { horizontal: 'left' as const, vertical: 'middle' as const }
    },
    header: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF303F9F' } } as ExcelJS.Fill,
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    totalRow: {
      font: { name: 'Arial', size: 11, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } } as ExcelJS.Fill,
      border: {
        top: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    },
    totalAmount: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF303F9F' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } } as ExcelJS.Fill,
      alignment: { horizontal: 'right' as const },
      numFmt: '"$"#,##0.00',
      border: {
        top: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'medium' as const, color: { argb: 'FFB0BEC5' } },
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
    moneyCell: {
      alignment: { horizontal: 'right' as const },
      numFmt: '"$"#,##0.00',
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        left: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } },
        right: { style: 'thin' as const, color: { argb: 'FFB0BEC5' } }
      }
    }
  };
};

// Hook for Excel export functionality
export const useExcelExport = () => {
  // Function to export region report to Excel
  const exportReporteRegion = async (
    reporteRegion: ReporteRegionData,
    fechaDesde: Date | null,
    fechaHasta: Date | null
  ): Promise<void> => {
    if (!reporteRegion || !fechaDesde || !fechaHasta) {
      console.error('Datos insuficientes para exportar');
      return;
    }

    try {
      const regiones = Object.keys(reporteRegion.regionesTotales);
      const currentDate = new Date();
      const fileName = `Reporte_Cobranza_Region_${format(currentDate, 'yyyyMMdd_HHmmss')}.xlsx`;
      
      // Crear libro de trabajo con ExcelJS
      const workbook = new ExcelJS.Workbook();
      
      // Establecer propiedades del documento
      workbook.creator = "Sistema de Cobranza Del Valle";
      workbook.lastModifiedBy = "Sistema de Cobranza";
      workbook.created = currentDate;
      workbook.modified = currentDate;
      workbook.properties.date1904 = false;
      
      // Establecer propiedades adicionales usando casting seguro
      const docProps = workbook.properties as any;
      docProps.title = "Reporte de Cobranza por Región";
      docProps.subject = `Período ${format(fechaDesde, 'dd/MM/yyyy')} - ${format(fechaHasta, 'dd/MM/yyyy')}`;
      docProps.keywords = "cobranza, región, finanzas, reporte";
      docProps.category = "Reportes Financieros";
      docProps.company = "Del Valle";
      
      // Get styles
      const styles = getExcelStyles();
      
      // ----- HOJA 1: RESUMEN EJECUTIVO -----
      createResumenSheet(workbook, reporteRegion, regiones, fechaDesde, fechaHasta, currentDate, styles);
      
      // ----- HOJA 2: DETALLE DEL REPORTE -----
      createDetalleSheet(workbook, reporteRegion, regiones, fechaDesde, fechaHasta, styles);
      
      // ----- HOJA 3: ESTADÍSTICAS -----
      createStatsSheet(workbook, reporteRegion, fechaDesde, fechaHasta, styles);
      
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

  // Function to create summary sheet
  const createResumenSheet = (
    workbook: ExcelJS.Workbook,
    reporteRegion: ReporteRegionData,
    regiones: string[],
    fechaDesde: Date,
    fechaHasta: Date,
    currentDate: Date,
    styles: ReturnType<typeof getExcelStyles>
  ) => {
    const worksheetResumen = workbook.addWorksheet('Resumen', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });
    
    // Configurar columnas para la hoja Resumen
    worksheetResumen.columns = [
      { header: '', width: 25 },
      { header: '', width: 18 },
      { header: '', width: 12 }
    ];
    
    // Añadir datos del resumen
    worksheetResumen.addRow(['', '', '']);  // Espacio para logo
    const titleRow = worksheetResumen.addRow(['REPORTE DE COBRANZA POR REGIÓN', '', '']);
    worksheetResumen.addRow(['', '', '']);  // Espacio
    const periodoRow = worksheetResumen.addRow([
      `Período: ${format(fechaDesde, 'dd/MM/yyyy')} - ${format(fechaHasta, 'dd/MM/yyyy')}`,
      '', ''
    ]);
    worksheetResumen.addRow(['Fecha de generación:', format(currentDate, 'dd/MM/yyyy HH:mm:ss'), '']);
    worksheetResumen.addRow(['', '', '']);  // Espacio
    worksheetResumen.addRow(['RESUMEN POR REGIÓN', '', '']);
    
    // Encabezados de tabla
    const headerRow = worksheetResumen.addRow(['Región', 'Monto Total', 'Porcentaje']);
    
    // Datos de regiones
    regiones.forEach(region => {
      const montoNumerico: number = Number(reporteRegion.regionesTotales[region]) || 0;
      const porcentaje: number = reporteRegion.totalGeneral 
        ? (montoNumerico / reporteRegion.totalGeneral) * 100 
        : 0;
      const row = worksheetResumen.addRow([
        region.replace('_', ' '),
        montoNumerico,
        porcentaje.toFixed(2) + '%'
      ]);
      row.getCell(1).style = styles.dataCell;
      row.getCell(2).style = styles.moneyCell;
      row.getCell(3).style = styles.dataCell;
    });
    
    // Espacio y fila de totales
    worksheetResumen.addRow(['', '', '']);
    const totalRow = worksheetResumen.addRow([
      'TOTAL GENERAL', 
      Number(reporteRegion.totalGeneral),
      '100%'
    ]);
    
    // Aplicar estilos
    titleRow.getCell(1).style = styles.title;
    titleRow.height = 30;
    periodoRow.getCell(1).style = styles.subtitle;
    
    headerRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    headerRow.height = 20;
    
    totalRow.getCell(1).style = styles.totalRow;
    totalRow.getCell(2).style = styles.totalAmount;
    totalRow.getCell(3).style = styles.totalRow;
    
    // Combinar celdas para títulos
    worksheetResumen.mergeCells('A2:C2');  // Título
    worksheetResumen.mergeCells('A4:C4');  // Período
  };

  // Function to create details sheet
  const createDetalleSheet = (
    workbook: ExcelJS.Workbook,
    reporteRegion: ReporteRegionData,
    regiones: string[],
    fechaDesde: Date,
    fechaHasta: Date,
    styles: ReturnType<typeof getExcelStyles>
  ) => {
    const worksheetDetalle = workbook.addWorksheet('Detalle por Fecha', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });
    
    // Definir columnas para la hoja de detalle
    const detalleColumns = [
      { header: 'FECHA', width: 20 },
      { header: '', width: 2 }
    ];
    
    regiones.forEach(region => {
      detalleColumns.push({ header: region.replace('_', ' '), width: 18 });
    });
    
    detalleColumns.push({ header: 'TOTAL', width: 20 });
    worksheetDetalle.columns = detalleColumns;
    
    // Añadir título y período
    const detalleTitleRow = worksheetDetalle.addRow(['COBRANZA POR REGIÓN']);
    const detallePeriodoRow = worksheetDetalle.addRow([
      `Del ${format(fechaDesde, 'dd/MM/yyyy')} al ${format(fechaHasta, 'dd/MM/yyyy')}`
    ]);
    worksheetDetalle.addRow([]);  // Espacio
    
    // Obtener la fila de encabezados que ya se estableció con las columnas
    const detalleHeaderRow = worksheetDetalle.addRow(detalleColumns.map(col => col.header));
    
    // Datos por fecha
    reporteRegion.cobranzasPorFechaRegion.forEach(item => {
      const rowData: any[] = [
        format(new Date(item.fecha), 'dd/MM/yyyy'),
        ''
      ];
      
      regiones.forEach(region => {
        const valorNumerico: number = item.porRegion[region] ? Number(item.porRegion[region]) : 0;
        rowData.push(valorNumerico);
      });
      
      rowData.push(Number(item.total));
      const dataRow = worksheetDetalle.addRow(rowData);
      
      // Aplicar estilos a las celdas
      dataRow.getCell(1).style = styles.dataCell;
      dataRow.getCell(2).style = styles.dataCell;
      
      for (let i = 0; i < regiones.length; i++) {
        dataRow.getCell(i + 3).style = styles.moneyCell;
      }
      
      dataRow.getCell(regiones.length + 3).style = styles.moneyCell;
    });
    
    // Espacio y fila de totales bancos
    worksheetDetalle.addRow([]);
    
    const detalleTotalBancosRow: any[] = ['TOTAL BANCOS', ''];
    regiones.forEach(region => {
      const valorTotal: number = reporteRegion.regionesTotales[region] ? 
        Number(reporteRegion.regionesTotales[region]) : 0;
      detalleTotalBancosRow.push(valorTotal);
    });
    detalleTotalBancosRow.push(Number(reporteRegion.totalBancos));
    
    const rowTotalesBancos = worksheetDetalle.addRow(detalleTotalBancosRow);
    
    // Aplicar estilos al total de bancos
    rowTotalesBancos.getCell(1).style = styles.totalRow;
    rowTotalesBancos.getCell(2).style = styles.totalRow;
    
    for (let i = 0; i < regiones.length; i++) {
      rowTotalesBancos.getCell(i + 3).style = styles.totalAmount;
    }
    rowTotalesBancos.getCell(regiones.length + 3).style = styles.totalAmount;
    
    // Añadir filas de pagos externos por tipo
    if (reporteRegion.pagoExternosPorTipo) {
      Object.entries(reporteRegion.pagoExternosPorTipo).forEach(([tipo, data]) => {
        const rowPagoExterno: any[] = [
          tipo.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
          ''
        ];
        
        regiones.forEach(region => {
          const valorRegion = data.porRegion[region] ? Number(data.porRegion[region]) : 0;
          rowPagoExterno.push(valorRegion);
        });
        
        rowPagoExterno.push(Number(data.total));
        const externalRow = worksheetDetalle.addRow(rowPagoExterno);
        
        // Estilos para filas de pagos externos
        externalRow.getCell(1).style = {
          ...styles.dataCell,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as ExcelJS.Fill
        };
        externalRow.getCell(2).style = {
          ...styles.dataCell,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as ExcelJS.Fill
        };
        
        for (let i = 0; i < regiones.length; i++) {
          externalRow.getCell(i + 3).style = {
            ...styles.moneyCell,
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as ExcelJS.Fill
          };
        }
        
        externalRow.getCell(regiones.length + 3).style = {
          ...styles.moneyCell,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as ExcelJS.Fill
        };
      });
    }
    
    // Total final
    const totalFinalRow: any[] = ['TOTAL COBRANZA', ''];
    
    // Calcular totales por región incluyendo pagos externos
    regiones.forEach(region => {
      let totalRegion = reporteRegion.regionesTotales[region] || 0;
      
      if (reporteRegion.pagoExternosPorTipo) {
        Object.values(reporteRegion.pagoExternosPorTipo).forEach(tipo => {
          totalRegion += tipo.porRegion[region] || 0;
        });
      }
      
      totalFinalRow.push(totalRegion);
    });
    
    totalFinalRow.push(Number(reporteRegion.totalFinal));
    const rowTotalFinal = worksheetDetalle.addRow(totalFinalRow);
    
    // Aplicar estilos al total final
    rowTotalFinal.eachCell((cell, colNumber) => {
      cell.style = {
        ...styles.totalAmount,
        font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF006100' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } } as ExcelJS.Fill,
        border: {
          top: { style: 'medium' as const, color: { argb: 'FF006100' } },
          left: { style: 'thin' as const, color: { argb: 'FF006100' } },
          bottom: { style: 'medium' as const, color: { argb: 'FF006100' } },
          right: { style: 'thin' as const, color: { argb: 'FF006100' } }
        }
      };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'left' as const };
      }
    });
    
    // Aplicar estilo al título de la hoja de detalle
    detalleTitleRow.getCell(1).style = styles.title;
    detalleTitleRow.height = 30;
    detallePeriodoRow.getCell(1).style = styles.subtitle;
    
    detalleHeaderRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    detalleHeaderRow.height = 20;
    
    // Combinar celdas para títulos en la hoja de detalle
    const lastCol = String.fromCharCode(65 + regiones.length + 2);
    worksheetDetalle.mergeCells(`A1:${lastCol}1`); // Título
    worksheetDetalle.mergeCells(`A2:${lastCol}2`); // Período
    
    // Establecer autofilter para facilitar la navegación
    worksheetDetalle.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: regiones.length + 3 }
    };
    
    // Congelar la primera fila y columna
    worksheetDetalle.views = [
      { state: 'frozen', xSplit: 1, ySplit: 4, activeCell: 'B5' }
    ];
    
    // Configurar encabezados y pies de página
    worksheetDetalle.headerFooter = {
      oddHeader: '&L&B&20Detalle de Cobranza por Región&C&D&R&F',
      oddFooter: '&L&BPágina &P de &N&C&B' +
        format(new Date(), 'dd/MM/yyyy HH:mm') +
        '&R&BGenerado por: Sistema Del Valle'
    };
  };

  // Function to create stats sheet
  const createStatsSheet = (
    workbook: ExcelJS.Workbook,
    reporteRegion: ReporteRegionData,
    fechaDesde: Date,
    fechaHasta: Date,
    styles: ReturnType<typeof getExcelStyles>
  ) => {
    const regiones = Object.keys(reporteRegion.regionesTotales);
    const worksheetStats = workbook.addWorksheet('Estadísticas', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });
    
    // Configurar columnas para estadísticas
    worksheetStats.columns = [
      { header: '', width: 25 },
      { header: '', width: 15 }
    ];
    
    // Añadir datos de estadísticas
    worksheetStats.addRow(['ESTADÍSTICAS DE COBRANZA', '']);
    worksheetStats.addRow(['', '']);
    worksheetStats.addRow(['Período analizado:', `${format(fechaDesde, 'dd/MM/yyyy')} - ${format(fechaHasta, 'dd/MM/yyyy')}`]);
    worksheetStats.addRow(['Total de registros:', reporteRegion.cobranzasPorFechaRegion.length.toString()]);
    
    const montoTotalRow = worksheetStats.addRow(['Monto total cobrado:', Number(reporteRegion.totalGeneral)]);
    montoTotalRow.getCell(2).numFmt = '"$"#,##0.00';
    
    const promedioDiario = reporteRegion.cobranzasPorFechaRegion.length > 0 
      ? Number(reporteRegion.totalGeneral) / reporteRegion.cobranzasPorFechaRegion.length
      : 0;
    const promedioDiarioRow = worksheetStats.addRow(['Promedio diario:', promedioDiario]);
    promedioDiarioRow.getCell(2).numFmt = '"$"#,##0.00';
    
    worksheetStats.addRow(['', '']);
    worksheetStats.addRow(['DISTRIBUCIÓN POR REGIÓN', '']);
    
    const distribucionHeaderRow = worksheetStats.addRow(['Región', 'Porcentaje']);
    distribucionHeaderRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    
    // Datos de distribución por región
    regiones.forEach(region => {
      const montoRegion: number = Number(reporteRegion.regionesTotales[region]) || 0;
      const porcentajeRegion: number = reporteRegion.totalGeneral 
        ? (montoRegion / reporteRegion.totalGeneral) * 100 
        : 0;
      worksheetStats.addRow([
        region.replace('_', ' '),
        porcentajeRegion.toFixed(2) + '%'
      ]);
    });
    
    // Aplicar estilo al título de estadísticas
    worksheetStats.getRow(1).getCell(1).style = styles.title;
    worksheetStats.mergeCells('A1:B1');
    
    worksheetStats.getRow(8).getCell(1).style = styles.subtitle;
    worksheetStats.mergeCells('A8:B8');
  };

  return {
    exportReporteRegion
  };
};