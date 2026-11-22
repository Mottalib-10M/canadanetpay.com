/**
 * Payroll contributions 2027, outside Quebec (official figures only).
 * CPP: CRA, "CPP contribution rates, maximums and exemptions", 2027 row (page modified 2026-11-09).
 * CPP2: YAMPE = 1.14 × YMPE rounded down to the hundred (CPP s. 18.1) = 87,400; rate 4% unchanged.
 * EI: ESDC, Summary of the 2027 Actuarial Report on the EI Premium Rate (2026-09-17).
 * Federal brackets and the basic personal amount for 2027 are not yet published by the CRA (2026-11-21).
 */
export const CPP_2027 = { rate: 0.0575, exemption: 3500, ympe: 76700, max: 4209.0 };
export const CPP2_2027 = { rate: 0.04, yampe: 87400, max: 428.0 };
export const EI_2027 = { rate: 0.0164, mie: 70800, max: 1161.12, rateQuebec: 0.0129, maxQuebec: 913.32 };

const r2 = (x: number) => Math.round(x * 100) / 100;

export function contributions2027(gross: number) {
  const g = Math.max(0, gross);
  const cpp = Math.min(r2(Math.max(0, Math.min(g, CPP_2027.ympe) - CPP_2027.exemption) * CPP_2027.rate), CPP_2027.max);
  const cpp2 = Math.min(r2(Math.max(0, Math.min(g, CPP2_2027.yampe) - CPP_2027.ympe) * CPP2_2027.rate), CPP2_2027.max);
  const ei = Math.min(r2(Math.min(g, EI_2027.mie) * EI_2027.rate), EI_2027.max);
  return { cpp, cpp2, ei, total: r2(cpp + cpp2 + ei) };
}
