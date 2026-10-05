/**
 * Old Age Security engine: OAS pension, recovery tax, Guaranteed Income
 * Supplement, Allowance and Allowance for the Survivor.
 *
 * The formulas are those of the Old Age Security Act (sections cited inline),
 * including the roundings the Act prescribes, applied to the parameters of
 * `data/oas-2026.ts`. Amounts are monthly unless the name says otherwise;
 * incomes are annual, for the base calendar year (the year before the July
 * that starts the payment period).
 *
 * Out of scope, and said so on the pages: the « special qualifying factor » of
 * a person with fewer than ten years in Canada who qualifies only through a
 * social security agreement; separated spouses (Minister's direction); periods
 * of incarceration; the deduction of the employee's own CPP and EI
 * contributions from income, which lowers GIS income by a few hundred dollars
 * for someone still working.
 */
import {
  OAS_FULL_MONTHLY, OAS_75_INCREASE, OAS_DEFERRAL_PER_MONTH, OAS_DEFERRAL_MAX_MONTHS,
  OAS_MIN_YEARS, OAS_FULL_YEARS,
  GIS_SINGLE_BASE, GIS_SINGLE_TOPUP, GIS_COUPLE_BASE, GIS_COUPLE_TOPUP,
  TOPUP_EXEMPT_SINGLE, TOPUP_EXEMPT_COUPLE, AFS_SUPPLEMENT_EQUIVALENT,
  GIS_EARNINGS_FULL_EXEMPTION, GIS_EARNINGS_HALF_EXEMPTION,
  RECOVERY_RATE, RECOVERY_YEARS,
} from '../data/oas-2026';

const cents = (x: number) => Math.round(x * 100) / 100;
const floorTo = (x: number, step: number) => Math.floor(x / step) * step;
const ceilTo = (x: number, step: number) => Math.ceil(x / step) * step;

// ─── OAS pension ────────────────────────────────────────────────────────────

export interface OasInput {
  /** Whole years lived in Canada after 18, counted at 65 (s. 3(4): rounded down). */
  yearsAt65: number;
  /** Months by which the start is deferred after 65 (0 to 60). */
  deferralMonths?: number;
  /** True from the month after the 75th birthday. */
  age75?: boolean;
  /** Assume the person keeps living in Canada while deferring (more years of residence). */
  residesDuringDeferral?: boolean;
}

export interface OasResult {
  eligible: boolean;
  /** Years used for the fraction, after deferral (at most 40). */
  yearsUsed: number;
  /** Residence fraction, n/40. */
  fraction: number;
  /** Pension before deferral and 75+ increases: the « monthly pension » of s. 2.1(2), used by the GIS formula. */
  basePension: number;
  /** Increase factor actually applied for deferral (1 = none). */
  deferralFactor: number;
  /** Which of the three amounts of s. 7.1(3) was retained. */
  rule: 'none' | 'full-deferred' | 'partial-deferred' | 'partial-at-approval' | 'no-deferral';
  monthly: number;
  annual: number;
}

/** OAS pension for the quarter, s. 3(3), 7(5), 7.1. */
export function oasPension({ yearsAt65, deferralMonths = 0, age75 = false, residesDuringDeferral = true }: OasInput): OasResult {
  const y65 = Math.max(0, Math.floor(yearsAt65));
  const m = Math.min(Math.max(0, Math.floor(deferralMonths)), OAS_DEFERRAL_MAX_MONTHS);
  const yApproval = Math.min(OAS_FULL_YEARS, residesDuringDeferral ? Math.floor(y65 + m / 12) : y65);
  if (yApproval < OAS_MIN_YEARS) {
    return { eligible: false, yearsUsed: yApproval, fraction: 0, basePension: 0, deferralFactor: 1, rule: 'none', monthly: 0, annual: 0 };
  }
  const f65 = Math.min(y65, OAS_FULL_YEARS) / OAS_FULL_YEARS;
  const fApproval = yApproval / OAS_FULL_YEARS;
  // The three candidates of s. 7.1(3). The deferral increase starts the month
  // after the person becomes qualified, so a person who reaches 10 years only
  // after 65 earns no increase for the months before.
  const candidates: Array<{ rule: OasResult['rule']; factor: number; fraction: number }> = [];
  if (y65 >= OAS_MIN_YEARS) {
    candidates.push({ rule: m ? 'partial-deferred' : 'no-deferral', factor: 1 + OAS_DEFERRAL_PER_MONTH * m, fraction: f65 });
  }
  candidates.push({ rule: m ? 'partial-at-approval' : 'no-deferral', factor: 1, fraction: fApproval });
  if (yApproval >= OAS_FULL_YEARS) {
    const monthsToFull = Math.max(0, (OAS_FULL_YEARS - y65) * 12);
    const after = Math.max(0, m - monthsToFull);
    candidates.push({ rule: after ? 'full-deferred' : 'no-deferral', factor: 1 + OAS_DEFERRAL_PER_MONTH * after, fraction: 1 });
  }
  const best = candidates.reduce((a, b) => (b.factor * b.fraction > a.factor * a.fraction + 1e-9 ? b : a));
  let monthly = OAS_FULL_MONTHLY * best.fraction * best.factor;
  if (age75) monthly *= 1 + OAS_75_INCREASE;
  monthly = cents(monthly);
  return {
    eligible: true,
    yearsUsed: Math.round(best.fraction * OAS_FULL_YEARS),
    fraction: best.fraction,
    basePension: cents(OAS_FULL_MONTHLY * best.fraction),
    deferralFactor: best.factor,
    rule: m === 0 ? 'no-deferral' : best.rule,
    monthly,
    annual: cents(monthly * 12),
  };
}

