export interface Disciplina {
  id: number;
  nombre: string;
  descripcion: string;
  cuotaMensual: number;
  activa: boolean;
  imagenUrl?: string | null;
}

export interface InscripcionMayor {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  aceptaTerminos: true;
}

// Field names match the backend /api/inscripcion/tutor endpoint exactly
export interface InscripcionMenor {
  menorNombre: string;
  menorApellido: string;
  menorDni: string;
  menorFechaNacimiento: string;
  tutorNombre: string;
  tutorApellido: string;
  tutorDni: string;
  tutorEmail: string;
  tutorTelefono?: string;
}

export interface InscripcionResultado {
  cuotaGenerada?: boolean;
  periodoPrueba?: boolean;
}
