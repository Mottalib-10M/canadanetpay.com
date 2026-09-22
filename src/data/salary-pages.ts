/**
 * Configuration for dynamically generated salary amount pages
 * Each page targets "$X salary after tax Canada" long-tail keywords
 */

export interface SalaryPageConfig {
  slug: string;
  grossAnnual: number;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
}

const amounts = [
  25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000,
  75000, 80000, 85000, 90000, 95000, 100000, 110000, 120000, 130000, 140000,
  150000, 175000, 200000, 250000, 300000,
];

/**
 * Montants conservant une page dediee.
 *
 * Les vingt-cinq pages engendrees ici etaient identiques a 98 % : le controle
 * d'unicite relevait 378 paires trop proches. On garde cinq montants places aux
 * endroits ou la situation fiscale change vraiment, c'est-a-dire de part et
 * d'autre des seuils de cotisation et des tranches hautes ; les autres sont
 * rassembles dans le tableau de /salary/, qui les compare.
 *
 * Retirer un montant d'ici demande une redirection dans `astro.config.mjs`,
 * faute de quoi son URL retournerait une 404.
 */
export const MONTANTS_AVEC_PAGE: number[] = [50000, 75000, 100000, 150000, 250000];

export const SALARY_PAGES: SalaryPageConfig[] = amounts.map((amount) => {
  const formatted = amount.toLocaleString('en-CA');
  return {
    slug: `${amount}-salary-after-tax`,
    grossAnnual: amount,
    title: `$${formatted} After Tax`,
    metaTitle: `$${formatted} Salary After Tax in Canada 2026 — Take-Home Pay`,
    metaDescription: `Calculate your take-home pay on a $${formatted} salary in Canada for 2026. See your federal tax, CPP, EI, and provincial tax breakdown across all provinces.`,
    h1: `$${formatted} Salary After Tax in Canada (2026)`,
  };
});

// ============================================================
// Salary Band System
// ============================================================

export type SalaryBand = 'entry' | 'median' | 'upper' | 'high' | 'top';

export function getSalaryBand(grossAnnual: number): SalaryBand {
  if (grossAnnual < 40_000) return 'entry';
  if (grossAnnual < 65_000) return 'median';
  if (grossAnnual < 100_000) return 'upper';
  if (grossAnnual < 175_000) return 'high';
  return 'top';
}

export interface BandNarrative {
  careers: string;
  taxes: string;
  budgeting: string;
  savings: string;
}

