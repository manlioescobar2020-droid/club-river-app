import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../../theme';

interface ActionCard {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  imageUrl?: string; // cuando haya foto real: assets/images/<nombre>.png o URL
  title: string;
  description: string;
  route: string;
  color: string;
  bgColor: string;
}

const ACTION_CARDS: ActionCard[] = [
  {
    icon:        'business-outline',
    title:       'Alquilar un espacio',
    description: 'Reservá canchas, salón de eventos y más',
    route:       'Alquileres',
    color:       colors.red,
    bgColor:     colors.redDim,
  },
  {
    icon:        'basketball-outline',
    title:       'Inscribirse en una disciplina',
    description: 'Fútbol, básquet, vóley y más',
    route:       'InscripcionPublica',
    color:       colors.yellow,
    bgColor:     colors.yellowDim,
  },
  {
    icon:        'card-outline',
    title:       'Asociarme al club',
    description: 'Convertite en socio y accedé a beneficios',
    route:       'Asociarse',
    color:       colors.green,
    bgColor:     colors.greenDim,
  },
  {
    icon:        'megaphone-outline',
    title:       'Noticias del club',
    description: 'Novedades, torneos y eventos',
    route:       'Noticias',
    color:       colors.purple,
    bgColor:     colors.purpleDim,
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
        <Image
          source={require('../../../assets/images/logo_river_transparente.png')}
          style={styles.logoPlaceholder}
          resizeMode="contain"
        />
        <Text style={styles.clubName}>RIVER PLATE</Text>
        <Text style={styles.clubSub}>Santo Tomé · Corrientes</Text>
        <View style={styles.diagonalStrip} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>¿QUÉ QUERÉS HACER?</Text>

        {ACTION_CARDS.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={[styles.card, { borderLeftColor: card.color }]}
            onPress={() => navigation.navigate(card.route)}
            activeOpacity={0.75}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.bgColor }]}>
              {card.imageUrl
                ? <Image source={{ uri: card.imageUrl }} style={styles.cardImage} />
                : <Ionicons name={card.icon} size={28} color={card.color} />
              }
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={card.color} />
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
    backgroundColor:   colors.red,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     30,
    zIndex:            1,
    elevation:         2,
  },
  logoPlaceholder: {
    width:        100,
    height:       100,
    marginBottom: 16,
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
    zIndex:        2,
  },
  diagonalStrip: {
    position:        'absolute',
    bottom:          -15,
    left:            '-10%',
    width:           '120%',
    height:          40,
    backgroundColor: colors.bg,
    transform:       [{ rotate: '-3deg' }],
    zIndex:          1,
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
    width:           56,
    height:          56,
    borderRadius:    12,
    justifyContent:  'center',
    alignItems:      'center',
    padding:         6,
  },
  cardImage: {
    width:  52,
    height: 52,
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
