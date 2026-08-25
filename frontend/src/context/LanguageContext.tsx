import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { t, type TranslationKey } from '../i18n/translations';
import type { LanguageCode } from '../types';

const LANG_KEY = 'duhuza_lang';

interface LanguageContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  tr: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(LANG_KEY) as LanguageCode | null;
    return saved && ['EN', 'RW', 'SW'].includes(saved) ? saved : 'RW';
  });

  const setLang = useCallback((l: LanguageCode) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  const tr = useCallback((key: TranslationKey) => t(lang, key), [lang]);

  const value = useMemo(() => ({ lang, setLang, tr }), [lang, setLang, tr]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
