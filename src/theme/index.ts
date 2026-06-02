export const colors = {
  // Fondos
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  surface2: '#EEEEEE',

  // Bordes
  border: '#E0E0E0',
  glass: 'rgba(0,0,0,0.04)',
  glassBorder: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.7)',

  // Rojo River
  red: '#DC2626',
  redBright: '#EF4444',
  redDim: 'rgba(220,38,38,0.12)',

  // Texto
  text: '#111111',
  muted: '#666666',

  // Acentos
  green: '#16A34A',
  greenDim: 'rgba(74,222,128,0.15)',
  greenBright: '#4ADE80',
  yellow: '#D97706',
  yellowDim: 'rgba(217,119,6,0.12)',
  yellowBright: '#FCD34D',
  purple: '#A78BFA',
  purpleDim: 'rgba(139,92,246,0.15)',
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 50,
};

export const typography = {
  display:      { fontFamily: 'BebasNeue_400Regular', letterSpacing: 2 },
  body:         { fontFamily: 'DMSans_400Regular' },
  bodyMedium:   { fontFamily: 'DMSans_500Medium'  },
  bodySemiBold: { fontFamily: 'DMSans_600SemiBold' },
  bodyBold:     { fontFamily: 'DMSans_700Bold',     fontWeight: '700' as const },
};
