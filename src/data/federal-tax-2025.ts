/**
 * Canadian Federal Tax Data for 2025
 * Source: Canada Revenue Agency (CRA)
 */

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export const FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 57375, rate: 0.15 },
  { min: 57375, max: 114750, rate: 0.205 },
  { min: 114750, max: 158468, rate: 0.26 },
  { min: 158468, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];

/** Basic Personal Amount (BPA) for 2025 */
export const BASIC_PERSONAL_AMOUNT = 16129;

/** BPA clawback threshold, high-income earners get a reduced BPA */
export const BPA_CLAWBACK_THRESHOLD = 177882;
export const BPA_CLAWBACK_FULL = 253414;
export const BPA_MINIMUM = 14538;

// ─── CPP (Canada Pension Plan) ──────────────────────────────────────────────

export const CPP_RATE = 0.0595;
export const CPP_EXEMPTION = 3500;
export const CPP_MAX_PENSIONABLE_EARNINGS = 71300;
export const CPP_MAX_CONTRIBUTION = 4034.10;

/** CPP2, Second additional CPP ceiling (2025) */
export const CPP2_RATE = 0.04;
export const CPP2_MAX_PENSIONABLE_EARNINGS = 79400;
export const CPP2_MAX_CONTRIBUTION = 324.00;

// ─── EI (Employment Insurance) ──────────────────────────────────────────────

export const EI_RATE = 0.0158;
export const EI_MAX_INSURABLE_EARNINGS = 65700;
export const EI_MAX_CONTRIBUTION = 1049.12;

// ─── QPP (Quebec Pension Plan), Quebec uses QPP instead of CPP ─────────────

export const QPP_RATE = 0.064;
export const QPP_EXEMPTION = 3500;
export const QPP_MAX_PENSIONABLE_EARNINGS = 71300;
export const QPP_MAX_CONTRIBUTION = 4341.80;

export const QPP2_RATE = 0.04;
export const QPP2_MAX_PENSIONABLE_EARNINGS = 79400;
export const QPP2_MAX_CONTRIBUTION = 324.00;

// ─── QPIP (Quebec Parental Insurance Plan) ──────────────────────────────────

export const QPIP_RATE = 0.00494;
export const QPIP_MAX_INSURABLE_EARNINGS = 98000;
export const QPIP_MAX_CONTRIBUTION = 484.12;

/** EI rate for Quebec residents (lower because QPIP exists) */
export const EI_RATE_QUEBEC = 0.01248;
export const EI_MAX_CONTRIBUTION_QUEBEC = 834.24;

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
