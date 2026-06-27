import { en, type Translations } from './en';
import { fr } from './fr';

export type Lang = 'en' | 'fr';

const translations: Record<Lang, Translations> = { en, fr };

export function t(lang: Lang): Translations {
  return translations[lang] ?? translations.en;
}

export function getLangFromUrl(url: URL): Lang {
  const [, langSegment] = url.pathname.split('/');
  if (langSegment === 'fr') return 'fr';
  return 'en';
}

export const SUPPORTED_LANGS: Lang[] = ['en', 'fr'];
