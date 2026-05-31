import api from './api';
import { Disciplina, InscripcionMayor, InscripcionMenor } from '../types/disciplinas';

export const disciplinasService = {
  async obtenerDisciplinas(): Promise<Disciplina[]> {
    const response = await api.get('/disciplinas');
    return response.data;
  },

  async inscribirMayor(data: InscripcionMayor): Promise<any> {
    const response = await api.post('/inscripcion/solicitar', data);
    return response.data;
  },

  async inscribirMenor(data: InscripcionMenor): Promise<any> {
    const response = await api.post('/inscripcion/tutor', data);
    return response.data;
  },
};
