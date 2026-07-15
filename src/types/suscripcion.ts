export type SuscripcionEstado = 'PENDING' | 'AUTHORIZED' | 'PAUSED' | 'CANCELLED';

export interface Suscripcion {
  id: string;
  estado: SuscripcionEstado;
  montoMensual: string;
  incluyeSocietaria: boolean;
  incluyeDisciplinas: boolean;
  ultimoPagoFecha: string | null;
  initPoint: string | null;
}

export interface SuscripcionPreview {
  montoBase: number;
  montoDisciplinas: number;
  disciplinas: { nombre: string; monto: number }[];
}
