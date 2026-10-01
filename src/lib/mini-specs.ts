/** Mini-simulateurs des guides (RECETTE §9.3), en anglais et en français, calculés par le moteur fiscal canadien. */
import { calculateTakeHome, calculateCPPContribution, calculateEIContribution, calculateProvincialTax } from './tax-engine-ca';
import { PROVINCES } from '../data/provinces';
import { formatCurrencyLang, formatPercentLang } from './format';
import type { MiniSpec } from './mini-types';

type L = 'en' | 'fr';
const T = <A>(l: L, en: A, fr: A) => (l === 'fr' ? fr : en);
const CODES = Object.keys(PROVINCES).sort((a, b) => PROVINCES[a].name.localeCompare(PROVINCES[b].name));
const ON = CODES.indexOf('ON');
const province = (l: L) => ({ id: 'p', label: T(l, 'Province or territory', 'Province ou territoire'), def: ON, options: CODES.map((c, i) => ({ value: String(i), label: PROVINCES[c].name })) });
const salary = (l: L, def = 75000) => ({ id: 's', label: T(l, 'Annual salary', 'Salaire annuel'), def, unit: '$', max: 5000000 });
const TH = (s: number, p: number, rrsp = 0) => calculateTakeHome({ grossAnnual: s, provinceCode: CODES[p] ?? 'ON', payFrequency: 'annual', rrspContribution: rrsp });

const SPECS: Record<string, (l: L) => MiniSpec> = {
  takehome: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Your take-home pay', 'Votre salaire net'), cta: T(l, 'Full salary calculator', 'Calculateur de salaire complet'), inputs: [salary(l), province(l)], run: ({ s, p }) => {
    const r = TH(s, p); return { head: [T(l, 'Take-home pay per month', 'Salaire net par mois'), $(r.netMonthly)], rows: [[T(l, 'Per year', 'Par année'), $(r.netAnnual)], [T(l, 'Income tax, federal and provincial', 'Impôt fédéral et provincial'), $(r.federalIncomeTax + r.provincialTax)], [T(l, 'CPP and EI', 'RPC et AE'), $(r.cpp + r.cpp2 + r.ei + r.qpip)]] };
  } }; },
  cpp: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Your CPP and EI contributions', 'Vos cotisations RPC et AE'), cta: T(l, 'CPP calculator', 'Calculateur RPC'), inputs: [salary(l)], run: ({ s }) => {
    const c = calculateCPPContribution(s); const e = calculateEIContribution(s); return { head: [T(l, 'CPP and CPP2 per year', 'RPC et RPC2 par année'), $(c.total)], rows: [['CPP', $(c.cpp)], ['CPP2', $(c.cpp2)], [T(l, 'EI premiums', 'Cotisations d’AE'), $(e.total)]] };
  } }; },
  federal: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Federal tax on your income', 'Impôt fédéral sur votre revenu'), cta: T(l, 'Federal tax calculator', 'Calculateur d’impôt fédéral'), inputs: [salary(l)], run: ({ s }) => {
    const r = TH(s, ON); return { head: [T(l, 'Federal income tax', 'Impôt fédéral'), $(r.federalIncomeTax)], rows: [[T(l, 'Taxable income', 'Revenu imposable'), $(r.federalTaxableIncome)], [T(l, 'Share of salary', 'Part du salaire'), formatPercentLang(s ? r.federalIncomeTax / s * 100 : 0, l)]] };
  } }; },
  marginal: (l) => ({ title: T(l, 'Your marginal and effective rates', 'Vos taux marginal et effectif'), cta: T(l, 'Income tax calculator', 'Calculateur d’impôt'), inputs: [salary(l), province(l)], run: ({ s, p }) => {
    const r = TH(s, p); return { head: [T(l, 'Marginal rate', 'Taux marginal'), formatPercentLang(r.marginalTaxRate, l)], rows: [[T(l, 'Effective rate', 'Taux effectif'), formatPercentLang(r.effectiveTaxRate, l)], [T(l, 'Tax on the next $1,000', 'Impôt sur les 1 000 $ suivants'), formatCurrencyLang(r.marginalTaxRate * 10, l)]] };
  } }),
  hourly: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Minimum wage take-home pay', 'Salaire minimum en net'), cta: T(l, 'Hourly to salary calculator', 'Calculateur horaire'), inputs: [{ id: 'h', label: T(l, 'Hourly wage', 'Taux horaire'), def: 17.6, unit: '$', max: 1000, decimals: 2 }, { id: 'w', label: T(l, 'Hours per week', 'Heures par semaine'), def: 40, unit: 'h', max: 80 }, province(l)], run: ({ h, w, p }) => {
    const g = h * w * 52; const r = TH(g, p); return { head: [T(l, 'Take-home per month', 'Net par mois'), $(r.netMonthly)], rows: [[T(l, 'Gross per year', 'Brut par année'), $(g)], [T(l, 'Take-home per year', 'Net par année'), $(r.netAnnual)]] };
  } }; },
  provincial: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Provincial tax where you live', 'Impôt provincial selon votre province'), cta: T(l, 'Income tax calculator', 'Calculateur d’impôt'), inputs: [salary(l), province(l)], run: ({ s, p }) => {
    const pr = calculateProvincialTax(s, CODES[p] ?? 'ON'); const r = TH(s, p); return { head: [T(l, 'Provincial tax per year', 'Impôt provincial par année'), $(pr)], rows: [[T(l, 'Federal tax', 'Impôt fédéral'), $(r.federalIncomeTax)], [T(l, 'Take-home per year', 'Net par année'), $(r.netAnnual)]] };
  } }; },
  rrsp: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Tax saved by an RRSP contribution', 'Impôt économisé par une cotisation REER'), cta: T(l, 'Income tax calculator', 'Calculateur d’impôt'), inputs: [salary(l, 85000), { id: 'r', label: T(l, 'RRSP contribution', 'Cotisation REER'), def: 5000, unit: '$', max: 100000 }, province(l)], run: ({ s, r, p }) => {
    const a = TH(s, p); const b = TH(s, p, r); const save = (a.federalIncomeTax + a.provincialTax) - (b.federalIncomeTax + b.provincialTax);
    return { head: [T(l, 'Tax saved', 'Impôt économisé'), $(save)], rows: [[T(l, 'Net cost of the contribution', 'Coût net de la cotisation'), $(r - save)], [T(l, 'Your marginal rate', 'Votre taux marginal'), formatPercentLang(a.marginalTaxRate, l)]] };
  } }; },
};

export function getSpec(kind: string, lang = 'en'): MiniSpec {
  const s = SPECS[kind]; if (!s) throw new Error(`Mini-simulateur inconnu : ${kind}`); return s(lang === 'fr' ? 'fr' : 'en');
}
