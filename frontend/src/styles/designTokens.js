/**
 * Modern Glassmorphism Design System - Design Tokens
 * Premium, contemporary interface with soft pastel colors and glassmorphism effects
 */

export const Colors = {
  // Base whites and neutrals - clean foundation
  white: '#FFFFFF',
  neutral50: '#FAFAFA',    // Ultra light - subtle backgrounds
  neutral100: '#F5F5F7',   // Soft white - card backgrounds
  neutral200: '#E8E8E8',   // Light borders - elegant separation
  neutral300: '#D1D1D1',   // Medium borders - subtle definition
  neutral400: '#A3A3A3',   // Tertiary text - muted
  neutral500: '#737373',   // Secondary text - balanced
  neutral600: '#525252',   // Primary text - readable
  neutral700: '#404040',   // Darker text - emphasis
  neutral800: '#262626',   // Very dark - headers
  neutral900: '#171717',   // Darkest - strong contrast

  // Pastel primary palette - soft blues
  primary50: '#F0F7FF',    // Ultra light blue
  primary100: '#E0F0FE',   // Very light blue
  primary200: '#BAE1FD',   // Light blue
  primary300: '#7CC8FC',   // Medium light blue
  primary400: '#36ACFA',   // Medium blue
  primary500: '#0C8CE9',   // Primary blue - vibrant but soft
  primary600: '#0070C7',   // Darker blue
  primary700: '#0158A1',   // Dark blue
  primary800: '#064C85',   // Very dark blue
  primary900: '#0B406E',   // Deep blue

  // Pastel secondary - mint green
  secondary50: '#F0FDF9',  // Ultra light mint
  secondary100: '#CCFBF1', // Very light mint
  secondary200: '#99F6E4', // Light mint
  secondary300: '#5EEAD4', // Medium light mint
  secondary400: '#2DD4BF', // Medium mint
  secondary500: '#14B8A6', // Primary mint
  secondary600: '#0D9488', // Darker mint
  secondary700: '#0F766E', // Dark mint
  secondary800: '#115E59', // Very dark mint
  secondary900: '#134E4A', // Deep mint

  // Pastel accent - lavender
  accent50: '#FAF5FF',     // Ultra light lavender
  accent100: '#F3E8FF',   // Very light lavender
  accent200: '#E9D5FF',   // Light lavender
  accent300: '#D8B4FE',   // Medium light lavender
  accent400: '#C084FC',   // Medium lavender
  accent500: '#A855F7',   // Primary lavender
  accent600: '#9333EA',   // Darker lavender
  accent700: '#7C3AED',   // Dark lavender
  accent800: '#6B21A8',   // Very dark lavender
  accent900: '#581C87',   // Deep lavender

  // Warm accent - sand/beige
  warm50: '#FFFBF7',      // Ultra light sand
  warm100: '#FEF7ED',     // Very light sand
  warm200: '#FDEDCF',     // Light sand
  warm300: '#FBD38D',     // Medium light sand
  warm400: '#F6AD55',     // Medium sand
  warm500: '#ED8936',     // Primary sand
  warm600: '#DD6B20',     // Darker sand
  warm700: '#C05621',     // Dark sand
  warm800: '#9A3412',     // Very dark sand
  warm900: '#7C2D12',     // Deep sand

  // Status colors - soft and professional
  success50: '#F0FDF9',
  success100: '#DCFCE7',
  success200: '#BBF7D0',
  success300: '#86EFAC',
  success400: '#4ADE80',
  success500: '#22C55E',  // Soft green
  success600: '#16A34A',
  success700: '#15803D',
  success800: '#166534',
  success900: '#14532D',

  warning50: '#FFFBEB',
  warning100: '#FEF3C7',
  warning200: '#FDE68A',
  warning300: '#FCD34D',
  warning400: '#FBBF24',
  warning500: '#F59E0B',  // Soft amber
  warning600: '#D97706',
  warning700: '#B45309',
  warning800: '#92400E',
  warning900: '#78350F',

  error50: '#FEF2F2',
  error100: '#FEE2E2',
  error200: '#FECACA',
  error300: '#FCA5A5',
  error400: '#F87171',
  error500: '#EF4444',   // Soft red
  error600: '#DC2626',
  error700: '#B91C1C',
  error800: '#991B1B',
  error900: '#7F1D1D',

  info50: '#F0F9FF',
  info100: '#E0F2FE',
  info200: '#BAE6FD',
  info300: '#7DD3FC',
  info400: '#38BDF8',
  info500: '#0EA5E9',    // Soft cyan
  info600: '#0284C7',
  info700: '#0369A1',
  info800: '#075985',
  info900: '#0C4A6E',

  // Glassmorphism colors
  glass: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.18)',
    shadow: 'rgba(255, 255, 255, 0.1)',
  },

  // Overlay colors for depth
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    medium: 'rgba(255, 255, 255, 0.6)',
    heavy: 'rgba(255, 255, 255, 0.4)',
  },
};

export const Typography = {
  // Modern font stack - clean and contemporary
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  fontFamilyMono: "'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",

  // Refined font sizes - more elegant hierarchy
  xs: '11px',      // Micro text, timestamps
  sm: '13px',      // Small labels, captions
  base: '15px',    // Body text - slightly larger for readability
  lg: '17px',      // Large body, section headers
  xl: '20px',      // Card headers, page titles
  '2xl': '24px',   // Dashboard headers
  '3xl': '28px',   // Page headers
  '4xl': '32px',   // Main titles
  '5xl': '40px',   // Hero titles

  // Modern font weights - refined
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,

  // Improved line heights for modern typography
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,

  // Subtle letter spacing for elegance
  tighter: '-0.025em',
  tight: '-0.01em',
  normal: '0em',
  wide: '0.01em',
  wider: '0.025em',
  widest: '0.05em',
};

