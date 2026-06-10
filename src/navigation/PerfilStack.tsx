import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PerfilScreen from '../screens/perfil/PerfilScreen';
import CambiarContrasenaScreen from '../screens/perfil/CambiarContrasenaScreen';
import AlquileresHistorialScreen from '../screens/socios/AlquileresHistorialScreen';
import ParticipantesACargoScreen from '../screens/socios/ParticipantesACargoScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const HEADER_OPTIONS = {
  headerStyle:      { backgroundColor: colors.red },
  headerTintColor:  colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
};

export default function PerfilStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilMain" component={PerfilScreen} />
      <Stack.Screen
        name="CambiarContrasena"
        component={CambiarContrasenaScreen}
        options={{ headerShown: true, title: 'Cambiar Contraseña', ...HEADER_OPTIONS }}
      />
      <Stack.Screen
        name="AlquileresHistorial"
        component={AlquileresHistorialScreen}
        options={{ headerShown: true, title: 'Mis Alquileres', ...HEADER_OPTIONS }}
      />
      <Stack.Screen
        name="ParticipantesACargo"
        component={ParticipantesACargoScreen}
        options={{ headerShown: true, title: 'Participantes a cargo', ...HEADER_OPTIONS }}
      />
    </Stack.Navigator>
  );
}
