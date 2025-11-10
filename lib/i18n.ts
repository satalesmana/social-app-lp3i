import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import en from './locales/en.json';
import id from './locales/id.json';

const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";

export const i18n = new I18n({
  en,id
});

i18n.locale = deviceLanguage ==='in' ? 'id': deviceLanguage;

export function changeLanguage(lang: string) {
  i18n.locale = lang;
}