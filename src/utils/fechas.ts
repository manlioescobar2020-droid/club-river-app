// Convención del backend para alquileres: la hora que aparece en el string ISO
// (antes de la Z) es la hora literal de Santo Tomé; no se aplica corrimiento de huso.

// Acepta "HH:MM" o ISO "YYYY-MM-DDTHH:MM:...Z" y devuelve siempre "HH:MM".
export function extraerHoraMinuto(valor: string): string {
  const matchISO = valor.match(/T(\d{2}):(\d{2})/);
  if (matchISO) return `${matchISO[1]}:${matchISO[2]}`;
  const matchSimple = valor.match(/^(\d{2}):(\d{2})/);
  if (matchSimple) return `${matchSimple[1]}:${matchSimple[2]}`;
  return valor;
}

// Instante real de fin de la reserva, para comparar contra "ahora".
export function finInstante(item: { fecha: string; horaFin: string }): Date {
  const fechaPart = item.fecha.slice(0, 10);
  const horaFin   = extraerHoraMinuto(item.horaFin);
  return new Date(`${fechaPart}T${horaFin}:00.000Z`);
}