// ─── Recovery tax ───────────────────────────────────────────────────────────

export interface RecoveryResult {
  threshold: number;
  excess: number;
  /** Repayment for the year: 15 % of the excess, never more than the OAS received. */
  annual: number;
  /** Monthly amount withheld from OAS in the July-June recovery period. */
  monthly: number;
  /** True when the whole pension is recovered. */
  full: boolean;
  period: string;
}

export function recoveryTax(netIncome: number, oasReceivedInYear: number, incomeYear = 2026): RecoveryResult {
  const y = RECOVERY_YEARS.find((r) => r.incomeYear === incomeYear) ?? RECOVERY_YEARS[RECOVERY_YEARS.length - 1];
  const excess = Math.max(0, netIncome - y.threshold);
  const raw = cents(excess * RECOVERY_RATE);
  const annual = Math.min(raw, Math.max(0, oasReceivedInYear));
  return { threshold: y.threshold, excess, annual: cents(annual), monthly: cents(annual / 12), full: oasReceivedInYear > 0 && raw >= oasReceivedInYear, period: y.period };
}

// ─── Income for the income-tested benefits ──────────────────────────────────

/**
 * Income of one person for GIS and the Allowance, OASA s. 2 « income »:
 * income under the Income Tax Act, minus OAS benefits themselves, minus the
 * earnings exemption of para. (b.1) on employment and self-employment income.
 */
export function gisIncome(otherIncome: number, earnings = 0): number {
  const e = Math.max(0, earnings);
  const exempt = Math.min(GIS_EARNINGS_FULL_EXEMPTION, e) + Math.min(GIS_EARNINGS_HALF_EXEMPTION, Math.max(0, e - GIS_EARNINGS_FULL_EXEMPTION) / 2);
  return Math.max(0, otherIncome) + e - exempt;
}

// ─── GIS ────────────────────────────────────────────────────────────────────

export type GisSituation = 'single' | 'spouse-oas' | 'spouse-allowance' | 'spouse-none';

export interface GisResult {
  situation: GisSituation;
  /** Income used: own for a single person, combined for a couple. */
  income: number;
  basic: number;
  topUp: number;
  monthly: number;
  annual: number;
  /** Maximum for the situation with no income and a full pension. */
  max: number;
}

/**
 * Monthly GIS of one pensioner.
 * @param income annual income for GIS (own if single, combined if couple), see `gisIncome`
 * @param ownBasePension the pensioner's OAS before deferral and 75+ increases (s. 2.1(2)); a partial pension raises GIS by the missing part (s. 12(5))
 */
