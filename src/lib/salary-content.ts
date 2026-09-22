/**
 * Dynamic SEO content for salary pages — unique per salary level.
 * All text is driven by the actual calculated values for the given salary.
 */
import type { CalculationResult } from './tax-engine-ca';

// ── formatters (pure, no DOM) ───────────────────────────────────────────────
const fmtC = (v: number): string =>
  '$' + Math.round(v).toLocaleString('en-CA');

const fmtP = (v: number): string => v.toFixed(1) + '%';

// ── Band label ──────────────────────────────────────────────────────────────
type Band = 'entry' | 'median' | 'upper' | 'high' | 'top';

function bandOf(amount: number): Band {
  if (amount < 40000) return 'entry';
  if (amount < 65000) return 'median';
  if (amount < 100000) return 'upper';
  if (amount < 175000) return 'high';
  return 'top';
}

// ── All salary amounts (for inter-salary references) ────────────────────────
const ALL_AMOUNTS = [
  25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000,
  75000, 80000, 85000, 90000, 95000, 100000, 110000, 120000, 130000, 140000,
  150000, 175000, 200000, 250000, 300000,
];

function getAdjacentAmounts(amount: number): { prev: number | null; next: number | null } {
  const idx = ALL_AMOUNTS.indexOf(amount);
  return {
    prev: idx > 0 ? ALL_AMOUNTS[idx - 1] : null,
    next: idx < ALL_AMOUNTS.length - 1 ? ALL_AMOUNTS[idx + 1] : null,
  };
}

// ── Unique career pools per salary amount ───────────────────────────────────

const CAREER_MAP: Record<number, { roles: string[]; progression: string }> = {
  25000: {
    roles: ['part-time retail associates', 'food service crew members', 'seasonal agricultural workers', 'student interns', 'casual warehouse packers'],
    progression: 'Moving from part-time to full-time status at this level typically adds $10,000 to $15,000, pushing you into the $35,000 to $40,000 range within one to two years.',
  },
  30000: {
    roles: ['full-time cashiers', 'junior data entry clerks', 'daycare assistants', 'hotel front-desk agents', 'landscaping crew leads'],
    progression: 'Gaining a certificate or diploma in your field at this salary often leads to a jump to $38,000 to $42,000 within 18 months.',
  },
  35000: {
    roles: ['library assistants', 'junior bookkeepers', 'dental receptionists', 'security guards', 'printing press operators'],
    progression: 'At $35,000 you are approaching the entry threshold for many unionized positions that start at $40,000 with predictable annual step increases.',
  },
  40000: {
    roles: ['licensed practical nurses', 'early-career graphic designers', 'municipal recreation coordinators', 'legal file clerks', 'insurance claims processors'],
    progression: 'A professional certification (e.g., bookkeeping designation or project coordination certificate) commonly triggers a $5,000 to $8,000 raise from this base.',
  },
  45000: {
    roles: ['junior web developers', 'social workers (early career)', 'immigration consultants', 'pharmacy technicians', 'residential building inspectors'],
    progression: 'Two to three years of experience at $45,000 positions you for senior specialist roles paying $55,000 to $60,000 in urban centres.',
  },
  50000: {
    roles: ['intermediate accountants', 'elementary school teachers (Year 3)', 'GIS analysts', 'heavy equipment operators', 'quality assurance technicians'],
    progression: 'Completing a CPA designation or PMP certification from this salary level commonly results in offers between $65,000 and $75,000.',
  },
  55000: {
    roles: ['registered nurses (Year 2)', 'systems administrators', 'marketing specialists', 'Red Seal electricians', 'environmental technologists'],
    progression: 'Specializing in a niche area (ICU nursing, cybersecurity, or industrial automation) at this salary accelerates progression to $70,000 within three years.',
  },
  60000: {
    roles: ['police constables (Year 2)', 'civil engineering technologists', 'high school teachers (mid-scale)', 'logistics coordinators', 'UX designers'],
    progression: 'Promotion to team lead or sergeant from $60,000 typically brings compensation to $72,000 to $80,000 with shift premiums included.',
  },
  65000: {
    roles: ['senior financial analysts', 'occupational therapists', 'fire captains', 'full-stack developers (3+ years)', 'petroleum landmen'],
    progression: 'At $65,000 your next career milestone is typically a management role or senior specialist position in the $80,000 to $90,000 range.',
  },
  70000: {
    roles: ['clinical pharmacists', 'mechanical engineers (P.Eng, 5+ years)', 'Crown prosecutors (early career)', 'senior network engineers', 'optometrists (associate)'],
    progression: 'Professional engineers and pharmacists at $70,000 typically reach $85,000 to $95,000 within four years through seniority and expanded scope.',
  },
  75000: {
    roles: ['chartered professional accountants (CPA, 5 years)', 'school vice-principals', 'senior urban planners', 'geoscientists', 'air traffic controllers (training)'],
    progression: 'From $75,000, achieving a partnership track or principal designation often doubles your income within seven to ten years.',
  },
  80000: {
    roles: ['senior software engineers', 'dental hygienists (full schedule)', 'federal policy advisors (EC-06)', 'petroleum engineers (intermediate)', 'nurse practitioners'],
    progression: 'Senior software engineers at $80,000 moving into cloud architecture or machine learning specializations routinely command $100,000 to $120,000.',
  },
  85000: {
    roles: ['physiotherapy clinic owners', 'senior project managers (PMP)', 'immigration lawyers (Year 3)', 'power systems engineers', 'university lecturers'],
    progression: 'At $85,000 the next salary band requires either people management responsibility or deep technical specialization reaching the $100,000 threshold.',
  },
  90000: {
    roles: ['engineering managers', 'hospital pharmacist managers', 'senior Crown counsel', 'IT directors (mid-size firms)', 'experienced mining geologists'],
    progression: 'Transitioning from $90,000 to six figures often coincides with taking on direct budget or P&L responsibility for a department.',
  },
  95000: {
    roles: ['school principals', 'senior DevOps engineers', 'actuarial analysts (ASA)', 'emergency medicine physicians (locum start)', 'construction project directors'],
    progression: 'At $95,000 you are on the cusp of six-figure territory, with performance bonuses and overtime often pushing total compensation above $100,000.',
  },
  100000: {
    roles: ['senior product managers', 'staff software engineers', 'CPA firm senior managers', 'orthodontists (associate)', 'oil sands operations supervisors'],
    progression: 'Breaking through $100,000 typically requires either a leadership track or rare technical expertise; the next jump to $120,000 often takes three to five years.',
  },
  110000: {
    roles: ['data science team leads', 'corporate tax managers', 'senior dentists (practice owners)', 'court judges (provincial)', 'senior mechanical engineers in aerospace'],
    progression: 'At $110,000 lateral moves between firms can accelerate salary growth faster than internal promotion, with competing offers often 15% to 20% higher.',
  },
  120000: {
    roles: ['VP of marketing (mid-size companies)', 'senior cloud architects', 'family physicians (salaried)', 'patent agents', 'senior geophysicists in energy'],
    progression: 'From $120,000 the path to $150,000 usually involves either executive responsibilities, equity participation, or moving to a higher-cost-of-living market.',
  },
  130000: {
    roles: ['engineering directors', 'hospital department heads', 'corporate M&A lawyers (Year 5)', 'senior actuaries (FSA)', 'university associate professors (tenured)'],
    progression: 'At $130,000 compensation often becomes more complex with RSUs, bonuses, and deferred compensation representing 15% to 25% of total pay.',
  },
  140000: {
    roles: ['general counsel (mid-size firms)', 'staff machine learning engineers', 'interventional radiographers', 'VP of engineering (startup)', 'chief financial officers (small cap)'],
    progression: 'Moving from $140,000 to $175,000+ typically requires C-suite ambitions, partnership buy-in, or founding a practice with an ownership stake.',
  },
  150000: {
    roles: ['psychiatrists (salaried)', 'Big Four partners (junior)', 'VP of product at tech companies', 'chief nursing officers', 'senior petroleum engineers (15+ years)'],
    progression: 'At $150,000 you are in the top 10% of earners, and further salary growth depends heavily on equity compensation, profit-sharing, or building a client book.',
  },
  175000: {
    roles: ['general surgeons (early practice)', 'managing directors at investment banks', 'law firm equity partners (regional)', 'chief technology officers', 'emergency medicine physicians (full-time)'],
    progression: 'From $175,000 the next major jump often comes from a combination of base salary growth and variable compensation totaling $220,000 to $300,000.',
  },
  200000: {
    roles: ['orthopaedic surgeons', 'Bay Street litigation partners', 'CEOs of mid-market companies', 'venture-backed startup CTOs', 'interventional cardiologists'],
    progression: 'At $200,000 total compensation packages frequently include $50,000 to $100,000 in additional bonuses, RSUs, and carried interest.',
  },
  250000: {
    roles: ['neurosurgeons', 'managing partners at national law firms', 'chief investment officers', 'tech company SVPs', 'radiologists (high-volume practices)'],
    progression: 'Earning $250,000 in salary alone places you in the top 2% nationally; further wealth accumulation shifts to equity ownership, real estate, and business exits.',
  },
  300000: {
    roles: ['cardiac surgeons', 'CEOs of publicly traded companies', 'hedge fund portfolio managers', 'senior partners at Magic Circle law firms', 'franchise owners with multiple locations'],
    progression: 'At $300,000 salary income, your annual tax bill exceeds $130,000 and tax-efficient structures (CCPCs, IPPs, family trusts) become essential wealth-building tools.',
  },
};

