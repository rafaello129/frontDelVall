import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cliente } from '../features/cliente/types';

export const useExportCarteraClienteExcel = () => {
  const exportCarteraClienteExcel = async (
    cliente: Cliente,
    facturas: any[]
  ): Promise<void> => {
    if (!cliente || !facturas || !Array.isArray(facturas) || facturas.length === 0) {
      console.error('Datos insuficientes para exportar');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const today = new Date();
      
      // PALETA CORPORATIVA
      const mainColor = 'FF23408E';
      const secondaryColor = 'FF1976D2';
      const headerFontColor = 'FFFFFFFF';
      const borderColor = 'FFB0BEC5';
      const vencidaRowColor = 'FFFFCDD2';
      const pendienteRowColor = 'FFFFF9C4';
      const totalColor = 'FFE3F2FD';


      // --- HOJA 1: DATOS DEL CLIENTE ---
      const clienteWorksheet = workbook.addWorksheet('Datos Cliente');
      
      // Configuración de página
      clienteWorksheet.pageSetup = { 
        paperSize: 9,
        orientation: 'portrait',
        margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
      };

      // Título
      clienteWorksheet.mergeCells('A1:B1');
      clienteWorksheet.getCell('A1').value = 'DATOS DEL CLIENTE';
      clienteWorksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      clienteWorksheet.getCell('A1').alignment = { horizontal: 'center' };
      clienteWorksheet.getRow(1).height = 28;

      // Fecha de generación
      clienteWorksheet.mergeCells('A2:B2');
      clienteWorksheet.getCell('A2').value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      clienteWorksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 10,
        italic: true,
        color: { argb: secondaryColor }
      };
      clienteWorksheet.getCell('A2').alignment = { horizontal: 'right' };
      clienteWorksheet.getRow(2).height = 20;

      // Datos del cliente
      const clienteFields = [
        { label: 'No. Cliente', value: cliente.noCliente },
        { label: 'Razón Social', value: cliente.razonSocial },
        { label: 'Nombre Comercial', value: cliente.comercial || 'N/A' },
        { label: 'RFC', value: cliente.rfc || 'N/A' },
        { label: 'Días Crédito', value: cliente.diasCredito },
        { label: 'Clasificación', value: cliente.clasificacion || 'N/A' },
        { label: 'Sucursal', value: cliente.sucursal || 'N/A' },
        { label: 'Estado', value: cliente.status },
        { label: 'Correos', value: cliente.correos?.map(c => c.correo).join(', ') || 'N/A' },
        { label: 'Teléfonos', value: cliente.telefonos?.map(t => t.telefono).join(', ') || 'N/A' },
        { label: 'Total Facturas', value: cliente.totalFacturas || 0 },
        { label: 'Saldo Total', value: cliente.saldoTotal ? `$${cliente.saldoTotal.toLocaleString('es-MX')}` : '$0.00' },
      ];

      // Agregar datos
      clienteFields.forEach((field, index) => {
        const row = 4 + index;
        
        // Etiqueta
        clienteWorksheet.getCell(`A${row}`).value = field.label;
        clienteWorksheet.getCell(`A${row}`).font = {
          name: 'Segoe UI',
          size: 11,
          bold: true,
          color: { argb: mainColor }
        };
        clienteWorksheet.getCell(`A${row}`).alignment = { vertical: 'middle' };
        clienteWorksheet.getCell(`A${row}`).border = {
          bottom: { style: 'thin', color: { argb: borderColor } }
        };
        
        // Valor
        clienteWorksheet.getCell(`B${row}`).value = field.value;
        clienteWorksheet.getCell(`B${row}`).font = {
          name: 'Segoe UI',
          size: 11,
          color: { argb: 'FF333333' }
        };
        clienteWorksheet.getCell(`B${row}`).alignment = { vertical: 'middle' };
        clienteWorksheet.getCell(`B${row}`).border = {
          bottom: { style: 'thin', color: { argb: borderColor } }
        };
      });

      // Ajustar anchos
      clienteWorksheet.columns = [
        { key: 'label', width: 22 },
        { key: 'value', width: 38 }
      ];
      // --- HOJA 2: FACTURAS PENDIENTES ---
      const facturasWorksheet = workbook.addWorksheet('Facturas Pendientes', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
      });

      // 1. DEFINIR COLUMNAS PRIMERO
      facturasWorksheet.columns = [
        { key: 'factura', header: 'Factura', width: 16 },
        { key: 'emision', header: 'Emisión', width: 14 },
        { key: 'vencimiento', header: 'Vencimiento', width: 14 },
        { key: 'estado', header: 'Estado', width: 14 },
        { key: 'diasRestantes', header: 'Días Restantes', width: 22 },
        { key: 'saldo', header: 'Saldo', width: 16 },
        { key: 'montoTotal', header: 'Monto Total', width: 16 },
        { key: 'concepto', header: 'Concepto', width: 40 }
      ];

      // Título
      facturasWorksheet.mergeCells('A1:H1');
      facturasWorksheet.getCell('A1').value = `FACTURAS PENDIENTES - ${cliente.razonSocial}`;
      facturasWorksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      facturasWorksheet.getCell('A1').alignment = { horizontal: 'center' };
      facturasWorksheet.getRow(1).height = 28;

      // Fecha de generación
      facturasWorksheet.mergeCells('A2:H2');
      facturasWorksheet.getCell('A2').value = `Generado: ${format(today, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      facturasWorksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 10,
        italic: true,
        color: { argb: secondaryColor }
      };
      facturasWorksheet.getCell('A2').alignment = { horizontal: 'right' };
      facturasWorksheet.getRow(2).height = 20;

      // Encabezados
      const headerRow = facturasWorksheet.addRow([
        'Factura', 'Emisión', 'Vencimiento', 'Estado', 
        'Días Restantes', 'Saldo', 'Monto Total', 'Concepto'
      ]);
      
      headerRow.eachCell(cell => {
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
      headerRow.height = 22;

      // Agregar facturas
      facturas.forEach((f) => {
        const fechaVenc = new Date(f.fechaVencimiento);
        const diasRestantes = differenceInCalendarDays(fechaVenc, today);
        const isVencida = diasRestantes < 0;
        
        // 2. USAR LAS KEYS DEFINIDAS
        const row = facturasWorksheet.addRow({
          factura: f.noFactura,
          emision: format(new Date(f.emision), 'dd/MM/yyyy'),
          vencimiento: format(fechaVenc, 'dd/MM/yyyy'),
          estado: f.estado,
          diasRestantes: isVencida ? `Vencida hace ${Math.abs(diasRestantes)} días` : diasRestantes,
          saldo: f.saldo,
          montoTotal: f.montoTotal,
          concepto: f.concepto
        });
        
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10 };
          cell.border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
          
          if (f.estado === 'Vencida') {
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: vencidaRowColor } 
            };
          } else if (f.estado === 'Pendiente') {
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: pendienteRowColor } 
            };
          }
          
          if (colNumber === 6 || colNumber === 7) { // Saldo y Monto Total
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: 'right' };
          }
          
          if (colNumber >= 2 && colNumber <= 4) { // Columnas de fechas y estado
            cell.alignment = { horizontal: 'center' };
          }
        });
        row.height = 20;
      });

      // Totales
      const totalSaldo = facturas.reduce((sum, f) => sum + (f.saldo || 0), 0);
      const totalMonto = facturas.reduce((sum, f) => sum + (f.montoTotal || 0), 0);
      
      const totalRow = facturasWorksheet.addRow({
        estado: 'TOTALES:',
        saldo: totalSaldo,
        montoTotal: totalMonto
      });
      
      totalRow.getCell(4).font = { bold: true, color: { argb: mainColor } };
      totalRow.getCell(6).font = { bold: true };
      totalRow.getCell(7).font = { bold: true };
      totalRow.getCell(6).numFmt = '"$"#,##0.00';
      totalRow.getCell(7).numFmt = '"$"#,##0.00';
      
      totalRow.eachCell(cell => {
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: totalColor } 
        };
        cell.border = {
          top: { style: 'medium', color: { argb: mainColor } },
          bottom: { style: 'medium', color: { argb: mainColor } }
        };
      });
      totalRow.height = 22;

      // Autofiltro
      facturasWorksheet.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: 8 }
      };

      facturasWorksheet.views = [{ state: 'frozen', ySplit: 3 }];

      // Guardar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Cartera_Cliente_${cliente.noCliente}_${format(today, 'yyyyMMdd_HHmmss')}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), fileName);

      console.log('Cartera exportada:', fileName);
    } catch (error) {
      console.error('Error al exportar cartera del cliente:', error);
    }
  };

  return { exportCarteraClienteExcel };
};