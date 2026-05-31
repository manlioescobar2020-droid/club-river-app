export type TipoEspacio = 'SALON' | 'CANCHA' | 'SALON_CANCHA';
export type CategoriaEvento = 'PRIVADO' | 'PUBLICO';

export interface PrecioAlquiler {
  id: number;
  tipoEspacio: TipoEspacio;
  categoriaEvento: CategoriaEvento;
  precioPorHora: number;
  activo: boolean;
}

export interface Espacio {
  tipo: TipoEspacio;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface CategoriaEventoInfo {
  tipo: CategoriaEvento;
  nombre: string;
  descripcion: string;
  icono: string;
}

export interface HorarioDisponible {
  hora: string; // "14:00"
  disponible: boolean;
}

export interface ReservaData {
  tipoEspacio: TipoEspacio;
  categoriaEvento: CategoriaEvento;
  fecha: string; // ISO string
  horaInicio: string;
  horaFin: string;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente: string;
}
