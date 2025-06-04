import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import localforage from 'localforage';
import { Module } from 'i18next';

// Import translations
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import frTranslation from './locales/fr/translation.json';
import arTranslation from './locales/ar/translation.json';
import hiTranslation from './locales/hi/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  },
  fr: {
    translation: frTranslation
  },
  ar: {
    translation: arTranslation
  },
  hi: {
    translation: hiTranslation
  }
};

// Custom language detector that uses localforage
const customLanguageDetector = {
  type: 'languageDetector' as const,
  init: () => {},
  detect: async () => {
    try {
      await localforage.ready();
      return await localforage.getItem('language');
    } catch (error) {
      console.error('Error reading language from localforage:', error);
      return null;
    }
  },
  cacheUserLanguage: async (lng: string) => {
    try {
      await localforage.ready();
      await localforage.setItem('language', lng);
    } catch (error) {
      console.error('Error saving language to localforage:', error);
    }
  }
};

// Initialize i18n
const initI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .use(customLanguageDetector as Module)
      .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'fr', 'ar', 'hi'],
        
        interpolation: {
          escapeValue: false, // React already safes from XSS
        },
        
        detection: {
          order: ['querystring', 'navigator', 'customLocalForage'],
          lookupQuerystring: 'lng',
          caches: ['customLocalForage'],
        },
        
        react: {
          useSuspense: true,
        },
      });
    
    console.log('i18n initialized successfully');
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Initialize with fallback settings
    await i18n
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: true,
        },
      });
  }
};

// Initialize i18n
initI18n();

export default i18n;