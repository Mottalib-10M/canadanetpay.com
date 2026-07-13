export const en = {
  lang: 'en',
  locale: 'en-CA',
  siteName: 'Salary After Tax Canada',
  siteDescription: 'Calculate your take-home pay after tax in Canada',

  // Navigation
  nav: {
    calculators: 'Calculators',
    salaryCalculator: 'Salary Calculator',
    netToGross: 'Net to Gross',
    incomeTax: 'Income Tax Calculator',
    cppCalculator: 'CPP Calculator',
    bonusTax: 'Bonus Tax Calculator',
    hourlyToSalary: 'Hourly to Salary',
    employerCost: 'Employer Cost',
    allCalculators: 'All Calculators',
    salaries: 'Salaries',
    provinces: 'Provinces',
    guides: 'Guides',
    about: 'About',
  },

  // Calculator labels
  calc: {
    yourDetails: 'Your Details',
    annualGross: 'Annual Gross Salary',
    province: 'Province / Territory',
    payFrequency: 'Pay Frequency',
    rrspContribution: 'RRSP Contribution',
    takeHomePay: 'Your Take-Home Pay',
    grossSalary: 'Gross Salary',
    federalTax: 'Federal Income Tax',
    provincialTax: 'Provincial Tax',
    totalDeductions: 'Total Deductions',
    netAnnual: 'Net Annual Salary',
    effectiveRate: 'Effective Tax Rate',
    marginalRate: 'Marginal Tax Rate',
    perYear: '/year',
    perMonth: '/mo',
    perBiWeekly: '/bi-weekly',
    perWeek: '/week',
  },

  // Common
  common: {
    calculate: 'Calculate',
    source: 'Source',
    sources: 'Sources',
    disclaimer: 'Disclaimer: This calculator provides estimates for informational purposes only. Consult a tax professional for personalized advice.',
    updatedFor: 'Updated for tax year 2026',
    faq: 'Frequently Asked Questions',
  },
} as const;

export type Translations = typeof en;
