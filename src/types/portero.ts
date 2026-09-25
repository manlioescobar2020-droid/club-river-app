export interface AgendaLlaveItem {
  id: number | string;
  tipo: string;
  tipoEspacio: string;
  deporteCancha: string | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  clienteNombre: string;
  clienteTelefono: string | null;
}
