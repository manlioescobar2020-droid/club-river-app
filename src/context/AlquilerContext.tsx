import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TipoEspacio, CategoriaEvento, DeporteMultiusos, PrecioAlquiler } from '../types/alquileres';

interface AlquilerState {
  tipoEspacio: TipoEspacio | null;
  deporte: DeporteMultiusos | null;
  categoriaEvento: CategoriaEvento | null;
  fecha: Date | null;
  horaInicio: string | null;
  horaFin: string | null;
  precioPorHora: number;
  precioTotal: number;
  precios: PrecioAlquiler[];
}

interface AlquilerContextType {
  state: AlquilerState;
  setTipoEspacio: (tipo: TipoEspacio, precio: number) => void;
  setDeporte: (deporte: DeporteMultiusos) => void;
  setCategoriaEvento: (categoria: CategoriaEvento) => void;
  setFechaHora: (fecha: Date, horaInicio: string, horaFin: string) => void;
  setPrecios: (precios: PrecioAlquiler[]) => void;
  calcularPrecioTotal: () => number;
  resetWizard: () => void;
}

const AlquilerContext = createContext<AlquilerContextType | undefined>(undefined);

const initialState: AlquilerState = {
  tipoEspacio: null,
  deporte: null,
  categoriaEvento: null,
  fecha: null,
  horaInicio: null,
  horaFin: null,
  precioPorHora: 0,
  precioTotal: 0,
  precios: [],
};

export function AlquilerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlquilerState>(initialState);

  const setTipoEspacio = (tipo: TipoEspacio, precio: number) => {
    setState(prev => ({ ...prev, tipoEspacio: tipo, deporte: null, precioPorHora: precio }));
  };

  const setDeporte = (deporte: DeporteMultiusos) => {
    setState(prev => ({ ...prev, deporte }));
  };

  const setCategoriaEvento = (categoria: CategoriaEvento) => {
    setState(prev => ({ ...prev, categoriaEvento: categoria }));
  };

  const setFechaHora = (fecha: Date, horaInicio: string, horaFin: string) => {
    setState(prev => ({ ...prev, fecha, horaInicio, horaFin }));
  };

  const setPrecios = (precios: PrecioAlquiler[]) => {
    setState(prev => ({ ...prev, precios }));
  };

  const calcularPrecioTotal = () => {
    if (!state.horaInicio || !state.horaFin) return 0;
    const inicio = parseInt(state.horaInicio.split(':')[0]);
    const fin    = parseInt(state.horaFin.split(':')[0]);
    const horas  = fin <= inicio ? (24 - inicio) + fin : fin - inicio;
    return state.precioPorHora * horas;
  };

  const resetWizard = () => {
    setState(initialState);
  };

  return (
    <AlquilerContext.Provider value={{
      state,
      setTipoEspacio,
      setDeporte,
      setCategoriaEvento,
      setFechaHora,
      setPrecios,
      calcularPrecioTotal,
      resetWizard,
    }}>
      {children}
    </AlquilerContext.Provider>
  );
}

export function useAlquiler() {
  const context = useContext(AlquilerContext);
  if (!context) {
    throw new Error('useAlquiler debe usarse dentro de AlquilerProvider');
  }
  return context;
}
