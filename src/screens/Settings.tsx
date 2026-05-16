import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useT } from '../i18n/LangProvider';
import { LANGS, type Lang, type MessageKey } from '../i18n/messages';
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode } from '../lib/currency';

type Props = {
  currency: CurrencyCode;
  onSetCurrency: (code: CurrencyCode) => void;
};

export function SettingsScreen({ currency, onSetCurrency }: Props) {
  const { t, lang, setLang } = useT();

  return (
    <div>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Card>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 14,
          }}
        >
          {t('settings.section.language')}
        </h2>
        <div
          role="group"
          aria-label={t('settings.section.language')}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          {LANGS.map((l: Lang) => {
            const active = lang === l;
            return (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={active}
                style={{
                  flex: '1 1 120px',
                  minHeight: 52,
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: '1.5px solid',
                  borderColor: active ? 'var(--teal)' : 'var(--border)',
                  background: active ? 'var(--teal)' : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text)',
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t(`lang.${l}` as MessageKey)}
              </button>
            );
          })}
        </div>
      </Card>
      <div style={{ height: 18 }} />
      <Card>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 14,
          }}
        >
          {t('settings.section.currency')}
        </h2>
        <div
          role="radiogroup"
          aria-label={t('settings.section.currency')}
          style={{ display: 'grid', gap: 8 }}
        >
          {CURRENCY_CODES.map((code) => {
            const def = CURRENCIES[code];
            const active = currency === code;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSetCurrency(code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  minHeight: 52,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: '1.5px solid',
                  borderColor: active ? 'var(--teal)' : 'var(--border)',
                  background: active ? 'var(--teal-light)' : 'var(--surface)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  fontSize: 15,
                  textAlign: 'start',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    minWidth: 32,
                    fontSize: 18,
                    fontWeight: 700,
                    color: active ? 'var(--teal)' : 'var(--text)',
                  }}
                >
                  {def.symbol}
                </span>
                <span style={{ flex: 1, fontWeight: active ? 700 : 500 }}>
                  {t(`currency.label.${code}` as MessageKey)}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{code}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
