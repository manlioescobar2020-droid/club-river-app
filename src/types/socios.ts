export interface Recibo {
  id: number;
  numero: string;
  monto: string;
  fecha: string;
  tipo: 'CUOTA' | 'ALQUILER';
  cuotas?: {
    mes: string;
    anio: number;
  }[];
}

export interface DevolucionInfo {
  aplicaDevolucion: boolean;
  porcentaje: number;
  montoDevuelto: number;
  diasAnticipacion: number;
  motivo: string;
}

export interface AlquilerHistorial {
  id: string;
  tipo: 'SALON' | 'CANCHA';
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipoEspacio: 'SALON' | 'CANCHA' | 'SALON_CANCHA';
  categoriaEvento: 'PUBLICO' | 'PRIVADO';
  monto: string;
  estado: 'RESERVADO' | 'PAGADO' | 'CANCELADO';
  devolucion?: DevolucionInfo;
}

export interface ParticipanteACargo {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  categorias: {
    categoria: {
      nombre: string;
      disciplina: {
        nombre: string;
      };
    };
  }[];
}

export interface MovimientoSaldo {
  monto: number;
  tipo: 'CANCELACION_ALQUILER' | 'USO_EN_ALQUILER' | 'AJUSTE_MANUAL';
  descripcion: string;
  creadoEn: string;
}

export interface SaldoResponse {
  saldo: number;
  movimientos: MovimientoSaldo[];
}