// ── Band context paragraph ──────────────────────────────────────────────────

export function getBandContext(
  amount: number,
  fmtAmount: string,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): string {
  const b = bandOf(amount);
  const hourly = (amount / 2080).toFixed(2);
  const { prev, next } = getAdjacentAmounts(amount);
  const MEDIAN_SALARY = 60000;
  const ratioToMedian = ((amount / MEDIAN_SALARY) * 100).toFixed(0);
  const dailyNet = (onResult.netAnnual / 260).toFixed(2);
  const weeklyNet = fmtC(onResult.netWeekly);

  // Adjacent salary comparison sentence (unique per amount)
  const adjacentSentence = prev
    ? 'At ' + fmtC(amount) + ', your Ontario net is ' + fmtC(onResult.netMonthly - (onResult.netAnnual - (amount - prev) * (1 - onResult.effectiveTaxRate / 100)) / 12) + ' more per month than at ' + fmtC(prev) + '. '
    : '';

  // Ratio to median sentence
  const medianSentence = 'Your salary is ' + ratioToMedian + '% of the Canadian national median of $60,000. ';

  // Daily net sentence
  const dailySentence = 'That\u2019s $' + dailyNet + ' per working day after CPP, EI, and income tax. ';

  if (b === 'entry') {
    return (
      'A gross salary of ' + fmtAmount + ' places you in the entry-level segment of the Canadian labour market. ' +
      medianSentence +
      dailySentence +
      'At this income your combined effective tax rate in Ontario is approximately ' + fmtP(onResult.effectiveTaxRate) +
      ', meaning you keep about ' + fmtC(onResult.netAnnual) + ' per year after all deductions. ' +
      'Your weekly net pay is ' + weeklyNet + ', deposited as ' + fmtC(onResult.netBiWeekly) + ' on a bi-weekly payroll cycle. ' +
      'In Alberta, the lowest-tax province, you retain ' + fmtC(abResult.netAnnual) +
      ', while in Quebec the higher QPP contributions and provincial rates reduce your take-home to ' + fmtC(qcResult.netAnnual) + '. ' +
      (prev ? 'Compared to earning ' + fmtC(prev) + ', your additional ' + fmtC(amount - prev) + ' of gross salary yields roughly ' + fmtC((onResult.netAnnual - (prev * (1 - onResult.effectiveTaxRate / 100))) / 12) + ' extra monthly net. ' : '') +
      'The federal minimum wage is $17.30 per hour, which translates to approximately $36,000 for full-time work. ' +
      'Provincial minimum wages range from $15.00 in Saskatchewan to $17.40 in British Columbia. ' +
      'At ' + fmtAmount + ' your hourly equivalent is $' + hourly + ' based on a standard 2,080-hour work year. ' +
      'Statistics Canada reports roughly 20% of Canadian workers earn in this range. ' +
      'The Basic Personal Amount of $16,129 shelters a meaningful portion of your income from federal tax, and your province provides an additional personal amount credit.'
    );
  }
  if (b === 'median') {
    const biWeekly = fmtC(onResult.netBiWeekly);
    const cppOnThis = fmtC(Math.min((amount - 3500) * 0.0595, 4034));
    return (
      'With a gross salary of ' + fmtAmount + ', you are near the median Canadian individual income of approximately $40,500 according to Statistics Canada. ' +
      medianSentence +
      dailySentence +
      'Your effective tax rate in Ontario is ' + fmtP(onResult.effectiveTaxRate) +
      ', resulting in annual take-home pay of ' + fmtC(onResult.netAnnual) +
      ' (' + fmtC(onResult.netMonthly) + ' per month or ' + biWeekly + ' bi-weekly). ' +
      (prev ? 'Stepping up from ' + fmtC(prev) + ' to ' + fmtC(amount) + ' adds approximately ' + fmtC((amount - prev) * (1 - onResult.marginalTaxRate / 100) / 12) + ' to your monthly net pay. ' : '') +
      'In Alberta you would keep ' + fmtC(abResult.netAnnual) +
      ' (' + fmtC(abResult.netAnnual - onResult.netAnnual) + ' more than Ontario), while Quebec deductions bring your net to ' + fmtC(qcResult.netAnnual) + '. ' +
      'On ' + fmtAmount + ' specifically, your federal marginal rate is ' + (amount <= 57375 ? '15%' : '20.5%') +
      ' and your CPP contribution of ' + cppOnThis + ' is calculated on ' + fmtC(amount - 3500) + ' of pensionable earnings. ' +
      'At $' + hourly + '/hour, your ' + fmtAmount + ' salary breaks down to ' + fmtC(onResult.netAnnual / 2080) + '/hour after tax in Ontario. ' +
      'Approximately 30% of full-time Canadian workers earn between $40,000 and $65,000, with ' + fmtAmount + ' representing ' + (((amount - 40000) / 25000) * 100).toFixed(0) + '% of the way through this range.'
    );
  }
  if (b === 'upper') {
    const abDiff = fmtC(abResult.netAnnual - onResult.netAnnual);
    return (
      'A ' + fmtAmount + ' salary places you well above the Canadian median and into the experienced professional tier. ' +
      medianSentence +
      dailySentence +
      'In Ontario your effective tax rate is ' + fmtP(onResult.effectiveTaxRate) +
      ', leaving you with ' + fmtC(onResult.netAnnual) + ' per year (' + fmtC(onResult.netMonthly) + ' monthly, ' + fmtC(onResult.netBiWeekly) + ' bi-weekly). ' +
      (prev ? 'The jump from ' + fmtC(prev) + ' to ' + fmtC(amount) + ' increases your Ontario monthly net by approximately ' + fmtC((amount - prev) * (1 - onResult.marginalTaxRate / 100) / 12) + '. ' : '') +
      'Alberta residents at this income keep ' + fmtC(abResult.netAnnual) +
      ', a difference of ' + abDiff + ' compared to Ontario. ' +
      'Quebec residents take home ' + fmtC(qcResult.netAnnual) + ' due to the higher QPP rate (6.4%) and provincial tax brackets reaching 19% above $53,255. ' +
      'Your hourly equivalent is $' + hourly + '. ' +
      'At this level you have likely reached the CPP maximum contribution of $4,034. ' +
      'RRSP contributions are your most powerful tax-reduction tool, with each dollar contributed saving ' + Math.round(onResult.marginalTaxRate) + ' cents in combined federal and provincial taxes. ' +
      'About 15% to 20% of Canadian workers earn in this bracket.'
    );
  }
  if (b === 'high') {
    return (
      'At ' + fmtAmount + ', you are in the high-income tier, above the 90th percentile of Canadian earners. ' +
      medianSentence +
      dailySentence +
      'Your Ontario effective tax rate of ' + fmtP(onResult.effectiveTaxRate) +
      ' means total annual deductions of ' + fmtC(onResult.grossAnnual - onResult.netAnnual) +
      ', leaving take-home pay of ' + fmtC(onResult.netAnnual) + ' (' + fmtC(onResult.netMonthly) + ' monthly). ' +
      (prev ? 'Compared to ' + fmtC(prev) + ', your extra ' + fmtC(amount - prev) + ' in gross income adds ' + fmtC((amount - prev) * (1 - onResult.marginalTaxRate / 100) / 12) + ' per month after tax in Ontario. ' : '') +
      'In Alberta the effective rate drops to ' + fmtP(abResult.effectiveTaxRate) +
      ' for a net of ' + fmtC(abResult.netAnnual) +
      ', while Quebec has the highest burden at ' + fmtP(qcResult.effectiveTaxRate) +
      ' (' + fmtC(qcResult.netAnnual) + ' net). ' +
      'Your federal marginal bracket is ' + (amount < 158468 ? '26%' : '29%') +
      ' and combined federal-provincial marginal rates range from about 38% in Alberta to over 50% in Quebec and Nova Scotia. ' +
      'Tax-efficient compensation strategies become critical at this level. ' +
      'Your hourly equivalent is $' + hourly + ' and you earn ' + fmtC(amount / 12) + ' per month before tax.'
    );
  }
  // top
  return (
    'A ' + fmtAmount + ' salary is in the top 5% of Canadian earners according to Statistics Canada. ' +
    medianSentence +
    dailySentence +
    'Your Ontario effective tax rate of ' + fmtP(onResult.effectiveTaxRate) +
    ' results in total annual deductions of ' + fmtC(onResult.grossAnnual - onResult.netAnnual) +
    ', leaving net take-home pay of ' + fmtC(onResult.netAnnual) + ' (' + fmtC(onResult.netMonthly) + ' monthly, ' + fmtC(onResult.netBiWeekly) + ' bi-weekly). ' +
    (prev ? 'The increase from ' + fmtC(prev) + ' to ' + fmtC(amount) + ' yields only ' + fmtC((amount - prev) * (1 - onResult.marginalTaxRate / 100) / 12) + ' additional monthly net due to your ' + fmtP(onResult.marginalTaxRate) + ' marginal rate. ' : '') +
    'In Alberta the effective rate is ' + fmtP(abResult.effectiveTaxRate) +
    ' for a net of ' + fmtC(abResult.netAnnual) +
    ', saving you ' + fmtC(abResult.netAnnual - onResult.netAnnual) + ' per year compared to Ontario. ' +
    'Quebec has the highest total burden at ' + fmtP(qcResult.effectiveTaxRate) +
    ' (' + fmtC(qcResult.netAnnual) + ' net). ' +
    'Your federal marginal bracket is ' + (amount < 220000 ? '29%' : '33%') +
    ' and combined marginal rates reach 44% in Alberta and up to 54% in Quebec and Nova Scotia. ' +
    'Every tax optimisation matters: maximising RRSP contributions, structuring compensation through a CCPC if applicable, ' +
    'and using prescribed-rate spousal loans for income splitting are all strategies worth exploring with a qualified tax advisor.'
  );
}