export const Spacing = {
  // Refined 4px grid with more options
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  18: '72px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
};

export const BorderRadius = {
  none: '0px',
  xs: '2px',       // Minimal - for subtle elements
  sm: '6px',       // Small - buttons, inputs
  md: '8px',       // Medium - cards, modals
  lg: '12px',      // Large - containers
  xl: '16px',      // Extra large - hero sections
  '2xl': '20px',   // Very large - special elements
  '3xl': '24px',   // Ultra large - premium feel
  full: '9999px',  // Circles, pills
};

export const Shadows = {
  none: 'none',
  // Subtle inner shadows for glassmorphism
  inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  innerMd: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Soft outer shadows for depth
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 2px 6px 0 rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.08)',

  // Glassmorphism shadows
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  glassMd: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  glassLg: '0 8px 32px 0 rgba(31, 38, 135, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2)',

  // Colored shadows for accents
  primary: '0 4px 14px 0 rgba(12, 140, 233, 0.15)',
  secondary: '0 4px 14px 0 rgba(20, 184, 166, 0.15)',
  accent: '0 4px 14px 0 rgba(168, 85, 247, 0.15)',
};

export const Borders = {
  width1: '1px',
  width2: '2px',
  width3: '3px',
  style: 'solid',
  color: Colors.neutral200,
  colorLight: Colors.neutral100,
  colorGlass: 'rgba(255, 255, 255, 0.2)',
};

export const Transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Component-specific tokens
export const Components = {
  Button: {
    heightSm: '36px',
    heightMd: '44px',
    heightLg: '52px',
    paddingX: '20px',
    fontWeight: Typography.medium,
    fontSize: Typography.sm,
    borderRadius: BorderRadius.sm,
    transition: Transitions.normal,
    shadow: Shadows.xs,
    shadowHover: Shadows.sm,
  },

  Input: {
    height: '44px',
    paddingX: '16px',
    paddingY: '12px',
    fontSize: Typography.sm,
    borderRadius: BorderRadius.sm,
    border: `${Borders.width1} ${Borders.style} ${Borders.color}`,
    transition: Transitions.normal,
    shadow: Shadows.xs,
    focusShadow: Shadows.primary,
  },

  Card: {
    borderRadius: BorderRadius.lg,
    border: `${Borders.width1} ${Borders.style} ${Colors.glass.border}`,
    padding: Spacing[6],
    backgroundColor: Colors.glass.background,
    shadow: Shadows.glass,
    backdropFilter: 'blur(16px)',
    innerShadow: Shadows.inner,
  },

  Table: {
    headerBackground: Colors.overlay.light,
    headerBorder: `${Borders.width1} ${Borders.style} ${Colors.neutral200}`,
    rowBorder: `${Borders.width1} ${Borders.style} rgba(0, 0, 0, 0.04)`,
    rowHoverBackground: Colors.primary50,
    headerFontWeight: Typography.semibold,
    headerFontSize: Typography.xs,
    rowFontSize: Typography.sm,
    borderRadius: BorderRadius.md,
  },

  Modal: {
    borderRadius: BorderRadius.xl,
    shadow: Shadows.glassLg,
    backgroundColor: Colors.glass.background,
    overlayBackground: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    border: `${Borders.width1} ${Borders.style} ${Colors.glass.border}`,
  },

  Sidebar: {
    backgroundColor: Colors.overlay.medium,
    width: '280px',
    borderRight: `${Borders.width1} ${Borders.style} ${Colors.neutral200}`,
    textColor: Colors.neutral700,
    shadow: Shadows.md,
    backdropFilter: 'blur(12px)',
  },

  Header: {
    backgroundColor: Colors.overlay.light,
    borderBottom: `${Borders.width1} ${Borders.style} ${Colors.neutral200}`,
    height: '72px',
    shadow: Shadows.xs,
    backdropFilter: 'blur(8px)',
  },

  // New glassmorphism components
  GlassCard: {
    background: Colors.glass.background,
    border: `${Borders.width1} ${Borders.style} ${Colors.glass.border}`,
    borderRadius: BorderRadius.lg,
    shadow: Shadows.glass,
    backdropFilter: 'blur(16px) saturate(180%)',
    innerShadow: Shadows.inner,
  },

  FloatingCard: {
    background: Colors.white,
    border: `${Borders.width1} ${Borders.style} ${Colors.neutral100}`,
    borderRadius: BorderRadius.xl,
    shadow: Shadows.lg,
    transform: 'translateY(-2px)',
    transition: Transitions.normal,
  },

  Badge: {
    borderRadius: BorderRadius.sm,
    paddingX: Spacing[2],
    paddingY: Spacing[0.5],
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    shadow: Shadows.xs,
  },

  Avatar: {
    borderRadius: BorderRadius.full,
    shadow: Shadows.sm,
    border: `${Borders.width2} ${Borders.style} ${Colors.white}`,
  },

  Tooltip: {
    backgroundColor: Colors.neutral800,
    color: Colors.white,
    borderRadius: BorderRadius.sm,
    shadow: Shadows.lg,
    fontSize: Typography.xs,
    padding: `${Spacing[1]} ${Spacing[2]}`,
  },

  Dropdown: {
    backgroundColor: Colors.white,
    border: `${Borders.width1} ${Borders.style} ${Colors.neutral200}`,
    borderRadius: BorderRadius.md,
    shadow: Shadows.lg,
    backdropFilter: 'blur(8px)',
  },
};
