'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LocalizationContext = createContext();

export const currencies = {
  MUR: { symbol: 'Rs', rate: 1, label: 'MUR', locale: 'en-MU' },
  EUR: { symbol: '€', rate: 0.02, label: 'EUR', locale: 'fr-FR' },
  USD: { symbol: '$', rate: 0.022, label: 'USD', locale: 'en-US' },
  CNY: { symbol: '¥', rate: 0.16, label: 'CNY', locale: 'zh-CN' },
};

export const languages = {
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  zh: { label: '中文', flag: '🇨🇳' },
};

export function LocalizationProvider({ children }) {
  const [currency, setCurrency] = useState('MUR');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('user-currency');
    const savedLang = localStorage.getItem('user-language');
    if (savedCurrency && currencies[savedCurrency]) setCurrency(savedCurrency);
    if (savedLang && languages[savedLang]) setLanguage(savedLang);
  }, []);

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('user-currency', code);
  };

  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem('user-language', code);
  };

  const formatPrice = (amountMUR) => {
    const { rate, locale, symbol } = currencies[currency];
    const converted = amountMUR * rate;
    
    // Use the native Intl formatter based on selected locale/currency
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'MUR' ? 0 : 2,
    }).format(converted);
  };

  return (
    <LocalizationContext.Provider value={{ 
      currency, setCurrency: changeCurrency, 
      language, setLanguage: changeLanguage,
      formatPrice, currencies, languages 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const useLocalization = () => useContext(LocalizationContext);