// ── Typical careers (UNIQUE per salary amount) ──────────────────────────────

export function getCareers(amount: number, fmtAmount: string): string {
  const careerData = CAREER_MAP[amount];

  if (careerData) {
    const roleList = careerData.roles.join(', ');
    const amtK = Math.round(amount / 1000);
    const hourlyGross = (amount / 2080).toFixed(2);
    return (
      'At ' + fmtAmount + ' ($' + amtK + 'k), typical Canadian occupations include ' + roleList + '. ' +
      careerData.progression + ' ' +
      'In major markets (Toronto, Vancouver, Calgary), roles paying ' + fmtAmount + ' nationally may offer $' + Math.round(amtK * 1.15) + 'k to $' + Math.round(amtK * 1.2) + 'k locally to offset higher living costs. ' +
      'The $' + hourlyGross + '/hour gross rate for ' + fmtAmount + ' positions reflects ' + (amount < 50000 ? 'entry-to-mid' : amount < 80000 ? 'mid-career' : 'senior-level') + ' experience expectations in the Canadian labour market.'
    );
  }

  // Fallback for any amount not in the map (shouldn't happen with current data)
  const b = bandOf(amount);
  if (b === 'entry') {
    return 'This income range is common for entry-level and part-time positions across Canada, with roles including retail, food service, and junior administrative staff earning near ' + fmtAmount + '.';
  }
  if (b === 'median') {
    return 'This salary range is near the Canadian median, with occupations such as teachers, nurses, tradespeople, and government workers commonly earning ' + fmtAmount + '.';
  }
  if (b === 'upper') {
    return 'Professionals earning ' + fmtAmount + ' are in the experienced specialist tier, including senior developers, pharmacists, and management roles.';
  }
  if (b === 'high') {
    return 'Earners at ' + fmtAmount + ' include directors, senior physicians, corporate lawyers, and senior engineers with 10+ years of experience.';
  }
  return 'Earners at ' + fmtAmount + ' are in the top 5% and include C-suite executives, medical specialists, and senior partners at professional firms.';
}

