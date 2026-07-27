import {
  emptyAmount, displayAmount, isEmpty, pressBackspace, pressComma, pressDigit, toMinor,
} from '../amountInput';
import type { AmountInput } from '../amountInput';

/** Type a sequence of keys the way the numpad would. */
function type(keys: string): AmountInput {
  return [...keys].reduce((state, key) => {
    if (key === ',') return pressComma(state);
    if (key === '<') return pressBackspace(state);
    return pressDigit(state, key);
  }, emptyAmount);
}

describe('decimals are optional', () => {
  it('treats a bare number as whole kroner', () => {
    const a = type('85');
    expect(displayAmount(a)).toBe('85');
    expect(toMinor(a)).toBe(8500);
  });

  it('fills unentered decimal places with zeros', () => {
    expect(toMinor(type('85,'))).toBe(8500);
    expect(toMinor(type('85,5'))).toBe(8550);
    expect(toMinor(type('85,50'))).toBe(8550);
  });
});

describe('input limits', () => {
  it('ignores digits once both decimal places are filled', () => {
    const a = type('248,50');
    const b = pressDigit(a, '9');
    expect(displayAmount(b)).toBe('248,50');
    expect(toMinor(b)).toBe(24850);
  });

  it('ignores a second comma', () => {
    expect(displayAmount(type('12,3,4'))).toBe('12,34');
  });

  it('does not keep a leading zero', () => {
    expect(displayAmount(type('05'))).toBe('5');
  });

  it('starts decimals from zero when comma is pressed first', () => {
    expect(toMinor(type(',5'))).toBe(50);
  });
});

describe('backspace', () => {
  it('removes decimal digits, then the comma, then whole digits', () => {
    let a = type('248,50');
    a = pressBackspace(a);
    expect(displayAmount(a)).toBe('248,5');
    a = pressBackspace(a);
    expect(displayAmount(a)).toBe('248,');
    a = pressBackspace(a);
    expect(displayAmount(a)).toBe('248');
    a = pressBackspace(a);
    expect(displayAmount(a)).toBe('24');
  });

  it('bottoms out at zero rather than going negative', () => {
    const a = type('5<<<');
    expect(displayAmount(a)).toBe('0');
    expect(isEmpty(a)).toBe(true);
  });
});

describe('display', () => {
  it('groups thousands while typing', () => {
    expect(displayAmount(type('12345'))).toBe('12.345');
  });

  it('shows zero for empty input', () => {
    expect(displayAmount(emptyAmount)).toBe('0');
    expect(isEmpty(emptyAmount)).toBe(true);
  });
});
