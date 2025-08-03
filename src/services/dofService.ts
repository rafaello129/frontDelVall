import axios from "axios";

/**
 * DTO de respuesta del backend NestJS
 */
export interface TipoCambioDofResponse {
  fecha: string; // "17/07/2025"
  valor: string; // "17.27"
}

/**
 * Obtiene el tipo de cambio DOF desde el backend NestJS.
 * @param fecha Fecha en formato 'dd/MM/yyyy' (opcional, por defecto hoy en backend)
 */
export async function getTipoCambioDOF(fecha?: string): Promise<TipoCambioDofResponse> {
  // Cambia la URL si tu backend está en otra ruta/puerto
  const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const params: Record<string, string> = {};
  if (fecha) params.fecha = fecha;

  const response = await axios.get<TipoCambioDofResponse>(`${baseURL}/dof/tipo-cambio`, { params });
  console.log("Tipo de cambio DOF:", response.data);
  return response.data;
}