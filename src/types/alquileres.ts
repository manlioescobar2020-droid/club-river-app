export type TipoEspacio = 'CANCHA_FUTBOL' | 'CANCHA_MULTIUSOS' | 'SALON' | 'SALON_CANCHA';
export type CategoriaEvento = 'PRIVADO' | 'PUBLICO';
export type DeporteMultiusos = 'BASQUET' | 'VOLEY' | 'NEWCOM' | 'FUTBOL_SALON';

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
  deporteCancha?: DeporteMultiusos;
  categoriaEvento: CategoriaEvento;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // ISO string
  horaFin: string; // ISO string
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string;
}
