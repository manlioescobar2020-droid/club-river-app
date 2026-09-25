import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import InicioPublicoScreen from '../screens/public/InicioPublicoScreen';
import NoticiasScreen from '../screens/noticias/NoticiasScreen';
import NoticiaDetalleScreen from '../screens/noticias/NoticiaDetalleScreen';
import AsociarseScreen from '../screens/asociarse/AsociarseScreen';
import InfoClubScreen from '../screens/public/InfoClubScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RecuperarContrasenaScreen from '../screens/auth/RecuperarContrasenaScreen';
import AlquileresStack from './AlquileresStack';
import DisciplinasStack from './DisciplinasStack';

import InicioScreen from '../screens/inicio/InicioScreen';
import PerfilStackNavigator from './PerfilStack';
import MisClasesStack from './MisClasesStack';
import MisCategoriasScreen from '../screens/participantes/MisCategoriasScreen';
import CuotasScreen from '../screens/cuotas/CuotasScreen';
import AgendaLlavesScreen from '../screens/portero/AgendaLlavesScreen';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { navigationRef, setEsPorteroNavegacion } from './navigationRef';

export { navigationRef };

const NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card:       colors.surface,
    text:       colors.text,
    border:     colors.border,
    primary:    colors.red,
  },
};

const PubStack  = createNativeStackNavigator();
const PrivStack = createNativeStackNavigator();
const PrivTab   = createBottomTabNavigator();

const AGENDA_HEADER_OPTIONS = {
  headerShown:      true,
  title:            'Agenda de llaves',
  headerStyle:      { backgroundColor: colors.red },
  headerTintColor:  colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
};

const TAB_SCREEN_OPTIONS = {
  tabBarActiveTintColor:   colors.red,
  tabBarInactiveTintColor: colors.muted,
  tabBarStyle: {
    backgroundColor: colors.bg,
    borderTopWidth:  1,
    borderTopColor:  colors.border,
    height:          55,
    paddingBottom:   8,
    paddingTop:      8,
    elevation:       0,
  },
  tabBarLabelStyle: {
    fontSize:        11,
    fontWeight:      'bold' as const,
    textTransform:   'uppercase' as const,
  },
  tabBarIconStyle:  { display: 'none' as const },
  tabBarItemStyle:  { flex: 1 },
  headerShown: false,
};

function PublicNavigator() {
  return (
    <PubStack.Navigator
      screenOptions={{
        headerStyle:         { backgroundColor: colors.surface },
        headerTintColor:     colors.red,
        headerTitleStyle:    { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <PubStack.Screen
        name="InicioPublico"
        component={InicioPublicoScreen}
        options={{ headerShown: false }}
      />
      <PubStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <PubStack.Screen
        name="Noticias"
        component={NoticiasScreen}
        options={{ title: 'Noticias', headerBackTitle: 'Volver' }}
      />
      <PubStack.Screen
        name="Asociarse"
        component={AsociarseScreen}
        options={{ title: 'Asociarme al club', headerBackTitle: 'Volver' }}
      />
      <PubStack.Screen
        name="NoticiaDetalle"
        component={NoticiaDetalleScreen}
        options={({ route }: any) => ({
          title: route.params?.titulo ?? 'Noticia',
          headerBackTitle: 'Volver',
        })}
      />
      <PubStack.Screen
        name="Alquileres"
        component={AlquileresStack}
        options={{ headerShown: false }}
      />
      <PubStack.Screen
        name="InscripcionPublica"
        component={DisciplinasStack}
        options={{ headerShown: false }}
      />
      <PubStack.Screen
        name="InfoClub"
        component={InfoClubScreen}
        options={{ title: 'Información del Club', headerBackTitle: 'Volver' }}
      />
      <PubStack.Screen
        name="RecuperarContrasena"
        component={RecuperarContrasenaScreen}
        options={{ headerShown: false }}
      />
    </PubStack.Navigator>
  );
}

function PorteroTabs() {
  return (
    <PrivTab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <PrivTab.Screen
        name="Agenda"
        component={AgendaLlavesScreen}
        options={{
          tabBarLabel: 'AGENDA',
          ...AGENDA_HEADER_OPTIONS,
        }}
      />
      <PrivTab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        options={{
          tabBarLabel: 'PERFIL',
        }}
      />
    </PrivTab.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();

  const isParticipante = user?.rol === 'PARTICIPANTE';
  const isProfesor     = user?.rol === 'PROFESOR';
  const tieneCuotas    = ['SOCIO', 'PARTICIPANTE', 'TUTOR_RESPONSABLE'].includes(user?.rol ?? '');

  return (
    <PrivTab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <PrivTab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarLabel: 'INICIO',
        }}
      />
      <PrivTab.Screen
        name="Alquileres"
        component={AlquileresStack}
        options={{
          tabBarLabel: 'ALQUILER',
        }}
      />
      {isParticipante ? (
        <PrivTab.Screen
          name="Categorías"
          component={MisCategoriasScreen}
          options={{
            tabBarLabel: 'CATEG.',
          }}
        />
      ) : (
        <PrivTab.Screen
          name="Disciplinas"
          component={DisciplinasStack}
          options={{
            tabBarLabel: 'DEPORTE',
          }}
        />
      )}
      {isProfesor && (
        <PrivTab.Screen
          name="MisClases"
          component={MisClasesStack}
          options={{
            tabBarLabel: 'CLASES',
          }}
        />
      )}
      {tieneCuotas && (
        <PrivTab.Screen
          name="Cuotas"
          component={CuotasScreen}
          options={{
            tabBarLabel: 'CUOTAS',
          }}
        />
      )}
      <PrivTab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        options={{
          tabBarLabel: 'PERFIL',
        }}
      />
    </PrivTab.Navigator>
  );
}

// Stack sobre las tabs: permite abrir AgendaLlaves desde cualquier tab
// (encargados de llave con otro rol). El PORTERO la tiene como tab propia.
function PrivateNavigator() {
  const { user } = useAuth();
  const isPortero = user?.rol === 'PORTERO';
  setEsPorteroNavegacion(isPortero);

  return (
    <PrivStack.Navigator screenOptions={{ headerShown: false }}>
      <PrivStack.Screen name="Tabs" component={isPortero ? PorteroTabs : MainTabs} />
      {!isPortero && (
        <PrivStack.Screen
          name="AgendaLlaves"
          component={AgendaLlavesScreen}
          options={AGENDA_HEADER_OPTIONS}
        />
      )}
    </PrivStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer theme={NAV_THEME} ref={navigationRef}>
      {isAuthenticated ? <PrivateNavigator /> : <PublicNavigator />}
    </NavigationContainer>
  );
}

