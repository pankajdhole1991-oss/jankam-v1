import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';

export type LanguageCode = 'en' | 'hi' | 'mr';

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations: Record<LanguageCode, any> = { en, hi, mr };

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('jankam_site_lang');
    if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved as LanguageCode;
    
    // Auto-detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'hi') return 'hi';
    if (browserLang === 'mr') return 'mr';
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('jankam_site_lang', lang);
    localStorage.setItem('jankam_session_lang', lang); // sync form setting
    window.dispatchEvent(new Event('jankam-language-change'));
    window.dispatchEvent(new Event('jankam-settings-update')); // trigger components refresh
  };

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('jankam_site_lang');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        if (saved !== language) {
          setLanguageState(saved as LanguageCode);
        }
      }
    };
    window.addEventListener('jankam-language-change', handleSync);
    return () => window.removeEventListener('jankam-language-change', handleSync);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result = translations[language];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return key; // return original key path if completely missing
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
export { translations };
