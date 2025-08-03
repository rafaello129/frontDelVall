import ExcelJS from "exceljs";
import FileSaver from "file-saver";
import { format, differenceInCalendarDays, subDays, addDays, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import type { Factura } from "../features/factura/types";

/**
 * Hook para exportar facturas a Excel con formato profesional
 * Incluye múltiples hojas: resumen ejecutivo, detalle de facturas y análisis gráfico
 */
export const useExportFacturasExcel = () => {
  const exportFacturasExcel = async (facturas: Factura[]): Promise<void> => {
    if (!facturas || !Array.isArray(facturas) || facturas.length === 0) {
      console.error("No hay facturas para exportar");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema de Facturación";
      workbook.lastModifiedBy = "Sistema Automático";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.properties.date1904 = false;
      
      // Configuración de colores y estilos
      const colorPalette = {
        // Colores principales
        primary: "FF1565C0",       // Azul principal
        primaryLight: "FF42A5F5",  // Azul claro
        secondary: "FF00B8D4",     // Cyan acento
        dark: "FF263238",          // Casi negro
        light: "FFFFFFFF",         // Blanco
        subtle: "FFF5F5F5",        // Gris muy claro
        
        // Estados
        success: "FF388E3C",       // Verde
        warning: "FFFFB300",       // Ámbar
        danger: "FFD32F2F",        // Rojo
        info: "FF0288D1",          // Azul información
        
        // Fondos
        vencida: "FFFFCDD2",       // Rojo claro
        pagada: "FFE8F5E9",        // Verde claro
        pendiente: "FFFFF9C4",     // Amarillo claro
        cancelada: "FFE0E0E0",     // Gris claro
        
        // Bordes y detalles
        border: "FFB0BEC5",        // Gris azulado
        highlight: "FF1976D2",     // Azul destacado
        zebraRow: "FFF5F5F5",      // Gris zebra
      };

      // Fecha actual para cálculos
      const today = new Date();
      const todayStr = format(today, "dd/MM/yyyy");

      // Fuentes consistentes
      const fonts = {
        title: { name: "Segoe UI", size: 20, bold: true, color: { argb: colorPalette.primary } },
        subtitle: { name: "Segoe UI", size: 14, bold: true, color: { argb: colorPalette.dark } },
        sectionHeader: { name: "Segoe UI", size: 12, bold: true, color: { argb: colorPalette.primary } },
        header: { name: "Segoe UI", size: 11, bold: true, color: { argb: colorPalette.light } },
        normal: { name: "Segoe UI", size: 10, color: { argb: colorPalette.dark } },
        total: { name: "Segoe UI", size: 11, bold: true, color: { argb: colorPalette.secondary } },
        footer: { name: "Segoe UI", size: 9, italic: true, color: { argb: colorPalette.primary } },
      };

      // Preparar los datos para el balance general
      const datosBalance = prepararDatosBalance(facturas, today);

      // CREAR HOJA 1: BALANCE GENERAL
      crearHojaBalance(workbook, datosBalance, facturas, colorPalette, fonts, today);

      // CREAR HOJA 2: DETALLE DE FACTURAS
      crearHojaDetalle(workbook, facturas, colorPalette, fonts, today);

      // CREAR HOJA 3: ANÁLISIS DE ANTIGÜEDAD
      crearHojaAnalisisAntiguedad(workbook, facturas, colorPalette, fonts, today);

      // Guardar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Reporte_Facturas_${format(today, "yyyyMMdd_HHmmss")}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), fileName);

      console.log("Excel exportado:", fileName);
    } catch (error) {
      console.error("Error al exportar facturas a Excel:", error);
    }
  };

  /**
   * Preparar datos para el balance general
   */
  const prepararDatosBalance = (facturas: Factura[], today: Date) => {
    // Totales por estado
    const porEstado = {
      Vencida: { count: 0, total: 0 },
      Pagada: { count: 0, total: 0 },
      Pendiente: { count: 0, total: 0 },
      Cancelada: { count: 0, total: 0 },
    };

    // Análisis por antigüedad
    const porAntiguedad = {
      "01-30": { count: 0, total: 0 },
      "31-60": { count: 0, total: 0 },
      "61-90": { count: 0, total: 0 },
      "91+": { count: 0, total: 0 },
    };

    // Top clientes (acumulación)
    const porCliente: Record<string, { nombre: string, count: number, total: number }> = {};

    // Totales generales
    const totales = {
      totalFacturas: facturas.length,
      montoTotal: 0,
      saldoTotal: 0,
      totalVencido: 0,
      totalPorVencer: 0
    };

    // Procesar cada factura
    facturas.forEach(factura => {
      const fechaVenc = new Date(factura.fechaVencimiento);
      const antiguedad = differenceInCalendarDays(today, fechaVenc);
      const montoTotal = factura.montoTotal || 0;
      const saldo = factura.saldo || 0;

      // Acumular por estado
      if (porEstado[factura.estado as keyof typeof porEstado]) {
        porEstado[factura.estado as keyof typeof porEstado].count++;
        porEstado[factura.estado as keyof typeof porEstado].total += montoTotal;
      }

      // Acumular por antigüedad (solo facturas con saldo pendiente)
      if (saldo > 0 && antiguedad > 0) {
        // Vencidas con saldo pendiente
        if (antiguedad <= 30) {
          porAntiguedad["01-30"].count++;
          porAntiguedad["01-30"].total += saldo;
        } else if (antiguedad <= 60) {
          porAntiguedad["31-60"].count++;
          porAntiguedad["31-60"].total += saldo;
        } else if (antiguedad <= 90) {
          porAntiguedad["61-90"].count++;
          porAntiguedad["61-90"].total += saldo;
        } else {
          porAntiguedad["91+"].count++;
          porAntiguedad["91+"].total += saldo;
        }
      }

      // Acumular por cliente
      const clienteKey = factura.cliente?.razonSocial || `Cliente ${factura.noCliente}`;
      if (!porCliente[clienteKey]) {
        porCliente[clienteKey] = {
          nombre: clienteKey,
          count: 0,
          total: 0
        };
      }
      porCliente[clienteKey].count++;
      porCliente[clienteKey].total += montoTotal;

      // Totales generales
      totales.montoTotal += montoTotal;
      totales.saldoTotal += saldo;
      
      // Acumular vencido o por vencer
      if (antiguedad >= 0) {
        totales.totalVencido += saldo;
      } else {
        totales.totalPorVencer += saldo;
      }
    });

    // Ordenar clientes por monto total para obtener top 10
    const topClientes = Object.values(porCliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { porEstado, porAntiguedad, topClientes, totales };
  };

  /**
   * Crear hoja de Balance General
   */
  const crearHojaBalance = (
    workbook: ExcelJS.Workbook, 
    datosBalance: any, 
    facturas: Factura[], 
    colorPalette: any, 
    fonts: any, 
    today: Date
  ) => {
    const balanceSheet = workbook.addWorksheet("Balance General", {
      pageSetup: { 
        paperSize: 9, 
        orientation: "portrait",
        fitToPage: true,
        fitToHeight: 1,
        fitToWidth: 1
      }
    });

    // Ajustar ancho de columnas base
    balanceSheet.columns = [
      { key: "a", width: 3 },   // Margen izquierdo
      { key: "b", width: 22 },  // Títulos/etiquetas
      { key: "c", width: 15 },  // Valores 1
      { key: "d", width: 15 },  // Valores 2
      { key: "e", width: 15 },  // Valores 3
      { key: "f", width: 15 },  // Valores 4
      { key: "g", width: 3 },   // Margen derecho
    ];

    // ----- ENCABEZADO PRINCIPAL -----
    balanceSheet.mergeCells("B2:F2");
    const titleCell = balanceSheet.getCell("B2");
    titleCell.value = "BALANCE GENERAL DE FACTURAS";
    titleCell.font = fonts.title;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    balanceSheet.getRow(2).height = 36;

    // Fecha y hora de generación
    balanceSheet.mergeCells("B3:F3");
    const dateCell = balanceSheet.getCell("B3");
    dateCell.value = `Reporte generado el ${format(today, "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}`;
    dateCell.font = fonts.subtitle;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    balanceSheet.getRow(3).height = 24;

    // Línea divisoria
    balanceSheet.mergeCells("B4:F4");
    const dividerCell = balanceSheet.getCell("B4");
    dividerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.primary }
    };
    balanceSheet.getRow(4).height = 4;


    // ----- SECCIÓN 2: FACTURAS POR ESTADO -----
    balanceSheet.mergeCells("B12:F12");
    const estadoHeader = balanceSheet.getCell("B12");
    estadoHeader.value = "FACTURAS POR ESTADO";
    estadoHeader.font = fonts.sectionHeader;
    estadoHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.subtle }
    };
    estadoHeader.alignment = { horizontal: "center", vertical: "middle" };
    balanceSheet.getRow(12).height = 24;

    // Encabezados de tabla estado
    const estadoHeaderRow = balanceSheet.getRow(14);
    const estadoHeaders = ["Estado", "Cantidad", "% Total", "Monto", "% Monto"];
    estadoHeaders.forEach((header, i) => {
      const cell = estadoHeaderRow.getCell(i + 2); // +2 para empezar en columna B
      cell.value = header;
      cell.font = fonts.header;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.primary }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: colorPalette.border } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "thin", color: { argb: colorPalette.border } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
    });
    estadoHeaderRow.height = 20;

    // Datos de estados
    let rowNum = 15;
    const estadosInfo = [
      { key: "Vencida", color: colorPalette.vencida },
      { key: "Pagada", color: colorPalette.pagada },
      { key: "Pendiente", color: colorPalette.pendiente },
      { key: "Cancelada", color: colorPalette.cancelada },
    ];
    
    estadosInfo.forEach((estado, idx) => {
      const data = datosBalance.porEstado[estado.key];
      const porcentajeCant = datosBalance.totales.totalFacturas > 0 
        ? (data.count / datosBalance.totales.totalFacturas) * 100 
        : 0;
      const porcentajeMonto = datosBalance.totales.montoTotal > 0 
        ? (data.total / datosBalance.totales.montoTotal) * 100 
        : 0;
        
      const estadoRow = balanceSheet.getRow(rowNum + idx);
      
      // Estado
      const cellEstado = estadoRow.getCell(2);
      cellEstado.value = estado.key;
      cellEstado.font = fonts.normal;
      cellEstado.alignment = { horizontal: "left", vertical: "middle" };
      
      // Cantidad
      const cellCantidad = estadoRow.getCell(3);
      cellCantidad.value = data.count;
      cellCantidad.font = fonts.normal;
      cellCantidad.alignment = { horizontal: "center", vertical: "middle" };
      
      // % Total
      const cellPorcentaje = estadoRow.getCell(4);
      cellPorcentaje.value = porcentajeCant / 100; // Como decimal para formato porcentaje
      cellPorcentaje.font = fonts.normal;
      cellPorcentaje.numFmt = "0.00%";
      cellPorcentaje.alignment = { horizontal: "center", vertical: "middle" };
      
      // Monto
      const cellMonto = estadoRow.getCell(5);
      cellMonto.value = data.total;
      cellMonto.font = fonts.normal;
      cellMonto.numFmt = '"$"#,##0.00';
      cellMonto.alignment = { horizontal: "right", vertical: "middle" };
      
      // % Monto
      const cellPorcentajeMonto = estadoRow.getCell(6);
      cellPorcentajeMonto.value = porcentajeMonto / 100;
      cellPorcentajeMonto.font = fonts.normal;
      cellPorcentajeMonto.numFmt = "0.00%";
      cellPorcentajeMonto.alignment = { horizontal: "center", vertical: "middle" };
      
      // Aplicar bordes y color a toda la fila
      estadoRow.eachCell({ includeEmpty: false }, cell => {
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: estado.color }
        };
      });
      
      estadoRow.height = 20;
    });

    // Fila Total Estados
    const totalEstadosRow = balanceSheet.getRow(rowNum + estadosInfo.length);
    
    // Etiqueta Total
    const cellTotalLabel = totalEstadosRow.getCell(2);
    cellTotalLabel.value = "TOTALES";
    cellTotalLabel.font = fonts.total;
    cellTotalLabel.alignment = { horizontal: "left", vertical: "middle" };
    
    // Total Cantidad
    const cellTotalCant = totalEstadosRow.getCell(3);
    cellTotalCant.value = datosBalance.totales.totalFacturas;
    cellTotalCant.font = fonts.total;
    cellTotalCant.alignment = { horizontal: "center", vertical: "middle" };
    
    // Total % (siempre 100%)
    const cellTotal100 = totalEstadosRow.getCell(4);
    cellTotal100.value = 1;
    cellTotal100.font = fonts.total;
    cellTotal100.numFmt = "0.00%";
    cellTotal100.alignment = { horizontal: "center", vertical: "middle" };
    
    // Total Monto
    const cellTotalMonto = totalEstadosRow.getCell(5);
    cellTotalMonto.value = datosBalance.totales.montoTotal;
    cellTotalMonto.font = fonts.total;
    cellTotalMonto.numFmt = '"$"#,##0.00';
    cellTotalMonto.alignment = { horizontal: "right", vertical: "middle" };
    
    // Total % Monto (siempre 100%)
    const cellTotalPorcentMonto = totalEstadosRow.getCell(6);
    cellTotalPorcentMonto.value = 1;
    cellTotalPorcentMonto.font = fonts.total;
    cellTotalPorcentMonto.numFmt = "0.00%";
    cellTotalPorcentMonto.alignment = { horizontal: "center", vertical: "middle" };
    
    // Aplicar estilos a la fila de totales
    totalEstadosRow.eachCell({ includeEmpty: false }, cell => {
      cell.border = {
        top: { style: "double", color: { argb: colorPalette.primary } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "double", color: { argb: colorPalette.primary } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.secondary }
      };
    });
    
    totalEstadosRow.height = 24;

    // ----- SECCIÓN 3: ANÁLISIS DE ANTIGÜEDAD -----
    const inicioAntiguedad = rowNum + estadosInfo.length + 3; // +3 para dejar un espacio

    balanceSheet.mergeCells(`B${inicioAntiguedad}:F${inicioAntiguedad}`);
    const antiguedadHeader = balanceSheet.getCell(`B${inicioAntiguedad}`);
    antiguedadHeader.value = "ANÁLISIS DE ANTIGÜEDAD";
    antiguedadHeader.font = fonts.sectionHeader;
    antiguedadHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.subtle }
    };
    antiguedadHeader.alignment = { horizontal: "center", vertical: "middle" };
    balanceSheet.getRow(inicioAntiguedad).height = 24;

    // Encabezados tabla antigüedad
    const antiguedadHeaderRow = balanceSheet.getRow(inicioAntiguedad + 2);
    const antiguedadHeaders = ["Días", "Facturas", "% Facturas", "Monto", "Criticidad"];
    antiguedadHeaders.forEach((header, i) => {
      const cell = antiguedadHeaderRow.getCell(i + 2); // +2 para empezar en columna B
      cell.value = header;
      cell.font = fonts.header;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.primary }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: colorPalette.border } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "thin", color: { argb: colorPalette.border } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
    });
    antiguedadHeaderRow.height = 20;

    // Definir rangos de antigüedad y sus estilos
    const antiguedadRangos = [
      { key: "01-30", label: "1-30 días", color: "FFC8E6C9", criticidad: "Baja", colorText: colorPalette.success },
      { key: "31-60", label: "31-60 días", color: "FFFFF59D", criticidad: "Media", colorText: colorPalette.warning },
      { key: "61-90", label: "61-90 días", color: "FFFFCC80", criticidad: "Alta", colorText: colorPalette.warning },
      { key: "91+", label: "91+ días", color: "FFEF9A9A", criticidad: "Crítica", colorText: colorPalette.danger },
    ];

    // Datos de antigüedad
    let totalAntigFacturas = 0;
    let totalAntigMonto = 0;

    // Calcular totales primero
    antiguedadRangos.forEach(rango => {
      totalAntigFacturas += datosBalance.porAntiguedad[rango.key].count;
      totalAntigMonto += datosBalance.porAntiguedad[rango.key].total;
    });

    // Rellenar datos
    antiguedadRangos.forEach((rango, idx) => {
      const data = datosBalance.porAntiguedad[rango.key];
      const antiguedadRow = balanceSheet.getRow(inicioAntiguedad + 3 + idx);
      
      // Rango de días
      const cellRango = antiguedadRow.getCell(2);
      cellRango.value = rango.label;
      cellRango.font = fonts.normal;
      cellRango.alignment = { horizontal: "left", vertical: "middle" };
      
      // Cantidad facturas
      const cellCantidad = antiguedadRow.getCell(3);
      cellCantidad.value = data.count;
      cellCantidad.font = fonts.normal;
      cellCantidad.alignment = { horizontal: "center", vertical: "middle" };
      
      // % Facturas
      const cellPorcentaje = antiguedadRow.getCell(4);
      cellPorcentaje.value = totalAntigFacturas > 0 ? (data.count / totalAntigFacturas) : 0;
      cellPorcentaje.font = fonts.normal;
      cellPorcentaje.numFmt = "0.00%";
      cellPorcentaje.alignment = { horizontal: "center", vertical: "middle" };
      
      // Monto
      const cellMonto = antiguedadRow.getCell(5);
      cellMonto.value = data.total;
      cellMonto.font = fonts.normal;
      cellMonto.numFmt = '"$"#,##0.00';
      cellMonto.alignment = { horizontal: "right", vertical: "middle" };
      
      // Criticidad
      const cellCriticidad = antiguedadRow.getCell(6);
      cellCriticidad.value = rango.criticidad;
      cellCriticidad.font = { ...fonts.normal, color: { argb: rango.colorText } };
      cellCriticidad.alignment = { horizontal: "center", vertical: "middle" };
      
      // Aplicar estilos a toda la fila
      antiguedadRow.eachCell({ includeEmpty: false }, cell => {
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rango.color }
        };
      });
      
      antiguedadRow.height = 20;
    });

    // Fila Total Antigüedad
    const filaFinalAntig = inicioAntiguedad + 3 + antiguedadRangos.length;
    const totalAntiguedadRow = balanceSheet.getRow(filaFinalAntig);
    
    // Etiqueta Total
    const cellTotalAntigLabel = totalAntiguedadRow.getCell(2);
    cellTotalAntigLabel.value = "TOTAL VENCIDO";
    cellTotalAntigLabel.font = fonts.total;
    cellTotalAntigLabel.alignment = { horizontal: "left", vertical: "middle" };
    
    // Total Cantidad
    const cellTotalAntigCant = totalAntiguedadRow.getCell(3);
    cellTotalAntigCant.value = totalAntigFacturas;
    cellTotalAntigCant.font = fonts.total;
    cellTotalAntigCant.alignment = { horizontal: "center", vertical: "middle" };
    
    // Total %
    const cellTotalAntig100 = totalAntiguedadRow.getCell(4);
    cellTotalAntig100.value = totalAntigFacturas > 0 ? 1 : 0;
    cellTotalAntig100.font = fonts.total;
    cellTotalAntig100.numFmt = "0.00%";
    cellTotalAntig100.alignment = { horizontal: "center", vertical: "middle" };
    
    // Total Monto
    const cellTotalAntigMonto = totalAntiguedadRow.getCell(5);
    cellTotalAntigMonto.value = totalAntigMonto;
    cellTotalAntigMonto.font = fonts.total;
    cellTotalAntigMonto.numFmt = '"$"#,##0.00';
    cellTotalAntigMonto.alignment = { horizontal: "right", vertical: "middle" };
    
    // Aplicar estilos a la fila de totales
    totalAntiguedadRow.eachCell({ includeEmpty: false }, cell => {
      cell.border = {
        top: { style: "double", color: { argb: colorPalette.primary } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "double", color: { argb: colorPalette.primary } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.secondary }
      };
    });
    
    totalAntiguedadRow.height = 24;

    // ----- SECCIÓN 4: TOP CLIENTES -----
    const inicioTopClientes = filaFinalAntig + 3; // +3 para dejar un espacio

    balanceSheet.mergeCells(`B${inicioTopClientes}:F${inicioTopClientes}`);
    const clientesHeader = balanceSheet.getCell(`B${inicioTopClientes}`);
    clientesHeader.value = "TOP 10 CLIENTES POR MONTO";
    clientesHeader.font = fonts.sectionHeader;
    clientesHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.subtle }
    };
    clientesHeader.alignment = { horizontal: "center", vertical: "middle" };
    balanceSheet.getRow(inicioTopClientes).height = 24;

    // Encabezados tabla clientes
    const clientesHeaderRow = balanceSheet.getRow(inicioTopClientes + 2);
    const clientesHeaders = ["Cliente", "Facturas", "% Facturas", "Monto", "% Monto"];
    clientesHeaders.forEach((header, i) => {
      const cell = clientesHeaderRow.getCell(i + 2); // +2 para empezar en columna B
      cell.value = header;
      cell.font = fonts.header;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.primary }
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: colorPalette.border } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "thin", color: { argb: colorPalette.border } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
    });
    clientesHeaderRow.height = 20;

    // Datos de los top clientes
    datosBalance.topClientes.forEach((cliente:any, idx:any) => {
      const clienteRow = balanceSheet.getRow(inicioTopClientes + 3 + idx);
      
      // Nombre Cliente
      const cellNombre = clienteRow.getCell(2);
      cellNombre.value = cliente.nombre;
      cellNombre.font = fonts.normal;
      cellNombre.alignment = { horizontal: "left", vertical: "middle" };
      
      // Cantidad facturas
      const cellCantidad = clienteRow.getCell(3);
      cellCantidad.value = cliente.count;
      cellCantidad.font = fonts.normal;
      cellCantidad.alignment = { horizontal: "center", vertical: "middle" };
      
      // % Facturas
      const cellPorcentaje = clienteRow.getCell(4);
      cellPorcentaje.value = datosBalance.totales.totalFacturas > 0 ? 
        (cliente.count / datosBalance.totales.totalFacturas) : 0;
      cellPorcentaje.font = fonts.normal;
      cellPorcentaje.numFmt = "0.00%";
      cellPorcentaje.alignment = { horizontal: "center", vertical: "middle" };
      
      // Monto
      const cellMonto = clienteRow.getCell(5);
      cellMonto.value = cliente.total;
      cellMonto.font = fonts.normal;
      cellMonto.numFmt = '"$"#,##0.00';
      cellMonto.alignment = { horizontal: "right", vertical: "middle" };
      
      // % Monto
      const cellPorcentajeMonto = clienteRow.getCell(6);
      cellPorcentajeMonto.value = datosBalance.totales.montoTotal > 0 ? 
        (cliente.total / datosBalance.totales.montoTotal) : 0;
      cellPorcentajeMonto.font = fonts.normal;
      cellPorcentajeMonto.numFmt = "0.00%";
      cellPorcentajeMonto.alignment = { horizontal: "center", vertical: "middle" };
      
      // Aplicar estilos a toda la fila
      clienteRow.eachCell({ includeEmpty: false }, cell => {
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        // Color alternado de filas
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: idx % 2 === 0 ? "FFFFFFFF" : colorPalette.zebraRow }
        };
      });
      
      clienteRow.height = 20;
    });

    // Pie de página con notas
    const notaFinal = inicioTopClientes + 3 + datosBalance.topClientes.length + 3;
    
    balanceSheet.mergeCells(`B${notaFinal}:F${notaFinal}`);
    const notaCell = balanceSheet.getCell(`B${notaFinal}`);
    notaCell.value = "* Este reporte muestra un resumen detallado de la situación actual de facturación. Para ver el detalle completo de facturas consulte la hoja 'Detalle Facturas'.";
    notaCell.font = fonts.footer;
    notaCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    balanceSheet.getRow(notaFinal).height = 30;

    return balanceSheet;
  };

  /**
   * Crear hoja de Detalle de Facturas
   */
  const crearHojaDetalle = (
    workbook: ExcelJS.Workbook, 
    facturas: Factura[], 
    colorPalette: any, 
    fonts: any, 
    today: Date
  ) => {
    const worksheet = workbook.addWorksheet("Detalle Facturas", {
      pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Definir columnas para mejor control
    const columns = [
      { header: "No. Cliente", key: "noCliente", width: 10 },
      { header: "Nombre Comercial", key: "comercial", width: 18 },
      { header: "Razón Social", key: "razonSocial", width: 22 },
      { header: "Factura", key: "noFactura", width: 12 },
      { header: "Emisión", key: "emision", width: 12 },
      { header: "Vencimiento", key: "fechaVencimiento", width: 12 },
      { header: "Antigüedad", key: "antiguedad", width: 10 },
      { header: "Estado", key: "estado", width: 10 },
      { header: "Saldo Total", key: "montoTotal", width: 14 },
      { header: "Vencido", key: "vencido", width: 12 },
      { header: "Por Vencer", key: "porVencer", width: 12 },
      { header: "Concepto", key: "concepto", width: 30 },
    ];

    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width
    }));

    // TÍTULO
    worksheet.mergeCells("A1:L1");
    worksheet.getCell("A1").value = "LISTADO DETALLADO DE FACTURAS";
    worksheet.getCell("A1").font = fonts.title;
    worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 36;

    // Fecha de generación
    worksheet.mergeCells("A2:L2");
    worksheet.getCell("A2").value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
    worksheet.getCell("A2").font = fonts.subtitle;
    worksheet.getCell("A2").alignment = { horizontal: "right", vertical: "middle" };
    worksheet.getRow(2).height = 24;

    // Línea divisoria
    worksheet.mergeCells("A3:L3");
    worksheet.getCell("A3").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.primary }
    };
    worksheet.getRow(3).height = 4;

    // Encabezados
    const headerRow = worksheet.addRow(columns.map(col => col.header));
    headerRow.eachCell(cell => {
      cell.font = fonts.header;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorPalette.primary }
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: colorPalette.border } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "thin", color: { argb: colorPalette.border } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
    });
    headerRow.height = 22;

    // Agregar filas de facturas con estilos distintivos y cálculo dinámico de antigüedad
    facturas.forEach((f, i) => {
      const fechaVenc = new Date(f.fechaVencimiento);
      const antiguedad = differenceInCalendarDays(today, fechaVenc);

      // Vencido y Por Vencer
      let vencido = "";
      let porVencer = "";
      if (antiguedad > 0) {
        vencido = f.saldo?.toString() || "";
      } else if (antiguedad < 0) {
        porVencer = f.saldo?.toString() || "";
      } else {
        // Si vence hoy, considerar como vencido
        vencido = f.saldo?.toString() || "";
      }

      const row = worksheet.addRow({
        noCliente: f.noCliente,
        comercial: f.cliente?.comercial || "",
        razonSocial: f.cliente?.razonSocial || "",
        noFactura: f.noFactura,
        emision: format(new Date(f.emision), "dd/MM/yyyy"),
        fechaVencimiento: format(fechaVenc, "dd/MM/yyyy"),
        antiguedad: antiguedad,
        estado: f.estado,
        montoTotal: f.montoTotal || 0,
        vencido: vencido ? Number(vencido) : "",
        porVencer: porVencer ? Number(porVencer) : "",
        concepto: f.concepto || "",
      });

      row.eachCell((cell, colNumber) => {
        cell.font = { ...fonts.normal };
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        cell.alignment = { vertical: "middle", wrapText: true };

        // Color de fila según estado
        let rowColor = undefined;
        switch (f.estado) {
          case "Vencida":
            rowColor = colorPalette.vencida;
            break;
          case "Pagada":
            rowColor = colorPalette.pagada;
            break;
          case "Pendiente":
            rowColor = colorPalette.pendiente;
            break;
          case "Cancelada":
            rowColor = colorPalette.cancelada;
            break;
          default:
            rowColor = i % 2 === 1 ? colorPalette.zebraRow : undefined;
        }
        if (rowColor) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowColor } };
        }

        // Columnas monetarias: formato y alineación
        const colKey = columns[colNumber - 1].key;
        if (["montoTotal", "vencido", "porVencer"].includes(colKey)) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        
        // Columna antigüedad: formato y color según valor
        if (colKey === "antiguedad") {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          if (antiguedad > 0) {
            cell.font = { ...cell.font, color: { argb: colorPalette.danger } };
          } else if (antiguedad < 0) {
            cell.font = { ...cell.font, color: { argb: colorPalette.success } };
          }
        }
        
        // Columnas de fecha: centradas
        if (["emision", "fechaVencimiento"].includes(colKey)) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
        
        // Columna estado: centrada y color según valor
        if (colKey === "estado") {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          switch (f.estado) {
            case "Vencida":
              cell.font = { ...cell.font, bold: true, color: { argb: colorPalette.danger } };
              break;
            case "Pagada":
              cell.font = { ...cell.font, color: { argb: colorPalette.success } };
              break;
            case "Pendiente":
              cell.font = { ...cell.font, color: { argb: colorPalette.warning } };
              break;
          }
        }
      });
      
      row.height = 20;
    });

    // Totales para saldo total, vencido, por vencer
    if (facturas.length > 0) {
      const totalSaldoTotal = facturas.reduce((acc, f) => acc + (f.montoTotal || 0), 0);
      const totalVencido = facturas.reduce((acc, f) => {
        const dif = differenceInCalendarDays(today, new Date(f.fechaVencimiento));
        if (dif >= 0) return acc + (f.saldo || 0);
        return acc;
      }, 0);
      const totalPorVencer = facturas.reduce((acc, f) => {
        const dif = differenceInCalendarDays(today, new Date(f.fechaVencimiento));
        if (dif < 0) return acc + (f.saldo || 0);
        return acc;
      }, 0);

      // Crear array con valores para cada columna
      const totalesArray = Array(columns.length).fill("");
      
      // Posicionar los totales en las columnas correctas
      totalesArray[columns.findIndex(c => c.key === "estado")] = "TOTALES:";
      totalesArray[columns.findIndex(c => c.key === "montoTotal")] = totalSaldoTotal;
      totalesArray[columns.findIndex(c => c.key === "vencido")] = totalVencido;
      totalesArray[columns.findIndex(c => c.key === "porVencer")] = totalPorVencer;
      
      const totalRow = worksheet.addRow(totalesArray);
      
      totalRow.eachCell((cell, colNumber) => {
        const colKey = columns[colNumber - 1].key;
        
        // Formatear celdas monetarias
        if (["montoTotal", "vencido", "porVencer"].includes(colKey)) {
          cell.numFmt = '"$"#,##0.00';
          cell.font = fonts.total;
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        
        // Formatear celda de etiqueta "TOTALES:"
        if (colKey === "estado") {
          cell.font = fonts.total;
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        
        // Estilos generales para toda la fila
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorPalette.secondary }
        };
        cell.border = {
          top: { style: "medium", color: { argb: colorPalette.primary } },
          bottom: { style: "medium", color: { argb: colorPalette.primary } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
      });
      
      totalRow.height = 22;
    }

    // Autofiltro y filas congeladas
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: columns.length }
    };
    worksheet.views = [{ state: "frozen", ySplit: 4 }];

    // Leyenda de colores
    const filaLeyenda = worksheet.rowCount + 2;
    
    worksheet.mergeCells(`A${filaLeyenda}:L${filaLeyenda}`);
    const leyendaTitle = worksheet.getCell(`A${filaLeyenda}`);
    leyendaTitle.value = "LEYENDA DE COLORES";
    leyendaTitle.font = fonts.sectionHeader;
    leyendaTitle.alignment = { horizontal: "center", vertical: "middle" };
    leyendaTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.subtle }
    };
    worksheet.getRow(filaLeyenda).height = 22;

    // Estados con colores
    const estadosLeyenda = [
      { estado: "Factura Vencida", color: colorPalette.vencida },
      { estado: "Factura Pagada", color: colorPalette.pagada },
      { estado: "Factura Pendiente", color: colorPalette.pendiente },
      { estado: "Factura Cancelada", color: colorPalette.cancelada }
    ];

    estadosLeyenda.forEach((item, i) => {
      const filaEstado = filaLeyenda + 1 + i;
      
      worksheet.mergeCells(`B${filaEstado}:C${filaEstado}`);
      const celdaEstado = worksheet.getCell(`B${filaEstado}`);
      celdaEstado.value = item.estado;
      celdaEstado.font = fonts.normal;
      celdaEstado.alignment = { horizontal: "center", vertical: "middle" };
      celdaEstado.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: item.color }
      };
      celdaEstado.border = {
        top: { style: "thin", color: { argb: colorPalette.border } },
        left: { style: "thin", color: { argb: colorPalette.border } },
        bottom: { style: "thin", color: { argb: colorPalette.border } },
        right: { style: "thin", color: { argb: colorPalette.border } }
      };
      
      worksheet.getRow(filaEstado).height = 20;
    });

    return worksheet;
  };

  /**
   * Crear hoja de Análisis de Antigüedad
   */
  const crearHojaAnalisisAntiguedad = (
    workbook: ExcelJS.Workbook, 
    facturas: Factura[], 
    colorPalette: any, 
    fonts: any, 
    today: Date
  ) => {
    const worksheet = workbook.addWorksheet("Análisis Antigüedad", {
      pageSetup: { paperSize: 9, orientation: "landscape" }
    });

    // Definir columnas
    worksheet.columns = [
      { key: "a", width: 3 },   // Margen izquierdo
      { key: "b", width: 15 },  // Cliente
      { key: "c", width: 25 },  // Razón Social
      { key: "d", width: 15 },  // Factura
      { key: "e", width: 15 },  // Fecha Vencimiento
      { key: "f", width: 12 },  // Antigüedad (días)
      { key: "g", width: 15 },  // 1-30 días
      { key: "h", width: 15 },  // 31-60 días
      { key: "i", width: 15 },  // 61-90 días
      { key: "j", width: 15 },  // 91+ días
      { key: "k", width: 18 },  // Saldo Total
      { key: "l", width: 3 },   // Margen derecho
    ];

    // TÍTULO
    worksheet.mergeCells("B1:K1");
    worksheet.getCell("B1").value = "ANÁLISIS DE ANTIGÜEDAD DE FACTURAS VENCIDAS";
    worksheet.getCell("B1").font = fonts.title;
    worksheet.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 36;

    // Fecha de generación
    worksheet.mergeCells("B2:K2");
    worksheet.getCell("B2").value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
    worksheet.getCell("B2").font = fonts.subtitle;
    worksheet.getCell("B2").alignment = { horizontal: "right", vertical: "middle" };
    worksheet.getRow(2).height = 24;

    // Línea divisoria
    worksheet.mergeCells("B3:K3");
    worksheet.getCell("B3").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.primary }
    };
    worksheet.getRow(3).height = 4;

    // Encabezados
    const headers = [
      "No. Cliente", "Razón Social", "Factura", "Fecha Venc.",
      "Antigüedad", "1-30 días", "31-60 días", "61-90 días",
      "91+ días", "Saldo Total"
    ];
    
    const headerRow = worksheet.addRow(["", ...headers, ""]);  // Con márgenes
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber > 1 && colNumber < 12) {  // Excluir márgenes
        cell.font = fonts.header;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorPalette.primary }
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
      }
    });
    headerRow.height = 22;

    // Filtrar solo facturas con saldo pendiente (no pagadas/canceladas)
    const facturasConSaldo = facturas.filter(f => 
      (f.estado === "Vencida" || f.estado === "Pendiente") && 
      f.saldo && f.saldo > 0
    );

    // Preparar datos agregados por cliente para antigüedad
    type ClienteAntiguedad = {
      noCliente: number;
      razonSocial: string;
      facturas: {
        noFactura: string;
        fechaVenc: Date;
        antiguedad: number;
        saldo: number;
        rango: "1-30" | "31-60" | "61-90" | "91+";
      }[];
      total: number;
      total_1_30: number;
      total_31_60: number;
      total_61_90: number;
      total_91_plus: number;
    };

    const clientesAntiguedad: Record<number, ClienteAntiguedad> = {};

    // Procesar cada factura con saldo
    facturasConSaldo.forEach(f => {
      const fechaVenc = new Date(f.fechaVencimiento);
      const antiguedad = differenceInCalendarDays(today, fechaVenc);
      
      // Solo procesar facturas vencidas (antiguedad > 0)
      if (antiguedad <= 0) return;
      
      // Determinar rango de antigüedad
      let rango: "1-30" | "31-60" | "61-90" | "91+" = "91+";
      if (antiguedad <= 30) {
        rango = "1-30";
      } else if (antiguedad <= 60) {
        rango = "31-60";
      } else if (antiguedad <= 90) {
        rango = "61-90";
      }

      const noCliente = f.noCliente;
      const saldo = f.saldo || 0;
      
      if (!clientesAntiguedad[noCliente]) {
        clientesAntiguedad[noCliente] = {
          noCliente,
          razonSocial: f.cliente?.razonSocial || `Cliente ${noCliente}`,
          facturas: [],
          total: 0,
          total_1_30: 0,
          total_31_60: 0,
          total_61_90: 0,
          total_91_plus: 0
        };
      }
      
      clientesAntiguedad[noCliente].facturas.push({
        noFactura: f.noFactura,
        fechaVenc,
        antiguedad,
        saldo,
        rango
      });
      
      clientesAntiguedad[noCliente].total += saldo;
      
      // Acumular en el rango correspondiente
      switch (rango) {
        case "1-30":
          clientesAntiguedad[noCliente].total_1_30 += saldo;
          break;
        case "31-60":
          clientesAntiguedad[noCliente].total_31_60 += saldo;
          break;
        case "61-90":
          clientesAntiguedad[noCliente].total_61_90 += saldo;
          break;
        case "91+":
          clientesAntiguedad[noCliente].total_91_plus += saldo;
          break;
      }
    });

    // Ordenar clientes por monto total (de mayor a menor)
    const clientesOrdenados = Object.values(clientesAntiguedad)
      .sort((a, b) => b.total - a.total);

    // Agregar filas de datos al reporte
    let currentRow = 5; // Fila después del encabezado
    let totalGeneral = 0;
    let totalGeneral_1_30 = 0;
    let totalGeneral_31_60 = 0;
    let totalGeneral_61_90 = 0;
    let totalGeneral_91_plus = 0;

    // Para cada cliente, mostrar una fila con sus totales
    clientesOrdenados.forEach(cliente => {
      totalGeneral += cliente.total;
      totalGeneral_1_30 += cliente.total_1_30;
      totalGeneral_31_60 += cliente.total_31_60;
      totalGeneral_61_90 += cliente.total_61_90;
      totalGeneral_91_plus += cliente.total_91_plus;
      
      // Datos base del cliente
      const rowData = [
        "",                    // Margen
        cliente.noCliente,     // No. Cliente
        cliente.razonSocial,   // Razón Social
        "",                    // Factura (vacío en la fila de cliente)
        "",                    // Fecha Venc. (vacío en la fila de cliente)
        "",                    // Antigüedad (vacío en la fila de cliente)
        cliente.total_1_30,    // 1-30 días
        cliente.total_31_60,   // 31-60 días
        cliente.total_61_90,   // 61-90 días
        cliente.total_91_plus, // 91+ días
        cliente.total,         // Saldo Total
        ""                     // Margen
      ];
      
      const clienteRow = worksheet.addRow(rowData);
      currentRow++;
      
      // Aplicar estilos a la fila de cliente
      clienteRow.eachCell((cell, colNumber) => {
        if (colNumber > 1 && colNumber < 12) {  // Excluir márgenes
          cell.font = { ...fonts.normal, bold: true };
          cell.border = {
            top: { style: "thin", color: { argb: colorPalette.border } },
            left: { style: "thin", color: { argb: colorPalette.border } },
            bottom: { style: "thin", color: { argb: colorPalette.border } },
            right: { style: "thin", color: { argb: colorPalette.border } }
          };
          
          // Formato de moneda para columnas de montos
          if (colNumber >= 7 && colNumber <= 11) {
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: "right", vertical: "middle" };
          }
          
          // Destacar la fila de cliente con un color de fondo
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colorPalette.subtle }
          };
        }
      });
      clienteRow.height = 22;
      
      // Para cada factura del cliente, mostrar el detalle
      cliente.facturas.forEach(factura => {
        // Determinar el color según rango de antigüedad
        let rangoColor: string;
        switch (factura.rango) {
          case "1-30":
            rangoColor = "FFC8E6C9"; // Verde claro
            break;
          case "31-60":
            rangoColor = "FFFFF59D"; // Amarillo claro
            break;
          case "61-90":
            rangoColor = "FFFFCC80"; // Naranja claro
            break;
          case "91+":
            rangoColor = "FFEF9A9A"; // Rojo claro
            break;
        }
        
        // Crear una fila para la factura con formato específico según su rango
        const facturaData = [
          "",                                    // Margen
          "",                                    // No. Cliente (vacío en detalle)
          "",                                    // Razón Social (vacío en detalle)
          factura.noFactura,                     // Factura
          format(factura.fechaVenc, "dd/MM/yyyy"), // Fecha Venc.
          factura.antiguedad,                    // Antigüedad
          factura.rango === "1-30" ? factura.saldo : "", // 1-30 días
          factura.rango === "31-60" ? factura.saldo : "", // 31-60 días
          factura.rango === "61-90" ? factura.saldo : "", // 61-90 días
          factura.rango === "91+" ? factura.saldo : "",  // 91+ días
          factura.saldo,                          // Saldo Total
          ""                                     // Margen
        ];
        
        const facturaRow = worksheet.addRow(facturaData);
        currentRow++;
        
        // Aplicar estilos a la fila de factura
        facturaRow.eachCell((cell, colNumber) => {
          if (colNumber > 1 && colNumber < 12) {  // Excluir márgenes
            cell.font = fonts.normal;
            cell.border = {
              top: { style: "thin", color: { argb: colorPalette.border } },
              left: { style: "thin", color: { argb: colorPalette.border } },
              bottom: { style: "thin", color: { argb: colorPalette.border } },
              right: { style: "thin", color: { argb: colorPalette.border } }
            };
            
            // Columnas de montos: formato moneda
            if ([7, 8, 9, 10, 11].includes(colNumber)) {
              cell.numFmt = '"$"#,##0.00';
              cell.alignment = { horizontal: "right", vertical: "middle" };
            }
            
            // Columna de antigüedad: centrada y negrita
            if (colNumber === 6) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
              // Color según antigüedad
              if (factura.antiguedad > 90) {
                cell.font = { ...cell.font, color: { argb: colorPalette.danger } };
              } else if (factura.antiguedad > 60) {
                cell.font = { ...cell.font, color: { argb: "FFFF9800" } }; // Naranja
              } else if (factura.antiguedad > 30) {
                cell.font = { ...cell.font, color: { argb: colorPalette.warning } };
              }
            }
            
            // Columna de fecha vencimiento: centrada
            if (colNumber === 5) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            }
            
            // Columna de factura: centrada
            if (colNumber === 4) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            }
            
            // Color de fondo según rango de antigüedad
            if (colNumber >= 4) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: rangoColor }
              };
            }
          }
        });
        facturaRow.height = 20;
      });
    });

    // Agregar fila de totales
    const totalesData = [
      "",                   // Margen
      "",                   // No. Cliente
      "TOTAL GENERAL",      // En lugar de Razón Social
      "",                   // Factura
      "",                   // Fecha Venc.
      "",                   // Antigüedad
      totalGeneral_1_30,    // 1-30 días
      totalGeneral_31_60,   // 31-60 días
      totalGeneral_61_90,   // 61-90 días
      totalGeneral_91_plus, // 91+ días
      totalGeneral,         // Saldo Total
      ""                    // Margen
    ];
    
    const totalesRow = worksheet.addRow(totalesData);
    currentRow++;
    
    // Aplicar estilos a la fila de totales
    totalesRow.eachCell((cell, colNumber) => {
      if (colNumber > 1 && colNumber < 12) {  // Excluir márgenes
        cell.font = fonts.total;
        cell.border = {
          top: { style: "double", color: { argb: colorPalette.primary } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "double", color: { argb: colorPalette.primary } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorPalette.secondary }
        };
        
        // Columnas de montos: formato moneda
        if (colNumber >= 7 && colNumber <= 11) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
        
        // Etiqueta TOTAL GENERAL
        if (colNumber === 3) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        }
      }
    });
    totalesRow.height = 24;

    // Agregar resumen de análisis
    const inicioResumen = currentRow + 3;
    
    worksheet.mergeCells(`B${inicioResumen}:K${inicioResumen}`);
    const resumenTitle = worksheet.getCell(`B${inicioResumen}`);
    resumenTitle.value = "RESUMEN DE ANÁLISIS DE ANTIGÜEDAD";
    resumenTitle.font = fonts.sectionHeader;
    resumenTitle.alignment = { horizontal: "center", vertical: "middle" };
    resumenTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorPalette.subtle }
    };
    worksheet.getRow(inicioResumen).height = 24;
    
    // Resumen porcentual
    const porcentajes = [
      { rango: "1-30 días", valor: totalGeneral_1_30, porcentaje: totalGeneral > 0 ? (totalGeneral_1_30 / totalGeneral) : 0, color: "FFC8E6C9", criticidad: "Baja" },
      { rango: "31-60 días", valor: totalGeneral_31_60, porcentaje: totalGeneral > 0 ? (totalGeneral_31_60 / totalGeneral) : 0, color: "FFFFF59D", criticidad: "Media" },
      { rango: "61-90 días", valor: totalGeneral_61_90, porcentaje: totalGeneral > 0 ? (totalGeneral_61_90 / totalGeneral) : 0, color: "FFFFCC80", criticidad: "Alta" },
      { rango: "91+ días", valor: totalGeneral_91_plus, porcentaje: totalGeneral > 0 ? (totalGeneral_91_plus / totalGeneral) : 0, color: "FFEF9A9A", criticidad: "Crítica" }
    ];
    
    // Encabezados de resumen
    const resumenHeaders = ["Rango", "Monto", "% del Total", "Nivel de Criticidad"];
    const resumenHeaderRow = worksheet.addRow(["", ...resumenHeaders, "", "", "", "", "", ""]);
    resumenHeaderRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 5) {
        cell.font = fonts.header;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorPalette.primary }
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: colorPalette.border } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "thin", color: { argb: colorPalette.border } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
      }
    });
    
    // Datos de resumen
    porcentajes.forEach(item => {
      const rowData = ["", item.rango, item.valor, item.porcentaje, item.criticidad, "", "", "", "", "", ""];
      const row = worksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 5) {
          cell.font = fonts.normal;
          cell.border = {
            top: { style: "thin", color: { argb: colorPalette.border } },
            left: { style: "thin", color: { argb: colorPalette.border } },
            bottom: { style: "thin", color: { argb: colorPalette.border } },
            right: { style: "thin", color: { argb: colorPalette.border } }
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: item.color }
          };
          
          // Formato específico según el tipo de columna
          if (colNumber === 3) {
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else if (colNumber === 4) {
            cell.numFmt = '0.00%';
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNumber === 5) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        }
      });
    });
    
    // Total resumen
    const rowTotalData = ["", "TOTAL", totalGeneral, 1, "", "", "", "", "", "", ""];
    const rowTotal = worksheet.addRow(rowTotalData);
    
    rowTotal.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 5) {
        cell.font = fonts.total;
        cell.border = {
          top: { style: "double", color: { argb: colorPalette.primary } },
          left: { style: "thin", color: { argb: colorPalette.border } },
          bottom: { style: "double", color: { argb: colorPalette.primary } },
          right: { style: "thin", color: { argb: colorPalette.border } }
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorPalette.secondary }
        };
        
        if (colNumber === 3) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: "right", vertical: "middle" };
        } else if (colNumber === 4) {
          cell.numFmt = '0.00%';
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      }
    });

    // Configurar filtros y vistas
    worksheet.autoFilter = {
      from: { row: 4, column: 2 },
      to: { row: 4, column: 11 }
    };
    worksheet.views = [{ state: "frozen", ySplit: 4 }];

    return worksheet;
  };

  return { exportFacturasExcel };
};