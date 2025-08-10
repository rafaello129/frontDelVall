import { useState, useEffect } from "react";
import { getTipoCambioDOF,  } from "../services/dofService";
import type { TipoCambioDofResponse } from "../services/dofService";


/**
 * Hook para obtener el tipo de cambio DOF de forma reactiva.
 * @param fecha Fecha en formato 'dd/MM/yyyy' (opcional, por defecto hoy)
 */
export function useTipoCambioDOF(fecha?: string) {
  const [data, setData] = useState<TipoCambioDofResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTipoCambioDOF(fecha)
      .then(setData)
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Error al consultar tipo de cambio DOF"
        );  
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [fecha]);

  return { data, loading, error };
}