// ── FAQ builder (6 questions with inter-salary comparisons) ─────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqs(
  fmtAmount: string,
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): FaqItem[] {
  const hourly = (amount / 2080).toFixed(2);
  const monthly = fmtC(amount / 12);
  const { prev, next } = getAdjacentAmounts(amount);

  // Inter-salary comparison sentence for FAQ answers
  const raiseSentence = next
    ? 'A ' + fmtC(next - amount) + ' raise from ' + fmtC(amount) + ' to ' + fmtC(next) + ' increases your monthly net by approximately ' + fmtC((next - amount) * (1 - onResult.marginalTaxRate / 100) / 12) + ' in Ontario. '
    : '';

  const prevSentence = prev
    ? 'Compared to ' + fmtC(prev) + ', you take home an additional ' + fmtC((amount - prev) * (1 - onResult.marginalTaxRate / 100) / 12) + ' per month at this salary. '
    : '';

  // Provincial comparison unique to this amount
  const provArbitrage = 'At exactly ' + fmtAmount + ', living in Alberta instead of Ontario saves you ' + fmtC(abResult.netAnnual - onResult.netAnnual) + ' per year, while Quebec costs you an extra ' + fmtC(onResult.netAnnual - qcResult.netAnnual) + ' annually in higher taxes and contributions. ';

  const amtK = Math.round(amount / 1000);
  const rrspRoom = Math.min(Math.round(amount * 0.18), 32490);
  const rrspSaving = Math.round(rrspRoom * onResult.marginalTaxRate / 100);
  const fhsaSaving = Math.round(8000 * onResult.marginalTaxRate / 100);
  const dailyNet = (onResult.netAnnual / 260).toFixed(2);

  return [
    {
      question: 'How much is ' + fmtAmount + ' a year after taxes in Canada?',
      answer:
        'On a ' + fmtAmount + ' ($' + amtK + 'k) salary, your take-home varies by province. ' +
        'Alberta: ' + fmtC(abResult.netAnnual) + '/year net (effective rate ' + fmtP(abResult.effectiveTaxRate) + ', keeping ' + fmtC(abResult.netMonthly) + '/month). ' +
        'Ontario: ' + fmtC(onResult.netAnnual) + '/year net (effective rate ' + fmtP(onResult.effectiveTaxRate) + ', keeping ' + fmtC(onResult.netMonthly) + '/month). ' +
        'Quebec: ' + fmtC(qcResult.netAnnual) + '/year net (effective rate ' + fmtP(qcResult.effectiveTaxRate) + ', keeping ' + fmtC(qcResult.netMonthly) + '/month). ' +
        provArbitrage +
        raiseSentence,
    },
    {
      question: 'What is ' + fmtAmount + ' a year per month after tax in Canada?',
      answer:
        'Your ' + fmtAmount + ' annual salary equals ' + monthly + ' gross per month. ' +
        'After all deductions on ' + fmtAmount + ', monthly net ranges from ' + fmtC(qcResult.netMonthly) + ' (Quebec) to ' + fmtC(abResult.netMonthly) + ' (Alberta). ' +
        'In Ontario, ' + fmtAmount + ' produces ' + fmtC(onResult.netMonthly) + '/month net (' + fmtC(onResult.netBiWeekly) + ' bi-weekly, or $' + dailyNet + ' per working day). ' +
        'Your ' + fmtAmount + ' paycheck includes deductions for federal tax (' + fmtC(Math.round(onResult.federalIncomeTax / 12)) + '/month), provincial tax (' + fmtC(Math.round(onResult.provincialTax / 12)) + '/month), and CPP+EI (' + fmtC(Math.round((onResult.cpp + onResult.cpp2 + onResult.ei) / 12)) + '/month). ' +
        prevSentence,
    },
    {
      question: 'What is ' + fmtAmount + ' a year per hour in Canada?',
      answer:
        'A ' + fmtAmount + ' salary equals $' + hourly + '/hour gross (2,080 hours/year at 40 hours/week). ' +
        'After Ontario taxes on ' + fmtAmount + ', your effective hourly rate drops to $' + (onResult.netAnnual / 2080).toFixed(2) + '/hour. ' +
        'In Alberta, ' + fmtAmount + ' nets $' + (abResult.netAnnual / 2080).toFixed(2) + '/hour after tax. ' +
        'The tax system reduces your ' + fmtAmount + ' hourly rate by ' + ((1 - onResult.netAnnual / amount) * 100).toFixed(1) + '% in Ontario, meaning you work ' + ((onResult.effectiveTaxRate / 100) * 8).toFixed(1) + ' hours of each 8-hour day just to cover taxes. ' +
        (next ? 'Moving to ' + fmtC(next) + ' raises your gross hourly to $' + (next / 2080).toFixed(2) + ' ($' + ((next - amount) / 2080).toFixed(2) + ' more per hour). ' : '') +
        (prev ? 'Your ' + fmtAmount + ' rate is $' + ((amount - prev) / 2080).toFixed(2) + '/hour more than at ' + fmtC(prev) + '.' : ''),
    },
    {
      question: 'Is ' + fmtAmount + ' a good salary in Canada in 2026?',
      answer:
        amount >= 100000
          ? fmtAmount + ' places you in the top ' + (amount >= 200000 ? '5%' : amount >= 150000 ? '8%' : '15%') + ' of Canadian earners, well above the $40,500 median. ' +
            'Your ' + fmtAmount + ' after-tax income of ' + fmtC(onResult.netMonthly) + '/month in Ontario comfortably supports homeownership in most markets. ' +
            'At ' + fmtAmount + ', the Alberta-Ontario spread of ' + fmtC(abResult.netAnnual - onResult.netAnnual) + '/year means province choice significantly impacts your lifestyle. ' +
            provArbitrage
          : amount >= 60000
            ? fmtAmount + ' exceeds the $40,500 national median by ' + fmtC(amount - 40500) + ' (' + Math.round((amount / 40500 - 1) * 100) + '% above). ' +
              'Your ' + fmtAmount + ' net of ' + fmtC(onResult.netMonthly) + '/month in Ontario covers core expenses and allows savings of approximately ' + fmtC(Math.round(onResult.netMonthly * 0.15)) + '/month (15% target). ' +
              'In lower-cost cities (Winnipeg, Halifax, Edmonton), ' + fmtAmount + ' provides considerable financial comfort. ' +
              raiseSentence
            : fmtAmount + ' is ' + fmtC(40500 - amount) + ' ' + (amount >= 40000 ? 'near' : 'below') + ' the $40,500 national median. ' +
              'On ' + fmtAmount + ', your Ontario net of ' + fmtC(onResult.netMonthly) + '/month ' + (onResult.netMonthly < 2800 ? 'makes major cities challenging without shared housing' : 'covers basics in mid-cost cities') + '. ' +
              'At ' + fmtAmount + ', government benefits like the GST/HST credit (up to $519/year) and Canada Workers Benefit (up to $1,518) supplement your income. ' +
              raiseSentence,
    },
    {
      question: 'What federal tax do I pay on ' + fmtAmount + ' in Canada?',
      answer:
        'Federal income tax on ' + fmtAmount + ' totals approximately ' + fmtC(onResult.federalIncomeTax) + ' after credits (BPA: ' + fmtC(Math.round(16129 * 0.15)) + ', CPP: ' + fmtC(Math.round(onResult.cpp * 0.15)) + ', EI: ' + fmtC(Math.round(onResult.ei * 0.15)) + '). ' +
        (amount <= 57375
          ? 'Your ' + fmtAmount + ' taxable income sits entirely in the 15% first bracket (up to $57,375), with ' + fmtC(57375 - amount) + ' of room before hitting the 20.5% bracket.'
          : amount <= 114750
            ? 'On ' + fmtAmount + ', the first $57,375 is taxed at 15% and the remaining ' + fmtC(amount - 57375) + ' at 20.5%.'
            : amount <= 158468
              ? 'Your ' + fmtAmount + ' spans three brackets: 15% on $57,375, 20.5% on $57,375 to $114,750, and 26% on the ' + fmtC(amount - 114750) + ' above $114,750.'
              : amount <= 220000
                ? 'On ' + fmtAmount + ', you span four brackets up to 29% on the ' + fmtC(amount - 158468) + ' above $158,468.'
                : 'Your ' + fmtAmount + ' hits all five brackets, with 33% on the ' + fmtC(amount - 220000) + ' above $220,000.') +
        ' For a Quebec resident earning ' + fmtAmount + ', the 16.5% abatement reduces federal tax by approximately ' + fmtC(Math.round(onResult.federalIncomeTax * 0.165)) + '. ' +
        'Your ' + fmtAmount + ' combined marginal rate (federal + Ontario) is ' + fmtP(onResult.marginalTaxRate) + '. ' +
        (next ? 'At ' + fmtC(next) + ', federal tax rises by approximately ' + fmtC(Math.round((next - amount) * (amount < 57375 ? 0.15 : amount < 114750 ? 0.205 : amount < 158468 ? 0.26 : amount < 220000 ? 0.29 : 0.33))) + '.' : ''),
    },
    {
      question: 'How can I reduce my taxes on a ' + fmtAmount + ' salary in Canada?',
      answer:
        'On ' + fmtAmount + ', the RRSP is the largest single lever: ' + fmtC(rrspRoom) + ' of room saves ' +
        fmtC(rrspSaving) + ' at your ' + fmtP(onResult.marginalTaxRate) + ' marginal rate, because a contribution reduces taxable income dollar for dollar. ' +
        'A first-time buyer can add the FHSA deduction of $8,000, worth a further ' + fmtC(fhsaSaving) + '. ' +
        'Child care costs, union dues and professional fees are deductible too, and a spousal RRSP shifts income to a lower-rate partner for later withdrawal.',
    },
  ];
}

// ── Progression context (raise simulation, province arbitrage, RRSP impact) ─

export interface ProgressionInsight {
  raiseSimulation: string;
  provinceArbitrage: string;
  rrspImpact: string;
}

