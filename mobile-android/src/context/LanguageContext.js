// FarmConnect Language Context (Phase 16)
import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en', 'kn', 'hi'

  function t(key) {
    const langDict = translations[currentLanguage] || translations.en;
    return langDict[key] || translations.en[key] || key;
  }

  function changeLanguage(langCode) {
    if (['en', 'kn', 'hi'].includes(langCode)) {
      setCurrentLanguage(langCode);
    }
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLanguage: 'en',
      changeLanguage: () => {},
      t: (key) => key,
    };
  }
  return context;
}
