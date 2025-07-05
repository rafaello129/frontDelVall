import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import type { EstadisticaAgrupada, EstadisticasOptions } from '../features/pagoExterno/types';

// Enhanced Excel styling definitions with professional look
const getExcelStyles = () => {
  return {
    // Title style with gradient fill
    title: {
      font: { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0B3861' } },
      fill: { 
        type: 'gradient' as const, 
        gradient: 'angle' as const,
        degree: 90,
        stops: [
          {position: 0, color: {argb: 'FFE6EEF9'}},
          {position: 1, color: {argb: 'FFC7D9F1'}}
        ]
      },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        left: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        bottom: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        right: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } }
      }
    },
    subtitle: {
      font: { name: 'Arial', size: 12, bold: true, color: { argb: 'FF0B3861' } },
      alignment: { horizontal: 'left' as const, vertical: 'middle' as const }
    },
    header: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { 
        type: 'gradient' as const, 
        gradient: 'angle' as const,
        degree: 90,
        stops: [
          {position: 0, color: {argb: 'FF305496'}},
          {position: 1, color: {argb: 'FF0070C0'}}
        ]
      },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      border: {
        top: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        left: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        bottom: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        right: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } }
      }
    },
    subheader: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF305496' } },
      fill: { 
        type: 'pattern' as const, 
        pattern: 'solid' as const, 
        fgColor: { argb: 'FFD3DFEE' } 
      },
      alignment: { horizontal: 'left' as const, vertical: 'middle' as const },
      border: {
        bottom: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } }
      }
    },
    totalRow: {
      font: { name: 'Arial', size: 11, bold: true },
      fill: { 
        type: 'pattern' as const, 
        pattern: 'solid' as const, 
        fgColor: { argb: 'FFD3DFEE' } 
      },
      border: {
        top: { style: 'medium' as const, color: { argb: 'FF8EB4E3' } },
        left: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        bottom: { style: 'medium' as const, color: { argb: 'FF8EB4E3' } },
        right: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } }
      }
    },
    totalAmount: {
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF305496' } },
      fill: { 
        type: 'pattern' as const, 
        pattern: 'solid' as const, 
        fgColor: { argb: 'FFD3DFEE' } 
      },
      alignment: { horizontal: 'right' as const },
      numFmt: '[$$-es-MX]#,##0.00',
      border: {
        top: { style: 'medium' as const, color: { argb: 'FF8EB4E3' } },
        left: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } },
        bottom: { style: 'medium' as const, color: { argb: 'FF8EB4E3' } },
        right: { style: 'thin' as const, color: { argb: 'FF8EB4E3' } }
      }
    },
    dataCell: {
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        left: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        right: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } }
      }
    },
    moneyCell: {
      alignment: { horizontal: 'right' as const },
      numFmt: '[$$-es-MX]#,##0.00',
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        left: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        right: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } }
      }
    },
    percentCell: {
      alignment: { horizontal: 'right' as const },
      numFmt: '0.00%',
      border: {
        top: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        left: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        bottom: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } },
        right: { style: 'thin' as const, color: { argb: 'FFD4D4D4' } }
      }
    },
    comparePositive: {
      font: { color: { argb: 'FF007E33' } },
      numFmt: '+0.00%;-0.00%;0.00%',
      alignment: { horizontal: 'right' as const }
    },
    compareNegative: {
      font: { color: { argb: 'FFCC0000' } },
      numFmt: '+0.00%;-0.00%;0.00%',
      alignment: { horizontal: 'right' as const }
    },
    // Alternating row styles for better readability
    alternateRow: {
      fill: { 
        type: 'pattern' as const, 
        pattern: 'solid' as const, 
        fgColor: { argb: 'FFF8F8F8' } 
      }
    },
    // Info cell
    infoCell: {
      font: { name: 'Arial', size: 10, color: { argb: 'FF333333' } }
    },
    infoLabel: {
      font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF305496' } }
    }
  };
};