export function getProgressionContext(
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): ProgressionInsight {
  const { prev, next } = getAdjacentAmounts(amount);
  const marginalRate = onResult.marginalTaxRate;
  const rrspRoom = Math.min(Math.round(amount * 0.18), 32490);
  const rrspSavings = Math.round(rrspRoom * marginalRate / 100);
  const fiveKRaiseNet = Math.round(5000 * (1 - marginalRate / 100));
  const tenKRaiseNet = Math.round(10000 * (1 - marginalRate / 100));
  const amtK = Math.round(amount / 1000);

  const raiseSimulation =
    'Starting from ' + fmtC(amount) + ' ($' + amtK + 'k), your Ontario combined marginal rate of ' + fmtP(marginalRate) + ' determines how much of any raise you keep. ' +
    'Adding $5,000 to your ' + fmtC(amount) + ' base pushes gross to ' + fmtC(amount + 5000) + ' and nets you an extra ' + fmtC(fiveKRaiseNet) + ' per year (' + fmtC(Math.round(fiveKRaiseNet / 12)) + ' monthly). ' +
    'A $10,000 raise from ' + fmtC(amount) + ' to ' + fmtC(amount + 10000) + ' yields ' + fmtC(tenKRaiseNet) + ' additional annual net (' + fmtC(Math.round(tenKRaiseNet / 12)) + '/month, or ' + fmtC(Math.round(tenKRaiseNet / 26)) + ' per bi-weekly pay). ' +
    (next
      ? 'Reaching the next benchmark of ' + fmtC(next) + ' from your current ' + fmtC(amount) + ' means an additional ' + fmtC(next - amount) + ' gross, translating to ' + fmtC(Math.round((next - amount) * (1 - marginalRate / 100))) + ' more net annually (' + fmtC(Math.round((next - amount) * (1 - marginalRate / 100) / 12)) + '/month). '
      : '') +
    (prev
      ? 'Looking back, your step up from ' + fmtC(prev) + ' to ' + fmtC(amount) + ' already added ' + fmtC(Math.round((amount - prev) * (1 - marginalRate / 100))) + ' to your annual net. '
      : '') +
    'Canada\u2019s progressive system means only the dollars above each threshold face the higher rate\u2014your existing income at ' + fmtC(amount) + ' is never retroactively taxed more.';

  const abSavings = abResult.netAnnual - onResult.netAnnual;
  const qcCost = onResult.netAnnual - qcResult.netAnnual;
  const abMonthly = Math.round(abSavings / 12);
  const qcMonthly = Math.round(qcCost / 12);
  const provinceArbitrage =
    'At ' + fmtC(amount) + ', an Ontario-to-Alberta move increases take-home by ' + fmtC(abSavings) + '/year (' + fmtC(abMonthly) + '/month), equivalent to a ' + fmtC(Math.round(abSavings / (1 - marginalRate / 100))) + ' pre-tax raise without changing jobs. ' +
    'Moving from Ontario to Quebec at this same ' + fmtC(amount) + ' salary costs ' + fmtC(qcCost) + ' annually (' + fmtC(qcMonthly) + '/month) due to higher QPP, QPIP, and provincial rates. ' +
    'Over 5 years at ' + fmtC(amount) + ', the Alberta advantage accumulates to ' + fmtC(abSavings * 5) + ' in additional take-home (before investment returns). ' +
    'Alberta\u2019s flat 10% rate means your ' + fmtC(amount) + ' salary faces a provincial tax of just ' + fmtC(abResult.provincialTax) + ', compared to ' + fmtC(onResult.provincialTax) + ' in Ontario and ' + fmtC(qcResult.provincialTax) + ' in Quebec. ' +
    'Additionally, Alberta\u2019s 0% provincial sales tax saves roughly ' + fmtC(Math.round(onResult.netAnnual * 0.5 * 0.08)) + ' per year on taxable purchases compared to Ontario\u2019s 8% provincial portion of HST.';

  const rrspImpact =
    'On your ' + fmtC(amount) + ' income, RRSP room is ' + fmtC(rrspRoom) + ' and contributing it all generates a ' + fmtC(rrspSavings) + ' refund at your ' + fmtP(marginalRate) + ' marginal rate. ' +
    'This effectively reduces your tax bill from ' + fmtC(onResult.grossAnnual - onResult.netAnnual) + ' to approximately ' + fmtC(onResult.grossAnnual - onResult.netAnnual - rrspSavings) + ' on your ' + fmtC(amount) + ' gross. ' +
    'Reinvesting that ' + fmtC(rrspSavings) + ' refund (e.g., into your TFSA) boosts your effective savings rate beyond the initial contribution. ' +
    'A $' + Math.round(rrspRoom / 12) + '/month RRSP contribution from your ' + fmtC(amount) + ' salary shelters ' + fmtC(rrspRoom) + ' annually, growing to approximately ' + fmtC(Math.round(rrspRoom * 14.78)) + ' after 10 years at 7% average returns. ' +
    'The after-contribution taxable income of ' + fmtC(amount - rrspRoom) + ' drops your effective rate from ' + fmtP(onResult.effectiveTaxRate) + ' to approximately ' + fmtP(Math.max(0, onResult.effectiveTaxRate - (rrspSavings / amount * 100))) + '. ' +
    'At ' + fmtC(amount) + ' specifically, maxing your RRSP is the single largest tax reduction available, saving more than any other deduction.';

  return { raiseSimulation, provinceArbitrage, rrspImpact };
}

// ── Salary-specific educational content ─────────────────────────────────────

export interface EducationalContent {
  federalBrackets: string;
  federalCalculation: string;
  provincialTax: string;
  cppEi: string;
  tfsaSection: string;
  rrspSection: string;
  fhsaSection: string;
  budgetIntro: string;
}

