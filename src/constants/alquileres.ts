import { Espacio, CategoriaEventoInfo } from '../types/alquileres';

export const ESPACIOS: Espacio[] = [
  {
    tipo: 'CANCHA',
    nombre: 'Cancha',
    descripcion: 'Espacio deportivo exterior para actividades físicas y partidos',
    icono: 'basketball',
  },
  {
    tipo: 'SALON',
    nombre: 'Salón',
    descripcion: 'Salón techado ideal para reuniones, cumpleaños y eventos sociales',
    icono: 'business',
  },
  {
    tipo: 'SALON_CANCHA',
    nombre: 'Salón + Cancha',
    descripcion: 'Todo el predio: salón y cancha disponibles para tu evento',
    icono: 'grid',
  },
];

export const CATEGORIAS_EVENTO: CategoriaEventoInfo[] = [
  {
    tipo: 'PRIVADO',
    nombre: 'Privado',
    descripcion: 'Evento cerrado para invitados específicos (cumpleaños, reuniones, etc.)',
    icono: 'lock-closed',
  },
  {
    tipo: 'PUBLICO',
    nombre: 'Público',
    descripcion: 'Evento abierto al público general (shows, torneos, ferias, etc.)',
    icono: 'people',
  },
];

export const HORARIOS_DISPONIBLES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

// Horarios válidos para hora de fin — incluye madrugada del día siguiente
export const HORARIOS_FIN = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  '22:00', '23:00',
];
