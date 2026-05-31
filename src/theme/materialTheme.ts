import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';

const { LightTheme: adaptedLight, DarkTheme: adaptedDark } = adaptNavigationTheme({
  reactNavigationLight: NavDefaultTheme,
  reactNavigationDark:  NavDarkTheme,
});

export const lightTheme = {
  ...MD3LightTheme,
  ...adaptedLight,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    ...adaptedLight.colors,
    primary:            '#DC2626',
    primaryContainer:   '#FEE2E2',
    secondary:          '#0EA5E9',
    secondaryContainer: '#E0F2FE',
    background:         '#F3F4F6',
    surface:            '#FFFFFF',
    surfaceVariant:     '#F9FAFB',
    onBackground:       '#111827',
    onSurface:          '#111827',
    onSurfaceVariant:   '#6B7280',
    outline:            '#E5E7EB',
    error:              '#EF4444',
    onPrimary:          '#FFFFFF',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  ...adaptedDark,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    ...adaptedDark.colors,
    primary:            '#EF4444',
    primaryContainer:   '#7F1D1D',
    secondary:          '#38BDF8',
    secondaryContainer: '#0C4A6E',
    background:         '#0F172A',
    surface:            '#1E293B',
    surfaceVariant:     '#334155',
    onBackground:       '#F1F5F9',
    onSurface:          '#F1F5F9',
    onSurfaceVariant:   '#94A3B8',
    outline:            '#475569',
    error:              '#F87171',
    onPrimary:          '#FFFFFF',
    // Navigation-specific
    card:               '#1E293B',
    border:             '#334155',
    notification:       '#EF4444',
    text:               '#F1F5F9',
  },
};

export type AppTheme = typeof lightTheme;
