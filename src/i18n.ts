import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

// Initialize i18n
const initI18n = async () => {
  try {
    console.log('Starting i18n initialization...');
    
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'es', 'fr', 'ar', 'hi'],
        
        interpolation: {
          escapeValue: false,
        },
        
        detection: {
          order: ['navigator'],
          caches: [],
        },
        
        react: {
          useSuspense: false,
        },
      });
    
    console.log('i18n initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    throw error;
  }
};

// Create a promise that resolves when i18n is initialized
const i18nInitPromise = initI18n().catch(error => {
  console.error('Fatal error during i18n initialization:', error);
  throw error;
});

export { i18nInitPromise };
export default i18n;