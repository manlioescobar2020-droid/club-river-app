import api from './api';
import { PrecioAlquiler, HorarioDisponible, ReservaData } from '../types/alquileres';

export const alquileresService = {
  async getPrecios(): Promise<PrecioAlquiler[]> {
    try {
      const response = await api.get('/alquileres/precios');
      console.log('[SERVICE DEBUG] getPrecios response.data:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('[ALQUILERES] Error obteniendo precios:', error);
      throw error;
    }
  },

  async getDisponibilidad(fecha: string, tipoEspacio?: string): Promise<HorarioDisponible[]> {
    try {
      const qs = tipoEspacio
        ? `fecha=${fecha}&tipoEspacio=${tipoEspacio}`
        : `fecha=${fecha}`;
      const response = await api.get(`/alquileres/disponibilidad?${qs}`);
      return response.data;
    } catch (error) {
      console.error('[ALQUILERES] Error obteniendo disponibilidad:', error);
      throw error;
    }
  },

  async crearReserva(data: ReservaData): Promise<{ init_point: string; alquilerId: string }> {
    try {
      console.log('[ALQUILERES] Creando reserva:', data);
      const response = await api.post('/alquileres/reservar', data);
      console.log('[SERVICE DEBUG] crearReserva response.data:', JSON.stringify(response.data));
      console.log('[SERVICE DEBUG] Claves en response.data:', Object.keys(response.data || {}));
      return response.data;
    } catch (error) {
      console.error('[ALQUILERES] Error creando reserva:', error);
      throw error;
    }
  },

  async verificarEstadoAlquiler(id: string): Promise<string> {
    const response = await api.get(`/alquileres/${id}/estado`);
    return response.data.estado;
  },
};
