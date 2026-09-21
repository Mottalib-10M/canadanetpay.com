/**
 * Canadian Tax Engine — Pure calculation functions for federal + provincial taxes
 *
 * All functions are pure, side-effect-free, and operate on annual figures.
 * Sources: CRA, Revenu Québec, provincial finance ministries.
 */

import {
  FEDERAL_BRACKETS,
  BASIC_PERSONAL_AMOUNT,
  BPA_CLAWBACK_THRESHOLD,
  BPA_CLAWBACK_FULL,
  BPA_MINIMUM,
  CPP_RATE,
  CPP_EXEMPTION,
  CPP_MAX_PENSIONABLE_EARNINGS,
  CPP_MAX_CONTRIBUTION,
  CPP2_RATE,
  CPP2_MAX_PENSIONABLE_EARNINGS,
  CPP2_MAX_CONTRIBUTION,
  EI_RATE,
  EI_MAX_INSURABLE_EARNINGS,
  EI_MAX_CONTRIBUTION,
  QPP_RATE,
  QPP_EXEMPTION,
  QPP_MAX_PENSIONABLE_EARNINGS,
  QPP_MAX_CONTRIBUTION,
  QPP2_RATE,
  QPP2_MAX_PENSIONABLE_EARNINGS,
  QPP2_MAX_CONTRIBUTION,
  QPIP_RATE,
  QPIP_MAX_INSURABLE_EARNINGS,
  QPIP_MAX_CONTRIBUTION,
  EI_RATE_QUEBEC,
  EI_MAX_CONTRIBUTION_QUEBEC,
  QUEBEC_ABATEMENT,
  PAY_PERIODS,
  type PayFrequency,
  type TaxBracket,
} from '../data/federal-tax-2025';

import { PROVINCES, type ProvinceConfig } from '../data/provinces';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CalculatorInput {
  grossAnnual: number;
  provinceCode: string;
  payFrequency: PayFrequency;
  rrspContribution?: number;
  _skipMarginal?: boolean;
}

