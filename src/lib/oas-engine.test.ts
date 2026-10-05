/**
 * The engine is checked against what Service Canada publishes for October to
 * December 2026 (data/oas-2026.ts, sources [SC-PAY], [SC-EST], [SC-REC]):
 * every maximum, every income cut-off (the last $24 or $48 bracket that pays
 * and the first that does not), the deferred amounts at 66 to 70 and the
 * recovery-tax example of the official estimator.
 */
import { describe, it, expect } from 'vitest';
import { oasPension, recoveryTax, gis, gisIncome, allowance, allowanceSurvivor, retirementIncome, residualDeduction } from './oas-engine';
import {
  OAS_FULL_MONTHLY, OAS_75_PUBLISHED, OAS_DEFERRED_PUBLISHED, GIS_SINGLE_MAX, GIS_COUPLE_MAX,
  ALLOWANCE_MAX, AFS_MAX, PUBLISHED_CUTOFFS, PAYMENT_DATES_2026,
} from '../data/oas-2026';

describe('OAS pension', () => {
  it('pays the published full pension at 65-74 and 75+', () => {
    expect(oasPension({ yearsAt65: 40 }).monthly).toBe(OAS_FULL_MONTHLY);
    expect(oasPension({ yearsAt65: 40, age75: true }).monthly).toBe(OAS_75_PUBLISHED);
  });
  it('pays n/40 for 10 to 39 years, rounded down to whole years', () => {
    expect(oasPension({ yearsAt65: 20 }).monthly).toBe(381.25);
    expect(oasPension({ yearsAt65: 10 }).monthly).toBe(190.63);
    expect(oasPension({ yearsAt65: 25.9 }).monthly).toBe(oasPension({ yearsAt65: 25 }).monthly);
  });
  it('pays nothing under 10 years', () => {
    expect(oasPension({ yearsAt65: 9 }).eligible).toBe(false);
  });
  it('matches the deferred amounts published for 66 to 70', () => {
    for (const [age, amount] of Object.entries(OAS_DEFERRED_PUBLISHED)) {
      expect(oasPension({ yearsAt65: 40, deferralMonths: (Number(age) - 65) * 12 }).monthly).toBe(amount);
    }
  });
  it('caps the deferral at 60 months (36 %)', () => {
    expect(oasPension({ yearsAt65: 40, deferralMonths: 90 }).monthly).toBe(1037);
  });
  it('keeps the greater of the three amounts of s. 7.1(3) for a partial pensioner', () => {
    // 30 years at 65, deferred 5 years: 30/40 × 1.36 = 1.02 beats 35/40
    const r = oasPension({ yearsAt65: 30, deferralMonths: 60 });
    expect(r.rule).toBe('partial-deferred');
    expect(r.monthly).toBe(777.75);
    // 38 years at 65, deferred 5 years: 38/40 × 1.36 = 1.292 beats full × (1 + 0.006 × 36)
    expect(oasPension({ yearsAt65: 38, deferralMonths: 60 }).monthly).toBe(985.15);
    // 8 years at 65: reaches 10 years at 67, no deferral increase before qualifying
    const late = oasPension({ yearsAt65: 8, deferralMonths: 24 });
    expect(late.eligible).toBe(true);
    expect(late.monthly).toBe(190.63);
  });
});

describe('recovery tax', () => {
  it('reproduces the estimator example: $100,000 in 2025 → $981.90', () => {
    const r = recoveryTax(100000, 9150, 2025);
    expect(r.excess).toBe(6546);
    expect(r.annual).toBe(981.9);
  });
  it('is nil at or below the 2026 threshold', () => {
    expect(recoveryTax(95323, 9150, 2026).annual).toBe(0);
  });
  it('never exceeds the OAS received', () => {
    const r = recoveryTax(200000, 9150, 2026);
    expect(r.annual).toBe(9150);
    expect(r.full).toBe(true);
  });
});

describe('GIS income', () => {
  it('exempts the first $5,000 of earnings and half of the next $10,000', () => {
    expect(gisIncome(0, 5000)).toBe(0);
    expect(gisIncome(0, 15000)).toBe(5000);
    expect(gisIncome(0, 20000)).toBe(10000);
    expect(gisIncome(12000, 3000)).toBe(12000);
  });
});

