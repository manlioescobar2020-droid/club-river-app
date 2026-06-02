import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../../theme';

interface ActionCard {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  route: string;
}

const ACTION_CARDS: ActionCard[] = [
  {
    icon: 'calendar-outline',
    title: 'Alquilar un espacio',
    description: 'Reservá canchas, salón de eventos y más',
    route: 'Alquileres',
  },
  {
    icon: 'trophy-outline',
    title: 'Inscribirse en una disciplina',
    description: 'Fútbol, básquet, vóley y más',
    route: 'InscripcionPublica',
  },
  {
    icon: 'person-add-outline',
    title: 'Asociarme al club',
    description: 'Convertite en socio y accedé a beneficios',
    route: 'Asociarse',
  },
  {
    icon: 'newspaper-outline',
    title: 'Noticias del club',
    description: 'Novedades, torneos y eventos',
    route: 'Noticias',
  },
];

export default function InicioPublicoScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.red} />

      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          {/* TODO: reemplazar con escudo.png */}
        </View>
        <Text style={styles.clubName}>RIVER PLATE</Text>
        <Text style={styles.clubSub}>Santo Tomé · Corrientes</Text>
        <View style={styles.diagonalStrip} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>¿QUÉ QUERÉS HACER?</Text>

        {ACTION_CARDS.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            onPress={() => navigation.navigate(card.route)}
            activeOpacity={0.75}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={card.icon} size={24} color={colors.red} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.red} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.loginBtnText}>Ya soy socio — Iniciar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { paddingBottom: 0 },

  header: {
    backgroundColor:  colors.red,
    height:           260,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 20,
    paddingTop:       20,
    zIndex:           1,
    elevation:        2,
  },
  logoPlaceholder: {
    width:         100,
    height:        100,
    borderRadius:  50,
    backgroundColor: colors.bg,
    borderWidth:   3,
    borderColor:   colors.bg,
    marginBottom:  16,
  },
  clubName: {
    ...typography.display,
    fontSize:         48,
    color:            colors.bg,
    letterSpacing:    4,
    textShadowColor:  'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom:     6,
  },
  clubSub: {
    ...typography.body,
    fontSize:     14,
    color:        colors.bg,
    letterSpacing: 2,
  },
  diagonalStrip: {
    position:        'absolute',
    bottom:          -15,
    left:            '-10%',
    width:           '120%',
    height:          40,
    backgroundColor: colors.bg,
    transform:       [{ rotate: '-3deg' }],
  },

  section: {
    paddingHorizontal: 16,
    paddingTop:        32,
    paddingBottom:     8,
  },
  sectionLabel: {
    fontSize:     11,
    fontWeight:   'bold',
    color:        colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },

  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.surface,
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      colors.surface2,
    borderLeftWidth:  4,
    borderLeftColor:  colors.red,
    padding:          18,
    marginBottom:     12,
    gap:              14,
    shadowColor:      colors.red,
    shadowOffset:     { width: 0, height: 2 },
    shadowOpacity:    0.08,
    shadowRadius:     4,
    elevation:        3,
  },
  cardIcon: {
    width:           48,
    height:          48,
    borderRadius:    10,
    backgroundColor: colors.redDim,
    justifyContent:  'center',
    alignItems:      'center',
  },
  cardContent: { flex: 1 },
  cardTitle: {
    ...typography.bodyBold,
    fontSize: 17,
    color:    colors.text,
  },
  cardDesc: {
    ...typography.body,
    fontSize:  13,
    color:     colors.muted,
    marginTop: 3,
  },

  loginBtn: {
    marginHorizontal: 16,
    marginTop:        8,
    marginBottom:     32,
    paddingVertical:  16,
    borderRadius:     12,
    borderWidth:      1.5,
    borderColor:      colors.glassBorder,
    alignItems:       'center',
  },
  loginBtnText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color:    colors.text,
  },
});
