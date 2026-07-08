import api from './api';
import { Suscripcion } from '../types/suscripcion';

async function getSuscripcion(): Promise<Suscripcion | null> {
  const response = await api.get('/mi-cuenta/suscripcion');
  return response.data?.suscripcion ?? null;
}

async function crearSuscripcion(incluyeDisciplinas: boolean): Promise<{ init_point: string }> {
  const response = await api.post('/mi-cuenta/suscripcion', { incluyeDisciplinas });
  return response.data;
}

async function cancelarSuscripcion(): Promise<void> {
  await api.delete('/mi-cuenta/suscripcion');
}

export default { getSuscripcion, crearSuscripcion, cancelarSuscripcion };
