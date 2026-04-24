import type { Lang } from '../i18n/messages';

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

export function parseDate(d: string): Date {
  return new Date(d + 'T00:00:00');
}

// NARROW NO-BREAK SPACE (U+202F) — used between number and € symbol.
const NBSP = ' ';

export function fmtN(n: number, lang: Lang = 'ar'): string {
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  return Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// With sign. German places € after the amount; Arabic keeps € prefix with English digits.
export function fmt(n: number, lang: Lang = 'ar'): string {
  const abs = fmtN(n, lang);
  const sign = n < 0 ? '-' : '';
  return lang === 'de' ? `${sign}${abs}${NBSP}€` : `${sign}€${NBSP}${abs}`;
}

// Absolute value, no sign.
export function fmtA(n: number, lang: Lang = 'ar'): string {
  const abs = fmtN(n, lang);
  return lang === 'de' ? `${abs}${NBSP}€` : `€${NBSP}${abs}`;
}

export function fmtDate(d: string, lang: Lang = 'ar'): string {
  const date = parseDate(d);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (lang === 'de') return `${day}. ${DE_MONTHS[month]} ${year}`;
  return `${day} ${AR_MONTHS[month]} ${year}`;
}

export function fmtMonth(yyyymm: string, lang: Lang = 'ar'): string {
  const date = parseDate(yyyymm + '-01');
  const month = date.getMonth();
  const year = date.getFullYear();
  if (lang === 'de') return `${DE_MONTHS[month]} ${year}`;
  return `${AR_MONTHS[month]} ${year}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
