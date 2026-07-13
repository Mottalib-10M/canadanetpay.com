/**
 * Centralised navigation data for Header and Footer components.
 * All internal links use trailing slashes to match trailingSlash: 'always'.
 */

export interface NavLink {
  href: string;
  label: string;
}

export interface NavGroup {
  label: string;
  children: NavLink[];
}

// ---------------------------------------------------------------------------
// Header navigation – grouped with dropdown labels
// ---------------------------------------------------------------------------

export const headerNavEn: NavGroup[] = [
  {
    label: 'Calculators',
    children: [
      { label: 'Salary Calculator', href: '/' },
      { label: 'Net to Gross', href: '/net-to-gross/' },
      { label: 'Income Tax Calculator', href: '/income-tax-calculator/' },
      { label: 'CPP / QPP Calculator', href: '/cpp-calculator/' },
      { label: 'Bonus Tax Calculator', href: '/bonus-tax-calculator/' },
      { label: 'Hourly to Salary', href: '/hourly-to-salary/' },
      { label: 'Employer Cost', href: '/employer-cost-calculator/' },
      { label: 'All Calculators', href: '/calculators/' },
    ],
  },
  {
    label: 'By Province',
    children: [
      { label: 'Ontario', href: '/province/ontario/' },
      { label: 'Quebec', href: '/province/quebec/' },
      { label: 'British Columbia', href: '/province/british-columbia/' },
      { label: 'Alberta', href: '/province/alberta/' },
      { label: 'Manitoba', href: '/province/manitoba/' },
      { label: 'Saskatchewan', href: '/province/saskatchewan/' },
    ],
  },
  {
    label: 'Guides',
    children: [
      { label: 'Federal Tax Brackets 2026', href: '/guides/federal-tax-brackets-2025/' },
      { label: 'CPP Explained', href: '/guides/cpp-explained/' },
      { label: 'RRSP Tax Savings', href: '/guides/rrsp-tax-savings/' },
      { label: 'Provincial Tax Comparison', href: '/guides/provincial-tax-comparison/' },
      { label: 'Minimum Wage Canada', href: '/guides/minimum-wage-canada/' },
      { label: 'Average Salary Canada', href: '/guides/average-salary-canada/' },
      { label: 'All Guides', href: '/guides/' },
    ],
  },
];

export const headerNavFr: NavGroup[] = [
  {
    label: 'Calculatrices',
    children: [
      { label: 'Calculateur de salaire', href: '/fr/' },
      { label: 'Net vers brut', href: '/fr/net-vers-brut/' },
      { label: "Calculateur d'impot sur le revenu", href: '/fr/calculateur-impot-sur-le-revenu/' },
      { label: 'Calculateur RPC / RRQ', href: '/fr/calculateur-rpc/' },
      { label: 'Calculateur de prime', href: '/fr/calculateur-impot-prime/' },
      { label: 'Horaire en salaire', href: '/fr/horaire-en-salaire/' },
      { label: 'Cout employeur', href: '/fr/calculateur-cout-employeur/' },
      { label: 'Toutes les calculatrices', href: '/fr/calculatrices/' },
    ],
  },
  {
    label: 'Provinces',
    children: [
      { label: 'Ontario', href: '/fr/province/ontario/' },
      { label: 'Quebec', href: '/fr/province/quebec/' },
      { label: 'Colombie-Britannique', href: '/fr/province/colombie-britannique/' },
      { label: 'Alberta', href: '/fr/province/alberta/' },
      { label: 'Manitoba', href: '/fr/province/manitoba/' },
      { label: 'Saskatchewan', href: '/fr/province/saskatchewan/' },
    ],
  },
  {
    label: 'Guides',
    children: [
      { label: "Tranches d'imposition federales 2026", href: '/fr/guides/tranches-imposition-federales-2025/' },
      { label: 'Le RPC explique', href: '/fr/guides/rpc-explique/' },
      { label: "Economies d'impot REER", href: '/fr/guides/economies-impot-reer/' },
      { label: 'Comparaison impots provinciaux', href: '/fr/guides/comparaison-impots-provinciaux/' },
      { label: 'Salaire minimum Canada', href: '/fr/guides/salaire-minimum-canada/' },
      { label: 'Salaire moyen Canada', href: '/fr/guides/salaire-moyen-canada/' },
      { label: 'Tous les guides', href: '/fr/guides/' },
    ],
  },
];

export const headerNav: Record<string, NavGroup[]> = {
  en: headerNavEn,
  fr: headerNavFr,
};

// ---------------------------------------------------------------------------
// Footer navigation – flat link arrays per column
// ---------------------------------------------------------------------------

export const footerCalcLinksEn: NavLink[] = [
  { label: 'Salary Calculator', href: '/' },
  { label: 'Net to Gross', href: '/net-to-gross/' },
  { label: 'Income Tax Calculator', href: '/income-tax-calculator/' },
  { label: 'CPP / QPP Calculator', href: '/cpp-calculator/' },
  { label: 'Bonus Tax Calculator', href: '/bonus-tax-calculator/' },
  { label: 'Hourly to Salary', href: '/hourly-to-salary/' },
  { label: 'Employer Cost', href: '/employer-cost-calculator/' },
  { label: 'All Calculators', href: '/calculators/' },
  { label: 'Widget', href: '/embed/' },
];

export const footerProvinceLinksEn: NavLink[] = [
  { label: 'Ontario', href: '/province/ontario/' },
  { label: 'Quebec', href: '/province/quebec/' },
  { label: 'British Columbia', href: '/province/british-columbia/' },
  { label: 'Alberta', href: '/province/alberta/' },
  { label: 'Manitoba', href: '/province/manitoba/' },
  { label: 'Nova Scotia', href: '/province/nova-scotia/' },
];

export const footerGuideLinksEn: NavLink[] = [
  { label: 'Federal Tax Brackets 2026', href: '/guides/federal-tax-brackets-2025/' },
  { label: 'CPP Explained', href: '/guides/cpp-explained/' },
  { label: 'RRSP Tax Savings', href: '/guides/rrsp-tax-savings/' },
  { label: 'Provincial Comparison', href: '/guides/provincial-tax-comparison/' },
  { label: 'Marginal vs Effective Rate', href: '/guides/marginal-vs-effective-tax-rate/' },
  { label: 'Minimum Wage Canada', href: '/guides/minimum-wage-canada/' },
  { label: 'Average Salary Canada', href: '/guides/average-salary-canada/' },
  { label: 'All Guides', href: '/guides/' },
  { label: 'Updates', href: '/updates/' },
];

export const footerAboutLinksEn: NavLink[] = [
  { label: 'About Us', href: '/about/' },
  { label: 'Methodology', href: '/methodology/' },
  { label: 'Contact', href: '/contact/' },
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Use', href: '/terms/' },
  { label: 'Version francaise', href: '/fr/' },
];

export const footerCalcLinks: Record<string, NavLink[]> = {
  en: footerCalcLinksEn,
};

export const footerProvinceLinks: Record<string, NavLink[]> = {
  en: footerProvinceLinksEn,
};

export const footerGuideLinks: Record<string, NavLink[]> = {
  en: footerGuideLinksEn,
};

export const footerAboutLinks: Record<string, NavLink[]> = {
  en: footerAboutLinksEn,
};
