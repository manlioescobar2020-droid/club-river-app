export interface EstadoCuentaCarnet {
  alDia: boolean;
  cuotasPendientes: number;
  cuotasVencidas: number;
}

export interface Carnet {
  tipo: 'socio' | 'participante';
  nombre: string;
  apellido: string;
  dni: string;
  estado: EstadoCuentaCarnet;
  verificarUrl: string;
}
