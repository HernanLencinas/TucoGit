import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import esARTranslations from '../locales/es-AR.json';
import deTranslations from '../locales/de.json';
import frTranslations from '../locales/fr.json';
import ptTranslations from '../locales/pt.json';
import jaTranslations from '../locales/ja.json';

// Recursos de traducción
const resources = {
  en: {
    translation: enTranslations,
  },
  'es-AR': {
    translation: esARTranslations,
  },
  de: {
    translation: deTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  pt: {
    translation: ptTranslations,
  },
  ja: {
    translation: jaTranslations,
  },
};

// Configuración de i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es-AR', // Idioma por defecto
    fallbackLng: 'es-AR', // Idioma de respaldo
    interpolation: {
      escapeValue: false, // React ya escapa los valores
    },
    react: {
      useSuspense: false, // No usar Suspense para evitar problemas con Electron
    },
  });

export default i18n;
