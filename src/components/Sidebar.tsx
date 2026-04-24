import type { Screen } from '../types';
import { NAV_ITEMS } from './nav-items';
import { useT } from '../i18n/LangProvider';
import { LANGS, type Lang } from '../i18n/messages';

type Props = {
  screen: Screen;
  setScreen: (s: Screen) => void;
};

export function Sidebar({ screen, setScreen }: Props) {
  const { t, lang, setLang } = useT();

  return (
    <aside
      style={{
        width: 'var(--sidebar-w-lg)',
        background: 'var(--teal-dark)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0 24px',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '28px 20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid oklch(100% 0 0 / 0.1)',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            background: 'oklch(100% 0 0 / 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            width={20}
            height={20}
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
          {t('app.name')}
        </span>
      </div>

      <nav
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}
      >
        {NAV_ITEMS.map(({ id, labelKey, Icon }) => {
          const active = screen === id;
          const label = t(labelKey);
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              title={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                justifyContent: 'flex-start',
                borderRadius: 12,
                border: 'none',
                background: active ? 'oklch(100% 0 0 / 0.15)' : 'transparent',
                color: active ? '#fff' : 'oklch(100% 0 0 / 0.55)',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: active ? 700 : 500,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    insetInlineEnd: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 3,
                    borderRadius: '4px 0 0 4px',
                    background: '#fff',
                  }}
                />
              )}
              <Icon s={22} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div
        style={{
          padding: '16px 14px 0',
          borderTop: '1px solid oklch(100% 0 0 / 0.1)',
          marginInline: 10,
          marginTop: 12,
        }}
      >
        <p
          style={{
            color: 'oklch(100% 0 0 / 0.55)',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            paddingInlineStart: 4,
          }}
        >
          {t('lang.label')}
        </p>
        <div
          role="group"
          aria-label={t('lang.label')}
          style={{ display: 'flex', gap: 6 }}
        >
          {LANGS.map((l: Lang) => {
            const active = lang === l;
            return (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  minHeight: 44,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1.5px solid',
                  borderColor: active ? '#fff' : 'oklch(100% 0 0 / 0.2)',
                  background: active ? 'oklch(100% 0 0 / 0.18)' : 'transparent',
                  color: active ? '#fff' : 'oklch(100% 0 0 / 0.65)',
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {t(l === 'ar' ? 'lang.ar' : 'lang.de')}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
