/**
 * Old Age Security, Guaranteed Income Supplement, Allowance and Allowance for
 * the Survivor: parameters for the payment quarter October to December 2026.
 *
 * Every figure below was read on 2026-10-05 from the source named beside it.
 * Amounts are indexed each January, April, July and October (Old Age Security
 * Act, s. 7(2) and 12(2)); the module must be updated each quarter, and the
 * tests in `lib/oas-engine.test.ts` check the result against the maximums and
 * income cut-offs Service Canada publishes, so a stale or mistyped parameter
 * fails the build instead of reaching a page.
 *
 * Sources
 *  [SC-PAY]  canada.ca, « Old Age Security payment amounts », October to
 *            December 2026, page modified 2026-09-29.
 *            https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/payments.html
 *  [SC-EST]  Service Canada, Old Age Security Benefits Estimator, legal values
 *            « October to December 2026 » (top-up amounts, deferred amounts).
 *            https://estimateursv-oasestimator.digital.service.canada.ca/en
 *  [SC-REC]  canada.ca, « Old Age Security pension recovery tax », page
 *            modified 2026-09-29.
 *            https://www.canada.ca/en/services/benefits/publicpensions/old-age-security/recovery-tax.html
 *  [CRA-235] CRA, « Line 23500 – Social benefits repayment », modified 2026-01-20.
 *  [CAL]     ESDC, « 2026 Canada Pension Plan and Old Age Security benefits
 *            payment dates » (printable calendar 5564).
 *  [OASA]    Old Age Security Act, R.S.C. 1985, c. O-9, consolidation current
 *            to 2026-09-21: s. 2 (income), 3 (full and partial pension), 7(5)
 *            (75+), 7.1 (deferral), 9 (absence), 12 and 12.1 (supplement and
 *            top-up), 19, 21, 22 and 22.1 (Allowance and Allowance for the
 *            Survivor). https://laws-lois.justice.gc.ca/eng/acts/o-9/
 *  [SC-CPP]  canada.ca, CPP and OAS benefit amounts 2026, modified 2026-09-29
 *            (maximum CPP retirement pension at 65 in 2026).
 */

export const OAS_QUARTER = 'October to December 2026';
export const OAS_VERIFIED = '2026-10-05';
/** Indexation of this quarter and over twelve months [SC-PAY]. */
export const OAS_QUARTER_INCREASE = 0.014;
export const OAS_YEAR_INCREASE = 0.03;

/** Full monthly OAS pension, 65 to 74 [SC-PAY]. */
export const OAS_FULL_MONTHLY = 762.5;
/** Increase from the month after the 75th birthday [OASA s. 7(5)] ; 838.75 published [SC-PAY]. */
export const OAS_75_INCREASE = 0.1;
export const OAS_75_PUBLISHED = 838.75;
/** Voluntary deferral: 0.6 % per month, no increase after age 70 [OASA s. 7.1(1), 7.1(4)]. */
export const OAS_DEFERRAL_PER_MONTH = 0.006;
export const OAS_DEFERRAL_MAX_MONTHS = 60;
/** Deferred full pension published by Service Canada for this quarter [SC-EST]. */
export const OAS_DEFERRED_PUBLISHED: Record<number, number> = { 66: 817.4, 67: 872.3, 68: 927.2, 69: 982.1, 70: 1037 };
/** Residence after 18: 10 years minimum, 40 for a full pension, 20 to be paid abroad [OASA s. 3, 9]. */
export const OAS_MIN_YEARS = 10;
export const OAS_FULL_YEARS = 40;
export const OAS_ABROAD_YEARS = 20;

/**
 * GIS. The published maximum is the basic supplement plus the top-up
 * (« additional amount », OASA s. 12.1). Service Canada publishes the top-ups
 * for the quarter [SC-EST]; the basic amounts are the published maximums
 * [SC-PAY] minus those top-ups.
 */
export const GIS_SINGLE_MAX = 1138.9;
export const GIS_SINGLE_TOPUP = 176.41;
export const GIS_SINGLE_BASE = Math.round((GIS_SINGLE_MAX - GIS_SINGLE_TOPUP) * 100) / 100; // 962.49
export const GIS_COUPLE_MAX = 685.56;
export const GIS_COUPLE_TOPUP = 49.99;
/** Also the « supplement equivalent » of s. 22(1). */
export const GIS_COUPLE_BASE = Math.round((GIS_COUPLE_MAX - GIS_COUPLE_TOPUP) * 100) / 100; // 635.57
/** Income above which the top-up is reduced by $1 for each $4 [OASA s. 12.1]. */
export const TOPUP_EXEMPT_SINGLE = 2000;
export const TOPUP_EXEMPT_COUPLE = 4000;

/** Allowance (60-64, spouse of a GIS pensioner) and Allowance for the Survivor [SC-PAY]. */
export const ALLOWANCE_MAX = 1448.06;
export const AFS_MAX = 1726.18;
/** Supplement equivalent for the survivor [OASA s. 22(4.1)] = AFS maximum − OAS − single top-up. */
export const AFS_SUPPLEMENT_EQUIVALENT = Math.round((AFS_MAX - OAS_FULL_MONTHLY - GIS_SINGLE_TOPUP) * 100) / 100; // 787.27

/** Published annual income cut-offs for the quarter [SC-PAY]: the first income at which nothing is paid. */
export const PUBLISHED_CUTOFFS = {
  gisSingle: 23112,
  gisSpouseOas: 30528,
  gisSpouseAllowance: 42768,
  gisSpouseNoOas: 55392,
  allowance: 42768,
  afs: 31152,
} as const;

/** Employment and self-employment income exempt from the GIS income test: first $5,000, then half of the next $10,000 [OASA s. 2, para. (b.1)]. */
export const GIS_EARNINGS_FULL_EXEMPTION = 5000;
export const GIS_EARNINGS_HALF_EXEMPTION = 5000;

/** OAS recovery tax (« clawback ») [SC-REC], [CRA-235]. */
export const RECOVERY_RATE = 0.15;
export interface RecoveryYear { incomeYear: number; period: string; threshold: number; max6574: number; max75: number }
export const RECOVERY_YEARS: RecoveryYear[] = [
  { incomeYear: 2024, period: 'July 2025 to June 2026', threshold: 90997, max6574: 148451, max75: 154196 },
  { incomeYear: 2025, period: 'July 2026 to June 2027', threshold: 93454, max6574: 152062, max75: 157923 },
  { incomeYear: 2026, period: 'July 2027 to June 2028', threshold: 95323, max6574: 155320, max75: 161320 },
];

/** Maximum CPP retirement pension at 65 in 2026 [SC-CPP]. */
export const CPP_MAX_RETIREMENT_65 = 1507.65;

/** CPP and OAS payment dates 2026 [CAL]: the same day for both benefits. */
export const PAYMENT_DATES_2026 = [
  '2026-01-28', '2026-02-25', '2026-03-27', '2026-04-28', '2026-05-27', '2026-06-26',
  '2026-07-29', '2026-08-27', '2026-09-25', '2026-10-28', '2026-11-26', '2026-12-22',
];
