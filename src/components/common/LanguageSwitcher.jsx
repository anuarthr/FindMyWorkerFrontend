import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`flex gap-1 bg-white/10 rounded-lg p-1 ${className}`}>
      <button 
        onClick={() => changeLanguage('es')}
        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
          i18n.language.startsWith('es') 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-neutral-dark/60 hover:text-primary hover:bg-white/50'
        }`}
      >
        ES
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
          i18n.language.startsWith('en') 
            ? 'bg-primary text-white shadow-sm' 
            : 'text-neutral-dark/60 hover:text-primary hover:bg-white/50'
        }`}
      >
        EN
      </button>
    </div>
  );
}
