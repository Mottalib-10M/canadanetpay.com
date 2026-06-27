import { describe, it, expect } from 'vitest';
import {
  calculateFederalTax,
  calculateCPPContribution,
  calculateEIContribution,
  calculateProvincialTax,
  calculateTakeHome,
  calculateRequiredGross,
  calculateBonus,
  calculateOntarioHealthPremium,
  hourlyToAnnual,
  annualToHourly,
} from './tax-engine-ca';

describe('calculateFederalTax', () => {
  it('should return 0 for income below BPA', () => {
    const result = calculateFederalTax(16000, 'ON');
    expect(result.total).toBe(0);
  });

  it('should calculate tax for $50,000 income', () => {
    const result = calculateFederalTax(50000, 'ON');
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(10000);
    expect(result.bands.length).toBeGreaterThan(0);
  });

  it('should calculate tax for $100,000 income', () => {
    const result = calculateFederalTax(100000, 'ON');
    expect(result.total).toBeGreaterThan(5000);
    expect(result.total).toBeLessThan(20000);
  });

  it('should apply Quebec abatement', () => {
    const onResult = calculateFederalTax(100000, 'ON');
    const qcResult = calculateFederalTax(100000, 'QC');
    expect(qcResult.total).toBeLessThan(onResult.total);
  });

  it('should handle RRSP deduction', () => {
    const noRrsp = calculateFederalTax(100000, 'ON');
    const withRrsp = calculateFederalTax(100000, 'ON', 10000);
    expect(withRrsp.total).toBeLessThan(noRrsp.total);
  });

  it('should calculate tax for high income ($250,000)', () => {
    const result = calculateFederalTax(250000, 'ON');
    expect(result.total).toBeGreaterThan(30000);
    expect(result.bands.length).toBe(5);
  });
});

describe('calculateCPPContribution', () => {
  it('should return 0 for income below exemption', () => {
    const result = calculateCPPContribution(3000, false);
    expect(result.cpp).toBe(0);
    expect(result.cpp2).toBe(0);
  });

  it('should calculate CPP for $50,000 income', () => {
    const result = calculateCPPContribution(50000, false);
    expect(result.cpp).toBeGreaterThan(2500);
    expect(result.cpp).toBeLessThan(4100);
    expect(result.cpp2).toBe(0);
  });

  it('should cap CPP at maximum', () => {
    const result = calculateCPPContribution(200000, false);
    expect(result.cpp).toBeLessThanOrEqual(4034.10);
  });

  it('should calculate CPP2 for income above first ceiling', () => {
    const result = calculateCPPContribution(79400, false);
    expect(result.cpp2).toBeGreaterThan(0);
    expect(result.cpp2).toBeLessThanOrEqual(324);
  });

  it('should use QPP rates for Quebec', () => {
    const cppResult = calculateCPPContribution(70000, false);
    const qppResult = calculateCPPContribution(70000, true);
    expect(qppResult.cpp).toBeGreaterThan(cppResult.cpp);
  });

  it('should cap QPP at maximum', () => {
    const result = calculateCPPContribution(200000, true);
    expect(result.cpp).toBeLessThanOrEqual(4341.80);
  });
});

describe('calculateEIContribution', () => {
  it('should calculate EI for $50,000 income', () => {
    const result = calculateEIContribution(50000, false);
    expect(result.ei).toBeGreaterThan(700);
    expect(result.ei).toBeLessThan(1100);
    expect(result.qpip).toBe(0);
  });

  it('should cap EI at maximum', () => {
    const result = calculateEIContribution(200000, false);
    expect(result.ei).toBeLessThanOrEqual(1049.12);
  });

  it('should use lower EI rate for Quebec', () => {
    const nonQc = calculateEIContribution(50000, false);
    const qc = calculateEIContribution(50000, true);
    expect(qc.ei).toBeLessThan(nonQc.ei);
  });

  it('should include QPIP for Quebec', () => {
    const result = calculateEIContribution(50000, true);
    expect(result.qpip).toBeGreaterThan(0);
    expect(result.total).toBe(result.ei + result.qpip);
  });

  it('should cap QPIP at maximum', () => {
    const result = calculateEIContribution(200000, true);
    expect(result.qpip).toBeLessThanOrEqual(484.12);
  });
});

describe('calculateProvincialTax', () => {
  it('should return 0 for income below BPA', () => {
    const result = calculateProvincialTax(10000, 'AB');
    expect(result).toBe(0);
  });

  it('should calculate Ontario provincial tax', () => {
    const result = calculateProvincialTax(75000, 'ON');
    expect(result).toBeGreaterThan(2000);
    expect(result).toBeLessThan(8000);
  });

  it('should calculate Quebec provincial tax', () => {
    const result = calculateProvincialTax(75000, 'QC');
    expect(result).toBeGreaterThan(3000);
    expect(result).toBeLessThan(12000);
  });

  it('should calculate Alberta provincial tax', () => {
    const result = calculateProvincialTax(75000, 'AB');
    expect(result).toBeGreaterThan(2000);
    expect(result).toBeLessThan(8000);
  });

  it('should apply Ontario surtax for high income', () => {
    const result = calculateProvincialTax(250000, 'ON');
    expect(result).toBeGreaterThan(15000);
  });
});

