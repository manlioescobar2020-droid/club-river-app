import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

// PrivateNavigator lo actualiza en cada render: define si la agenda es una tab
// (PORTERO) o una pantalla de stack sobre las tabs (resto de los roles).
let esPortero = false;

export function setEsPorteroNavegacion(valor: boolean) {
  esPortero = valor;
}

// `ts` fuerza un cambio de params aunque se abra dos veces el mismo alquiler,
// para que la pantalla vuelva a resaltar y scrollear.
export function abrirAgenda(alquilerId?: string | number) {
  if (!navigationRef.isReady()) return;
  const params = { alquilerId: alquilerId != null ? String(alquilerId) : undefined, ts: Date.now() };
  if (esPortero) {
    navigationRef.navigate('Tabs', { screen: 'Agenda', params });
  } else {
    navigationRef.navigate('AgendaLlaves', params);
  }
}
