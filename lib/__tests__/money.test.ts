import { formatAmount, formatKr, formatSigned, formatWhole, krToMinor } from '../money';

describe('formatAmount', () => {
  it('formats øre as Danish decimals', () => {
    expect(formatAmount(24850)).toBe('248,50');
    expect(formatAmount(500)).toBe('5,00');
    expect(formatAmount(5)).toBe('0,05');
    expect(formatAmount(0)).toBe('0,00');
  });

  it('groups thousands with a dot, not a comma', () => {
    expect(formatAmount(124850)).toBe('1.248,50');
    expect(formatAmount(1234567890)).toBe('12.345.678,90');
  });

  it('uses a real minus sign for negatives', () => {
    expect(formatAmount(-24850)).toBe('−248,50');
  });
});

describe('formatWhole', () => {
  it('rounds to whole kroner for hero figures', () => {
    expect(formatWhole(158043)).toBe('1.580');
    expect(formatWhole(24850)).toBe('249');
    expect(formatWhole(0)).toBe('0');
  });
});

describe('formatKr', () => {
  it('appends the unit', () => {
    expect(formatKr(24850)).toBe('248,50 kr.');
  });
});

describe('formatSigned', () => {
  it('marks direction explicitly', () => {
    expect(formatSigned(2840000, 'in')).toBe('+28.400,00');
    expect(formatSigned(24850, 'out')).toBe('−248,50');
  });
});

describe('krToMinor', () => {
  it('avoids float drift', () => {
    expect(krToMinor(0.1 + 0.2)).toBe(30);
    expect(krToMinor(248.5)).toBe(24850);
  });
});