describe('calculateOntarioHealthPremium', () => {
  it('should return 0 for income below $20,000', () => {
    expect(calculateOntarioHealthPremium(19000)).toBe(0);
  });

  it('should return $300 for income $30,000', () => {
    expect(calculateOntarioHealthPremium(30000)).toBe(300);
  });

  it('should return $600 for income $60,000', () => {
    expect(calculateOntarioHealthPremium(60000)).toBe(600);
  });

  it('should return $900 for income over $200,600', () => {
    expect(calculateOntarioHealthPremium(300000)).toBe(900);
  });
});

describe('calculateTakeHome', () => {
  it('should calculate complete result for Ontario $75,000', () => {
    const result = calculateTakeHome({ grossAnnual: 75000, provinceCode: 'ON', payFrequency: 'bi_weekly' });
    expect(result.grossAnnual).toBe(75000);
    expect(result.federalIncomeTax).toBeGreaterThan(0);
    expect(result.cpp).toBeGreaterThan(0);
    expect(result.ei).toBeGreaterThan(0);
    expect(result.provincialTax).toBeGreaterThan(0);
    expect(result.netAnnual).toBeGreaterThan(0);
    expect(result.netAnnual).toBeLessThan(75000);
    expect(result.netMonthly).toBeCloseTo(result.netAnnual / 12, 0);
    expect(result.effectiveTaxRate).toBeGreaterThan(20);
    expect(result.effectiveTaxRate).toBeLessThan(40);
  });

  it('should include QPIP for Quebec', () => {
    const result = calculateTakeHome({ grossAnnual: 75000, provinceCode: 'QC', payFrequency: 'annual' });
    expect(result.qpip).toBeGreaterThan(0);
    expect(result.provinceName).toBe('Quebec');
  });

  it('should include Ontario health premium', () => {
    const result = calculateTakeHome({ grossAnnual: 75000, provinceCode: 'ON', payFrequency: 'annual' });
    expect(result.ontarioHealthPremium).toBeGreaterThan(0);
  });

  it('should have lower net for Quebec than Alberta at same income', () => {
    const ab = calculateTakeHome({ grossAnnual: 100000, provinceCode: 'AB', payFrequency: 'annual' });
    const qc = calculateTakeHome({ grossAnnual: 100000, provinceCode: 'QC', payFrequency: 'annual' });
    expect(qc.netAnnual).toBeLessThan(ab.netAnnual);
  });

  it('should calculate marginal tax rate', () => {
    const result = calculateTakeHome({ grossAnnual: 100000, provinceCode: 'ON', payFrequency: 'annual' });
    expect(result.marginalTaxRate).toBeGreaterThan(20);
    expect(result.marginalTaxRate).toBeLessThan(60);
  });
});

describe('calculateRequiredGross', () => {
  it('should find gross that produces target net', () => {
    const target = 50000;
    const gross = calculateRequiredGross(target, 'ON');
    const result = calculateTakeHome({ grossAnnual: gross, provinceCode: 'ON', payFrequency: 'annual' });
    expect(Math.abs(result.netAnnual - target)).toBeLessThan(1);
  });

  it('should find higher gross for Quebec (higher taxes)', () => {
    const target = 50000;
    const abGross = calculateRequiredGross(target, 'AB');
    const qcGross = calculateRequiredGross(target, 'QC');
    expect(qcGross).toBeGreaterThan(abGross);
  });
});

describe('calculateBonus', () => {
  it('should calculate bonus tax', () => {
    const result = calculateBonus(75000, 10000, 'ON');
    expect(result.bonusNet).toBeGreaterThan(0);
    expect(result.bonusNet).toBeLessThan(10000);
    expect(result.bonusFederalTax).toBeGreaterThan(0);
    expect(result.bonusProvincialTax).toBeGreaterThanOrEqual(0);
  });

  it('should handle Quebec QPP for bonus', () => {
    const result = calculateBonus(60000, 10000, 'QC');
    expect(result.bonusCPP).toBeGreaterThan(0);
    expect(result.bonusNet).toBeLessThan(10000);
  });
});

describe('hourlyToAnnual', () => {
  it('should convert $25/hr at 40hrs/week', () => {
    expect(hourlyToAnnual(25, 40)).toBe(52000);
  });

  it('should handle part-time hours', () => {
    expect(hourlyToAnnual(30, 20)).toBe(31200);
  });
});

describe('annualToHourly', () => {
  it('should convert $52,000 annual to $25/hr', () => {
    expect(annualToHourly(52000, 40)).toBe(25);
  });
});
