import type { Lang } from '../i18n/messages';
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from './currency';

export const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

export const DE_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function parseDate(d: string): Date {
  return new Date(d + 'T00:00:00');
}

// NARROW NO-BREAK SPACE (U+202F) — used between number and currency symbol.
const NBSP = ' ';

export function fmtN(n: number, lang: Lang = 'en'): string {
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// With sign. Symbol position is per-currency (EUR/USD/GBP/TRY prefix;
// SYP/SAR/AED suffix); number separators come from `lang`.
export function fmt(
  n: number,
  lang: Lang = 'en',
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const abs = fmtN(n, lang);
  const sign = n < 0 ? '-' : '';
  const { symbol, position } = CURRENCIES[currency];
  return position === 'suffix'
    ? `${sign}${abs}${NBSP}${symbol}`
    : `${sign}${symbol}${NBSP}${abs}`;
}

// Absolute value, no sign.
export function fmtA(
  n: number,
  lang: Lang = 'en',
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  const abs = fmtN(n, lang);
  const { symbol, position } = CURRENCIES[currency];
  return position === 'suffix' ? `${abs}${NBSP}${symbol}` : `${symbol}${NBSP}${abs}`;
}

export function fmtDate(d: string, lang: Lang = 'en'): string {
  const date = parseDate(d);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (lang === 'en') return `${EN_MONTHS[month]} ${day}, ${year}`;
  if (lang === 'de') return `${day}. ${DE_MONTHS[month]} ${year}`;
  return `${day} ${AR_MONTHS[month]} ${year}`;
}

export function fmtMonth(yyyymm: string, lang: Lang = 'en'): string {
  const date = parseDate(yyyymm + '-01');
  const month = date.getMonth();
  const year = date.getFullYear();
  if (lang === 'en') return `${EN_MONTHS[month]} ${year}`;
  if (lang === 'de') return `${DE_MONTHS[month]} ${year}`;
  return `${AR_MONTHS[month]} ${year}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
