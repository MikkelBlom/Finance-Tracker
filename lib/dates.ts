/**
 * All date handling is local-time. The user is in one timezone and cares about
 * "which calendar day did I spend this on", so UTC conversion would only ever
 * introduce off-by-one-day bugs around midnight.
 */

const MONTHS_DA = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar day as YYYY-MM-DD. */
export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local month as YYYY-MM. */
export function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Full local timestamp, stored on every row. */
export function toIso(d: Date): string {
  return `${toDayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function parseIso(iso: string): Date {
  const [datePart, timePart = '00:00:00'] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0);
}

export function monthKeyOfIso(iso: string): string {
  return iso.slice(0, 7);
}

export function dayKeyOfIso(iso: string): string {
  return iso.slice(0, 10);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/** Days remaining in the month including today. Returns the full month if `today` is elsewhere. */
export function daysLeftInMonth(monthKey: string, today: Date): number {
  const total = daysInMonth(monthKey);
  if (toMonthKey(today) !== monthKey) return total;
  return total - today.getDate() + 1;
}

/** How far through the month we are, 0..1 — the pace marker on the budget bar. */
export function monthProgress(monthKey: string, today: Date): number {
  const total = daysInMonth(monthKey);
  if (toMonthKey(today) !== monthKey) return 1;
  return today.getDate() / total;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTHS_DA[m - 1]} ${y}`;
}

/** "27 Jul" — the compact form used in lists. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** "09:12" */
export function timeOfDay(iso: string): string {
  return iso.slice(11, 16);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toMonthKey(d);
}

export function parseDayKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dayKey: string, delta: number): string {
  const d = parseDayKey(dayKey);
  d.setDate(d.getDate() + delta);
  return toDayKey(d);
}

/** Whole days from `fromKey` to `toKey`. Negative when toKey is earlier. */
export function daysBetween(fromKey: string, toKey: string): number {
  const ms = parseDayKey(toKey).getTime() - parseDayKey(fromKey).getTime();
  // Round rather than floor: DST shifts make some "days" 23 or 25 hours long.
  return Math.round(ms / 86400000);
}

export function firstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function lastDayOfMonth(monthKey: string): string {
  return `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, '0')}`;
}

/**
 * Weekday index with Monday as 0, matching how a Danish calendar is laid out.
 * JavaScript puts Sunday at 0, which would shift every row by one.
 */
export function mondayFirstWeekday(dayKey: string): number {
  return (parseDayKey(dayKey).getDay() + 6) % 7;
}

/** "27 Jul 2026" */
export function longDate(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}
