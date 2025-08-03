import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cobranza } from '../features/cobranza/types';
import { TipoPago } from '../features/shared/enums';

export const useExportCobranzasExcel = () => {
  const exportCobranzasExcel = async (cobranzas: Cobranza[]): Promise<void> => {
    if (!cobranzas || !Array.isArray(cobranzas) || cobranzas.length === 0) {
      console.error('No hay datos de cobranzas para exportar');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const today = new Date();
      
      // PALETA CORPORATIVA
      const mainColor = 'FF23408E';
      const secondaryColor = 'FF1976D2';
      const accentColor = 'FF64B5F6';
      const headerFontColor = 'FFFFFFFF';
      const borderColor = 'FFB0BEC5';
      const totalColor = 'FFE3F2FD';
      const alternateRowColor = 'FFF5F5F5';

      // --- HOJA 1: COBRANZAS POR BANCO ---
      const bancoWorksheet = workbook.addWorksheet('Cobranzas por Banco', {
        pageSetup: { 
          paperSize: 9, 
          orientation: 'landscape',
          margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
        }
      });
      
      // Definición de columnas - Total Pesos movido a segunda posición
      bancoWorksheet.columns = [
        { key: 'banco', header: 'Banco', width: 20 },
        { key: 'totalPesos', header: 'Total Pesos', width: 18 },
        { key: 'efectivo', header: 'Efectivo', width: 16 },
        { key: 'transferencia', header: 'Transferencia', width: 16 },
        { key: 'cheque', header: 'Cheque', width: 16 },
        { key: 'tarjeta', header: 'Tarjeta', width: 16 },
        { key: 'otro', header: 'Otro', width: 16 },
        { key: 'totalDolares', header: 'Total Dólares', width: 18 },
      ];

      // Título - Filas 1 y 2
      bancoWorksheet.mergeCells('A1:H1');
      bancoWorksheet.getCell('A1').value = 'REPORTE DE COBRANZAS POR BANCO';
      bancoWorksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      bancoWorksheet.getCell('A1').alignment = { horizontal: 'center' };
      bancoWorksheet.getRow(1).height = 28;

      // Fecha de generación
      bancoWorksheet.mergeCells('A2:H2');
      bancoWorksheet.getCell('A2').value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      bancoWorksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 10,
        italic: true,
        color: { argb: secondaryColor }
      };
      bancoWorksheet.getCell('A2').alignment = { horizontal: 'right' };
      bancoWorksheet.getRow(2).height = 20;

      // Fila 3 - Encabezados
      const bancoHeaderRow = bancoWorksheet.addRow([
        'Banco', 'Total Pesos', 'Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Otro', 'Total Dólares'
      ]);

      bancoHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { 
          name: 'Segoe UI', 
          size: 11, 
          bold: true, 
          color: { argb: headerFontColor } 
        };
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: mainColor } 
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
      });
      bancoHeaderRow.height = 22;

      // Agrupar datos por banco
      const bancoData: Record<number, {
        nombre: string;
        totalEfectivo: number;
        totalTransferencia: number;
        totalCheque: number;
        totalTarjeta: number;
        totalOtro: number;
        totalPesos: number;
        totalDolares: number;
      }> = {};

      cobranzas.forEach(cobranza => {
        const bancoId = cobranza.bancoId;
        
        if (!bancoData[bancoId]) {
          bancoData[bancoId] = {
            nombre: cobranza.banco?.nombre || `Banco ID: ${bancoId}`,
            totalEfectivo: 0,
            totalTransferencia: 0,
            totalCheque: 0,
            totalTarjeta: 0,
            totalOtro: 0,
            totalPesos: 0,
            totalDolares: 0
          };
        }
        
        const monto = cobranza.total || 0;
        const montoDolares = cobranza.montoDolares || 0;
        
        bancoData[bancoId].totalPesos += monto;
        bancoData[bancoId].totalDolares += montoDolares;
        
        switch (cobranza.tipoPago) {
          case TipoPago.EFECTIVO:
            bancoData[bancoId].totalEfectivo += monto;
            break;
          case TipoPago.TRANSFERENCIA:
            bancoData[bancoId].totalTransferencia += monto;
            break;
          case TipoPago.CHEQUE:
            bancoData[bancoId].totalCheque += monto;
            break;
          case TipoPago.TARJETA:
            bancoData[bancoId].totalTarjeta += monto;
            break;
          case TipoPago.OTRO:
            bancoData[bancoId].totalOtro += monto;
            break;
        }
      });

      let totalGenEfectivo = 0;
      let totalGenTransferencia = 0;
      let totalGenCheque = 0;
      let totalGenTarjeta = 0;
      let totalGenOtro = 0;
      let totalGenPesos = 0;
      let totalGenDolares = 0;

      // Agregar filas de datos - a partir de la fila 4
      Object.values(bancoData).forEach((banco, index) => {
        // Orden actualizado con Total Pesos en segunda posición
        const row = bancoWorksheet.addRow({
          banco: banco.nombre,
          totalPesos: banco.totalPesos,
          efectivo: banco.totalEfectivo,
          transferencia: banco.totalTransferencia,
          cheque: banco.totalCheque,
          tarjeta: banco.totalTarjeta,
          otro: banco.totalOtro,
          totalDolares: banco.totalDolares
        });
        
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          
          // Colorear filas alternas
          if (index % 2 !== 0) {
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: alternateRowColor } 
            };
          }
          
          // Formato de moneda para columnas de montos
          if (colNumber > 1) {
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: 'right' };
          }
        });
        
        // Acumular totales generales
        totalGenEfectivo += banco.totalEfectivo;
        totalGenTransferencia += banco.totalTransferencia;
        totalGenCheque += banco.totalCheque;
        totalGenTarjeta += banco.totalTarjeta;
        totalGenOtro += banco.totalOtro;
        totalGenPesos += banco.totalPesos;
        totalGenDolares += banco.totalDolares;
      });

      // Configurar el filtrado automático - aplicarlo a la fila de encabezados
      if (Object.keys(bancoData).length > 0) {
        bancoWorksheet.autoFilter = {
          from: { row: 3, column: 1 },
          to: { row: 3, column: 8 }
        };
      }

      // Fila de totales - Orden actualizado
      const totalBancoRow = bancoWorksheet.addRow({
        banco: 'TOTAL GENERAL',
        totalPesos: totalGenPesos,
        efectivo: totalGenEfectivo,
        transferencia: totalGenTransferencia,
        cheque: totalGenCheque,
        tarjeta: totalGenTarjeta,
        otro: totalGenOtro,
        totalDolares: totalGenDolares
      });

      totalBancoRow.eachCell((cell, colNumber) => {
        cell.font = { 
          name: 'Segoe UI', 
          size: 10, 
          bold: true,
          color: { argb: mainColor }
        };
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: totalColor } 
        };
        cell.border = {
          top: { style: 'medium', color: { argb: mainColor } },
          bottom: { style: 'medium', color: { argb: mainColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        
        if (colNumber > 1) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }
      });
      totalBancoRow.height = 22;

      // --- HOJA 2: COBRANZAS POR DÍA ---
      const diaWorksheet = workbook.addWorksheet('Cobranzas por Día', {
        pageSetup: { 
          paperSize: 9, 
          orientation: 'landscape',
          margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
        }
      });
      
      // Definición de columnas - Total Pesos movido a segunda posición
      diaWorksheet.columns = [
        { key: 'fecha', header: 'Fecha', width: 16 },
        { key: 'totalPesos', header: 'Total Pesos', width: 18 },
        { key: 'efectivo', header: 'Efectivo', width: 16 },
        { key: 'transferencia', header: 'Transferencia', width: 16 },
        { key: 'cheque', header: 'Cheque', width: 16 },
        { key: 'tarjeta', header: 'Tarjeta', width: 16 },
        { key: 'otro', header: 'Otro', width: 16 },
        { key: 'totalDolares', header: 'Total Dólares', width: 18 },
        { key: 'operaciones', header: 'Operaciones', width: 14 },
      ];

      // Título
      diaWorksheet.mergeCells('A1:I1');
      diaWorksheet.getCell('A1').value = 'REPORTE DE COBRANZAS POR DÍA';
      diaWorksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      diaWorksheet.getCell('A1').alignment = { horizontal: 'center' };
      diaWorksheet.getRow(1).height = 28;

      // Fecha de generación
      diaWorksheet.mergeCells('A2:I2');
      diaWorksheet.getCell('A2').value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      diaWorksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 10,
        italic: true,
        color: { argb: secondaryColor }
      };
      diaWorksheet.getCell('A2').alignment = { horizontal: 'right' };
      diaWorksheet.getRow(2).height = 20;

      // Encabezados - Fila 3
      const diaHeaderRow = diaWorksheet.addRow([
        'Fecha', 'Total Pesos', 'Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Otro', 'Total Dólares', 'Operaciones'
      ]);

      diaHeaderRow.eachCell(cell => {
        cell.font = { 
          name: 'Segoe UI', 
          size: 11, 
          bold: true, 
          color: { argb: headerFontColor } 
        };
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: mainColor } 
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
      });
      diaHeaderRow.height = 22;

      // Agrupar datos por día
      const diaData: Record<string, {
        fecha: Date;
        totalEfectivo: number;
        totalTransferencia: number;
        totalCheque: number;
        totalTarjeta: number;
        totalOtro: number;
        totalPesos: number;
        totalDolares: number;
        operaciones: number;
      }> = {};

      cobranzas.forEach(cobranza => {
        const fechaPago = new Date(cobranza.fechaPago);
        const fechaStr = format(fechaPago, 'yyyy-MM-dd');
        
        if (!diaData[fechaStr]) {
          diaData[fechaStr] = {
            fecha: fechaPago,
            totalEfectivo: 0,
            totalTransferencia: 0,
            totalCheque: 0,
            totalTarjeta: 0,
            totalOtro: 0,
            totalPesos: 0,
            totalDolares: 0,
            operaciones: 0
          };
        }
        
        const monto = cobranza.total || 0;
        const montoDolares = cobranza.montoDolares || 0;
        
        diaData[fechaStr].totalPesos += monto;
        diaData[fechaStr].totalDolares += montoDolares;
        diaData[fechaStr].operaciones += 1;
        
        switch (cobranza.tipoPago) {
          case TipoPago.EFECTIVO:
            diaData[fechaStr].totalEfectivo += monto;
            break;
          case TipoPago.TRANSFERENCIA:
            diaData[fechaStr].totalTransferencia += monto;
            break;
          case TipoPago.CHEQUE:
            diaData[fechaStr].totalCheque += monto;
            break;
          case TipoPago.TARJETA:
            diaData[fechaStr].totalTarjeta += monto;
            break;
          case TipoPago.OTRO:
            diaData[fechaStr].totalOtro += monto;
            break;
        }
      });

      // Ordenar los datos por fecha (más reciente primero)
      const diasOrdenados = Object.values(diaData).sort((a, b) => 
        b.fecha.getTime() - a.fecha.getTime()
      );

      // Agregar filas de datos - a partir de la fila 4
      let totalGenDiaEfectivo = 0;
      let totalGenDiaTransferencia = 0;
      let totalGenDiaCheque = 0;
      let totalGenDiaTarjeta = 0;
      let totalGenDiaOtro = 0;
      let totalGenDiaPesos = 0;
      let totalGenDiaDolares = 0;
      let totalGenDiaOperaciones = 0;

      diasOrdenados.forEach((dia, index) => {
        // Formatear fecha como cadena para evitar problemas
        const fechaStr = format(dia.fecha, 'dd/MM/yyyy');
        
        // Orden actualizado con Total Pesos en segunda posición
        const row = diaWorksheet.addRow({
          fecha: fechaStr,
          totalPesos: dia.totalPesos,
          efectivo: dia.totalEfectivo,
          transferencia: dia.totalTransferencia,
          cheque: dia.totalCheque,
          tarjeta: dia.totalTarjeta,
          otro: dia.totalOtro,
          totalDolares: dia.totalDolares,
          operaciones: dia.operaciones
        });
        
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          
          // Colorear filas alternas
          if (index % 2 !== 0) {
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: alternateRowColor } 
            };
          }
          
          // Formato para cada tipo de columna
          if (colNumber === 1) { // Fecha
            cell.alignment = { horizontal: 'center' };
          } else if (colNumber > 1 && colNumber < 9) { // Montos
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: 'right' };
          } else if (colNumber === 9) { // Operaciones
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center' };
          }
        });
        
        // Acumular totales generales
        totalGenDiaEfectivo += dia.totalEfectivo;
        totalGenDiaTransferencia += dia.totalTransferencia;
        totalGenDiaCheque += dia.totalCheque;
        totalGenDiaTarjeta += dia.totalTarjeta;
        totalGenDiaOtro += dia.totalOtro;
        totalGenDiaPesos += dia.totalPesos;
        totalGenDiaDolares += dia.totalDolares;
        totalGenDiaOperaciones += dia.operaciones;
      });

      // Configurar el filtrado automático - aplicarlo a la fila de encabezados
      if (diasOrdenados.length > 0) {
        diaWorksheet.autoFilter = {
          from: { row: 3, column: 1 },
          to: { row: 3, column: 9 }
        };
      }

      // Fila de totales - Orden actualizado
      const totalDiaRow = diaWorksheet.addRow({
        fecha: 'TOTAL GENERAL',
        totalPesos: totalGenDiaPesos,
        efectivo: totalGenDiaEfectivo,
        transferencia: totalGenDiaTransferencia,
        cheque: totalGenDiaCheque,
        tarjeta: totalGenDiaTarjeta,
        otro: totalGenDiaOtro,
        totalDolares: totalGenDiaDolares,
        operaciones: totalGenDiaOperaciones
      });

      totalDiaRow.eachCell((cell, colNumber) => {
        cell.font = { 
          name: 'Segoe UI', 
          size: 10, 
          bold: true,
          color: { argb: mainColor }
        };
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: totalColor } 
        };
        cell.border = {
          top: { style: 'medium', color: { argb: mainColor } },
          bottom: { style: 'medium', color: { argb: mainColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        
        if (colNumber > 1 && colNumber < 9) {
          cell.numFmt = '"$"#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }
        
        if (colNumber === 1) {
          cell.alignment = { horizontal: 'center' };
        }
        
        if (colNumber === 9) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center' };
        }
      });
      totalDiaRow.height = 22;

      // --- HOJA 3: DETALLE DE COBRANZAS ---
      const detalleWorksheet = workbook.addWorksheet('Detalle Cobranzas', {
        pageSetup: { 
          paperSize: 9, 
          orientation: 'landscape',
          margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
        }
      });
      
      // Título
      detalleWorksheet.mergeCells('A1:J1');
      detalleWorksheet.getCell('A1').value = 'DETALLE DE COBRANZAS';
      detalleWorksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      detalleWorksheet.getCell('A1').alignment = { horizontal: 'center' };
      detalleWorksheet.getRow(1).height = 28;

      // Fecha de generación
      detalleWorksheet.mergeCells('A2:J2');
      detalleWorksheet.getCell('A2').value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      detalleWorksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 10,
        italic: true,
        color: { argb: secondaryColor }
      };
      detalleWorksheet.getCell('A2').alignment = { horizontal: 'right' };
      detalleWorksheet.getRow(2).height = 20;

      // Definición de columnas
      detalleWorksheet.columns = [
        { key: 'fecha', header: 'Fecha Pago', width: 14 },
        { key: 'noFactura', header: 'No. Factura', width: 14 },
        { key: 'noCliente', header: 'No. Cliente', width: 12 },
        { key: 'cliente', header: 'Cliente', width: 24 },
        { key: 'banco', header: 'Banco', width: 18 },
        { key: 'tipoPago', header: 'Tipo Pago', width: 14 },
        { key: 'referencia', header: 'Referencia', width: 18 },
        { key: 'total', header: 'Total Pesos', width: 16 },
        { key: 'totalDolares', header: 'Total Dólares', width: 16 },
        { key: 'sucursal', header: 'Sucursal', width: 14 },
      ];

      // Encabezados - Fila 3
      const detalleHeaderRow = detalleWorksheet.addRow([
        'Fecha Pago', 'No. Factura', 'No. Cliente', 'Cliente', 
        'Banco', 'Tipo Pago', 'Referencia', 'Total Pesos', 
        'Total Dólares', 'Sucursal'
      ]);

      detalleHeaderRow.eachCell(cell => {
        cell.font = { 
          name: 'Segoe UI', 
          size: 11, 
          bold: true, 
          color: { argb: headerFontColor } 
        };
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: mainColor } 
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true 
        };
        cell.border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
      });
      detalleHeaderRow.height = 22;

      // Agregar todas las cobranzas individuales
      cobranzas.forEach((cobranza, index) => {
        const fechaPagoStr = format(new Date(cobranza.fechaPago), 'dd/MM/yyyy');
        
        const row = detalleWorksheet.addRow({
          fecha: fechaPagoStr,
          noFactura: cobranza.noFactura,
          noCliente: cobranza.noCliente,
          cliente: cobranza.razonSocial || cobranza.cliente?.razonSocial || '',
          banco: cobranza.banco?.nombre || `Banco ID: ${cobranza.bancoId}`,
          tipoPago: cobranza.tipoPago,
          referencia: cobranza.referenciaPago || '',
          total: cobranza.total || 0,
          totalDolares: cobranza.montoDolares || 0,
          sucursal: cobranza.sucursal || ''
        });

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          
          // Colorear filas alternas
          if (index % 2 !== 0) {
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: alternateRowColor } 
            };
          }
          
          // Aplicar formatos específicos según el tipo de columna
          switch (colNumber) {
            case 1: // Fecha
              cell.alignment = { horizontal: 'center' };
              break;
            case 2: // No. Factura
            case 3: // No. Cliente
              cell.alignment = { horizontal: 'center' };
              break;
            case 8: // Total Pesos
            case 9: // Total Dólares
              cell.numFmt = '"$"#,##0.00';
              cell.alignment = { horizontal: 'right' };
              break;
            case 6: // Tipo Pago
            case 10: // Sucursal
              cell.alignment = { horizontal: 'center' };
              break;
            default:
              cell.alignment = { vertical: 'middle' };
          }
        });
      });

      // Configurar el filtrado automático - aplicarlo a la fila de encabezados
      if (cobranzas.length > 0) {
        detalleWorksheet.autoFilter = {
          from: { row: 3, column: 1 },
          to: { row: 3, column: 10 }
        };
      }

      // Configurar vistas con filas congeladas en la fila de encabezados
      bancoWorksheet.views = [{ state: 'frozen', ySplit: 3 }];
      diaWorksheet.views = [{ state: 'frozen', ySplit: 3 }];
      detalleWorksheet.views = [{ state: 'frozen', ySplit: 3 }];

      // Guardar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Reporte_Cobranzas_${format(today, 'yyyyMMdd_HHmmss')}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), fileName);

      console.log('Reporte de cobranzas exportado:', fileName);
    } catch (error) {
      console.error('Error al exportar reporte de cobranzas:', error);
    }
  };

  return { exportCobranzasExcel };
};