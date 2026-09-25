// Etiquetas legibles para los enums de alquiler que manda el backend
// (TipoEspacio / DeporteCancha en prisma/schema.prisma). Nunca devuelven el
// valor crudo: un valor desconocido cae en `legible` (sin "_", primera mayúscula).

const TIPO_ESPACIO: Record<string, string> = {
  CANCHA_FUTBOL:    'Cancha de Fútbol',
  CANCHA_MULTIUSOS: 'Cancha Multiusos',
  SALON:            'Salón de Eventos',
  SALON_CANCHA:     'Salón + Cancha',
};

const DEPORTE: Record<string, string> = {
  FUTBOL_5:     'Fútbol 5',
  BASQUET:      'Básquet',
  VOLEY:        'Vóley',
  NEWCOM:       'Newcom',
  FUTBOL_SALON: 'Fútbol de Salón',
};

function legible(valor: string): string {
  const texto = valor.replace(/_/g, ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const labelTipoEspacio = (tipo: string): string => TIPO_ESPACIO[tipo] ?? legible(tipo);

export const labelDeporte = (deporte: string): string => DEPORTE[deporte] ?? legible(deporte);

export function etiquetaEspacio(tipoEspacio: string, deporteCancha?: string | null): string {
  const espacio = labelTipoEspacio(tipoEspacio);
  return deporteCancha ? `${espacio} — ${labelDeporte(deporteCancha)}` : espacio;
}
