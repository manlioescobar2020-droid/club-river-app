import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import LoginScreen from '../screens/auth/LoginScreen';
import InicioScreen from '../screens/inicio/InicioScreen';
import InfoClubScreen from '../screens/public/InfoClubScreen';
import AlquileresStack from './AlquileresStack';
import DisciplinasStack from './DisciplinasStack';
import PerfilStackNavigator from './PerfilStack';
import MisClasesStack from './MisClasesStack';
import MisCategoriasScreen from '../screens/participantes/MisCategoriasScreen';
import CuotasScreen from '../screens/cuotas/CuotasScreen';

import { useAuth } from '../context/AuthContext';
import { useAlquiler } from '../context/AlquilerContext';
import { colors } from '../theme';

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

const RootStack = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();

type TabIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color: string;
  badge?: boolean;
};

function TabIcon({ name, focused, color, badge }: TabIconProps) {
  return (
    <View style={styles.iconOuter}>
      <View style={[styles.iconInner, focused && styles.iconInnerActive]}>
        <Ionicons name={name} size={24} color={color} />
      </View>
      {badge && <View style={styles.badgeDot} />}
    </View>
  );
}

function MainTabs() {
  const { user }                 = useAuth();
  const { state: alquilerState } = useAlquiler();

  const isParticipante        = user?.rol === 'PARTICIPANTE';
  const isProfesor            = user?.rol === 'PROFESOR';
  const tieneCuotas           = ['SOCIO', 'PARTICIPANTE', 'TUTOR_RESPONSABLE'].includes(user?.rol ?? '');
  const hasPendingReservation = alquilerState.tipoEspacio !== null;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   colors.red,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: 'rgba(13,13,20,0.92)',
          borderTopWidth:  1,
          borderTopColor:  colors.border,
          height:          70,
          paddingBottom:   10,
          paddingTop:      6,
          elevation:       0,
        },
        tabBarLabelStyle: {
          fontSize:      10,
          fontWeight:    '700',
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarLabel: 'INICIO',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Alquileres"
        component={AlquileresStack}
        options={{
          tabBarLabel: 'ALQUILER',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'calendar' : 'calendar-outline'}
              focused={focused}
              color={color}
              badge={hasPendingReservation}
            />
          ),
        }}
      />

      {isParticipante ? (
        <Tab.Screen
          name="Categorías"
          component={MisCategoriasScreen}
          options={{
            tabBarLabel: 'CATEG.',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? 'ribbon' : 'ribbon-outline'}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Disciplinas"
          component={DisciplinasStack}
          options={{
            tabBarLabel: 'DEPORTE',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? 'trophy' : 'trophy-outline'}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      )}

      {isProfesor && (
        <Tab.Screen
          name="MisClases"
          component={MisClasesStack}
          options={{
            tabBarLabel: 'CLASES',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? 'school' : 'school-outline'}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      )}

      {tieneCuotas && (
        <Tab.Screen
          name="Cuotas"
          component={CuotasScreen}
          options={{
            tabBarLabel: 'CUOTAS',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                name={focused ? 'wallet' : 'wallet-outline'}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Perfil"
        component={PerfilStackNavigator}
        options={{
          tabBarLabel: 'PERFIL',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown:      true,
            title:            'Iniciar Sesión',
            headerStyle:      { backgroundColor: colors.red },
            headerTintColor:  colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <RootStack.Screen
          name="InfoClub"
          component={InfoClubScreen}
          options={{
            headerShown:      true,
            title:            'Información del Club',
            headerStyle:      { backgroundColor: colors.red },
            headerTintColor:  colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconOuter: {
    position:       'relative',
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconInner: {
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   5,
  },
  iconInnerActive: {
    backgroundColor: colors.redDim,
  },
  badgeDot: {
    position:        'absolute',
    top:             2,
    right:           4,
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: colors.red,
  },
});
