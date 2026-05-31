import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DisciplinasScreen from '../screens/disciplinas/DisciplinasScreen';
import InscripcionScreen from '../screens/disciplinas/InscripcionScreen';
import FormularioMayorScreen from '../screens/disciplinas/FormularioMayorScreen';
import FormularioMenorScreen from '../screens/disciplinas/FormularioMenorScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function DisciplinasStack() {
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
        name="DisciplinasHome"
        component={DisciplinasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Inscripcion"
        component={InscripcionScreen}
        options={{ title: 'Inscripción', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen
        name="FormularioMayor"
        component={FormularioMayorScreen}
        options={{ title: 'Formulario mayor de edad', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen
        name="FormularioMenor"
        component={FormularioMenorScreen}
        options={{ title: 'Formulario menor de edad', headerBackTitle: 'Volver' }}
      />
    </Stack.Navigator>
  );
}
