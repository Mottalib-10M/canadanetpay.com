import { describe, it, expect } from 'vitest';
import { contributions2027 } from '../data/payroll-2027';

// Official 2027 maximums: CRA (CPP 4,209.00), ESDC (EI 1,161.12), CPP2 (87,400 − 76,700) × 4 % = 428.
describe('payroll contributions 2027 (outside Quebec)', () => {
  it('reaches the official maximums at high salaries', () => {
    const c = contributions2027(150000);
    expect(c.cpp).toBe(4209);
    expect(c.cpp2).toBe(428);
    expect(c.ei).toBe(1161.12);
    expect(c.total).toBe(5798.12);
  });
  it('applies the $3,500 exemption and the 5.75 % rate below the ceiling', () => {
    const c = contributions2027(50000);
    expect(c.cpp).toBe(2673.75);
    expect(c.cpp2).toBe(0);
    expect(c.ei).toBe(820);
  });
  it('pays nothing on a zero salary', () => {
    expect(contributions2027(0).total).toBe(0);
  });
});
