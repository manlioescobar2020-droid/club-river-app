import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AlquileresScreen from '../screens/alquileres/AlquileresScreen';
import SeleccionarDeporteScreen from '../screens/alquileres/SeleccionarDeporteScreen';
import SeleccionarCategoriaScreen from '../screens/alquileres/SeleccionarCategoriaScreen';
import SeleccionarFechaHoraScreen from '../screens/alquileres/SeleccionarFechaHoraScreen';
import ConfirmarReservaScreen from '../screens/alquileres/ConfirmarReservaScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AlquileresStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:        { backgroundColor: colors.surface },
        headerTintColor:    colors.red,
        headerTitleStyle:   { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="AlquileresHome"
        component={AlquileresScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeleccionarDeporte"
        component={SeleccionarDeporteScreen}
        options={{ title: '¿Para qué deporte?', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen
        name="SeleccionarCategoria"
        component={SeleccionarCategoriaScreen}
        options={{ title: 'Tipo de evento', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen
        name="SeleccionarFechaHora"
        component={SeleccionarFechaHoraScreen}
        options={{ title: 'Fecha y hora', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen
        name="ConfirmarReserva"
        component={ConfirmarReservaScreen}
        options={{ title: 'Confirmar reserva', headerBackTitle: 'Volver' }}
      />
    </Stack.Navigator>
  );
}
