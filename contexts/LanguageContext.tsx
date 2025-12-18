
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Language = 'en' | 'es';
type Translations = Record<string, any>; // Can be nested

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

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    return storedLang || DEFAULT_LANGUAGE;
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslationsForLang = useCallback(async (langToLoad: Language): Promise<Translations | null> => {
    let response;
    try {
      response = await fetch(`/locales/${langToLoad}.json`);
      if (!response.ok) {
        console.error(`Failed to fetch ${langToLoad}.json: ${response.statusText} (status ${response.status})`);
        return null;
      }

      // Try to parse as JSON first.
      // If this succeeds, we use the data even if Content-Type might be off (common in dev).
      const data = await response.json();
      return data;

    } catch (error: any) {
      // This catch block handles:
      // 1. Network errors from fetch() itself.
      // 2. Errors from response.json() if parsing fails.

      let responseText = "";
      const contentType = response?.headers?.get("content-type");

      if (response && typeof response.text === 'function') {
        try {
          // Attempt to get response text for better debugging if parsing failed
          responseText = await response.clone().text(); // Clone if response body might be read again
        } catch (textError) {
          // console.warn(`Could not read response text for ${langToLoad}.json after an error.`, textError);
        }
      }
      
      console.error(`Error loading translations for ${langToLoad}.json. Initial error: ${error.message}`);
      if (response) {
         console.error(`Details for ${langToLoad}.json: Status ${response.status}. Content-Type: '${contentType}'. Response text (first 500 chars): ${responseText.substring(0,500)}`);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const attemptLoad = async () => {
      setIsLoading(true);
      let loadedData = await loadTranslationsForLang(language);

      if (loadedData) {
        setTranslations(loadedData);
      } else {
        // Primary language failed
        if (language !== DEFAULT_LANGUAGE) {
          console.warn(`Failed to load translations for '${language}'. Attempting fallback to default language '${DEFAULT_LANGUAGE}'.`);
          loadedData = await loadTranslationsForLang(DEFAULT_LANGUAGE);
          if (loadedData) {
            setTranslations(loadedData);
            setLanguageState(DEFAULT_LANGUAGE); // Update language state to reflect fallback
            localStorage.setItem(LANGUAGE_KEY, DEFAULT_LANGUAGE);
          } else {
            console.error(`Fallback to default language '${DEFAULT_LANGUAGE}' also failed.`);
            setTranslations({}); // Set empty if all attempts failed
          }
        } else {
          // Default language itself failed
          console.error(`Failed to load default language '${DEFAULT_LANGUAGE}'.`);
          setTranslations({});
        }
      }
      setIsLoading(false);
    };
    attemptLoad();
  }, [language, loadTranslationsForLang]); // Effect re-runs if 'language' changes

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang); 
    localStorage.setItem(LANGUAGE_KEY, newLang);
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const keyParts = key.split('.');
    let text: any = translations;
    for (const part of keyParts) {
      if (text && typeof text === 'object' && part in text) {
        text = text[part];
      } else {
        // console.warn(`Translation key not found: ${key}`);
        return key; 
      }
    }

    if (typeof text !== 'string') {
        // console.warn(`Translation for key '${key}' is not a string.`);
        return key; 
    }
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = (text as string).replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      });
    }
    return text as string;
  }, [translations]);
  
  const formatDate = useCallback((date: Date, options: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(language, options).format(date);
    } catch (e) {
      // console.error(`Error formatting date with locale ${language}, falling back to default locale for format`, e);
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

  const getShortWeekdayName = useCallback((dayIndex: number) => { // 0 for Sunday, 1 for Monday...
    if (dayIndex < 0 || dayIndex > 6) return '';
    return t(`weekdays.short.${weekdayKeys[dayIndex]}`);
  }, [t]);

  if (isLoading && Object.keys(translations).length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f4f8' }}>
        <p style={{ fontSize: '1.25rem', color: '#4a5568' }}>Loading language...</p>
      </div>
    );
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, getShiftDisplayName, getMonthName, getShortWeekdayName }}>
      {children}
    </LanguageContext.Provider>
  );
};
