import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 ${className}`}
    >
      <span className="material-symbols-outlined text-base">translate</span>
      <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};
