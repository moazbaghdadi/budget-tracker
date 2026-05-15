import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fmt, fmtA, fmtDate, fmtMonth } from '../lib/format';
import {
  DEFAULT_LANG,
  LANGS,
  interpolate,
  translate,
  type Lang,
  type MessageKey,
} from './messages';

export const LANG_STORAGE_KEY = 'muhaseb-tech:lang';

type TContext = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: MessageKey) => string;
  tp: (key: MessageKey, params: Record<string, string | number>) => string;
  fmtMoney: (n: number) => string;
  fmtMoneyAbs: (n: number) => string;
  fmtDate: (iso: string) => string;
  fmtMonth: (yyyymm: string) => string;
};

const LangContext = createContext<TContext | null>(null);

function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

function initialLang(): Lang {
  return readStoredLang() ?? DEFAULT_LANG;
}

export function LangProvider({
  children,
  initialLang: initial,
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(() => initial ?? initialLang());

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.dataset.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore storage errors (private mode, quota) */
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const value = useMemo<TContext>(
    () => ({
      lang,
      setLang,
      t: (key) => translate(lang, key),
      tp: (key, params) => interpolate(lang, key, params),
      fmtMoney: (n) => fmt(n, lang),
      fmtMoneyAbs: (n) => fmtA(n, lang),
      fmtDate: (iso) => fmtDate(iso, lang),
      fmtMonth: (ym) => fmtMonth(ym, lang),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useT(): TContext {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useT must be used inside <LangProvider>');
  return ctx;
}
