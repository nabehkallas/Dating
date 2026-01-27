import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

// Import translations
import ar from './locales/ar.json';
import en from './locales/en.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('user-language');

  if (!savedLanguage) {
    savedLanguage = getLocales()[0].languageCode === 'ar' ? 'ar' : 'en';
  }

  i18n.use(initReactI18next).init({
    
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  
  const isArabic = savedLanguage === 'ar';
  if (isArabic !== I18nManager.isRTL) {
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
  }
};

initI18n();

export default i18n;