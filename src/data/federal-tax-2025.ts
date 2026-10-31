/**
 * Canadian Federal Tax Data for 2026
 * Source: Canada Revenue Agency, T4127 Payroll Deductions Formulas, 122nd edition, effective January 1, 2026,
 * and 123rd edition, effective July 1, 2026 (read 2026-10-31).
 * (The file name is historical: the figures were those of 2025, some of them wrong, until 2026-10-01.)
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export const FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 58523, rate: 0.14 },
  { min: 58523, max: 117045, rate: 0.205 },
  { min: 117045, max: 181440, rate: 0.26 },
  { min: 181440, max: 258482, rate: 0.29 },
  { min: 258482, max: Infinity, rate: 0.33 },
];

/** Lowest federal rate: non-refundable credits are valued at this rate. */
export const FEDERAL_LOWEST_RATE = 0.14;

/** Basic Personal Amount (BPA) for 2026 */
export const BASIC_PERSONAL_AMOUNT = 16452;

/** BPA clawback threshold, high-income earners get a reduced BPA */
export const BPA_CLAWBACK_THRESHOLD = 181440;
export const BPA_CLAWBACK_FULL = 258482;
export const BPA_MINIMUM = 14829;

/**
 * Canada employment amount (credit at the lowest rate on the lesser of employment income and this amount).
 * T4127 123rd edition, Table 8.2 (CEA), read 2026-10-31.
 */
export const CANADA_EMPLOYMENT_AMOUNT = 1501;

// ─── CPP (Canada Pension Plan) ──────────────────────────────────────────────

export const CPP_RATE = 0.0595;
export const CPP_EXEMPTION = 3500;
export const CPP_MAX_PENSIONABLE_EARNINGS = 74600;
export const CPP_MAX_CONTRIBUTION = 4230.45;
/**
 * Base CPP rate. Only the base part (4.95/5.95) of CPP gives a tax credit; the first additional
 * part (1/5.95) and all CPP2 are deducted from income (T4127, factors K2, K2P and F5).
 */
export const CPP_BASE_RATE = 0.0495;

/** CPP2, Second additional CPP ceiling (2026) */
export const CPP2_RATE = 0.04;
export const CPP2_MAX_PENSIONABLE_EARNINGS = 85000;
export const CPP2_MAX_CONTRIBUTION = 416.00;

// ─── EI (Employment Insurance) ──────────────────────────────────────────────

export const EI_RATE = 0.0163;
export const EI_MAX_INSURABLE_EARNINGS = 68900;
export const EI_MAX_CONTRIBUTION = 1123.07;

// ─── QPP (Quebec Pension Plan), Quebec uses QPP instead of CPP ─────────────

export const QPP_RATE = 0.063;
export const QPP_EXEMPTION = 3500;
export const QPP_MAX_PENSIONABLE_EARNINGS = 74600;
export const QPP_MAX_CONTRIBUTION = 4479.30;
/** Base QPP rate (5.30 of 6.30): credit federally, the additional part is deducted from income */
export const QPP_BASE_RATE = 0.053;

export const QPP2_RATE = 0.04;
export const QPP2_MAX_PENSIONABLE_EARNINGS = 85000;
export const QPP2_MAX_CONTRIBUTION = 416.00;

// ─── QPIP (Quebec Parental Insurance Plan) ──────────────────────────────────

export const QPIP_RATE = 0.0043;
export const QPIP_MAX_INSURABLE_EARNINGS = 103000;
export const QPIP_MAX_CONTRIBUTION = 442.90;

/** EI rate for Quebec residents (lower because QPIP exists) */
export const EI_RATE_QUEBEC = 0.0130;
export const EI_MAX_CONTRIBUTION_QUEBEC = 895.70;

/** Quebec federal tax abatement, 16.5% reduction */
export const QUEBEC_ABATEMENT = 0.165;

/**
 * Quebec deduction for workers: 6% of employment income, maximum $1,450 in 2026.
 * Source: Finances Québec, Paramètres du régime d'imposition des particuliers 2026 (tableau 3),
 * https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/finances/publications-adm/parametres/AUTFR_RegimeImpot2026.pdf, read 2026-10-31.
 */
export const QC_WORKER_DEDUCTION_RATE = 0.06;
export const QC_WORKER_DEDUCTION_MAX = 1450;

// ─── Pay Periods ────────────────────────────────────────────────────────────

export type PayFrequency = 'annual' | 'monthly' | 'semi_monthly' | 'bi_weekly' | 'weekly';

export const PAY_PERIODS: Record<PayFrequency, { label: string; periods: number }> = {
  annual: { label: 'Annually', periods: 1 },
  monthly: { label: 'Monthly', periods: 12 },
  semi_monthly: { label: 'Semi-Monthly (24x)', periods: 24 },
  bi_weekly: { label: 'Bi-Weekly (26x)', periods: 26 },
  weekly: { label: 'Weekly (52x)', periods: 52 },
};
