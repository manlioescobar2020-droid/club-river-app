import api from './api';
import { Carnet } from '../types/carnet';

export const carnetService = {
  async obtenerMiCarnet(): Promise<Carnet> {
    const response = await api.get('/mi-carnet');
    return response.data;
  },
};
