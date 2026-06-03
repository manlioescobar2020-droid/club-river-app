export type TipoEspacio = 'CANCHA_FUTBOL' | 'CANCHA_MULTIUSOS' | 'SALON' | 'SALON_CANCHA';
export type CategoriaEvento = 'PRIVADO' | 'PUBLICO';
export type DeporteMultiusos = 'BASQUET' | 'VOLEY' | 'NEWCOM' | 'FUTBOL_SALON';

export const labelTipoEspacio = (tipo: TipoEspacio): string => ({
  CANCHA_FUTBOL:    'Cancha de Fútbol',
  CANCHA_MULTIUSOS: 'Cancha Multiusos',
  SALON:            'Salón de Eventos',
  SALON_CANCHA:     'Salón + Cancha',
}[tipo] ?? tipo);

export const labelDeporte = (deporte: DeporteMultiusos): string => ({
  BASQUET:      'Básquet',
  VOLEY:        'Vóley',
  NEWCOM:       'Newcom',
  FUTBOL_SALON: 'Fútbol de Salón',
}[deporte] ?? deporte);

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
  deporte?: DeporteMultiusos;
  categoriaEvento: CategoriaEvento;
  fecha: string; // ISO string
  horaInicio: string;
  horaFin: string;
  nombreCliente: string;
  telefonoCliente: string;
  emailCliente: string;
}
