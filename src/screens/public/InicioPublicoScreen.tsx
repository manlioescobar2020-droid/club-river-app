import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, typography } from '../../theme';

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
    description: 'Unite a fútbol, básquet, vóley y más',
    route: 'InscripcionPublica',
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
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.clubName}>RIVER PLATE</Text>
        <Text style={styles.clubSub}>Santo Tomé · Corrientes</Text>
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
              <Ionicons name={card.icon} size={26} color={colors.red} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
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
  content:   { paddingBottom: 48 },

  header: {
    backgroundColor:  colors.red,
    alignItems:       'center',
    paddingTop:       64,
    paddingBottom:    40,
    paddingHorizontal: 20,
  },
  logo: {
    width:        96,
    height:       96,
    borderRadius: 48,
    marginBottom: 16,
    borderWidth:  3,
    borderColor:  'rgba(255,255,255,0.25)',
  },
  clubName: {
    ...typography.display,
    fontSize:     38,
    color:        colors.text,
    marginBottom: 4,
  },
  clubSub: {
    ...typography.body,
    fontSize: 15,
    color:    'rgba(255,255,255,0.75)',
  },

  section: {
    paddingHorizontal: 16,
    paddingTop:        28,
    gap:               12,
  },
  sectionLabel: {
    ...typography.display,
    fontSize:     12,
    color:        colors.muted,
    letterSpacing: 2,
    marginBottom:  4,
  },

  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
    padding:         16,
    gap:             14,
  },
  cardIcon: {
    width:           52,
    height:          52,
    borderRadius:    radius.md,
    backgroundColor: colors.redDim,
    justifyContent:  'center',
    alignItems:      'center',
  },
  cardContent: { flex: 1 },
  cardTitle: {
    ...typography.bodySemiBold,
    fontSize:     16,
    color:        colors.text,
    marginBottom: 3,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 13,
    color:    colors.muted,
  },

  loginBtn: {
    marginHorizontal: 16,
    marginTop:        28,
    paddingVertical:  16,
    borderRadius:     radius.md,
    borderWidth:      1.5,
    borderColor:      colors.glassBorder,
    alignItems:       'center',
  },
  loginBtnText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color:    colors.muted,
  },
});
