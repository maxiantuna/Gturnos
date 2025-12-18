
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { en, es } from '../locales/translations';

type Language = 'en' | 'es';
type Translations = Record<string, any>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  formatDate: (date: Date, options: Intl.DateTimeFormatOptions) => string;
  getShiftDisplayName: (shiftKey: import('../types').PredefinedShift | 'Sin Asignar') => string;
  getMonthName: (monthIndex: number) => string;
  getShortWeekdayName: (dayIndex: number) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'rotativeShiftSchedulerLanguage';
const DEFAULT_LANGUAGE: Language = 'es';

const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const translationsMap: Record<Language, Translations> = { en, es };

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    return (storedLang === 'en' || storedLang === 'es') ? storedLang : DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang); 
    localStorage.setItem(LANGUAGE_KEY, newLang);
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const currentTranslations = translationsMap[language];
    const keyParts = key.split('.');
    let text: any = currentTranslations;
    
    for (const part of keyParts) {
      if (text && typeof text === 'object' && part in text) {
        text = text[part];
      } else {
        return key; 
      }
    }

    if (typeof text !== 'string') {
        return key; 
    }
    
    let result = text;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      });
    }
    return result;
  }, [language]);
  
  const formatDate = useCallback((date: Date, options: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(language, options).format(date);
    } catch (e) {
      return new Intl.DateTimeFormat(undefined, options).format(date); 
    }
  }, [language]);

  const getShiftDisplayName = useCallback((shiftKey: import('../types').PredefinedShift | 'Sin Asignar') => {
    if (shiftKey === 'Sin Asignar') return t('shifts.SinAsignar');
    return t(`shifts.${shiftKey}`);
  }, [t]);

  const getMonthName = useCallback((monthIndex: number) => {
    if (monthIndex < 0 || monthIndex > 11) return '';
    return t(`months.${monthKeys[monthIndex]}`);
  }, [t]);

  const getShortWeekdayName = useCallback((dayIndex: number) => {
    if (dayIndex < 0 || dayIndex > 6) return '';
    return t(`weekdays.short.${weekdayKeys[dayIndex]}`);
  }, [t]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, getShiftDisplayName, getMonthName, getShortWeekdayName }}>
      {children}
    </LanguageContext.Provider>
  );
};
