import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MisCategoriasProfesorScreen from '../screens/profesores/MisCategoriasProfesorScreen';
import ParticipantesListaScreen from '../screens/profesores/ParticipantesListaScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const HEADER = {
  headerStyle:      { backgroundColor: colors.red },
  headerTintColor:  colors.text,
  headerTitleStyle: { fontWeight: 'bold' as const },
};

export default function MisClasesStack() {
  return (
    <Stack.Navigator screenOptions={HEADER}>
      <Stack.Screen
        name="MisCategoriasProfesor"
        component={MisCategoriasProfesorScreen}
        options={{ title: 'Mis Clases' }}
      />
      <Stack.Screen
        name="ParticipantesLista"
        component={ParticipantesListaScreen}
        options={{ title: 'Participantes' }}
      />
    </Stack.Navigator>
  );
}
