import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, typography } from '../../theme';

interface InfoItem {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

const INFO_ITEMS: InfoItem[] = [
  { icon: 'location-outline',   label: 'Dirección',            value: 'Santo Tomé, Corrientes' },
  { icon: 'time-outline',       label: 'Horarios de Atención', value: 'Lunes a Viernes: 8:00 – 20:00\nSábados: 9:00 – 14:00' },
  { icon: 'call-outline',       label: 'Teléfono',             value: '+54 9 3756 000000' },
  { icon: 'mail-outline',       label: 'Email',                value: 'contacto@clubriversantotome.com.ar' },
];

export default function InfoClubScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.bannerHeader}>
        <View style={styles.escudoContainer}>
          <Ionicons name="shield-checkmark-outline" size={56} color={colors.red} />
        </View>
        <Text style={styles.bannerTitle}>Club River Plate</Text>
        <Text style={styles.bannerSub}>Santo Tomé, Corrientes</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACIÓN DE CONTACTO</Text>
        <View style={styles.sectionCard}>
          {INFO_ITEMS.map((item, idx) => (
            <View key={item.label}>
              {idx > 0 && <View style={styles.rowDivider} />}
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name={item.icon} size={20} color={colors.red} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOBRE EL CLUB</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.descripcion}>
            El Club River Plate de Santo Tomé es una institución deportiva y social con amplia
            trayectoria en la comunidad correntina. Ofrecemos diversas disciplinas deportivas para
            todas las edades, instalaciones modernas y un espíritu de comunidad que nos caracteriza.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 40 },
  bannerHeader: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  escudoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerTitle: { ...typography.display, fontSize: 24, color: colors.text, marginBottom: 4 },
  bannerSub: { ...typography.body, fontSize: 14, color: colors.muted },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { ...typography.display, fontSize: 13, color: colors.muted, letterSpacing: 2, marginBottom: 10 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
  rowDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.body, fontSize: 12, color: colors.muted, marginBottom: 4 },
  infoValue: { ...typography.bodyMedium, fontSize: 15, color: colors.text, lineHeight: 22 },
  descripcion: { ...typography.body, fontSize: 14, color: colors.muted, lineHeight: 24, padding: 16 },
});