export function gis(situation: GisSituation, income: number, ownBasePension = OAS_FULL_MONTHLY): GisResult {
  const Y = Math.max(0, income);
  const missingOas = Math.max(0, OAS_FULL_MONTHLY - ownBasePension);
  let basic: number;
  let topUp: number;
  let max: number;
  if (situation === 'single') {
    // s. 12(5): [(A − B) × C] − D/2, D = Y/12 rounded down to a multiple of $2
    const D = floorTo(Y / 12, 2);
    basic = GIS_SINGLE_BASE + missingOas - D / 2;
    // s. 12.1(1)(a): A − C/4, C = (Y − 2,000)/12 rounded down to a multiple of $4
    const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_SINGLE) / 12, 4);
    topUp = GIS_SINGLE_TOPUP - C / 4;
    max = GIS_SINGLE_BASE + GIS_SINGLE_TOPUP + missingOas;
  } else if (situation === 'spouse-oas') {
    // s. 12(6)(c)(ii): monthly base income = combined income / 24
    const D = floorTo(Y / 24, 2);
    basic = GIS_COUPLE_BASE + missingOas - D / 2;
    // s. 12.1(2), case (b)(ii)
    const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_COUPLE) / 24, 4);
    topUp = GIS_COUPLE_TOPUP - C / 4;
    max = GIS_COUPLE_BASE + GIS_COUPLE_TOPUP + missingOas;
  } else if (situation === 'spouse-none') {
    // s. 12(6)(b): Y/24 − B/2, B = full pension (without the 75+ increase) rounded up to a multiple of $4
    const B = ceilTo(OAS_FULL_MONTHLY, 4);
    const D = floorTo(Math.max(0, Y / 24 - B / 2), 2);
    basic = GIS_SINGLE_BASE + missingOas - D / 2;
    // s. 12.1(1)(b): the single top-up, reduced on combined income above $4,000
    const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_COUPLE) / 24, 4);
    topUp = GIS_SINGLE_TOPUP - C / 4;
    max = GIS_SINGLE_BASE + GIS_SINGLE_TOPUP + missingOas;
  } else {
    // spouse receives the Allowance, s. 22(2): [(A − B) × C] − D/4, D = residual joint income
    const D = floorTo(Math.max(0, Y / 12 - residualDeduction()), 4);
    basic = GIS_COUPLE_BASE + missingOas - D / 4;
    // s. 22.1(1)
    const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_COUPLE) / 24, 4);
    topUp = GIS_COUPLE_TOPUP - C / 4;
    max = GIS_COUPLE_BASE + GIS_COUPLE_TOPUP + missingOas;
  }
  basic = cents(Math.max(0, basic));
  topUp = cents(Math.max(0, topUp));
  let monthly = cents(basic + topUp);
  if (situation === 'spouse-allowance') {
    // s. 22(6): when the Allowance plus this supplement fall below the Part II
    // supplement (the scale for a spouse who receives no benefit), the
    // pensioner receives that Part II supplement minus the Allowance. This is
    // why GIS continues above the income at which the Allowance stops.
    const partII = gis('spouse-none', Y, ownBasePension).monthly;
    const alw = allowance(Y).monthly;
    if (alw + monthly < partII) {
      monthly = cents(partII - alw);
      basic = cents(Math.max(0, monthly - topUp));
    }
  }
  return { situation, income: Y, basic, topUp, monthly, annual: cents(monthly * 12), max: cents(max) };
}

/**
 * B of the « residual joint income » and « residual income of the survivor »,
 * s. 22(1): four-thirds of the pension equivalent rounded up to a multiple of
 * $3, the product rounded up to a multiple of $4.
 */
export function residualDeduction(): number {
  const rounded = ceilTo(OAS_FULL_MONTHLY, 3);
  return ceilTo((4 / 3) * rounded, 4);
}

// ─── Allowance and Allowance for the Survivor ───────────────────────────────

export interface AllowanceResult {
  basic: number;
  topUp: number;
  monthly: number;
  annual: number;
  max: number;
}

/** Allowance paid to the 60-64 spouse of a GIS pensioner, s. 22(3) and 22.1(2). `combinedIncome` excludes OAS, GIS and the Allowance. */
export function allowance(combinedIncome: number): AllowanceResult {
  const Y = Math.max(0, combinedIncome);
  const M = Y / 12;
  const R = residualDeduction();
  let basic: number;
  if (M <= R) {
    // (b): (A × B) + C, C = max(0, D × B − ¾ E), E rounded down to a multiple of $4
    const E = floorTo(M, 4);
    basic = GIS_COUPLE_BASE + Math.max(0, OAS_FULL_MONTHLY - 0.75 * E);
  } else {
    // (c): (A × B) − C/4, C = residual joint income rounded down to a multiple of $4
    basic = GIS_COUPLE_BASE - floorTo(M - R, 4) / 4;
  }
  const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_COUPLE) / 24, 4);
  const topUp = Math.max(0, GIS_COUPLE_TOPUP - C / 4);
  const b = cents(Math.max(0, basic));
  const t = cents(topUp);
  const monthly = cents(b + t);
  return { basic: b, topUp: t, monthly, annual: cents(monthly * 12), max: cents(OAS_FULL_MONTHLY + GIS_COUPLE_BASE + GIS_COUPLE_TOPUP) };
}

