import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useT } from '../i18n/LangProvider';
import { LANGS, type Lang, type MessageKey } from '../i18n/messages';

export function SettingsScreen() {
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
    </div>
  );
}
