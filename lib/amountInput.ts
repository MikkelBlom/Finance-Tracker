/**
 * The numpad's state machine. Decimals are optional: typing 8-5 gives 85,00 while
 * 8-5-,-5-0 gives 85,50. Pure and separately testable, because this is the single
 * most-used interaction in the app and a bug here is a wrong number in the ledger.
 */

export type AmountInput = {
  /** Digits before the comma. */
  whole: string;
  /** null until the comma is pressed, then 0-2 digits. */
  decimals: string | null;
};

const MAX_WHOLE_DIGITS = 7; // 9.999.999 kr. is well past anything realistic

export const emptyAmount: AmountInput = { whole: '', decimals: null };

export function pressDigit(input: AmountInput, digit: string): AmountInput {
  if (input.decimals === null) {
    // Leading zeros are meaningless — typing 0 then 5 should give 5, not 05.
    const next = input.whole === '0' ? digit : input.whole + digit;
    if (next.length > MAX_WHOLE_DIGITS) return input;
    return { ...input, whole: next };
  }
  if (input.decimals.length >= 2) return input;
  return { ...input, decimals: input.decimals + digit };
}

export function pressComma(input: AmountInput): AmountInput {
  if (input.decimals !== null) return input;
  return { whole: input.whole === '' ? '0' : input.whole, decimals: '' };
}

export function pressBackspace(input: AmountInput): AmountInput {
  if (input.decimals !== null) {
    if (input.decimals.length > 0) {
      return { ...input, decimals: input.decimals.slice(0, -1) };
    }
    return { ...input, decimals: null };
  }
  return { ...input, whole: input.whole.slice(0, -1) };
}

/** What the big number on screen reads, with Danish thousands separators. */
export function displayAmount(input: AmountInput): string {
  const whole = input.whole === '' ? '0' : input.whole;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (input.decimals === null) return grouped;
  return `${grouped},${input.decimals}`;
}

/** Value in øre. Unentered decimal places are zeros: "85," -> 8500. */
export function toMinor(input: AmountInput): number {
  const kr = parseInt(input.whole || '0', 10);
  const ore = parseInt((input.decimals ?? '').padEnd(2, '0') || '0', 10);
  return kr * 100 + ore;
}

export function isEmpty(input: AmountInput): boolean {
  return toMinor(input) === 0;
}
