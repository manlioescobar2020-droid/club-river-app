import api from './api';
import { AgendaLlaveItem } from '../types/portero';

async function getAgenda(): Promise<AgendaLlaveItem[]> {
  const response = await api.get('/portero/agenda');
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data?.agenda ?? data?.alquileres ?? [];
}

export const porteroService = { getAgenda };