/** Allowance for the Survivor, s. 22(4) and 22.1(3). `income` excludes OAS benefits. */
export function allowanceSurvivor(income: number): AllowanceResult {
  const Y = Math.max(0, income);
  const M = Y / 12;
  const R = residualDeduction();
  let basic: number;
  if (M <= R) {
    const E = floorTo(M, 4);
    basic = AFS_SUPPLEMENT_EQUIVALENT + Math.max(0, OAS_FULL_MONTHLY - 0.75 * E);
  } else {
    // (c): (A × B) − C/2, C = residual income rounded down to a multiple of $2
    basic = AFS_SUPPLEMENT_EQUIVALENT - floorTo(M - R, 2) / 2;
  }
  const C = floorTo(Math.max(0, Y - TOPUP_EXEMPT_SINGLE) / 12, 4);
  const topUp = Math.max(0, GIS_SINGLE_TOPUP - C / 4);
  const b = cents(Math.max(0, basic));
  const t = cents(topUp);
  const monthly = cents(b + t);
  return { basic: b, topUp: t, monthly, annual: cents(monthly * 12), max: cents(OAS_FULL_MONTHLY + AFS_SUPPLEMENT_EQUIVALENT + GIS_SINGLE_TOPUP) };
}

// ─── CPP + OAS + GIS together ───────────────────────────────────────────────

export interface RetirementInput {
  situation: GisSituation;
  yearsAt65: number;
  deferralMonths?: number;
  age75?: boolean;
  /** Your CPP or QPP retirement pension, per month. */
  cppMonthly: number;
  /** Other taxable income per year: workplace pension, RRIF, interest, rent… (not OAS or GIS). */
  otherAnnual?: number;
  /** Employment or self-employment income per year. */
  earningsAnnual?: number;
  /** Spouse's income for GIS per year, CPP included (couples only). */
  spouseAnnual?: number;
}

export interface RetirementResult {
  oas: OasResult;
  cpp: number;
  gis: GisResult;
  /** Allowance paid to the spouse, when the situation is « spouse-allowance ». */
  spouseAllowance: number;
  recovery: RecoveryResult;
  /** Your gross monthly income from the three programs, after recovery tax. */
  monthlyTotal: number;
  annualTotal: number;
  /** GIS lost per extra $100 of CPP a month. */
  gisLossPer100Cpp: number;
}

export function retirementIncome(input: RetirementInput): RetirementResult {
  const oas = oasPension({ yearsAt65: input.yearsAt65, deferralMonths: input.deferralMonths, age75: input.age75 });
  const cpp = Math.max(0, input.cppMonthly);
  const ownIncome = gisIncome(cpp * 12 + (input.otherAnnual ?? 0), input.earningsAnnual ?? 0);
  const couple = input.situation !== 'single';
  const income = couple ? ownIncome + Math.max(0, input.spouseAnnual ?? 0) : ownIncome;
  // GIS is paid only with an OAS pension, and uses the pension before the
  // deferral and 75+ increases (s. 2.1(2)).
  const none: GisResult = { situation: input.situation, income, basic: 0, topUp: 0, monthly: 0, annual: 0, max: 0 };
  const g = oas.eligible ? gis(input.situation, income, oas.basePension) : none;
  const gPlus = oas.eligible ? gis(input.situation, income + 1200, oas.basePension) : none;
  const spouseAllowance = input.situation === 'spouse-allowance' && oas.eligible ? allowance(income).monthly : 0;
  // Net income (line 23400) for the recovery tax: OAS, CPP, GIS, other income and earnings.
  const netIncome = oas.annual + cpp * 12 + g.annual + (input.otherAnnual ?? 0) + Math.max(0, input.earningsAnnual ?? 0);
  const recovery = recoveryTax(netIncome, oas.annual, 2026);
  const monthlyTotal = cents(oas.monthly - recovery.monthly + cpp + g.monthly);
  return {
    oas, cpp, gis: g, spouseAllowance, recovery,
    monthlyTotal, annualTotal: cents(monthlyTotal * 12),
    gisLossPer100Cpp: cents(g.monthly - gPlus.monthly),
  };
}

export const GIS_SITUATIONS: Array<{ value: GisSituation; label: string }> = [
  { value: 'single', label: 'Single, widowed or divorced' },
  { value: 'spouse-oas', label: 'Spouse or partner receives the full OAS pension' },
  { value: 'spouse-allowance', label: 'Spouse or partner (60-64) receives the Allowance' },
  { value: 'spouse-none', label: 'Spouse or partner receives neither OAS nor the Allowance' },
];
