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

export function parseDate(d: string): Date {
  return new Date(d + 'T00:00:00');
}

export function fmtN(n: number): string {
  return Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const NBSP = ' ';

export function fmt(n: number): string {
  return (n < 0 ? '-' : '') + '€' + NBSP + fmtN(n);
}

export function fmtA(n: number): string {
  return '€' + NBSP + fmtN(n);
}

export function fmtDateAr(d: string): string {
  const date = parseDate(d);
  return `${date.getDate()} ${AR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function fmtMonthAr(yyyymm: string): string {
  const date = parseDate(yyyymm + '-01');
  return `${AR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
