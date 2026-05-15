import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LangProvider } from './i18n/LangProvider';
import { LANG_STORAGE_KEY } from './i18n/LangProvider';
import { DEFAULT_LANG, LANGS } from './i18n/messages';
import { ConfirmProvider } from './components/ConfirmDialog';
import './index.css';

// Apply the saved language to <html> before React paints so there's no RTL/LTR flash.
try {
  let lang: string | null = localStorage.getItem(LANG_STORAGE_KEY);
  if (!(LANGS as readonly string[]).includes(lang ?? '')) {
    lang = DEFAULT_LANG;
  }
  const root = document.documentElement;
  root.lang = lang!;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.dataset.lang = lang!;
} catch {
  /* ignore */
}

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

createRoot(container).render(
  <StrictMode>
    <LangProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </LangProvider>
  </StrictMode>,
);