// Hook for Excel export functionality
export const useExcelExportPagosExternos = () => {
  // Function to export pagos externos statistics to Excel
  const exportEstadisticas = async (
    estadisticasPorTipo: EstadisticaAgrupada[],
    estadisticasPorSucursal: EstadisticaAgrupada[],
    estadisticasMetadata: {
      total: number;
      cantidad: number;
      promedio: number;
      periodoActual?: { fechaDesde: Date; fechaHasta: Date };
      periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
    },
    options: EstadisticasOptions
  ): Promise<void> => {
    if (estadisticasPorTipo.length === 0 || estadisticasPorSucursal.length === 0) {
      console.error('No hay datos para exportar');
      return;
    }

    try {
      const currentDate = new Date();
      const fileName = `Estadisticas_Pagos_Externos_${format(currentDate, 'yyyyMMdd_HHmmss')}.xlsx`;
      
      // Create workbook
      const workbook = new ExcelJS.Workbook();
      
      // Set document properties
      workbook.creator = "Sistema de Pagos Externos Del Valle";
      workbook.lastModifiedBy = "Usuario";
      workbook.created = currentDate;
      workbook.modified = currentDate;
      
      // Set additional properties
      const docProps = workbook.properties as any;
      docProps.title = "Estadísticas de Pagos Externos";
      
      const periodoDesde = options.fechaDesde ? format(new Date(options.fechaDesde), 'dd/MM/yyyy') : 'No especificado';
      const periodoHasta = options.fechaHasta ? format(new Date(options.fechaHasta), 'dd/MM/yyyy') : 'No especificado';
      docProps.subject = `Período ${periodoDesde} - ${periodoHasta}`;
      
      docProps.keywords = "pagos externos, estadísticas, finanzas, reporte";
      docProps.category = "Reportes Financieros";
      docProps.company = "Del Valle";
      
      // Get styles
      const styles = getExcelStyles();
      
      // Create only the three main sheets
      createResumenSheet(workbook, estadisticasMetadata, options, styles, estadisticasPorTipo, estadisticasPorSucursal);
      createTiposSheet(workbook, estadisticasPorTipo, estadisticasMetadata, options, styles);
      createSucursalesSheet(workbook, estadisticasPorSucursal, estadisticasMetadata, styles);
      
      // Save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buffer]), fileName);
      
      console.log(`Estadísticas exportadas con éxito: ${fileName}`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error al exportar las estadísticas:', error);
      return Promise.reject(error);
    }
  };

  // Function to create summary sheet with overall information and mini KPIs
  const createResumenSheet = (
    workbook: ExcelJS.Workbook,
    estadisticasMetadata: {
      total: number;
      cantidad: number;
      promedio: number;
      periodoActual?: { fechaDesde: Date; fechaHasta: Date };
      periodoComparacion?: { fechaDesde: Date; fechaHasta: Date };
    },
    options: EstadisticasOptions,
    styles: ReturnType<typeof getExcelStyles>,
    estadisticasPorTipo: EstadisticaAgrupada[],
    estadisticasPorSucursal: EstadisticaAgrupada[]
  ) => {
    const worksheetResumen = workbook.addWorksheet('Resumen', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'portrait',
        fitToPage: true,
        horizontalCentered: true
      }
    });
    
    // Configure columns with wider layout
    worksheetResumen.columns = [
      { key: 'col1', width: 20 },
      { key: 'col2', width: 15 },
      { key: 'col3', width: 15 },
      { key: 'col4', width: 15 },
    ];
    
    // Add company name
    worksheetResumen.addRow(['DEL VALLE', '', '', '']);
    const logoRow = worksheetResumen.getRow(1);
    logoRow.height = 35;
    logoRow.getCell(1).style = { 
      font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FF305496' } },
      alignment: { vertical: 'middle' as const }
    };
    
    // Add title with merged cells
    const titleRow = worksheetResumen.addRow(['ESTADÍSTICAS DE PAGOS EXTERNOS', '', '', '']);
    titleRow.height = 35;
    worksheetResumen.mergeCells('A2:D2');
    titleRow.getCell(1).style = styles.title;
    
    worksheetResumen.addRow(['', '', '', '']); // Space
    
    // Add period information with better formatting
    const periodoDesde = options.fechaDesde ? format(new Date(options.fechaDesde), 'dd/MM/yyyy') : 'No especificado';
    const periodoHasta = options.fechaHasta ? format(new Date(options.fechaHasta), 'dd/MM/yyyy') : 'No especificado';
    
    const periodoRow = worksheetResumen.addRow([
      'Período de análisis:',
      `${periodoDesde} - ${periodoHasta}`,
      '',
      ''
    ]);
    periodoRow.getCell(1).style = styles.infoLabel;
    periodoRow.getCell(2).style = styles.infoCell;
    
    // Add generation information
    const genDateRow = worksheetResumen.addRow([
      'Fecha de generación:',
      format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
      '',
      ''
    ]);
    genDateRow.getCell(1).style = styles.infoLabel;
    genDateRow.getCell(2).style = styles.infoCell;
    
    const monedaRow = worksheetResumen.addRow([
      'Moneda:',
      options.moneda || 'MXN',
      '',
      ''
    ]);
    monedaRow.getCell(1).style = styles.infoLabel;
    monedaRow.getCell(2).style = styles.infoCell;
    
    // Add comparison info if available
    if (options.compararConPeriodoAnterior && estadisticasMetadata.periodoComparacion) {
      const compPeriodoDesde = format(new Date(estadisticasMetadata.periodoComparacion.fechaDesde), 'dd/MM/yyyy');
      const compPeriodoHasta = format(new Date(estadisticasMetadata.periodoComparacion.fechaHasta), 'dd/MM/yyyy');
      const comparacionRow = worksheetResumen.addRow([
        'Comparado con período:',
        `${compPeriodoDesde} - ${compPeriodoHasta}`,
        '',
        ''
      ]);
      comparacionRow.getCell(1).style = styles.infoLabel;
      comparacionRow.getCell(2).style = styles.infoCell;
    }
    
    worksheetResumen.addRow(['', '', '', '']); // Space
    
    // Add KPI Header
    const kpiHeaderRow = worksheetResumen.addRow(['RESUMEN GENERAL', '', '', '']);
    worksheetResumen.mergeCells(`A8:D8`);
    kpiHeaderRow.getCell(1).style = styles.subheader;
    kpiHeaderRow.height = 25;
    
    // Add KPI cards in a 2x2 grid with nicer formatting
    const kpiRow1 = worksheetResumen.addRow([
      'Total de pagos externos:', 
      estadisticasMetadata.total,
      'Cantidad de transacciones:', 
      estadisticasMetadata.cantidad
    ]);
    
    kpiRow1.getCell(1).style = styles.infoLabel;
    kpiRow1.getCell(2).style = {
      ...styles.totalAmount, 
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF305496' } }
    };
    kpiRow1.getCell(3).style = styles.infoLabel;
    kpiRow1.getCell(4).style = {
      ...styles.infoCell,
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF305496' } },
      alignment: { horizontal: 'right' as const }
    };
    kpiRow1.height = 22;
    
    const kpiRow2 = worksheetResumen.addRow([
      ' ', 
      estadisticasMetadata.promedio,
      '', 
      ''
    ]);
    
    kpiRow2.getCell(1).style = styles.infoLabel;
    kpiRow2.getCell(2).style = {
      ...styles.totalAmount,
      font: { name: 'Arial', size: 11, bold: true, color: { argb: 'FF305496' } }
    };
    kpiRow2.height = 22;
    
    worksheetResumen.addRow(['', '', '', '']); // Space
    
    // Top payment types section
    worksheetResumen.addRow(['PRINCIPALES TIPOS DE PAGO', '', '', '']);
    worksheetResumen.getRow(worksheetResumen.rowCount).getCell(1).style = styles.subheader;
    worksheetResumen.mergeCells(`A11:D11`);
    worksheetResumen.getRow(worksheetResumen.rowCount).height = 25;
    
    // Add table header
    const tipoHeaderRow = worksheetResumen.addRow(['Tipo de Pago', 'Monto', '% del Total', 'Transacciones']);
    tipoHeaderRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    tipoHeaderRow.height = 20;
    
    // Sort by amount and get top 5 payment types
    const topTipos = [...estadisticasPorTipo]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // Add data rows with alternating background
    topTipos.forEach((item, index) => {
      const row = worksheetResumen.addRow([
        item.categoria.replace(/_/g, ' '),
        item.total,
        item.porcentaje ? item.porcentaje / 100 : 0,
        item.cantidad
      ]);
      
      row.getCell(1).style = index % 2 === 0 ? styles.dataCell : {...styles.dataCell, ...styles.alternateRow};
      row.getCell(2).style = index % 2 === 0 ? styles.moneyCell : {...styles.moneyCell, ...styles.alternateRow};
      row.getCell(3).style = index % 2 === 0 ? styles.percentCell : {...styles.percentCell, ...styles.alternateRow};
      row.getCell(4).style = index % 2 === 0 ? 
        {...styles.dataCell, alignment: { horizontal: 'center' as const }} : 
        {...styles.dataCell, ...styles.alternateRow, alignment: { horizontal: 'center' as const }};
    });
    
    // Add total row
    worksheetResumen.addRow(['TOTAL', estadisticasMetadata.total, 1, estadisticasMetadata.cantidad]);
    const totalTiposRow = worksheetResumen.getRow(worksheetResumen.rowCount);
    totalTiposRow.getCell(1).style = styles.totalRow;
    totalTiposRow.getCell(2).style = styles.totalAmount;
    totalTiposRow.getCell(3).style = { ...styles.totalRow, numFmt: '0.00%' };
    totalTiposRow.getCell(4).style = { ...styles.totalRow, alignment: { horizontal: 'center' as const } };
    
    worksheetResumen.addRow(['', '', '', '']); // Space
    
    // Top sucursales section
    worksheetResumen.addRow(['PRINCIPALES SUCURSALES', '', '', '']);
    worksheetResumen.getRow(worksheetResumen.rowCount).getCell(1).style = styles.subheader;
    worksheetResumen.mergeCells(`A${worksheetResumen.rowCount}:D${worksheetResumen.rowCount}`);
    worksheetResumen.getRow(worksheetResumen.rowCount).height = 25;
    
    // Add table header
    const sucursalHeaderRow = worksheetResumen.addRow(['Sucursal', 'Monto', '% del Total', 'Transacciones']);
    sucursalHeaderRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    sucursalHeaderRow.height = 20;
    
    // Sort by amount and get top 5 branches
    const topSucursales = [...estadisticasPorSucursal]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // Add data rows with alternating background
    topSucursales.forEach((item, index) => {
      const row = worksheetResumen.addRow([
        item.categoria,
        item.total,
        item.porcentaje ? item.porcentaje / 100 : 0,
        item.cantidad
      ]);
      
      row.getCell(1).style = index % 2 === 0 ? styles.dataCell : {...styles.dataCell, ...styles.alternateRow};
      row.getCell(2).style = index % 2 === 0 ? styles.moneyCell : {...styles.moneyCell, ...styles.alternateRow};
      row.getCell(3).style = index % 2 === 0 ? styles.percentCell : {...styles.percentCell, ...styles.alternateRow};
      row.getCell(4).style = index % 2 === 0 ? 
        {...styles.dataCell, alignment: { horizontal: 'center' as const }} : 
        {...styles.dataCell, ...styles.alternateRow, alignment: { horizontal: 'center' as const }};
    });
    
    // Add total row
    worksheetResumen.addRow(['TOTAL', estadisticasMetadata.total, 1, estadisticasMetadata.cantidad]);
    const totalSucRow = worksheetResumen.getRow(worksheetResumen.rowCount);
    totalSucRow.getCell(1).style = styles.totalRow;
    totalSucRow.getCell(2).style = styles.totalAmount;
    totalSucRow.getCell(3).style = { ...styles.totalRow, numFmt: '0.00%' };
    totalSucRow.getCell(4).style = { ...styles.totalRow, alignment: { horizontal: 'center' as const } };
    
    // Add footer with page numbers
    worksheetResumen.headerFooter = {
      oddHeader: '',
      oddFooter: '&CPágina &P de &N',
    };
  };

  // Create sheet with detailed statistics by payment type
  const createTiposSheet = (
    workbook: ExcelJS.Workbook,
    estadisticasPorTipo: EstadisticaAgrupada[],
    estadisticasMetadata: {
      total: number;
      cantidad: number;
      promedio: number;
    },
    options: EstadisticasOptions,
    styles: ReturnType<typeof getExcelStyles>
  ) => {
    const worksheet = workbook.addWorksheet('Por Tipo de Pago', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true
      }
    });
    
    // Add company name and title rows first
    const logoRow = worksheet.addRow(['DEL VALLE', '', '', '', '']);
    logoRow.height = 30;
    logoRow.getCell(1).style = { 
      font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FF305496' } },
      alignment: { vertical: 'middle' as const }
    };
    
    // Add title
    const titleRow = worksheet.addRow(['DISTRIBUCIÓN POR TIPO DE PAGO EXTERNO', '', '', '', '']);
    titleRow.height = 35;
    titleRow.getCell(1).style = styles.title;
    
    // Add period information
    const periodoDesde = options.fechaDesde ? format(new Date(options.fechaDesde), 'dd/MM/yyyy') : 'No especificado';
    const periodoHasta = options.fechaHasta ? format(new Date(options.fechaHasta), 'dd/MM/yyyy') : 'No especificado';
    const periodoRow = worksheet.addRow([`Período: ${periodoDesde} - ${periodoHasta}`, '', '', '', '']);
    periodoRow.getCell(1).style = styles.subtitle;
    
    worksheet.addRow([]); // Space
    
    // Define columns with keys for better control
    const hasComparison = options.compararConPeriodoAnterior && 
                        estadisticasPorTipo.length > 0 && 
                        estadisticasPorTipo[0].comparacion;
    
    // Define the headers directly in a row
    const headers = ['Tipo de Pago', 'Monto Total', 'Transacciones', 'Promedio', '% del Total'];
    if (hasComparison) {
      headers.push('Var. vs Período Anterior');
    }
    
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    headerRow.height = 20;
    
    // Set column widths
    worksheet.getColumn(1).width = 30; // Tipo de Pago
    worksheet.getColumn(2).width = 20; // Monto Total
    worksheet.getColumn(3).width = 15; // Transacciones
    worksheet.getColumn(4).width = 15; // Promedio
    worksheet.getColumn(5).width = 15; // % del Total
    
    if (hasComparison) {
      worksheet.getColumn(6).width = 25; // Var. vs Período Anterior
    }
    
    // Merge title cell across all columns
    const lastCol = hasComparison ? 'F' : 'E';
    worksheet.mergeCells(`A2:${lastCol}2`);
    
    // Add data rows with alternating background
    estadisticasPorTipo.forEach((item, index) => {
      const rowData = [
        item.categoria.replace(/_/g, ' '),
        item.total,
        item.cantidad,
        item.promedio,
        item.porcentaje ? item.porcentaje / 100 : 0
      ];
      
      // Add comparison data if available
      if (hasComparison && item.comparacion) {
        rowData.push(item.comparacion.porcentaje / 100);
      }
      
      const dataRow = worksheet.addRow(rowData);
      
      const rowStyle = index % 2 === 0 ? {} : styles.alternateRow;
      
      // Apply styles to the data cells
      dataRow.getCell(1).style = {...styles.dataCell, ...rowStyle};
      dataRow.getCell(2).style = {...styles.moneyCell, ...rowStyle};
      dataRow.getCell(3).style = {
        ...styles.dataCell,
        ...rowStyle,
        alignment: { horizontal: 'center' as const }
      };
      dataRow.getCell(4).style = {...styles.moneyCell, ...rowStyle};
      dataRow.getCell(5).style = {...styles.percentCell, ...rowStyle};
      
      // Style comparison cell if present
      if (hasComparison && item.comparacion) {
        const compareStyle = item.comparacion.porcentaje >= 0 ? styles.comparePositive : styles.compareNegative;
        dataRow.getCell(6).style = {
          ...styles.dataCell,
          ...rowStyle,
          ...compareStyle
        };
      }
    });
    
    // Add total row
    worksheet.addRow([]); // Space
    // Fix: Use Array<string | number> to handle mixed type array
    const totalRowData: Array<string | number> = [
      'TOTAL',
      estadisticasMetadata.total,
      estadisticasMetadata.cantidad,
      estadisticasMetadata.promedio,
      1 // 100%
    ];
    
    // Add comparison total if available
    if (hasComparison) {
      const totalComparison = estadisticasPorTipo.reduce(
        (sum, item) => sum + (item.comparacion?.porcentaje || 0), 
        0
      ) / 100;
      totalRowData.push(totalComparison);
    }
    
    const totalRow = worksheet.addRow(totalRowData);
    
    // Style total row
    totalRow.getCell(1).style = styles.totalRow;
    totalRow.getCell(2).style = styles.totalAmount;
    totalRow.getCell(3).style = {
      ...styles.totalRow,
      alignment: { horizontal: 'center' as const }
    };
    totalRow.getCell(4).style = styles.totalAmount;
    totalRow.getCell(5).style = {
      ...styles.totalRow,
      numFmt: '0.00%'
    };
    
    if (hasComparison) {
      // Fix: Add type guard for comparing values
      const comparisonValue = totalRowData[5];
      const compareStyle = typeof comparisonValue === 'number' && comparisonValue >= 0 
        ? styles.comparePositive 
        : styles.compareNegative;
        
      totalRow.getCell(6).style = {
        ...styles.totalRow,
        ...compareStyle
      };
    }
    
    // Set auto-filter for easy navigation
    worksheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: 5, column: hasComparison ? 6 : 5 }
    };
    
    // Freeze header rows
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 5 }
    ];
    
    // Add footer with page numbers and date
    worksheet.headerFooter = {
      oddHeader: '',
      oddFooter: '&CPágina &P de &N | Generado el ' + format(new Date(), 'dd/MM/yyyy HH:mm')
    };
  };

  // Create sheet with statistics by branch office
  const createSucursalesSheet = (
    workbook: ExcelJS.Workbook,
    estadisticasPorSucursal: EstadisticaAgrupada[],
    estadisticasMetadata: {
      total: number;
      cantidad: number;
      promedio: number;
    },
    styles: ReturnType<typeof getExcelStyles>
  ) => {
    const worksheet = workbook.addWorksheet('Por Sucursal', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true
      }
    });
    
    // Add logo and company name
    const logoRow = worksheet.addRow(['DEL VALLE', '', '', '', '']);
    logoRow.height = 30;
    logoRow.getCell(1).style = { 
      font: { name: 'Arial', size: 14, bold: true, color: { argb: 'FF305496' } },
      alignment: { vertical: 'middle' as const }
    };
    
    // Add title
    const titleRow = worksheet.addRow(['DISTRIBUCIÓN POR SUCURSAL', '', '', '', '']);
    titleRow.height = 35;
    titleRow.getCell(1).style = styles.title;
    
    worksheet.addRow([]); // Space
    
    // Add headers directly in a row
    const headerRow = worksheet.addRow(['Sucursal', 'Monto Total', 'Transacciones', 'Promedio', '% del Total']);
    headerRow.eachCell((cell) => {
      cell.style = styles.header;
    });
    headerRow.height = 20;
    
    // Set column widths
    worksheet.getColumn(1).width = 25; // Sucursal
    worksheet.getColumn(2).width = 20; // Monto Total
    worksheet.getColumn(3).width = 15; // Transacciones
    worksheet.getColumn(4).width = 15; // Promedio
    worksheet.getColumn(5).width = 15; // % del Total
    
    // Merge title cell across all columns
    worksheet.mergeCells('A2:E2');
    
    // Add data rows with alternating background
    estadisticasPorSucursal.forEach((item, index) => {
      const dataRow = worksheet.addRow([
        item.categoria,
        item.total,
        item.cantidad,
        item.promedio,
        item.porcentaje ? item.porcentaje / 100 : 0
      ]);
      
      const rowStyle = index % 2 === 0 ? {} : styles.alternateRow;
      
      // Apply styles to the data cells
      dataRow.getCell(1).style = {...styles.dataCell, ...rowStyle};
      dataRow.getCell(2).style = {...styles.moneyCell, ...rowStyle};
      dataRow.getCell(3).style = {
        ...styles.dataCell,
        ...rowStyle,
        alignment: { horizontal: 'center' as const }
      };
      dataRow.getCell(4).style = {...styles.moneyCell, ...rowStyle};
      dataRow.getCell(5).style = {...styles.percentCell, ...rowStyle};
    });
    
    // Add total row
    worksheet.addRow([]); // Space
    // Fix: Use Array<string | number> for mixed type array
    const totalRowData: Array<string | number> = [
      'TOTAL',
      estadisticasMetadata.total,
      estadisticasMetadata.cantidad,
      estadisticasMetadata.promedio,
      1 // 100%
    ];
    
    const totalRow = worksheet.addRow(totalRowData);
    
    // Style total row
    totalRow.getCell(1).style = styles.totalRow;
    totalRow.getCell(2).style = styles.totalAmount;
    totalRow.getCell(3).style = {
      ...styles.totalRow,
      alignment: { horizontal: 'center' as const }
    };
    totalRow.getCell(4).style = styles.totalAmount;
    totalRow.getCell(5).style = {
      ...styles.totalRow,
      numFmt: '0.00%'
    };
    
    // Set auto-filter
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: 5 }
    };
    
    // Freeze header rows
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 4 }
    ];
    
    // Add footer
    worksheet.headerFooter = {
      oddHeader: '',
      oddFooter: '&CPágina &P de &N | Generado el ' + format(new Date(), 'dd/MM/yyyy HH:mm')
    };
  };

  return { exportEstadisticas };
};