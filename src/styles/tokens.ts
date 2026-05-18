// ============================================================
// OdontoSync — Design Tokens (Clinical Serenity)
// Fonte única de verdade para cores, tipografia e espaçamentos.
// Extraídos do Design System do Stitch MCP.
// ============================================================

export const colors = {
  // Primárias — Teal médico elevado
  primary: '#006763',
  primaryContainer: '#14827C',
  primaryFixed: '#96F3EB',
  primaryFixedDim: '#79D6CF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#F3FFFD',
  onPrimaryFixed: '#00201E',
  onPrimaryFixedVariant: '#00504C',
  inversePrimary: '#79D6CF',

  // Secundárias
  secondary: '#516160',
  secondaryContainer: '#D2E3E2',
  secondaryFixed: '#D5E6E4',
  secondaryFixedDim: '#B9CAC8',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#566665',
  onSecondaryFixed: '#0F1E1E',
  onSecondaryFixedVariant: '#3A4A49',

  // Terciárias — Accent quente
  tertiary: '#8D492B',
  tertiaryContainer: '#AB6141',
  tertiaryFixed: '#FFDBCE',
  tertiaryFixedDim: '#FFB598',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#FFFBFF',
  onTertiaryFixed: '#370E00',
  onTertiaryFixedVariant: '#733518',

  // Superfícies — Hierarquia de nesting
  background: '#F8F9F9',
  surface: '#F8F9F9',
  surfaceBright: '#F8F9F9',
  surfaceContainer: '#EDEEEE',
  surfaceContainerHigh: '#E7E8E8',
  surfaceContainerHighest: '#E1E3E3',
  surfaceContainerLow: '#F3F4F4',
  surfaceContainerLowest: '#FFFFFF',
  surfaceDim: '#D9DADA',
  surfaceTint: '#006A65',
  surfaceVariant: '#E1E3E3',
  onBackground: '#191C1C',
  onSurface: '#191C1C',
  onSurfaceVariant: '#3E4948',
  inverseSurface: '#2E3131',
  inverseOnSurface: '#F0F1F1',

  // Erros
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  // Outlines
  outline: '#6E7978',
  outlineVariant: '#BDC9C7',
} as const;

export const fonts = {
  headline: 'Manrope_700Bold',
  headlineMedium: 'Manrope_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  label: 'Inter_600SemiBold',
} as const;

export const fontSizes = {
  displayLg: 57,
  displayMd: 45,
  displaySm: 36,
  headlineLg: 32,
  headlineMd: 28,
  headlineSm: 24,
  titleLg: 22,
  titleMd: 16,
  titleSm: 14,
  bodyLg: 16,
  bodyMd: 14,
  bodySm: 12,
  labelLg: 14,
  labelMd: 12,
  labelSm: 11,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 8,    // 0.5rem — Chips, small elements
  md: 24,   // 1.5rem — Inputs, nested cards
  lg: 32,   // 2rem — Outer cards
  full: 9999, // Pill buttons
} as const;

// Sombra ambiente — nunca usar drop-shadow padrão
// Tinted com on_surface, ultra-difusa
export const shadows = {
  ambient: {
    shadowColor: '#191C1C',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#191C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
