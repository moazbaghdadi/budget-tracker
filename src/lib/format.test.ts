import { describe, it, expect } from 'vitest';
import {
  AR_MONTHS,
  fmt,
  fmtA,
  fmtN,
  fmtDateAr,
  fmtMonthAr,
  parseDate,
  todayIso,
} from './format';

// Currency uses U+202F (NARROW NO-BREAK SPACE) between symbol and amount,
// per the design spec in CLAUDE.md.
const NNBSP = ' ';

describe('fmtN', () => {
  it('formats integers with two decimals and thousands separators', () => {
    expect(fmtN(1234)).toBe('1,234.00');
    expect(fmtN(0)).toBe('0.00');
    expect(fmtN(1000000)).toBe('1,000,000.00');
  });
  it('formats decimals to two places', () => {
    expect(fmtN(1.5)).toBe('1.50');
    expect(fmtN(1.234)).toBe('1.23');
    expect(fmtN(1.236)).toBe('1.24');
  });
  it('takes absolute value (sign is rendered separately)', () => {
    expect(fmtN(-50)).toBe('50.00');
  });
});

describe('fmt / fmtA', () => {
  it('fmtA never adds a sign', () => {
    expect(fmtA(50)).toBe(`€${NNBSP}50.00`);
    expect(fmtA(-50)).toBe(`€${NNBSP}50.00`);
  });
  it('fmt adds a leading minus for negatives', () => {
    expect(fmt(50)).toBe(`€${NNBSP}50.00`);
    expect(fmt(-50)).toBe(`-€${NNBSP}50.00`);
  });
});

describe('parseDate', () => {
  it('parses YYYY-MM-DD as local midnight (no TZ shift)', () => {
    const d = parseDate('2026-04-01');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3);
    expect(d.getDate()).toBe(1);
  });
});

describe('fmtDateAr', () => {
  it('renders day with Arabic month name and 4-digit year', () => {
    expect(fmtDateAr('2026-04-01')).toBe('1 أبريل 2026');
    expect(fmtDateAr('2026-12-31')).toBe('31 ديسمبر 2026');
  });
});

describe('fmtMonthAr', () => {
  it('renders month name + year from YYYY-MM', () => {
    expect(fmtMonthAr('2026-01')).toBe('يناير 2026');
    expect(fmtMonthAr('2026-12')).toBe('ديسمبر 2026');
  });
});

describe('AR_MONTHS', () => {
  it('has 12 months in order', () => {
    expect(AR_MONTHS).toHaveLength(12);
    expect(AR_MONTHS[0]).toBe('يناير');
    expect(AR_MONTHS[11]).toBe('ديسمبر');
  });
});

describe('todayIso', () => {
  it('returns YYYY-MM-DD of length 10', () => {
    const t = todayIso();
    expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(t).toHaveLength(10);
  });
});