export function getEducationalContent(
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): EducationalContent {
  const fmtAmount = fmtC(amount);
  const rrspRoom = Math.min(Math.round(amount * 0.18), 32490);
  const marginalRate = onResult.marginalTaxRate;
  const hourly = (amount / 2080).toFixed(2);
  const { prev, next } = getAdjacentAmounts(amount);

  // Determine which brackets this salary spans
  const bracketCount = amount <= 57375 ? 1 : amount <= 114750 ? 2 : amount <= 158468 ? 3 : amount <= 220000 ? 4 : 5;

  const roomToNextBracket = amount <= 57375 ? 57375 - amount : amount <= 114750 ? 114750 - amount : amount <= 158468 ? 158468 - amount : amount <= 220000 ? 220000 - amount : 0;
  const nextBracketRate = amount <= 57375 ? '20.5%' : amount <= 114750 ? '26%' : amount <= 158468 ? '29%' : amount <= 220000 ? '33%' : '33%';

  const federalBrackets =
    'On ' + fmtAmount + ', Canada\u2019s progressive system taxes your income through ' + bracketCount + ' federal bracket' + (bracketCount > 1 ? 's' : '') + '. ' +
    (bracketCount === 1
      ? fmtAmount + ' sits entirely in the 15% first bracket, with ' + fmtC(roomToNextBracket) + ' of headroom before the 20.5% bracket begins at $57,375. At ' + fmtAmount + ', your federal marginal rate is 15%\u2014the lowest possible. '
      : bracketCount === 2
        ? 'On ' + fmtAmount + ': 15% applies to the first $57,375 (' + fmtC(Math.round(57375 * 0.15)) + ' tax) and 20.5% on the remaining ' + fmtC(amount - 57375) + ' (' + fmtC(Math.round((amount - 57375) * 0.205)) + ' tax). You have ' + fmtC(roomToNextBracket) + ' before reaching the 26% bracket. '
        : bracketCount === 3
          ? fmtAmount + ' spans three brackets: 15% on $57,375, 20.5% on $57,375, and 26% on the ' + fmtC(amount - 114750) + ' above $114,750. The 26% bracket applies to ' + ((amount - 114750) / amount * 100).toFixed(1) + '% of your income. '
          : bracketCount === 4
            ? 'On ' + fmtAmount + ': brackets of 15%, 20.5%, 26%, and 29% apply, with the 29% rate hitting the ' + fmtC(amount - 158468) + ' above $158,468 (' + ((amount - 158468) / amount * 100).toFixed(1) + '% of your salary). '
            : fmtAmount + ' reaches all five brackets. The 33% top rate applies to ' + fmtC(amount - 220000) + ' (' + ((amount - 220000) / amount * 100).toFixed(1) + '% of income), producing ' + fmtC(Math.round((amount - 220000) * 0.33)) + ' in top-bracket tax alone. ') +
    'The $16,129 Basic Personal Amount credit (' + fmtC(Math.round(16129 * 0.15)) + ' at 15%) shelters early income from tax on your ' + fmtAmount + ' salary. ' +
    (amount > 177882
      ? 'At ' + fmtAmount + ', your BPA is partially clawed back since income exceeds $177,882. '
      : 'Your ' + fmtAmount + ' income qualifies for the full BPA\u2014no clawback applies below $177,882. ') +
    'RRSP planning: sheltering $5,000 from your ' + fmtAmount + ' income saves ' + fmtC(Math.round(5000 * marginalRate / 100)) + ' in combined tax; the full ' + fmtC(rrspRoom) + ' RRSP room saves ' + fmtC(Math.round(rrspRoom * marginalRate / 100)) + '.';

  const grossTaxBeforeCredits = onResult.federalIncomeTax + Math.round(16129 * 0.15) + Math.round((onResult.cpp + onResult.cpp2) * 0.15) + Math.round(onResult.ei * 0.15);
  const totalCredits = Math.round(16129 * 0.15) + Math.round((onResult.cpp + onResult.cpp2) * 0.15) + Math.round(onResult.ei * 0.15);
  const fedEffRate = (onResult.federalIncomeTax / amount * 100).toFixed(1);

  const federalCalculation =
    'Calculating federal tax on ' + fmtAmount + ': with no RRSP deduction, the full ' + fmtAmount + ' is taxable. ' +
    'Gross federal tax on ' + fmtAmount + ' (before credits) is approximately ' + fmtC(grossTaxBeforeCredits) + '. ' +
    'Credits reduce this by ' + fmtC(totalCredits) + ' (BPA: ' + fmtC(Math.round(16129 * 0.15)) + ' + CPP: ' + fmtC(Math.round((onResult.cpp + onResult.cpp2) * 0.15)) + ' + EI: ' + fmtC(Math.round(onResult.ei * 0.15)) + '), leaving net federal tax of ' + fmtC(onResult.federalIncomeTax) + ' on ' + fmtAmount + '. ' +
    'That ' + fmtC(onResult.federalIncomeTax) + ' represents a ' + fedEffRate + '% effective federal rate on your ' + fmtAmount + ' gross. ' +
    'If you contributed ' + fmtC(rrspRoom) + ' to your RRSP, taxable income drops to ' + fmtC(amount - rrspRoom) + ' and federal tax falls by approximately ' + fmtC(Math.round(rrspRoom * (amount < 57375 ? 0.15 : amount < 114750 ? 0.205 : 0.26))) + '. ' +
    (next ? 'Earning ' + fmtC(next) + ' instead of ' + fmtAmount + ' adds approximately ' + fmtC(Math.round((next - amount) * (amount < 57375 ? 0.15 : amount < 114750 ? 0.205 : amount < 158468 ? 0.26 : amount < 220000 ? 0.29 : 0.33))) + ' in federal tax on the extra ' + fmtC(next - amount) + '. ' : '');

  const onProvPct = (onResult.provincialTax / amount * 100).toFixed(1);
  const abProvPct = (abResult.provincialTax / amount * 100).toFixed(1);
  const qcProvPct = (qcResult.provincialTax / amount * 100).toFixed(1);
  const provDiff = qcResult.provincialTax - abResult.provincialTax;

  const provincialTax =
    'On ' + fmtAmount + ', provincial income tax in Ontario totals ' + fmtC(onResult.provincialTax) + ' (' + onProvPct + '% of gross), calculated across ' +
    (amount <= 51446 ? 'the first bracket at 5.05%' : amount <= 102894 ? 'two brackets (5.05% and 9.15%)' : amount <= 150000 ? 'three brackets (5.05%, 9.15%, and 11.16%)' : amount <= 220000 ? 'four brackets (5.05%, 9.15%, 11.16%, and 12.16%)' : 'all five brackets up to 13.16%') + '. ' +
    (onResult.ontarioHealthPremium > 0 ? 'Ontario\u2019s Health Premium adds another ' + fmtC(onResult.ontarioHealthPremium) + ' to your ' + fmtAmount + ' tax bill. ' : '') +
    'Alberta charges ' + fmtC(abResult.provincialTax) + ' (' + abProvPct + '% of your ' + fmtAmount + ' gross) under its flat 10% structure\u2014saving you ' + fmtC(onResult.provincialTax - abResult.provincialTax) + ' versus Ontario. ' +
    'Quebec\u2019s progressive brackets produce ' + fmtC(qcResult.provincialTax) + ' (' + qcProvPct + '%) on ' + fmtAmount + ', though the 16.5% federal abatement partially offsets this. ' +
    'The Alberta-to-Quebec provincial tax gap on your specific ' + fmtAmount + ' salary is ' + fmtC(provDiff) + '/year (' + fmtC(Math.round(provDiff / 12)) + '/month)\u2014equivalent to a ' + fmtC(Math.round(provDiff / (1 - marginalRate / 100))) + ' pre-tax raise. ' +
    'British Columbia would charge approximately ' + fmtP(amount <= 47937 ? 5.06 : amount <= 95875 ? 7.7 : amount <= 110076 ? 10.5 : 12.29) + ' effective provincial rate on ' + fmtAmount + ', while Manitoba\u2019s system (10.8% to 17.4%) falls between Ontario and Quebec.';

  const cppContrib = onResult.cpp;
  const cpp2Contrib = onResult.cpp2;
  const eiContrib = onResult.ei;
  const totalPayroll = cppContrib + cpp2Contrib + eiContrib;
  const cppPensionableEarnings = Math.min(amount, 71300) - 3500;
  const reachedCppMax = amount >= 71300;
  const reachedCpp2 = amount >= 79400;
  const reachedEiMax = amount >= 65700;

  const payrollPctOfGross = ((totalPayroll / amount) * 100).toFixed(1);
  const qpipEstimate = Math.min(amount, 98000) * 0.00494;

  const cppEi =
    'Your ' + fmtAmount + ' salary generates payroll deductions of ' + fmtC(totalPayroll) + ' annually (' + payrollPctOfGross + '% of gross, or ' + fmtC(Math.round(totalPayroll / 12)) + '/month). ' +
    (reachedCppMax
      ? 'At ' + fmtAmount + ', you exceed the $71,300 CPP ceiling so your contribution is capped at the $4,034 maximum\u2014no additional CPP is owed on the ' + fmtC(amount - 71300) + ' above the ceiling. '
      : 'CPP on ' + fmtAmount + ': 5.95% applied to ' + fmtC(cppPensionableEarnings) + ' of pensionable earnings (' + fmtAmount + ' minus the $3,500 basic exemption) equals ' + fmtC(cppContrib) + '. ') +
    (reachedCpp2
      ? 'CPP2 on ' + fmtAmount + ': the maximum $324 contribution applies since your salary exceeds the $79,400 second ceiling. '
      : cpp2Contrib > 0
        ? 'CPP2 adds ' + fmtC(cpp2Contrib) + ' (4% on the ' + fmtC(amount - 71300) + ' between $71,300 and your ' + fmtAmount + ' salary). '
        : 'At ' + fmtAmount + ', CPP2 does not yet apply\u2014it only activates on earnings above the $71,300 first ceiling. ') +
    (reachedEiMax
      ? 'EI on ' + fmtAmount + ': capped at $1,049 since your salary exceeds the $65,700 insurable earnings maximum. '
      : 'EI on ' + fmtAmount + ': ' + fmtC(eiContrib) + ' (1.58% of your full ' + fmtAmount + ' salary, which is below the $65,700 maximum). ') +
    'A Quebec resident earning ' + fmtAmount + ' would pay QPP at 6.4% plus QPIP of approximately ' + fmtC(Math.round(qpipEstimate)) + ', offset by the lower 1.248% EI rate. ' +
    'On ' + fmtAmount + ', these mandatory deductions reduce your federal tax through credits: CPP credit of ' + fmtC(Math.round((cppContrib + cpp2Contrib) * 0.15)) + ' plus EI credit of ' + fmtC(Math.round(eiContrib * 0.15)) + ' (both at the 15% credit rate), saving you ' + fmtC(Math.round((cppContrib + cpp2Contrib + eiContrib) * 0.15)) + ' total.';

  const tfsaGrowth7yr = Math.round(7000 * 9.49); // 7% for 7 years future value of annuity
  const tfsaGrowth10yr = Math.round(7000 * 14.78); // 7% for 10 years
  const tfsaMonthly = Math.round(7000 / 12);
  const tfsaPctOfNet = ((7000 / onResult.netAnnual) * 100).toFixed(1);
  const tfsaTaxSaved5yr = Math.round(7000 * 0.07 * marginalRate / 100 * 5);

  const tfsaSection =
    'On your ' + fmtAmount + ' salary (Ontario net: ' + fmtC(onResult.netAnnual) + '), a full $7,000 TFSA contribution is ' + tfsaPctOfNet + '% of after-tax income, or ' + fmtC(tfsaMonthly) + ' per month set aside from your ' + fmtC(onResult.netMonthly) + ' monthly net. ' +
    'Inside the TFSA, all investment gains on this ' + fmtAmount + ' earner\u2019s savings grow completely tax-free\u2014capital gains, dividends, and interest are never taxed on withdrawal. ' +
    'For someone at your ' + fmtP(marginalRate) + ' marginal rate earning ' + fmtAmount + ', each $1,000 of investment income sheltered in a TFSA rather than a taxable account saves ' + fmtC(Math.round(1000 * marginalRate / 100)) + ' in tax\u2014that\u2019s ' + fmtC(tfsaTaxSaved5yr) + ' in avoided tax over 5 years on a 7% return. ' +
    'At 7% average returns, your $7,000 annual TFSA contribution from a ' + fmtAmount + ' salary grows to ' + fmtC(tfsaGrowth7yr) + ' in 7 years or ' + fmtC(tfsaGrowth10yr) + ' in 10 years\u2014all withdrawable tax-free. ' +
    'With cumulative room of up to $102,000 (if unused since 2009), a ' + fmtAmount + ' earner can shelter substantial wealth from the ' + fmtP(marginalRate) + ' marginal rate. ' +
    'After filling your RRSP (' + fmtC(rrspRoom) + ' room on ' + fmtAmount + '), the TFSA is your next priority for tax-efficient wealth building.';

  const rrspRefund = Math.round(rrspRoom * marginalRate / 100);
  const rrsp1kSaving = Math.round(1000 * marginalRate / 100);
  const rrspMonthly = Math.round(rrspRoom / 12);
  const rrspGrowth10yr = Math.round(rrspRoom * 14.78);
  const rrspNetCost = rrspRoom - rrspRefund;

  const rrspSection =
    'At ' + fmtAmount + ', your RRSP contribution limit is ' + fmtC(rrspRoom) + ' per year (18% of ' + fmtAmount + ', subject to the $32,490 cap). ' +
    'Contributing ' + fmtC(rrspRoom) + ' from your ' + fmtAmount + ' salary (' + fmtC(rrspMonthly) + '/month) reduces taxable income to ' + fmtC(amount - rrspRoom) + ' and triggers a tax refund of ' + fmtC(rrspRefund) + '. ' +
    'The net out-of-pocket cost is only ' + fmtC(rrspNetCost) + ' after the refund, meaning you shelter ' + fmtC(rrspRoom) + ' for an actual cost of ' + fmtC(rrspNetCost) + '. ' +
    'Each $1,000 RRSP contribution on your ' + fmtAmount + ' income saves ' + fmtC(rrsp1kSaving) + ' at your ' + fmtP(marginalRate) + ' marginal rate. ' +
    'Channelling the ' + fmtC(rrspRefund) + ' refund into your TFSA shelters a combined ' + fmtC(rrspRoom + rrspRefund) + ' from taxation annually. ' +
    'Your ' + fmtC(rrspRoom) + ' annual contribution at 7% returns compounds to ' + fmtC(rrspGrowth10yr) + ' over 10 years inside the tax-deferred account. ' +
    'Since RRSP withdrawals are taxed as income, this works best if your retirement income will be below your current ' + fmtAmount + '\u2014common if your mortgage is paid off and CPP/OAS cover basic needs.';

  const fhsaSaving = Math.round(8000 * marginalRate / 100);
  const fhsaPctOfNet = ((8000 / onResult.netAnnual) * 100).toFixed(1);
  const fhsaNetCost = 8000 - fhsaSaving;
  const fhsa5yrGrowth = Math.round(8000 * 5.75);
  const fhsa5yrTaxSaved = fhsaSaving * 5;

  const fhsaSection =
    'For a first-time buyer earning ' + fmtAmount + ', the FHSA\u2019s $8,000 annual deduction saves ' + fmtC(fhsaSaving) + ' in tax at your ' + fmtP(marginalRate) + ' rate\u2014the net cost is only ' + fmtC(fhsaNetCost) + ' out of pocket. ' +
    'That $8,000 contribution from your ' + fmtC(onResult.netAnnual) + ' after-tax income represents ' + fhsaPctOfNet + '% of annual net pay, or ' + fmtC(Math.round(8000 / 12)) + ' per month. ' +
    'Over 5 years of maxing the FHSA on your ' + fmtAmount + ' salary, you accumulate $40,000 in contributions plus approximately ' + fmtC(fhsa5yrGrowth - 40000) + ' in tax-free investment growth (at 7%), totalling ' + fmtC(fhsa5yrGrowth) + ' for a down payment. ' +
    'Total tax savings over those 5 years: ' + fmtC(fhsa5yrTaxSaved) + ' at your current ' + fmtAmount + ' marginal rate. ' +
    'Unlike an RRSP, FHSA withdrawals for a qualifying home purchase are completely tax-free, giving you both the deduction on the way in and tax-free growth on the way out. ' +
    'If you decide not to buy, FHSA balances transfer to your RRSP without using contribution room\u2014no penalty for a ' + fmtAmount + ' earner who changes plans. ' +
    'Combined FHSA + RRSP deductions on ' + fmtAmount + ': ' + fmtC(fhsaSaving + rrspRefund) + ' annual tax reduction (' + fmtC(Math.round((fhsaSaving + rrspRefund) / 12)) + '/month back in your pocket).';

  const housingBudget = Math.round(onResult.netMonthly * 0.30);
  const discretionary = Math.round(onResult.netMonthly - housingBudget - 500 - 250 - 200 - 180 - 70);
  const discretionaryPct = ((discretionary / onResult.netMonthly) * 100).toFixed(0);

  const budgetIntro =
    'Your ' + fmtAmount + ' salary produces ' + fmtC(onResult.netMonthly) + ' monthly net in Ontario. Allocating 30% to housing means ' + fmtC(housingBudget) + ' for rent or mortgage. ' +
    (housingBudget < 1500
      ? 'On a ' + fmtAmount + ' income, that ' + fmtC(housingBudget) + ' housing budget requires living outside major centres or sharing accommodation in Toronto/Vancouver where rents start at $2,000+. '
      : housingBudget < 2200
        ? 'Your ' + fmtC(housingBudget) + ' housing allocation on ' + fmtAmount + ' covers a one-bedroom in most cities (Ottawa, Calgary, Montreal) but stretches tight in downtown Toronto or Vancouver. '
        : 'At ' + fmtC(housingBudget) + '/month from your ' + fmtAmount + ' salary, you can comfortably rent a two-bedroom or service a mortgage of approximately ' + fmtC(Math.round(housingBudget * 12 / 0.05)) + ' in most Canadian markets. ') +
    'After fixed costs (housing, groceries, transport, utilities, insurance, phone), your ' + fmtAmount + ' salary leaves ' + fmtC(discretionary) + ' per month (' + discretionaryPct + '% of net) for savings and lifestyle spending.';

  return { federalBrackets, federalCalculation, provincialTax, cppEi, tfsaSection, rrspSection, fhsaSection, budgetIntro };
}

