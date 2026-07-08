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
