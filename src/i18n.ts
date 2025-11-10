import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import it from './locales/it.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it }
    },
    // Prefer language from the path prefix if present (e.g. /en or /it)
    lng: ((): string => {
      try {
        if (typeof window !== 'undefined') {
          const m = window.location.pathname.match(/^\/(en|it)(?:\/|$)/);
          if (m && m[1]) return m[1];
        }
      } catch (e) {
        // ignore
      }
      return 'en';
    })(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