// ── Budget breakdown ────────────────────────────────────────────────────────

export interface BudgetBreakdown {
  housing: number;
  groceries: number;
  transport: number;
  utilities: number;
  insurance: number;
  phone: number;
  savings: number;
}

export function getBudgetBreakdown(netMonthly: number): BudgetBreakdown {
  const housing = Math.round(netMonthly * 0.30);
  const groceries = 500;
  const transport = 250;
  const utilities = 200;
  const insurance = 180;
  const phone = 70;
  const savings = Math.round(netMonthly - housing - groceries - transport - utilities - insurance - phone);
  return { housing, groceries, transport, utilities, insurance, phone, savings };
}

// ── Salary-specific tax overview (replaces band-level narrative.taxes) ──────

export function getTaxOverview(
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): string {
  const fmtAmount = fmtC(amount);
  const totalDeductions = onResult.grossAnnual - onResult.netAnnual;
  const fedPct = (onResult.federalIncomeTax / totalDeductions * 100).toFixed(0);
  const provPct = (onResult.provincialTax / totalDeductions * 100).toFixed(0);
  const payrollPct = ((onResult.cpp + onResult.cpp2 + onResult.ei) / totalDeductions * 100).toFixed(0);
  const { prev, next } = getAdjacentAmounts(amount);

  const marginalKeep = (1 - onResult.marginalTaxRate / 100);
  const monthlyDeductions = Math.round(totalDeductions / 12);
  const amtK = Math.round(amount / 1000);

  return (
    'On ' + fmtAmount + ' ($' + amtK + 'k) in Ontario, total annual deductions are ' + fmtC(totalDeductions) + ' (' + fmtC(monthlyDeductions) + '/month), split as: ' +
    'federal income tax ' + fmtC(onResult.federalIncomeTax) + ' (' + fedPct + '% of your ' + fmtAmount + ' deductions), ' +
    'provincial income tax ' + fmtC(onResult.provincialTax) + ' (' + provPct + '%), ' +
    'CPP/CPP2/EI contributions ' + fmtC(onResult.cpp + onResult.cpp2 + onResult.ei) + ' (' + payrollPct + '%). ' +
    (onResult.ontarioHealthPremium > 0 ? 'Ontario Health Premium at ' + fmtAmount + ': ' + fmtC(onResult.ontarioHealthPremium) + '. ' : '') +
    'On your ' + fmtAmount + ' salary, the ' + fmtP(onResult.marginalTaxRate) + ' combined marginal rate means each additional dollar above ' + fmtAmount + ' nets you only $' + marginalKeep.toFixed(2) + '. ' +
    'The gap between your ' + fmtP(onResult.effectiveTaxRate) + ' effective rate and ' + fmtP(onResult.marginalTaxRate) + ' marginal rate on ' + fmtAmount + ' exists because early dollars are taxed at lower brackets. ' +
    (prev ? 'Compared to ' + fmtC(prev) + ', your ' + fmtAmount + ' salary pays ' + fmtC(Math.round(totalDeductions - prev * onResult.effectiveTaxRate / 100 * 0.92)) + ' more in annual deductions for ' + fmtC(amount - prev) + ' additional gross. ' : '') +
    'Alberta advantage on ' + fmtAmount + ': ' + fmtC(abResult.netAnnual - onResult.netAnnual) + ' more net per year (' + fmtC(Math.round((abResult.netAnnual - onResult.netAnnual) / 12)) + '/month). ' +
    'Quebec burden on ' + fmtAmount + ': ' + fmtP(qcResult.effectiveTaxRate) + ' effective rate, paying ' + fmtC(qcResult.grossAnnual - qcResult.netAnnual) + ' total deductions (' + fmtC(onResult.netAnnual - qcResult.netAnnual) + ' more than Ontario).'
  );
}

