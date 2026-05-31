export interface CategoriaInscripta {
  id: number;
  categoria: {
    id: number;
    nombre: string;
    disciplina: {
      nombre: string;
    };
  };
  profesor?: {
    nombre: string;
    apellido: string;
  };
  fechaInscripcion: string;
  activo: boolean;
  estadisticasAsistencia?: {
    totalClases: number;
    presentes: number;
    ausentes: number;
    porcentaje: number;
  };
}
