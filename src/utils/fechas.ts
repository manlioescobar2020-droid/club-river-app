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

function aMinutos(hhmm: string): [number, number] {
  const [h, m] = hhmm.split(':').map(Number);
  return [h, m];
}

// Instante real de fin de la reserva, para comparar contra "ahora".
// El día sale de los componentes UTC de `fecha` (T00:00Z y T03:00Z son el mismo día)
// y la hora literal se arma en hora LOCAL. Si horaFin <= horaInicio, la reserva
// cruza la medianoche y termina al día siguiente.
export function finInstante(item: { fecha: string; horaInicio?: string; horaFin: string }): Date {
  const f = new Date(item.fecha);
  const y = f.getUTCFullYear();
  const m = f.getUTCMonth();
  const d = f.getUTCDate();

  const [hf, mf] = aMinutos(extraerHoraMinuto(item.horaFin));
  if (item.horaInicio) {
    const [hi, mi] = aMinutos(extraerHoraMinuto(item.horaInicio));
    if (hf * 60 + mf <= hi * 60 + mi) return new Date(y, m, d + 1, hf, mf);
  }
  return new Date(y, m, d, hf, mf);
}
