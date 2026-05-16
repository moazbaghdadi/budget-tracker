export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'SYP' | 'SAR' | 'AED' | 'TRY';

export type CurrencyDef = {
  code: CurrencyCode;
  symbol: string;
  position: 'prefix' | 'suffix';
};

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  EUR: { code: 'EUR', symbol: '€', position: 'prefix' },
  USD: { code: 'USD', symbol: '$', position: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', position: 'prefix' },
  TRY: { code: 'TRY', symbol: '₺', position: 'prefix' },
  SYP: { code: 'SYP', symbol: 'ل.س', position: 'suffix' },
  SAR: { code: 'SAR', symbol: 'ر.س', position: 'suffix' },
  AED: { code: 'AED', symbol: 'د.إ', position: 'suffix' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === 'string' && v in CURRENCIES;
}
