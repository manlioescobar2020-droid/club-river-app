import api, { BASE_URL } from './api';
import { Recibo, AlquilerHistorial, ParticipanteACargo } from '../types/socios';

export const sociosService = {
  async obtenerRecibos(): Promise<Recibo[]> {
    const response = await api.get('/mi-cuenta/recibos');
    return response.data;
  },

  // Devuelve la URL del recibo; la descarga con auth la maneja el llamador.
  descargarReciboPDF(reciboId: number): string {
    return `${BASE_URL}/recibos/${reciboId}`;
  },

  async obtenerHistorialAlquileres(): Promise<AlquilerHistorial[]> {
    const response = await api.get('/mi-cuenta/alquileres');
    return response.data;
  },

  async obtenerParticipantesACargo(): Promise<ParticipanteACargo[]> {
    const response = await api.get('/mi-cuenta/participantes');
    return response.data;
  },
};
