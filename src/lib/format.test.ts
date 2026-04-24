import { describe, it, expect } from 'vitest';
import {
  AR_MONTHS,
  DE_MONTHS,
  fmt,
  fmtA,
  fmtN,
  fmtDate,
  fmtMonth,
  parseDate,
  todayIso,
} from './format';

// NARROW NO-BREAK SPACE (U+202F) — between number and € symbol.
const NNBSP = ' ';

describe('fmtN', () => {
  it('formats integers with two decimals and thousands separators (en-US default)', () => {
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
  it('formats with German locale: dot thousands, comma decimal', () => {
    expect(fmtN(1234, 'de')).toBe('1.234,00');
    expect(fmtN(1234.56, 'de')).toBe('1.234,56');
    expect(fmtN(1000000, 'de')).toBe('1.000.000,00');
  });
});

describe('fmt / fmtA', () => {
  it('Arabic-locale: € prefix with narrow NBSP', () => {
    expect(fmtA(50)).toBe(`€${NNBSP}50.00`);
    expect(fmtA(-50)).toBe(`€${NNBSP}50.00`);
    expect(fmt(50)).toBe(`€${NNBSP}50.00`);
    expect(fmt(-50)).toBe(`-€${NNBSP}50.00`);
  });
  it('German-locale: € suffix with narrow NBSP', () => {
    expect(fmtA(50, 'de')).toBe(`50,00${NNBSP}€`);
    expect(fmtA(1234.5, 'de')).toBe(`1.234,50${NNBSP}€`);
    expect(fmt(1234.5, 'de')).toBe(`1.234,50${NNBSP}€`);
    expect(fmt(-1234.5, 'de')).toBe(`-1.234,50${NNBSP}€`);
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

describe('fmtDate', () => {
  it('Arabic: "1 أبريل 2026"', () => {
    expect(fmtDate('2026-04-01')).toBe('1 أبريل 2026');
    expect(fmtDate('2026-12-31')).toBe('31 ديسمبر 2026');
  });
  it('German: "1. April 2026"', () => {
    expect(fmtDate('2026-04-01', 'de')).toBe('1. April 2026');
    expect(fmtDate('2026-12-31', 'de')).toBe('31. Dezember 2026');
  });
});

describe('fmtMonth', () => {
  it('Arabic: "يناير 2026"', () => {
    expect(fmtMonth('2026-01')).toBe('يناير 2026');
    expect(fmtMonth('2026-12')).toBe('ديسمبر 2026');
  });
  it('German: "Januar 2026"', () => {
    expect(fmtMonth('2026-01', 'de')).toBe('Januar 2026');
    expect(fmtMonth('2026-12', 'de')).toBe('Dezember 2026');
  });
});

describe('month arrays', () => {
  it('AR_MONTHS has 12 Arabic months in order', () => {
    expect(AR_MONTHS).toHaveLength(12);
    expect(AR_MONTHS[0]).toBe('يناير');
    expect(AR_MONTHS[11]).toBe('ديسمبر');
  });
  it('DE_MONTHS has 12 German months in order', () => {
    expect(DE_MONTHS).toHaveLength(12);
    expect(DE_MONTHS[0]).toBe('Januar');
    expect(DE_MONTHS[11]).toBe('Dezember');
  });
});

describe('todayIso', () => {
  it('returns YYYY-MM-DD of length 10', () => {
    const t = todayIso();
    expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(t).toHaveLength(10);
  });
});
