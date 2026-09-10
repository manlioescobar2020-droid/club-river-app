import api, { BASE_URL } from './api';
import { Recibo, AlquilerHistorial, ParticipanteACargo, SaldoResponse } from '../types/socios';

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

  async obtenerSaldo(): Promise<SaldoResponse> {
    const response = await api.get('/mi-cuenta/saldo');
    return response.data;
  },

  async cancelarAlquiler(id: string): Promise<{
    ok: boolean; cancelado: boolean; montoDevuelto: number;
    aplicaDevolucion: boolean; porcentaje: number; mensaje: string;
  }> {
    const response = await api.post(`/mi-cuenta/alquileres/${id}/cancelar`, {});
    return response.data;
  },
};
