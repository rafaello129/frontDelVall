import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ProyeccionPago, EstadoProyeccion } from '../features/proyeccion/types';

// Interface for client projections in the calendar
interface ClienteProyecciones {
  noCliente: number;
  nombreCliente: string;
  proyecciones: ProyeccionPago[];
}

export const useExportProyeccionesExcel = () => {
  const exportCalendarioProyecciones = async (
    fechas: Date[],
    clientesProyecciones: ClienteProyecciones[],
    totalesPorFecha: Record<string, number>,
    totalesPorCliente: Record<number, number>,
    totalGeneral: number
  ): Promise<void> => {
    try {
      const workbook = new ExcelJS.Workbook();
      const currentDate = new Date();
      const fileName = `Calendario_Proyecciones_${format(currentDate, 'yyyyMMdd_HHmmss')}.xlsx`;
      
      // PALETA CORPORATIVA
      const mainColor = 'FF0C527F'; // Azul corporativo
      const headerFontColor = 'FFFFFFFF'; // Blanco
      const borderColor = 'FFB0BEC5'; // Gris claro
      const totalColor = 'FFE3F2FD'; // Azul muy claro
      const alternateRowColor = 'FFF5F5F5'; // Gris casi blanco
      const pendienteColor = 'FF64B5F6'; // Azul claro
      const cumplidaColor = 'FF81C784'; // Verde claro
      const vencidaColor = 'FFFF8A65'; // Naranja rojizo claro
      const canceladaColor = 'FFBDBDBD'; // Gris

      // Crear hoja de trabajo
      const worksheet = workbook.addWorksheet('Calendario de Proyecciones', {
        pageSetup: {
          paperSize: 9,
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.7,
            right: 0.7,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3
          }
        }
      });

      // Configurar columnas
      const columns: Partial<ExcelJS.Column>[] = [
      ];

      // Agregar una columna para cada fecha
      fechas.forEach(fecha => {
        columns.push({
        });
      });

      // Columna para el total
      columns.push({  });
      
      worksheet.columns = columns;

      // Cargar logo - SOLUCIÓN PARA NAVEGADOR
      try {
        // En ambiente de navegador, necesitamos cargar la imagen como una URL
        // y convertirla a base64 o usar una imagen ya en base64
        const logoUrl = '/logo.png'; // URL relativa al logo en carpeta public
        
        // Intentar cargar el logo mediante fetch
        const response = await fetch(logoUrl);
        if (response.ok) {
          // Convertir la respuesta a un ArrayBuffer
          const imageArrayBuffer = await response.arrayBuffer();
          
          // Agregar la imagen desde el ArrayBuffer
          const logoId = workbook.addImage({
            buffer: imageArrayBuffer,
            extension: 'png',
          });
          
          // Insertar logo en la esquina superior izquierda
          worksheet.addImage(logoId, {
            tl: { col: 0, row: 0 },
            ext: { width: 180, height: 60 }
          });
        } else {
          console.warn('No se pudo cargar el logo: respuesta HTTP no ok');
        }
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
        // Continuar sin logo si hay error
      }

      // Título y encabezados
      const titleRow = worksheet.addRow(['']);
      titleRow.height = 60; // Espacio para el logo

      const fechaGeneracionRow = worksheet.addRow([`Generado: ${format(currentDate, "dd 'de' MMMM yyyy, HH:mm", { locale: es })}`]);
      fechaGeneracionRow.getCell(1).font = {
        name: 'Arial',
        size: 10,
        italic: true,
        color: { argb: 'FF666666' }
      };
      fechaGeneracionRow.height = 20;
      
      const titleTextRow = worksheet.addRow(['CALENDARIO DE PROYECCIONES']);
      titleTextRow.getCell(1).font = {
        name: 'Arial',
        size: 16,
        bold: true,
        color: { argb: mainColor }
      };
      titleTextRow.height = 30;
      
      // Combinar celdas para el título
      worksheet.mergeCells(`A3:${String.fromCharCode(65 + columns.length - 1)}3`);
      worksheet.getCell('A3').alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      // Fila de subtítulo: rango de fechas
      const subtitleRow = worksheet.addRow(['']);
      if (fechas.length > 0) {
        const firstDate = format(fechas[0], "dd 'de' MMMM", { locale: es });
        const lastDate = format(fechas[fechas.length - 1], "dd 'de' MMMM 'de' yyyy", { locale: es });
        subtitleRow.getCell(1).value = `Periodo: ${firstDate} al ${lastDate}`;
      }
      subtitleRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        bold: true
      };
      worksheet.mergeCells(`A4:${String.fromCharCode(65 + columns.length - 1)}4`);
      worksheet.getCell('A4').alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      subtitleRow.height = 20;

      // Espacio antes de los encabezados
      worksheet.addRow(['']);
      
      // Fila de encabezados - primera celda es "Cliente"
      const headerRow = worksheet.addRow(['Cliente']);
      headerRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: mainColor }
      };
      headerRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: headerFontColor }
      };
      headerRow.getCell(1).border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      headerRow.getCell(1).alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };

      // Agregar encabezados de fechas
      fechas.forEach((fecha, index) => {
        const dayName = format(fecha, 'EEEE', { locale: es });
        const dateStr = format(fecha, 'dd/MM/yyyy');
        
        // Mostrar día de la semana y fecha
        headerRow.getCell(index + 2).value = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}\n${dateStr}`;
        headerRow.getCell(index + 2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: mainColor }
        };
        headerRow.getCell(index + 2).font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: { argb: headerFontColor }
        };
        headerRow.getCell(index + 2).border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        headerRow.getCell(index + 2).alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
      });
    // Ajustar el ancho de las columnas
    worksheet.getColumn(1).width = 20; // Ancho para la columna "Cliente"
    for (let i = 2; i <= columns.length; i++) {
        worksheet.getColumn(i).width = 15; // Ancho para las columnas de fechas
    }

      // Encabezado de Total
      const lastCell = headerRow.getCell(columns.length);
      lastCell.value = 'TOTAL';
      lastCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: mainColor }
      };
      lastCell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: headerFontColor }
      };
      lastCell.border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      lastCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      
      headerRow.height = 30; // Altura para los encabezados
      
      // Datos de clientes y proyecciones
      clientesProyecciones.forEach((cliente, clienteIndex) => {
        const dataRow = worksheet.addRow(['']);
        
        // Nombre del cliente
        dataRow.getCell(1).value = cliente.nombreCliente;
        dataRow.getCell(1).font = {
          name: 'Arial',
          size: 10,
          bold: true
        };
        dataRow.getCell(1).border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        
        // Colorear filas alternas
        if (clienteIndex % 2 !== 0) {
          for (let i = 1; i <= columns.length; i++) {
            dataRow.getCell(i).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: alternateRowColor }
            };
          }
        }
        
        // Datos de proyecciones por fecha
        fechas.forEach((fecha, fechaIndex) => {
          // Buscar proyección para este cliente y esta fecha
          const proyeccion = cliente.proyecciones.find(p => {
            const fechaProyectada = new Date(p.fechaProyectada);
            return fechaProyectada.getDate() === fecha.getDate() &&
                   fechaProyectada.getMonth() === fecha.getMonth() &&
                   fechaProyectada.getFullYear() === fecha.getFullYear();
          });
          
          const cellIndex = fechaIndex + 2;
          
          if (proyeccion) {
            // Texto a mostrar: monto y estado
            dataRow.getCell(cellIndex).value = {
              richText: [
                {
                  text: `$${proyeccion.monto.toLocaleString('es-MX')}\n`,
                  font: { bold: true, size: 10 }
                },
                {
                  text: proyeccion.estado,
                  font: { size: 9, italic: true }
                }
              ]
            };
            
            // Color de fondo según estado
            let cellColor;
            switch (proyeccion.estado) {
              case EstadoProyeccion.PENDIENTE:
                cellColor = pendienteColor;
                break;
              case EstadoProyeccion.CUMPLIDA:
                cellColor = cumplidaColor;
                break;
              case EstadoProyeccion.VENCIDA:
                cellColor = vencidaColor;
                break;
              case EstadoProyeccion.CANCELADA:
                cellColor = canceladaColor;
                break;
              default:
                cellColor = pendienteColor;
            }
            
            dataRow.getCell(cellIndex).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: cellColor }
            };
          } else {
            // Celda vacía si no hay proyección
            dataRow.getCell(cellIndex).value = '-';
            dataRow.getCell(cellIndex).alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
          }
          
          // Bordes para todas las celdas
          dataRow.getCell(cellIndex).border = {
            top: { style: 'thin', color: { argb: borderColor } },
            left: { style: 'thin', color: { argb: borderColor } },
            bottom: { style: 'thin', color: { argb: borderColor } },
            right: { style: 'thin', color: { argb: borderColor } }
          };
          
          // Alineación para celdas con proyección
          if (proyeccion) {
            dataRow.getCell(cellIndex).alignment = {
              horizontal: 'center',
              vertical: 'middle',
              wrapText: true
            };
          }
        });
        
        // Total del cliente
        const totalClienteCell = dataRow.getCell(columns.length);
        totalClienteCell.value = totalesPorCliente[cliente.noCliente] || 0;
        totalClienteCell.numFmt = '"$"#,##0.00';
        totalClienteCell.font = {
          name: 'Arial',
          size: 10,
          bold: true
        };
        totalClienteCell.alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
        totalClienteCell.border = {
          top: { style: 'thin', color: { argb: borderColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'thin', color: { argb: borderColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        
        dataRow.height = 30; // Altura fija para todas las filas de datos
      });
      
      // Fila de totales por fecha
      const totalRow = worksheet.addRow(['Total del Día']);
      totalRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        bold: true
      };
      totalRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: totalColor }
      };
      totalRow.getCell(1).border = {
        top: { style: 'medium', color: { argb: mainColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'medium', color: { argb: mainColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      totalRow.getCell(1).alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      
      // Totales por fecha
      fechas.forEach((fecha, index) => {
        const fechaStr = format(fecha, 'yyyy-MM-dd');
        const totalFecha = totalesPorFecha[fechaStr] || 0;
        
        totalRow.getCell(index + 2).value = totalFecha;
        totalRow.getCell(index + 2).numFmt = '"$"#,##0.00';
        totalRow.getCell(index + 2).font = {
          name: 'Arial',
          size: 11,
          bold: true
        };
        totalRow.getCell(index + 2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: totalColor }
        };
        totalRow.getCell(index + 2).border = {
          top: { style: 'medium', color: { argb: mainColor } },
          left: { style: 'thin', color: { argb: borderColor } },
          bottom: { style: 'medium', color: { argb: mainColor } },
          right: { style: 'thin', color: { argb: borderColor } }
        };
        totalRow.getCell(index + 2).alignment = {
          horizontal: 'right',
          vertical: 'middle'
        };
      });
      
      // Total general
      totalRow.getCell(columns.length).value = totalGeneral;
      totalRow.getCell(columns.length).numFmt = '"$"#,##0.00';
      totalRow.getCell(columns.length).font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: mainColor }
      };
      totalRow.getCell(columns.length).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: totalColor }
      };
      totalRow.getCell(columns.length).border = {
        top: { style: 'medium', color: { argb: mainColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'medium', color: { argb: mainColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      totalRow.getCell(columns.length).alignment = {
        horizontal: 'right',
        vertical: 'middle'
      };
      
      totalRow.height = 22;
      
      // Añadir leyenda de estados
      worksheet.addRow(['']); // Espacio
      
      const leyendaRow = worksheet.addRow(['LEYENDA DE ESTADOS:']);
      leyendaRow.getCell(1).font = {
        name: 'Arial',
        size: 11,
        bold: true
      };
      
      // Leyenda para cada estado
      const estadosRow = worksheet.addRow(['']);
      
      // PENDIENTE
      estadosRow.getCell(1).value = 'PENDIENTE';
      estadosRow.getCell(1).font = { name: 'Arial', size: 10 };
      estadosRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: pendienteColor }
      };
      estadosRow.getCell(1).border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      estadosRow.getCell(1).alignment = { horizontal: 'center' };
      
      // CUMPLIDA
      estadosRow.getCell(2).value = 'CUMPLIDA';
      estadosRow.getCell(2).font = { name: 'Arial', size: 10 };
      estadosRow.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: cumplidaColor }
      };
      estadosRow.getCell(2).border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      estadosRow.getCell(2).alignment = { horizontal: 'center' };
      
      // VENCIDA
      estadosRow.getCell(3).value = 'VENCIDA';
      estadosRow.getCell(3).font = { name: 'Arial', size: 10 };
      estadosRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: vencidaColor }
      };
      estadosRow.getCell(3).border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      estadosRow.getCell(3).alignment = { horizontal: 'center' };
      
      // CANCELADA
      estadosRow.getCell(4).value = 'CANCELADA';
      estadosRow.getCell(4).font = { name: 'Arial', size: 10 };
      estadosRow.getCell(4).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: canceladaColor }
      };
      estadosRow.getCell(4).border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } }
      };
      estadosRow.getCell(4).alignment = { horizontal: 'center' };
      
      // Configurar vista congelada para facilitar navegación
      worksheet.views = [
        { state: 'frozen', xSplit: 1, ySplit: 6 }
      ];

      // Guardar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buffer]), fileName);
      
      console.log(`Calendario de proyecciones exportado: ${fileName}`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error al exportar el calendario de proyecciones:', error);
      return Promise.reject(error);
    }
  };

  return {
    exportCalendarioProyecciones
  };
};