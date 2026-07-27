/**
 * Design tokens from the approved light-mode concepts.
 * These are the single source of truth for colour and spacing — screens must not
 * hard-code hex values.
 */

export const colors = {
  paper: '#FFFFFF',
  ground: '#EFF2F0',
  ink: '#14181A',
  ink2: '#5C6A68',
  ink3: '#939E9C',
  line: '#E2E7E5',

  accent: '#0E5E58',
  accentTint: '#DCEAE7',
  accentInk: '#0B4A45',

  ochre: '#A96A15',
  ochreTint: '#F7EDDD',
  ochreInk: '#7C4E10',

  brick: '#A63A2C',

  onAccent: '#FFFFFF',
} as const;

/** Muted enough that eight can sit together without shouting. */
export const categoryPalette = [
  '#6E8F5E', // sage
  '#C0715A', // clay
  '#5D7A93', // slate
  '#8A8478', // stone
  '#3F8079', // teal
  '#85608B', // plum
  '#B0616F', // rose
  '#9AA3A0', // grey
] as const;

export const radius = {
  sm: 9,
  md: 11,
  lg: 14,
  xl: 16,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** Tab bar height excluding the safe-area inset. */
export const TAB_BAR_HEIGHT = 58;

/** Every scrollable screen pads by this so content never hides under the add button. */
export const SCROLL_BOTTOM_INSET = TAB_BAR_HEIGHT + 44;
