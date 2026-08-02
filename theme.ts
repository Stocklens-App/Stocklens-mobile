// theme.ts

// Dark palette — your existing values, unchanged
export const darkColors = {
  background: '#11141A',
  surface: '#1C212D',
  border: '#2A3245',
  primary: '#3478F6',
  textMain: '#FFFFFF',
  textSecondary: '#7E8494',
  error: '#FF4D4D',
  success: '#00C896',
};

// Light palette — the considered counterpart
export const lightColors = {
  background: '#F4F7FC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  primary: '#3478F6',
  textMain: '#0F1B2D',
  textSecondary: '#5D6B82',
  error: '#E23744',
  success: '#0E9F6E',
};

export type ThemeColors = typeof darkColors;

// Backward-compat: existing screens import { COLORS } and still work (dark).
// We migrate them to useTheme() one by one; nothing breaks in the meantime.
export const COLORS = darkColors;

export const SIZES = {
  radius: 8,
  padding: 20,
};