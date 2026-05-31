export interface CategoriaProfesor {
  id: number;
  categoria: {
    id: number;
    nombre: string;
    disciplina: {
      nombre: string;
    };
    cupoMaximo?: number;
  };
  participantes: {
    id: number;
    participante: {
      id: number;
      nombre: string;
      apellido: string;
    };
  }[];
  _count?: {
    participantes: number;
  };
}

export interface ParticipanteCategoria {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
}
