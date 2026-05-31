import api from './api';
import { CategoriaInscripta } from '../types/participantes';

export const participantesService = {
  async obtenerMisCategorias(): Promise<CategoriaInscripta[]> {
    const response = await api.get('/mi-cuenta/categorias');
    return response.data;
  },

  async obtenerEstadisticasAsistencia(categoriaId: number) {
    const response = await api.get(`/mi-cuenta/categorias/${categoriaId}/asistencia`);
    return response.data;
  },
};
