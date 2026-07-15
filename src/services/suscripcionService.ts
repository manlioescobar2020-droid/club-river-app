import api from './api';
import { Suscripcion, SuscripcionPreview } from '../types/suscripcion';

async function getSuscripcion(): Promise<{ suscripcion: Suscripcion | null; preview: SuscripcionPreview | null }> {
  const response = await api.get('/mi-cuenta/suscripcion');
  return {
    suscripcion: response.data?.suscripcion ?? null,
    preview: response.data?.preview ?? null,
  };
}

async function crearSuscripcion(incluyeDisciplinas: boolean): Promise<{ init_point: string }> {
  const response = await api.post('/mi-cuenta/suscripcion', { incluyeDisciplinas });
  return response.data;
}

async function cancelarSuscripcion(): Promise<void> {
  await api.delete('/mi-cuenta/suscripcion');
}

export default { getSuscripcion, crearSuscripcion, cancelarSuscripcion };
