/**
 * Money is stored and passed around as an integer number of øre. Never as a float —
 * 0.1 + 0.2 problems in a finance app are not acceptable.
 *
 * Formatting is hand-rolled rather than using Intl so that it is identical on web,
 * Android and in tests, with no dependency on the JS engine's locale data.
 */

/** Group the integer part Danish-style: 1234567 -> "1.234.567" */
function group(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 124850 -> "1.248,50" */
export function formatAmount(minor: number): string {
  const negative = minor < 0;
  const abs = Math.abs(Math.round(minor));
  const kr = Math.floor(abs / 100);
  const ore = abs % 100;
  const body = `${group(String(kr))},${String(ore).padStart(2, '0')}`;
  return negative ? `−${body}` : body;
}

/** 124850 -> "1.248,50 kr." */
export function formatKr(minor: number): string {
  return `${formatAmount(minor)} kr.`;
}

/**
 * Rounded to whole kroner: 158043 -> "1.580".
 * Used for hero figures, where two decimals are noise.
 */
export function formatWhole(minor: number): string {
  const negative = minor < 0;
  const kr = Math.round(Math.abs(minor) / 100);
  const body = group(String(kr));
  return negative ? `−${body}` : body;
}

/** Signed, for entries in a list: +2.840 / −248,50 */
export function formatSigned(minor: number, direction: 'in' | 'out'): string {
  const sign = direction === 'in' ? '+' : '−';
  return `${sign}${formatAmount(Math.abs(minor))}`;
}

export function krToMinor(kr: number): number {
  return Math.round(kr * 100);
}