export const SALARY_BAND_NARRATIVES: Record<SalaryBand, BandNarrative> = {
  entry: {
    careers: 'This income range is common for entry-level positions and part-time workers in Canada. Typical occupations include retail associates, food service workers, junior administrative assistants, warehouse staff, and early-career customer service roles. At the federal minimum wage of $17.30/hour, full-time work produces about $36,000 annually. Provincial minimum wages range from $15.00 (Saskatchewan) to $17.40 (British Columbia). Statistics Canada reports approximately 20% of workers earn in this range.',
    taxes: 'At this income, your federal tax liability is relatively low. The Basic Personal Amount ($16,129 in 2025) shelters a significant portion of earnings. You fall in the 15% federal bracket. CPP contributions (5.95% on income between $3,500 and $71,300) and EI premiums (1.58% up to $65,700) are your main payroll deductions. In Quebec, you contribute to QPP (6.4%) and QPIP (0.494%) instead. Provincial tax adds 5% to 10% depending on your province. You may qualify for the GST/HST credit and the Canada Workers Benefit (CWB), which provides up to $1,518 for single individuals.',
    budgeting: 'With take-home pay of roughly $2,200 to $2,800 per month, careful budgeting is important. Housing is typically the largest expense. CMHC recommends spending no more than 30% of gross income on shelter costs. In smaller cities like Winnipeg or Halifax, rent for a one-bedroom apartment ranges from $1,000 to $1,400. In Toronto or Vancouver, the same apartment costs $1,800 to $2,400, making roommates or suburban locations necessary. Statistics Canada reports the average Canadian household spends about $1,100 monthly on food, transportation, and household operations combined.',
    savings: 'Building an emergency fund of $2,000 to $5,000 is your first priority. A Tax-Free Savings Account (TFSA) with a $7,000 annual contribution limit is ideal at this income level because withdrawals are tax-free, and you are already in a low tax bracket. If your employer offers RRSP matching, contribute enough to capture the full match. The First Home Savings Account (FHSA) allows $8,000 per year in tax-deductible contributions if you are saving for your first home. Even small regular contributions to low-cost index ETFs build wealth over time.',
  },
  median: {
    careers: 'This range brackets the median Canadian individual income (approximately $40,500 according to Statistics Canada). Common occupations include teachers, registered nurses, police officers, skilled tradespeople (electricians, plumbers), paralegals, IT support specialists, and marketing coordinators. Most positions require a college diploma, trades certification, or university degree. About 30% of Canadian full-time workers earn in this range. Government positions (federal, provincial, municipal) are well-represented in this bracket.',
    taxes: 'Your federal marginal rate is 15% (up to $57,375) or 20.5% (on income between $57,375 and $114,750). Your effective federal rate is typically 10% to 14%. CPP contributions at 5.95% on eligible earnings (up to $4,034 per year) and EI premiums ($1,049 maximum) are fixed costs. Provincial taxes vary significantly: Alberta has the lowest provincial rate at 10% flat, while Quebec can reach 14% to 20% combined with federal abatement. Contributing to an RRSP reduces your taxable income dollar-for-dollar, saving you 20% to 30% in combined federal and provincial tax on each dollar contributed.',
    budgeting: 'With monthly net income of $3,200 to $4,200, you have reasonable financial flexibility in most Canadian cities outside Toronto and Vancouver. A mortgage on a home priced at $300,000 to $400,000 is typically feasible with a 5% to 10% down payment and the First-Time Home Buyer Incentive. Monthly housing costs (mortgage, property tax, insurance) should stay under $1,500 to $1,800. The average Canadian household spends about $450 per month on groceries and $400 on transportation. Provincial differences in sales tax (GST/HST ranging from 5% to 15%) impact your purchasing power.',
    savings: 'A balanced savings strategy includes both an RRSP (for the tax deduction at your current marginal rate) and a TFSA (for tax-free growth). Aim to save 10% to 15% of gross income. If you are a first-time home buyer, the FHSA provides both a tax deduction on contributions and tax-free withdrawals for a home purchase. Target a three-to-six-month emergency fund ($12,000 to $20,000). If your employer offers a defined-benefit or defined-contribution pension, factor this into your overall retirement savings calculation.',
  },
  upper: {
    careers: 'This income range is typical for experienced professionals, senior specialists, and mid-level managers. Common roles include senior software developers, engineering managers, pharmacists, school principals, corporate accountants (CPA), senior government analysts, and healthcare specialists. Most positions require a bachelor\'s degree plus 5 to 10 years of experience or a professional designation. About 15% to 20% of Canadian workers earn in this bracket.',
    taxes: 'You are in the 20.5% or 26% federal marginal bracket (26% starts at $114,750). Your effective federal rate is 14% to 18%. You have reached the CPP maximum contribution ($4,034 + CPP2 at 4% on earnings from $71,300 to $79,400). RRSP contributions are your most powerful tax-reduction tool at this level, with a deduction limit of 18% of previous year\'s earned income (maximum $32,490 in 2025). Each dollar contributed saves 30% to 40% in combined federal and provincial taxes. Consider income splitting strategies if you have a spouse in a lower tax bracket, such as a spousal RRSP.',
    budgeting: 'With monthly net income of $5,000 to $6,500, most Canadian housing markets are accessible. Mortgage qualification extends to $450,000 to $600,000. In Toronto and Vancouver, this means condos or townhouses; in Calgary, Ottawa, or Montreal, detached homes are within reach. Discretionary income allows for regular vacations, dining, and lifestyle spending while still maintaining a healthy savings rate. Consider tracking spending to prevent lifestyle inflation as your income grows.',
    savings: 'Maximize your RRSP contribution ($32,490 or 18% of earned income) for the significant tax deduction. Allocate TFSA contributions ($7,000/year) to growth investments since gains are never taxed. If you have children, contribute $2,500 per year per child to an RESP to receive the 20% Canada Education Savings Grant ($500/year). Total annual savings of $35,000 to $50,000 is achievable, building a $1 million portfolio in 12 to 15 years with market returns.',
  },
  high: {
    careers: 'Earners at this level include directors and VPs, senior physicians, specialized dentists, corporate lawyers, senior IT architects, management consultants, and experienced engineers in oil and gas. Many roles involve significant management responsibility or highly specialized expertise. Professional designations (MD, JD, CPA, P.Eng) are common. About 8% to 10% of Canadian workers earn in this range, placing them above the 90th income percentile.',
    taxes: 'You are in the 26% or 29% federal marginal bracket (29% starts at $158,468). Combined federal and provincial marginal rates range from 38% (Alberta) to over 50% (Quebec, Nova Scotia). Tax-efficient compensation becomes critical. Maximize RRSP contributions ($32,490) and TFSA ($7,000). If you receive stock options, timing the exercise has significant tax implications. Consider incorporating if you have consulting or professional income (Canadian-Controlled Private Corporation). Charitable donations over $200 receive a federal credit at 29% to 33%, making strategic philanthropy tax-efficient.',
    budgeting: 'With monthly net income of $8,000 to $11,000, housing and lifestyle are comfortable across Canada. The biggest financial lever at this level is avoiding lifestyle inflation and maintaining a 30% to 40% savings rate. Mortgage qualification extends to $700,000 to $900,000. Consider working with a fee-only financial planner for comprehensive tax and investment planning. Umbrella insurance ($1-2 million) provides additional liability protection.',
    savings: 'Max out all registered accounts: RRSP ($32,490), TFSA ($7,000), RESP per child ($2,500 for grant). Surplus savings flow into non-registered (taxable) accounts invested in tax-efficient Canadian dividend stocks or index ETFs. Canadian eligible dividends receive a tax credit that reduces the effective tax rate to 25% to 35% depending on province. Consider an Individual Pension Plan (IPP) if you are a business owner, which allows higher contributions than an RRSP. Target annual savings of $60,000+ for financial independence within 10 to 15 years.',
  },
  top: {
    careers: 'Earners at this level include C-suite executives, medical specialists (surgeons, radiologists, anesthesiologists), senior partners at law and consulting firms, tech executives, successful entrepreneurs, and senior finance professionals. Compensation often includes bonuses, stock options, RSUs, and deferred compensation. According to Statistics Canada, the top 5% of earners have income above $200,000. These roles typically require 15+ years of progressive experience and advanced credentials.',
    taxes: 'You are in the 29% or 33% federal marginal bracket (33% applies to income above $220,000). Combined federal and provincial marginal rates range from 44% (Alberta) to 54% (Quebec, Nova Scotia). Every tax optimization matters at this level. Beyond maxing RRSPs, consider: incorporating your practice or business (small business tax rate is 9% federal vs 33% personal), prescribed-rate spousal loans for income splitting (CRA rate currently 4%), charitable donation strategies, and flow-through share investments. The Alternative Minimum Tax (AMT) may apply if you claim significant deductions.',
    budgeting: 'At this income, the focus shifts from meeting expenses to wealth building and asset protection. Work with a CPA who specializes in high-income earners, and a fee-only financial planner. Critical insurance coverage includes disability insurance (protecting your income stream), umbrella liability ($2-5 million), and life insurance if you have dependents. Estate planning with a will, powers of attorney, and possibly a family trust becomes important.',
    savings: 'Max all registered accounts (RRSP, TFSA) and deploy $100,000+ annually into diversified investments. Consider real estate as a portfolio diversifier, leveraging the principal residence capital gains exemption. An IPP or Personal Pension Plan can shelter significantly more than an RRSP. For business owners, the Capital Gains Exemption ($1,016,836 for qualifying small business shares) provides substantial tax-free wealth on exit. With a 40% savings rate, you can accumulate $2 million or more within 10 years.',
  },
};