// ── Salary-specific savings strategy (replaces band-level narrative.savings) ─

export function getSavingsStrategy(
  amount: number,
  onResult: CalculationResult,
): string {
  const fmtAmount = fmtC(amount);
  const marginalRate = onResult.marginalTaxRate;
  const rrspRoom = Math.min(Math.round(amount * 0.18), 32490);
  const rrspSaving = Math.round(rrspRoom * marginalRate / 100);
  const netMonthly = onResult.netMonthly;
  const savingsTarget15 = Math.round(amount * 0.15);
  const monthlyTarget = Math.round(savingsTarget15 / 12);
  const tenYearGrowth = Math.round(savingsTarget15 * 14.78);

  const amtK = Math.round(amount / 1000);
  const surplusSavings = Math.max(0, savingsTarget15 - rrspRoom - 7000);
  const dividendRate = Math.round(marginalRate * 0.6);
  const capGainsRate = (marginalRate / 2).toFixed(1);

  return (
    'On ' + fmtAmount + ' ($' + amtK + 'k), saving 15% means ' + fmtC(savingsTarget15) + '/year (' + fmtC(monthlyTarget) + '/month), representing ' + ((savingsTarget15 / onResult.netAnnual) * 100).toFixed(0) + '% of your ' + fmtC(onResult.netAnnual) + ' after-tax income. ' +
    'Optimal order for a ' + fmtAmount + ' earner: employer RRSP match first, then FHSA ($8,000 saves ' + fmtC(Math.round(8000 * marginalRate / 100)) + ' on ' + fmtAmount + '), then RRSP (' + fmtC(rrspRoom) + ' room saves ' + fmtC(rrspSaving) + '), then TFSA ($7,000). ' +
    'Total tax refund from maxing both RRSP and FHSA on ' + fmtAmount + ': ' + fmtC(rrspSaving + Math.round(8000 * marginalRate / 100)) + '/year\u2014reinvesting that refund from your ' + fmtAmount + ' salary accelerates compound growth. ' +
    'Your ' + fmtC(savingsTarget15) + ' annual savings at 7% grows to ' + fmtC(tenYearGrowth) + ' in a decade (starting from ' + fmtAmount + ' today). ' +
    'Emergency fund at ' + fmtAmount + ' net: ' + fmtC(Math.round(netMonthly * 3)) + ' (3 months) to ' + fmtC(Math.round(netMonthly * 6)) + ' (6 months of your ' + fmtC(netMonthly) + ' monthly expenses). ' +
    'Once registered accounts are full, your ' + fmtAmount + ' surplus of ' + fmtC(surplusSavings) + '/year goes to taxable accounts\u2014Canadian eligible dividends face only ~' + dividendRate + '% effective tax, and capital gains only ' + capGainsRate + '% (half your ' + fmtP(marginalRate) + ' marginal rate on ' + fmtAmount + ').'
  );
}

// ── Salary-specific "How to Maximise" section ───────────────────────────────

export function getMaximiseTips(
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): string {
  const fmtAmount = fmtC(amount);
  const marginalRate = onResult.marginalTaxRate;
  const rrspRoom = Math.min(Math.round(amount * 0.18), 32490);
  const rrspSaving = Math.round(rrspRoom * marginalRate / 100);
  const abDiff = abResult.netAnnual - qcResult.netAnnual;
  const { next } = getAdjacentAmounts(amount);

  const tips: string[] = [
    'Contribute your full RRSP room of ' + fmtC(rrspRoom) + ' to reduce taxable income from ' + fmtAmount + ' to ' + fmtC(amount - rrspRoom) + ', generating a refund of ' + fmtC(rrspSaving) + ' at your ' + fmtP(marginalRate) + ' marginal rate.',
    'Maximise your TFSA ($7,000/year) for tax-free growth. At your marginal rate, sheltering $1,000 of investment income saves ' + fmtC(Math.round(1000 * marginalRate / 100)) + ' annually compared to a taxable account.',
    'Claim all eligible deductions: at ' + fmtP(marginalRate) + ' marginal, a $2,000 deduction (union dues, professional fees, or moving expenses) saves you ' + fmtC(Math.round(2000 * marginalRate / 100)) + '.',
    'Province matters: the Alberta-to-Quebec difference on ' + fmtAmount + ' is ' + fmtC(abDiff) + ' per year. Even moving from Ontario to Alberta saves ' + fmtC(abResult.netAnnual - onResult.netAnnual) + ' annually.',
  ];

  if (amount < 100000) {
    tips.push('Use the FHSA ($8,000/year) if you qualify. At your marginal rate, the deduction saves ' + fmtC(Math.round(8000 * marginalRate / 100)) + ' per year while building your down payment tax-free.');
  } else {
    tips.push('Consider incorporating if you have side income. The small business rate of 9% federally vs. your ' + fmtP(marginalRate) + ' personal rate creates significant deferral opportunities on retained earnings.');
  }

  if (next && next - amount <= 20000) {
    tips.push('Negotiate a raise to ' + fmtC(next) + ': the extra ' + fmtC(next - amount) + ' gross adds ' + fmtC(Math.round((next - amount) * (1 - marginalRate / 100))) + ' annual net (' + fmtC(Math.round((next - amount) * (1 - marginalRate / 100) / 12)) + '/month) after tax.');
  } else {
    tips.push('Contribute $2,500 per child to an RESP to receive the 20% Canada Education Savings Grant ($500/year), which at your income level is not clawed back.');
  }

  if (amount >= 60000) {
    tips.push('If you have a spouse earning under ' + fmtC(Math.round(amount * 0.4)) + ', a spousal RRSP contribution at your ' + fmtP(marginalRate) + ' rate creates future withdrawals taxed at their lower rate\u2014potentially saving 15%+ per dollar in retirement.');
  }

  return tips.join(' ');
}

// ── Provincial comparison intro (salary-specific) ───────────────────────────

export function getProvincialIntro(
  amount: number,
  onResult: CalculationResult,
  abResult: CalculationResult,
  qcResult: CalculationResult,
): string {
  const fmtAmount = fmtC(amount);
  const spread = abResult.netAnnual - qcResult.netAnnual;
  const spreadMonthly = Math.round(spread / 12);

  return (
    'Your take-home pay on a ' + fmtAmount + ' salary varies by up to ' + fmtC(spread) + ' per year (' + fmtC(spreadMonthly) + '/month) depending on your province of residence. ' +
    'At this specific salary, Ontario keeps you at ' + fmtP(onResult.effectiveTaxRate) + ' effective tax rate (' + fmtC(onResult.netMonthly) + '/month net), ' +
    'Alberta at ' + fmtP(abResult.effectiveTaxRate) + ' (' + fmtC(abResult.netMonthly) + '/month), ' +
    'and Quebec at ' + fmtP(qcResult.effectiveTaxRate) + ' (' + fmtC(qcResult.netMonthly) + '/month). ' +
    'The following table provides the complete breakdown for five major provinces, showing exactly where each tax dollar goes on your ' + fmtAmount + ' income.'
  );
}
