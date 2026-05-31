export interface Recibo {
  id: number;
  numero: string;
  monto: string;
  fecha: string;
  tipo: 'CUOTA' | 'ALQUILER';
  cuotas?: {
    mes: number;
    anio: number;
  }[];
}

export interface AlquilerHistorial {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoEspacio: 'SALON' | 'CANCHA' | 'SALON_CANCHA';
  categoriaEvento: 'PUBLICO' | 'PRIVADO';
  monto: string;
  estado: 'RESERVADO' | 'PAGADO' | 'CANCELADO';
}

export interface ParticipanteACargo {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  categorias: {
    categoria: {
      nombre: string;
      disciplina: {
        nombre: string;
      };
    };
  }[];
}
