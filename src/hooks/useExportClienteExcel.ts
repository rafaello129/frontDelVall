import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cliente } from '../features/cliente/types';

// Tipos para Cliente
export interface CorreoCliente {
  correo: string;
  principal?: boolean;
}
export interface TelefonoCliente {
  telefono: string;
  principal?: boolean;
}
export interface ClienteResponseDto {
  noCliente: number;
  razonSocial: string;
  comercial: string;
  diasCredito: number;
  sucursal: string;
  status: string;
  clasificacion: string;
  correos?: CorreoCliente[];
  telefonos?: TelefonoCliente[];
  totalFacturas?: number;
  saldoTotal?: number;
}

/**
 * Exporta a Excel una lista de clientes con formato y estilos profesionales.
 */
export const useExportClientesExcel = () => {
  const exportClientesExcel = async (clientes: Cliente[]): Promise<void> => {
    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
      console.error('No hay clientes para exportar');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Clientes', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
      });

      // PALETA CORPORATIVA
      const mainColor = 'FF23408E'; // Azul corporativo
      const secondaryColor = 'FF1976D2'; // Azul secundario
      const accentColor = 'FF64B5F6'; // Azul claro
      const headerFontColor = 'FFFFFFFF';
      const borderColor = 'FFB0BEC5';
      const zebraRowColor = 'FFF6F8FC';
      const inactivoRowColor = 'FFFFE0E0'; // Rojo claro para inactivos
      const totalColor = 'FFE3F2FD';

      // Definir columnas
      worksheet.columns = [
        { header: 'No. Cliente', key: 'noCliente', width: 15 },
        { header: 'Razón Social', key: 'razonSocial', width: 38 },
        { header: 'Comercial', key: 'comercial', width: 32 },
        { header: 'Días Crédito', key: 'diasCredito', width: 14 },
        { header: 'Sucursal', key: 'sucursal', width: 20 },
        { header: 'Status', key: 'status', width: 13 },
        { header: 'Clasificación', key: 'clasificacion', width: 16 },
        { header: 'Correos', key: 'correos', width: 38 },
        { header: 'Teléfonos', key: 'telefonos', width: 28 },
        { header: 'Total Facturas', key: 'totalFacturas', width: 15 },
        { header: 'Saldo Total', key: 'saldoTotal', width: 18 },
      ];

      // LOGO Y TÍTULO
      worksheet.mergeCells('A1:K1');
      worksheet.getCell('A1').value = 'LISTADO DE CLIENTES';
      worksheet.getCell('A1').font = {
        name: 'Segoe UI',
        size: 18,
        bold: true,
        color: { argb: mainColor }
      };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: accentColor }
      };
      worksheet.getRow(1).height = 36;

      // Fecha de generación
      worksheet.mergeCells('A2:K2');
      worksheet.getCell('A2').value = `Generado: ${format(new Date(), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`;
      worksheet.getCell('A2').font = {
        name: 'Segoe UI',
        size: 11,
        italic: true,
        color: { argb: secondaryColor }
      };
      worksheet.getCell('A2').alignment = { horizontal: 'right', vertical: 'middle' };
      worksheet.getRow(2).height = 20;

      // Línea decorativa
      worksheet.mergeCells('A3:K3');
      worksheet.getCell('A3').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: mainColor }
      };
      worksheet.getRow(3).height = 6;

      // Encabezados
      const headerRow = worksheet.addRow([
        'No. Cliente',
        'Razón Social',
        'Comercial',
        'Días Crédito',
        'Sucursal',
        'Status',
        'Clasificación',
        'Correos',
        'Teléfonos',
        'Total Facturas',
        'Saldo Total'
      ]);
      headerRow.eachCell(cell => {
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: headerFontColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: mainColor } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
      });
      headerRow.height = 22;

      // Agregar filas de clientes, zebra striping y color para inactivos
      clientes.forEach((c, i) => {
        const row = worksheet.addRow({
          noCliente: c.noCliente,
          razonSocial: c.razonSocial,
          comercial: c.comercial,
          diasCredito: c.diasCredito,
          sucursal: c.sucursal,
          status: c.status,
          clasificacion: c.clasificacion,
          correos: c.correos?.map(cor => cor.correo).join('; ') ?? '',
          telefonos: c.telefonos?.map(tel => tel.telefono).join('; ') ?? '',
          totalFacturas: c.totalFacturas ?? '',
          saldoTotal: c.saldoTotal ?? ''
        });
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF222222' } };
          cell.border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
          // Zebra striping
          if (c.status === "Inactivo") {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: inactivoRowColor } };
          } else if (i % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraRowColor } };
          }
          // Números
          if (colNumber === 11) { // saldo total
            cell.numFmt = '"$"#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          }
          if (colNumber === 10) { // total facturas
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (colNumber === 4) { // días crédito
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
        row.height = 20;
      });

      // TOTAL GENERAL si hay saldoTotal
      if (clientes.some(c => typeof c.saldoTotal === 'number')) {
        const totalSaldo = clientes.reduce((acc, c) => acc + (c.saldoTotal || 0), 0);
        const totalRow = worksheet.addRow([
          '', '', '', '', '', '', '', '', 'TOTAL GENERAL:', '', totalSaldo
        ]);
        totalRow.getCell(9).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: mainColor } };
        totalRow.getCell(9).alignment = { horizontal: 'right' };
        totalRow.getCell(11).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: secondaryColor } };
        totalRow.getCell(11).numFmt = '"$"#,##0.00';
        totalRow.getCell(11).alignment = { horizontal: 'right' };
        totalRow.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: totalColor } };
          cell.border = {
            top: { style: 'medium', color: { argb: mainColor } },
            bottom: { style: 'medium', color: { argb: mainColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
        });
        totalRow.height = 22;
      }

      // Autofiltro en encabezados
      worksheet.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4, column: 11 }
      };

      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      // Ajuste de altura a todas las filas
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 4) row.height = 20;
      });

      // Guardar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Listado_Clientes_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      FileSaver.saveAs(new Blob([buffer]), fileName);

      console.log('Excel exportado:', fileName);
    } catch (error) {
      console.error('Error al exportar clientes a Excel:', error);
    }
  };

  return { exportClientesExcel };
};