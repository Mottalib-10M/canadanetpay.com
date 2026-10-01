/**
 * Canadian Provincial / Territorial Tax Data for 2026
 * Sources: CRA T4127, 122nd edition (effective January 1, 2026); Revenu Québec for Quebec.
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface ProvinceConfig {
  name: string;
  abbreviation: string;
  slug: string;
  brackets: TaxBracket[];
  basicPersonalAmount: number;
  /** Surtax config (Ontario-style) */
  surtax?: { threshold1: number; rate1: number; threshold2: number; rate2: number };
  /** Quebec uses QPP instead of CPP, plus QPIP, and gets federal abatement */
  isQuebec?: boolean;
  /** Additional health premium (Ontario) */
  healthPremium?: boolean;
  notes?: string;
}

export const PROVINCES: Record<string, ProvinceConfig> = {
  AB: {
    name: 'Alberta',
    abbreviation: 'AB',
    slug: 'alberta',
    brackets: [
      { min: 0, max: 61200, rate: 0.08 },
      { min: 61200, max: 154259, rate: 0.1 },
      { min: 154259, max: 185111, rate: 0.12 },
      { min: 185111, max: 246813, rate: 0.13 },
      { min: 246813, max: 370220, rate: 0.14 },
      { min: 370220, max: Infinity, rate: 0.15 },
    ],
    basicPersonalAmount: 22769,
    notes: 'Alberta has no provincial sales tax (PST). Only GST applies.',
  },
  BC: {
    name: 'British Columbia',
    abbreviation: 'BC',
    slug: 'british-columbia',
    brackets: [
      { min: 0, max: 50363, rate: 0.0506 },
      { min: 50363, max: 100728, rate: 0.077 },
      { min: 100728, max: 115648, rate: 0.105 },
      { min: 115648, max: 140430, rate: 0.1229 },
      { min: 140430, max: 190405, rate: 0.147 },
      { min: 190405, max: 265545, rate: 0.168 },
      { min: 265545, max: Infinity, rate: 0.205 },
    ],
    basicPersonalAmount: 13216,
  },
  MB: {
    name: 'Manitoba',
    abbreviation: 'MB',
    slug: 'manitoba',
    brackets: [
      { min: 0, max: 47000, rate: 0.108 },
      { min: 47000, max: 100000, rate: 0.1275 },
      { min: 100000, max: Infinity, rate: 0.174 },
    ],
    basicPersonalAmount: 15780,
  },
  NB: {
    name: 'New Brunswick',
    abbreviation: 'NB',
    slug: 'new-brunswick',
    brackets: [
      { min: 0, max: 52333, rate: 0.094 },
      { min: 52333, max: 104666, rate: 0.14 },
      { min: 104666, max: 193861, rate: 0.16 },
      { min: 193861, max: Infinity, rate: 0.195 },
    ],
    basicPersonalAmount: 13664,
  },
  NL: {
    name: 'Newfoundland and Labrador',
    abbreviation: 'NL',
    slug: 'newfoundland-and-labrador',
    brackets: [
      { min: 0, max: 44678, rate: 0.087 },
      { min: 44678, max: 89354, rate: 0.145 },
      { min: 89354, max: 159528, rate: 0.158 },
      { min: 159528, max: 223340, rate: 0.178 },
      { min: 223340, max: 285319, rate: 0.198 },
      { min: 285319, max: 570638, rate: 0.208 },
      { min: 570638, max: 1141275, rate: 0.213 },
      { min: 1141275, max: Infinity, rate: 0.218 },
    ],
    basicPersonalAmount: 11188,
  },
  NS: {
    name: 'Nova Scotia',
    abbreviation: 'NS',
    slug: 'nova-scotia',
    brackets: [
      { min: 0, max: 30995, rate: 0.0879 },
      { min: 30995, max: 61991, rate: 0.1495 },
      { min: 61991, max: 97417, rate: 0.1667 },
      { min: 97417, max: 157124, rate: 0.175 },
      { min: 157124, max: Infinity, rate: 0.21 },
    ],
    basicPersonalAmount: 11932,
  },
  NT: {
    name: 'Northwest Territories',
    abbreviation: 'NT',
    slug: 'northwest-territories',
    brackets: [
      { min: 0, max: 53003, rate: 0.059 },
      { min: 53003, max: 106009, rate: 0.086 },
      { min: 106009, max: 172346, rate: 0.122 },
      { min: 172346, max: Infinity, rate: 0.1405 },
    ],
    basicPersonalAmount: 18198,
  },
  NU: {
    name: 'Nunavut',
    abbreviation: 'NU',
    slug: 'nunavut',
    brackets: [
      { min: 0, max: 55801, rate: 0.04 },
      { min: 55801, max: 111602, rate: 0.07 },
      { min: 111602, max: 181439, rate: 0.09 },
      { min: 181439, max: Infinity, rate: 0.115 },
    ],
    basicPersonalAmount: 19659,
  },
  ON: {
    name: 'Ontario',
    abbreviation: 'ON',
    slug: 'ontario',
    brackets: [
      { min: 0, max: 53891, rate: 0.0505 },
      { min: 53891, max: 107785, rate: 0.0915 },
      { min: 107785, max: 150000, rate: 0.1116 },
      { min: 150000, max: 220000, rate: 0.1216 },
      { min: 220000, max: Infinity, rate: 0.1316 },
    ],
    basicPersonalAmount: 12989,
    surtax: { threshold1: 5818, rate1: 0.20, threshold2: 7446, rate2: 0.36 },
    healthPremium: true,
    notes: 'Ontario levies an additional Health Premium on incomes above $20,000 and a surtax on provincial tax above certain thresholds.',
  },
  PE: {
    name: 'Prince Edward Island',
    abbreviation: 'PE',
    slug: 'prince-edward-island',
    brackets: [
      { min: 0, max: 33928, rate: 0.095 },
      { min: 33928, max: 65820, rate: 0.1347 },
      { min: 65820, max: 106890, rate: 0.166 },
      { min: 106890, max: 142520, rate: 0.1762 },
      { min: 142520, max: Infinity, rate: 0.19 },
    ],
    basicPersonalAmount: 15000,
  },
  QC: {
    name: 'Quebec',
    abbreviation: 'QC',
    slug: 'quebec',
    brackets: [
      { min: 0, max: 54345, rate: 0.14 },
      { min: 54345, max: 108680, rate: 0.19 },
      { min: 108680, max: 132245, rate: 0.24 },
      { min: 132245, max: Infinity, rate: 0.2575 },
    ],
    basicPersonalAmount: 18952,
    isQuebec: true,
    notes: 'Quebec residents pay QPP instead of CPP, contribute to QPIP, and receive a 16.5% federal tax abatement. Quebec also files a separate provincial tax return.',
  },
  SK: {
    name: 'Saskatchewan',
    abbreviation: 'SK',
    slug: 'saskatchewan',
    brackets: [
      { min: 0, max: 54532, rate: 0.105 },
      { min: 54532, max: 155805, rate: 0.125 },
      { min: 155805, max: Infinity, rate: 0.145 },
    ],
    basicPersonalAmount: 20381,
  },
  YT: {
    name: 'Yukon',
    abbreviation: 'YT',
    slug: 'yukon',
    brackets: [
      { min: 0, max: 58523, rate: 0.064 },
      { min: 58523, max: 117045, rate: 0.09 },
      { min: 117045, max: 181440, rate: 0.109 },
      { min: 181440, max: 500000, rate: 0.128 },
      { min: 500000, max: Infinity, rate: 0.15 },
    ],
    basicPersonalAmount: 16452,
  },
};

/** All province codes sorted alphabetically by name */
export const ALL_PROVINCES = Object.keys(PROVINCES).sort((a, b) =>
  PROVINCES[a].name.localeCompare(PROVINCES[b].name)
);

/** Get province by slug */
export function getProvinceBySlug(slug: string): ProvinceConfig | undefined {
  return Object.values(PROVINCES).find((p) => p.slug === slug);
}