/** Annual incomes are tested on both sides of the published cut-off. */
describe('GIS against published maximums and cut-offs', () => {
  it('single', () => {
    expect(gis('single', 0).monthly).toBe(GIS_SINGLE_MAX);
    expect(gis('single', PUBLISHED_CUTOFFS.gisSingle - 24).monthly).toBeGreaterThan(0);
    expect(gis('single', PUBLISHED_CUTOFFS.gisSingle).monthly).toBe(0);
  });
  it('spouse receives OAS', () => {
    expect(gis('spouse-oas', 0).monthly).toBe(GIS_COUPLE_MAX);
    expect(gis('spouse-oas', PUBLISHED_CUTOFFS.gisSpouseOas - 48).monthly).toBeGreaterThan(0);
    expect(gis('spouse-oas', PUBLISHED_CUTOFFS.gisSpouseOas).monthly).toBe(0);
  });
  it('spouse receives the Allowance', () => {
    expect(gis('spouse-allowance', 0).monthly).toBe(GIS_COUPLE_MAX);
    // The published $42,768 is where the Allowance stops; above it the
    // pensioner is paid on the « spouse receives neither » scale (s. 22(6)).
    expect(allowance(PUBLISHED_CUTOFFS.gisSpouseAllowance).monthly).toBe(0);
    expect(gis('spouse-allowance', PUBLISHED_CUTOFFS.gisSpouseAllowance).monthly).toBe(gis('spouse-none', PUBLISHED_CUTOFFS.gisSpouseAllowance).monthly);
    expect(gis('spouse-allowance', PUBLISHED_CUTOFFS.gisSpouseNoOas).monthly).toBe(0);
  });
  it('s. 22(6): Allowance + GIS never fall below the Part II supplement', () => {
    for (const y of [20000, 30000, 36000, 40000, 42000]) {
      const sum = allowance(y).monthly + gis('spouse-allowance', y).monthly;
      expect(sum).toBeGreaterThanOrEqual(gis('spouse-none', y).monthly - 0.01);
    }
  });
  it('spouse receives neither', () => {
    expect(gis('spouse-none', 0).monthly).toBe(GIS_SINGLE_MAX);
    expect(gis('spouse-none', PUBLISHED_CUTOFFS.gisSpouseNoOas - 48).monthly).toBeGreaterThan(0);
    expect(gis('spouse-none', PUBLISHED_CUTOFFS.gisSpouseNoOas).monthly).toBe(0);
  });
  it('reduces the basic amount $1 per $2 and the top-up $1 per $4 (single)', () => {
    // $6,000: basic 962.49 − 250 = 712.49 ; top-up 176.41 − 332/4 = 93.41
    const r = gis('single', 6000);
    expect(r.basic).toBe(712.49);
    expect(r.topUp).toBe(93.41);
    expect(r.monthly).toBe(805.9);
  });
  it('adds the missing OAS to the GIS of a partial pensioner (s. 12(5))', () => {
    const full = gis('single', 6000).monthly;
    const partial = gis('single', 6000, 381.25).monthly;
    expect(partial).toBe(Math.round((full + 381.25) * 100) / 100);
  });
});

describe('Allowance and Allowance for the Survivor', () => {
  it('residual deduction is $1,020 a month', () => {
    expect(residualDeduction()).toBe(1020);
  });
  it('Allowance: published maximum and cut-off', () => {
    expect(allowance(0).monthly).toBe(ALLOWANCE_MAX);
    expect(allowance(PUBLISHED_CUTOFFS.allowance - 48).monthly).toBeGreaterThan(0);
    expect(allowance(PUBLISHED_CUTOFFS.allowance).monthly).toBe(0);
  });
  it('Allowance for the Survivor: published maximum and cut-off', () => {
    expect(allowanceSurvivor(0).monthly).toBe(AFS_MAX);
    expect(allowanceSurvivor(PUBLISHED_CUTOFFS.afs - 24).monthly).toBeGreaterThan(0);
    expect(allowanceSurvivor(PUBLISHED_CUTOFFS.afs).monthly).toBe(0);
  });
  it('the OAS-equivalent part falls $3 per $4 of income first', () => {
    // $4,800 a year = $400 a month: 762.50 − 300 = 462.50 kept
    const r = allowanceSurvivor(4800);
    expect(r.basic).toBe(Math.round((787.27 + 462.5) * 100) / 100);
  });
});

describe('CPP + OAS + GIS', () => {
  it('a single pensioner with $800 of CPP and full OAS', () => {
    const r = retirementIncome({ situation: 'single', yearsAt65: 40, cppMonthly: 800 });
    // income 9,600 → basic 962.49 − 400 = 562.49 ; top-up 176.41 − 632/4 = 18.41
    expect(r.gis.monthly).toBe(580.9);
    expect(r.monthlyTotal).toBe(Math.round((762.5 + 800 + 580.9) * 100) / 100);
  });
  it('no GIS without an OAS pension', () => {
    const r = retirementIncome({ situation: 'single', yearsAt65: 5, cppMonthly: 300 });
    expect(r.gis.monthly).toBe(0);
  });
});

describe('payment dates', () => {
  it('lists twelve 2026 dates, one per month', () => {
    expect(PAYMENT_DATES_2026).toHaveLength(12);
    expect(new Set(PAYMENT_DATES_2026.map((d) => d.slice(5, 7))).size).toBe(12);
  });
});
