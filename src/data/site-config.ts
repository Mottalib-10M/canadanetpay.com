export const SITE_NAME = 'Canada Net Pay';
export const SITE_URL = 'https://canadanetpay.com';
export const SITE_LOCALE = 'en-CA';
export const SITE_LANGUAGE = 'en';
export const TAX_YEAR = 2026;
export const LAST_UPDATED = '2026-07-01';
export const CURRENCY = 'CAD';
export const CURRENCY_SYMBOL = '$';
export const BING_VERIFY_CODE = '';
/** Projet Microsoft Clarity (compte amradif). Vide = aucun traceur ni bandeau. */
export const CLARITY_ID = 'yrboj7iap3';
/** Identifiant de mesure Google Analytics 4. Chargé par Consent.astro selon
 *  la même règle que Clarity ; vide = pas de GA4. */
export const GA4_ID = 'G-D1XK1X1CQW';
/** Régime de consentement : 'opt-in' = rien avant l'accord ; 'notice' = mesure active
 *  avec information préalable et retrait possible. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';

export const CONTACT_EMAIL = 'contact@canadanetpay.com';

/*
 * Identite legale de l'editeur (RECETTE-SITE.md, controle check-legal).
 * Un champ laisse vide ressort en jaune sur la page legale et fait echouer le
 * controle : rien ne part en ligne avec une mention manquante.
 */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',
  legalForm: '',                 // vide : publication a titre personnel, pas de societe
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: 'France',          // pays de l'editeur, pas du site
  phone: '',
  registerLabel: 'SIREN',
  registerNumber: '',
  vatLabel: 'VAT number',
  vatNumber: '',                 // vide : non assujetti
  jurisdiction: 'Canada',
  supervisoryAuthority: 'Office of the Privacy Commissioner of Canada, 30 Victoria Street, Gatineau QC K1A 1H3, Canada',
  supervisoryAuthorityUrl: 'https://www.priv.gc.ca/en/report-a-concern/',
  hosting: {
    name: 'GitHub, Inc.',
    address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States',
    phone: '',
    url: 'https://github.com',
  },
};
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];