export interface TaxBandBreakdown {
  name: string;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface CalculationResult {
  grossAnnual: number;
  federalTaxableIncome: number;
  federalIncomeTax: number;
  federalBands: TaxBandBreakdown[];
  cpp: number;
  cpp2: number;
  ei: number;
  qpip: number;
  provincialTax: number;
  provinceName: string;
  ontarioHealthPremium: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  netBiWeekly: number;
  netWeekly: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  payPerPeriod: number;
  payFrequency: PayFrequency;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcBrackets(taxableIncome: number, brackets: TaxBracket[]): { total: number; bands: TaxBandBreakdown[] } {
  let total = 0;
  const bands: TaxBandBreakdown[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const tax = taxableInBracket * bracket.rate;
    if (taxableInBracket > 0) {
      bands.push({
        name: '',
        rate: bracket.rate,
        taxableAmount: round2(taxableInBracket),
        tax: round2(tax),
      });
      total += tax;
    }
  }

  return { total: round2(total), bands };
}

// ─── Basic Personal Amount (with high-income clawback) ──────────────────────

function getEffectiveBPA(grossAnnual: number): number {
  if (grossAnnual <= BPA_CLAWBACK_THRESHOLD) return BASIC_PERSONAL_AMOUNT;
  if (grossAnnual >= BPA_CLAWBACK_FULL) return BPA_MINIMUM;
  const reduction = ((grossAnnual - BPA_CLAWBACK_THRESHOLD) / (BPA_CLAWBACK_FULL - BPA_CLAWBACK_THRESHOLD)) * (BASIC_PERSONAL_AMOUNT - BPA_MINIMUM);
  return round2(BASIC_PERSONAL_AMOUNT - reduction);
}

// ─── Federal Income Tax ─────────────────────────────────────────────────────

export function calculateFederalTax(
  grossAnnual: number,
  provinceCode: string,
  rrspContribution: number = 0,
): { total: number; taxableIncome: number; bands: TaxBandBreakdown[] } {
  const taxableIncome = Math.max(0, grossAnnual - rrspContribution);
  const { total: grossTax, bands } = calcBrackets(taxableIncome, FEDERAL_BRACKETS);

  // BPA non-refundable credit at lowest rate (15%)
  const bpa = getEffectiveBPA(grossAnnual);
  const bpaCredit = round2(bpa * 0.15);

  // CPP/QPP credit
  const province = PROVINCES[provinceCode];
  const isQuebec = province?.isQuebec ?? false;
  const cppCredit = round2(calculateCPPContribution(grossAnnual, isQuebec).total * 0.15);

  // EI credit
  const eiCredit = round2(calculateEIContribution(grossAnnual, isQuebec).ei * 0.15);

  let federalTax = Math.max(0, grossTax - bpaCredit - cppCredit - eiCredit);

  // Quebec abatement
  if (isQuebec) {
    federalTax = round2(federalTax * (1 - QUEBEC_ABATEMENT));
  }

  return { total: round2(federalTax), taxableIncome: round2(taxableIncome), bands };
}

// ─── CPP / QPP ──────────────────────────────────────────────────────────────

export function calculateCPPContribution(grossAnnual: number, isQuebec: boolean = false): { cpp: number; cpp2: number; total: number } {
  if (isQuebec) {
    // QPP
    const qppEarnings = Math.min(grossAnnual, QPP_MAX_PENSIONABLE_EARNINGS) - QPP_EXEMPTION;
    const qpp = qppEarnings > 0 ? Math.min(round2(qppEarnings * QPP_RATE), QPP_MAX_CONTRIBUTION) : 0;

    // QPP2
    const qpp2Earnings = Math.min(grossAnnual, QPP2_MAX_PENSIONABLE_EARNINGS) - QPP_MAX_PENSIONABLE_EARNINGS;
    const qpp2 = qpp2Earnings > 0 ? Math.min(round2(qpp2Earnings * QPP2_RATE), QPP2_MAX_CONTRIBUTION) : 0;

    return { cpp: qpp, cpp2: qpp2, total: round2(qpp + qpp2) };
  }

  // CPP
  const cppEarnings = Math.min(grossAnnual, CPP_MAX_PENSIONABLE_EARNINGS) - CPP_EXEMPTION;
  const cpp = cppEarnings > 0 ? Math.min(round2(cppEarnings * CPP_RATE), CPP_MAX_CONTRIBUTION) : 0;

  // CPP2
  const cpp2Earnings = Math.min(grossAnnual, CPP2_MAX_PENSIONABLE_EARNINGS) - CPP_MAX_PENSIONABLE_EARNINGS;
  const cpp2 = cpp2Earnings > 0 ? Math.min(round2(cpp2Earnings * CPP2_RATE), CPP2_MAX_CONTRIBUTION) : 0;

  return { cpp, cpp2, total: round2(cpp + cpp2) };
}

// ─── EI / QPIP ─────────────────────────────────────────────────────────────

export function calculateEIContribution(grossAnnual: number, isQuebec: boolean = false): { ei: number; qpip: number; total: number } {
  if (isQuebec) {
    const eiEarnings = Math.min(grossAnnual, EI_MAX_INSURABLE_EARNINGS);
    const ei = Math.min(round2(eiEarnings * EI_RATE_QUEBEC), EI_MAX_CONTRIBUTION_QUEBEC);

    const qpipEarnings = Math.min(grossAnnual, QPIP_MAX_INSURABLE_EARNINGS);
    const qpip = Math.min(round2(qpipEarnings * QPIP_RATE), QPIP_MAX_CONTRIBUTION);

    return { ei, qpip, total: round2(ei + qpip) };
  }

  const eiEarnings = Math.min(grossAnnual, EI_MAX_INSURABLE_EARNINGS);
  const ei = Math.min(round2(eiEarnings * EI_RATE), EI_MAX_CONTRIBUTION);

  return { ei, qpip: 0, total: ei };
}

// ─── Provincial Income Tax ──────────────────────────────────────────────────

export function calculateProvincialTax(grossAnnual: number, provinceCode: string, rrspContribution: number = 0): number {
  const province = PROVINCES[provinceCode];
  if (!province) return 0;

  const taxableIncome = Math.max(0, grossAnnual - rrspContribution);
  const { total: grossProvTax } = calcBrackets(taxableIncome, province.brackets);

  // Provincial BPA credit at lowest bracket rate
  const lowestRate = province.brackets[0].rate;
  const bpaCredit = round2(province.basicPersonalAmount * lowestRate);

  let provTax = Math.max(0, grossProvTax - bpaCredit);

  // Ontario surtax
  if (province.surtax) {
    const { threshold1, rate1, threshold2, rate2 } = province.surtax;
    let surtax = 0;
    if (provTax > threshold1) {
      surtax += (provTax - threshold1) * rate1;
    }
    if (provTax > threshold2 && rate2 > 0) {
      surtax += (provTax - threshold2) * rate2;
    }
    provTax = round2(provTax + surtax);
  }

  return round2(provTax);
}

// ─── Ontario Health Premium ─────────────────────────────────────────────────

export function calculateOntarioHealthPremium(grossAnnual: number): number {
  if (grossAnnual <= 20000) return 0;
  if (grossAnnual <= 25000) return round2((grossAnnual - 20000) * 0.06);
  if (grossAnnual <= 36000) return 300;
  if (grossAnnual <= 38500) return round2(300 + (grossAnnual - 36000) * 0.06);
  if (grossAnnual <= 48000) return 450;
  if (grossAnnual <= 48600) return round2(450 + (grossAnnual - 48000) * 0.25);
  if (grossAnnual <= 72000) return 600;
  if (grossAnnual <= 72600) return round2(600 + (grossAnnual - 72000) * 0.25);
  if (grossAnnual <= 200000) return 750;
  if (grossAnnual <= 200600) return round2(750 + (grossAnnual - 200000) * 0.25);
  return 900;
}

// ─── Main Calculator ────────────────────────────────────────────────────────

export function calculateTakeHome(input: CalculatorInput): CalculationResult {
  const {
    grossAnnual,
    provinceCode,
    payFrequency,
    rrspContribution = 0,
  } = input;

  const province = PROVINCES[provinceCode];
  const isQuebec = province?.isQuebec ?? false;

  // Federal income tax
  const federal = calculateFederalTax(grossAnnual, provinceCode, rrspContribution);

  // CPP/QPP
  const cppResult = calculateCPPContribution(grossAnnual, isQuebec);

  // EI/QPIP
  const eiResult = calculateEIContribution(grossAnnual, isQuebec);

  // Provincial tax
  const provincialTax = calculateProvincialTax(grossAnnual, provinceCode, rrspContribution);

  // Ontario Health Premium
  const ontarioHP = province?.healthPremium ? calculateOntarioHealthPremium(grossAnnual) : 0;

  // Total deductions
  const totalDeductions = round2(
    federal.total + cppResult.total + eiResult.total + provincialTax + ontarioHP + rrspContribution
  );

  // Net
  const netAnnual = round2(grossAnnual - totalDeductions);
  const netMonthly = round2(netAnnual / 12);
  const netBiWeekly = round2(netAnnual / 26);
  const netWeekly = round2(netAnnual / 52);

  const periods = PAY_PERIODS[payFrequency].periods;
  const payPerPeriod = round2(netAnnual / periods);

  // Effective rate (taxes only, not RRSP)
  const totalTax = federal.total + cppResult.total + eiResult.total + provincialTax + ontarioHP;
  const effectiveTaxRate = grossAnnual > 0 ? round2((totalTax / grossAnnual) * 100) : 0;

  // Marginal rate
  const marginalTaxRate = input._skipMarginal
    ? 0
    : calculateMarginalRate(grossAnnual, provinceCode, payFrequency, rrspContribution);

  return {
    grossAnnual,
    federalTaxableIncome: federal.taxableIncome,
    federalIncomeTax: federal.total,
    federalBands: federal.bands,
    cpp: cppResult.cpp,
    cpp2: cppResult.cpp2,
    ei: eiResult.ei,
    qpip: eiResult.qpip,
    provincialTax,
    provinceName: province?.name ?? 'Unknown',
    ontarioHealthPremium: ontarioHP,
    totalDeductions,
    netAnnual,
    netMonthly,
    netBiWeekly,
    netWeekly,
    effectiveTaxRate,
    marginalTaxRate,
    payPerPeriod,
    payFrequency,
  };
}

// ─── Marginal Rate ──────────────────────────────────────────────────────────

function calculateMarginalRate(
  grossAnnual: number,
  provinceCode: string,
  payFrequency: PayFrequency,
  rrspContribution: number,
): number {
  const r1 = calculateTakeHome({
    grossAnnual, provinceCode, payFrequency, rrspContribution, _skipMarginal: true,
  });
  const r2 = calculateTakeHome({
    grossAnnual: grossAnnual + 1, provinceCode, payFrequency, rrspContribution, _skipMarginal: true,
  });

  const additionalTax =
    (r2.federalIncomeTax + r2.cpp + r2.cpp2 + r2.ei + r2.qpip + r2.provincialTax + r2.ontarioHealthPremium) -
    (r1.federalIncomeTax + r1.cpp + r1.cpp2 + r1.ei + r1.qpip + r1.provincialTax + r1.ontarioHealthPremium);

  return round2(additionalTax * 100);
}

// ─── Reverse Calculator (Net → Gross) ────────────────────────────────────────

export function calculateRequiredGross(
  targetNet: number,
  provinceCode: string,
  payFrequency: PayFrequency = 'annual',
  rrspContribution: number = 0,
): number {
  let low = targetNet;
  let high = targetNet * 3;
  const tolerance = 0.50;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const result = calculateTakeHome({
      grossAnnual: mid, provinceCode, payFrequency, rrspContribution,
    });

    if (Math.abs(result.netAnnual - targetNet) < tolerance) {
      return Math.ceil(mid);
    }

    if (result.netAnnual < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.ceil((low + high) / 2);
}

// ─── Bonus Calculator ───────────────────────────────────────────────────────

export interface BonusResult {
  bonusGross: number;
  bonusFederalTax: number;
  bonusCPP: number;
  bonusEI: number;
  bonusProvincialTax: number;
  bonusNet: number;
}

export function calculateBonus(
  salary: number,
  bonus: number,
  provinceCode: string,
): BonusResult {
  const totalComp = salary + bonus;
  const province = PROVINCES[provinceCode];
  const isQuebec = province?.isQuebec ?? false;

  // Federal marginal tax on bonus
  const fedOnTotal = calculateFederalTax(totalComp, provinceCode).total;
  const fedOnSalary = calculateFederalTax(salary, provinceCode).total;
  const bonusFederalTax = round2(fedOnTotal - fedOnSalary);

  // CPP on bonus
  const cppOnTotal = calculateCPPContribution(totalComp, isQuebec).total;
  const cppOnSalary = calculateCPPContribution(salary, isQuebec).total;
  const bonusCPP = round2(cppOnTotal - cppOnSalary);

  // EI on bonus
  const eiOnTotal = calculateEIContribution(totalComp, isQuebec).total;
  const eiOnSalary = calculateEIContribution(salary, isQuebec).total;
  const bonusEI = round2(eiOnTotal - eiOnSalary);

  // Provincial tax on bonus
  const provOnTotal = calculateProvincialTax(totalComp, provinceCode);
  const provOnSalary = calculateProvincialTax(salary, provinceCode);
  const bonusProvincialTax = round2(provOnTotal - provOnSalary);

  const bonusNet = round2(bonus - bonusFederalTax - bonusCPP - bonusEI - bonusProvincialTax);

  return { bonusGross: bonus, bonusFederalTax, bonusCPP, bonusEI, bonusProvincialTax, bonusNet };
}

// ─── Hourly / Salary Conversions ─────────────────────────────────────────────

export function hourlyToAnnual(hourly: number, hoursPerWeek: number = 40): number {
  return round2(hourly * hoursPerWeek * 52);
}

export function annualToHourly(annual: number, hoursPerWeek: number = 40): number {
  return round2(annual / (hoursPerWeek * 52));
}
