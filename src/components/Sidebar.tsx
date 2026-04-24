import type { Screen } from '../types';
import { NAV_ITEMS } from './nav-items';

type Props = {
  screen: Screen;
  setScreen: (s: Screen) => void;
};

export function Sidebar({ screen, setScreen }: Props) {
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
          متتبع الميزانية
        </span>
      </div>

      <nav
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = screen === id;
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
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
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
                    right: 0,
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
    </aside>
  );
}
