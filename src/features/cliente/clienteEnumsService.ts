import { Sucursal } from '../shared/enums';

interface ClienteEnums {
  sucursales: string[];
  clasificaciones: string[];
}

// Default values in case API fails
const DEFAULT_ENUMS: ClienteEnums = {
  sucursales: Object.values(Sucursal),
  clasificaciones: ['TURISMO', 'GRUPO HYATT', 'PERSONAL']
};

// Cache the values once fetched
let cachedEnums: ClienteEnums | null = null;

export const clienteEnumsService = {
  /**
   * Fetches enum values from the backend API
   * Returns cached values if available
   */
  getEnums: async (): Promise<ClienteEnums> => {
    // Return cached values if available
    if (cachedEnums) return cachedEnums;
    
    try {
      // Try to fetch from backend
    //   const response = await privateApi.get('/cliente/enums');
    //   if (response.data && 
    //       response.data.sucursales && 
    //       response.data.clasificaciones) {
        
    //     cachedEnums = {
    //       sucursales: response.data.sucursales,
    //       clasificaciones: response.data.clasificaciones
    //     };
    //     return cachedEnums;
    //   }
      
      // If response doesn't have expected structure
      return DEFAULT_ENUMS;
    } catch (error) {
      console.log('Error fetching enum values, using defaults', error);
      return DEFAULT_ENUMS;
    }
  }
};