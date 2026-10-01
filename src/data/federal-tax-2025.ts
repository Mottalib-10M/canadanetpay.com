/**
 * Canadian Federal Tax Data for 2026
 * Source: Canada Revenue Agency, T4127 Payroll Deductions Formulas, 122nd edition, effective January 1, 2026.
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

// ─── CPP (Canada Pension Plan) ──────────────────────────────────────────────

export const CPP_RATE = 0.0595;
export const CPP_EXEMPTION = 3500;
export const CPP_MAX_PENSIONABLE_EARNINGS = 74600;
export const CPP_MAX_CONTRIBUTION = 4230.45;

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

// ─── Pay Periods ────────────────────────────────────────────────────────────

export type PayFrequency = 'annual' | 'monthly' | 'semi_monthly' | 'bi_weekly' | 'weekly';

export const PAY_PERIODS: Record<PayFrequency, { label: string; periods: number }> = {
  annual: { label: 'Annually', periods: 1 },
  monthly: { label: 'Monthly', periods: 12 },
  semi_monthly: { label: 'Semi-Monthly (24x)', periods: 24 },
  bi_weekly: { label: 'Bi-Weekly (26x)', periods: 26 },
  weekly: { label: 'Weekly (52x)', periods: 52 },
};
