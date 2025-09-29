import { colors, spacing, borderRadius, shadows, typography, breakpoints, zIndex } from './tokens';

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints,
  zIndex,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Typography = typeof typography;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;

// Re-export tokens for direct access
export * from './tokens';
