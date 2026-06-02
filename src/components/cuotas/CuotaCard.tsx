import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Cuota } from '../../services/cuotasService';
import { colors, radius, typography } from '../../theme';

export interface CuotaCardProps {
  cuota: Cuota;
  seleccionable?: boolean;
  seleccionada?: boolean;
  onToggleSeleccion?: (id: number) => void;
  onVerRecibo?: (reciboId: number) => void;
}

const ESTADO_CONFIG: Record<string, { bg: string; color: string }> = {
  VENCIDA:   { bg: colors.redDim,    color: colors.redBright    },
  PENDIENTE: { bg: colors.yellowDim, color: colors.yellowBright },
  PAGADA:    { bg: colors.greenDim,  color: colors.greenBright  },
};

function parseMesAnio(mesAnio: string): { mes: string; anio: string } {
  const parts = mesAnio.trim().split(' ');
  return {
    mes:  (parts[0] ?? '').slice(0, 3).toUpperCase(),
    anio: parts[1] ?? '',
  };
}

function formatFecha(fecha: string): string {
  const [yyyy, mm, dd] = fecha.slice(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export default function CuotaCard({
  cuota,
  seleccionable = false,
  seleccionada  = false,
  onToggleSeleccion,
  onVerRecibo,
}: CuotaCardProps) {
  const { mes, anio } = parseMesAnio(cuota.mesAnio);
  const cfg = ESTADO_CONFIG[cuota.estado] ?? { bg: colors.surface2, color: colors.muted };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        cuota.estado === 'VENCIDA' && styles.cardVencida,
        seleccionada              && styles.cardSelected,
      ]}
      onPress={seleccionable ? () => onToggleSeleccion?.(cuota.id) : undefined}
      activeOpacity={seleccionable ? 0.75 : 1}
    >
      {/* ── Cuadrado fecha ── */}
      <View style={[styles.dateBox, seleccionada && styles.dateBoxSelected]}>
        {seleccionable && seleccionada ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <>
            <Text style={styles.dateMes}>{mes}</Text>
            <Text style={styles.dateAnio}>{anio}</Text>
          </>
        )}
      </View>

      {/* ── Contenido central ── */}
      <View style={styles.content}>
        <Text style={styles.titulo} numberOfLines={1}>
          Cuota {cuota.mesAnio}
        </Text>
        <Text style={styles.fecha}>
          Vence {formatFecha(cuota.fechaVencimiento)}
        </Text>
        {cuota.disciplina && (
          <Text style={styles.disciplina} numberOfLines={1}>
            {cuota.disciplina.nombre}
          </Text>
        )}
      </View>

      {/* ── Monto + badge + recibo ── */}
      <View style={styles.right}>
        <Text style={styles.monto}>
          ${Number(cuota.monto).toLocaleString('es-AR')}
        </Text>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>
            {cuota.estado}
          </Text>
        </View>
        {cuota.estado === 'PAGADA' && cuota.reciboId != null && onVerRecibo && (
          <TouchableOpacity
            style={styles.reciboBtn}
            onPress={() => onVerRecibo(cuota.reciboId!)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={16}
              color={colors.green}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.surface,
    borderWidth:      1,
    borderColor:      colors.glassBorder,
    borderRadius:     18,
    marginHorizontal: 16,
    marginVertical:   5,
    padding:          14,
    gap:              12,
  },
  cardVencida: {
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  cardSelected: {
    borderColor:     colors.red,
    backgroundColor: colors.redDim,
  },

  /* Date box */
  dateBox: {
    width:           42,
    height:          42,
    borderRadius:    12,
    backgroundColor: colors.surface2,
    alignItems:      'center',
    justifyContent:  'center',
  },
  dateBoxSelected: { backgroundColor: colors.red },
  checkmark: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
  dateMes:   {
    ...typography.body,
    fontSize:      9,
    color:         colors.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  dateAnio:  { ...typography.display, fontSize: 13, color: colors.text },

  /* Content */
  content:    { flex: 1 },
  titulo:     { ...typography.bodyMedium, fontSize: 14, color: colors.text, marginBottom: 2 },
  fecha:      { ...typography.body,       fontSize: 11, color: colors.muted },
  disciplina: { ...typography.body,       fontSize: 11, color: colors.muted, marginTop: 2 },

  /* Right */
  right:     { alignItems: 'flex-end', gap: 6 },
  monto:     { ...typography.display, fontSize: 16, color: colors.text },
  badge: {
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  badgeText: { ...typography.bodyBold, fontSize: 9, letterSpacing: 0.5 },
  reciboBtn: { marginTop: 2 },
});
