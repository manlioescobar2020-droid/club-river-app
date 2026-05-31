import api from './api';
import { CategoriaProfesor, ParticipanteCategoria } from '../types/profesores';

export const profesoresService = {
  async obtenerMisCategorias(): Promise<CategoriaProfesor[]> {
    const response = await api.get('/mi-portal/categorias');
    return response.data;
  },

  async obtenerParticipantesCategoria(categoriaId: number): Promise<ParticipanteCategoria[]> {
    const response = await api.get(`/mi-portal/categorias/${categoriaId}/participantes`);
    return response.data;
  },
};
