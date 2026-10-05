/** Mini-simulateurs des guides (RECETTE §9.3), en anglais et en français, calculés par le moteur fiscal canadien. */
import { calculateTakeHome, calculateCPPContribution, calculateEIContribution, calculateProvincialTax } from './tax-engine-ca';
import { PROVINCES } from '../data/provinces';
import { formatCurrencyLang, formatPercentLang } from './format';
import type { MiniSpec } from './mini-types';
import { oasPension, gis, gisIncome, recoveryTax, GIS_SITUATIONS } from './oas-engine';
import { PAYMENT_DATES_2026, OAS_FULL_MONTHLY } from '../data/oas-2026';

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
  oas: (l) => { const $ = (x: number) => formatCurrencyLang(x, l, true); return { title: T(l, 'Your OAS pension and payment dates', 'Votre pension de la SV'), cta: T(l, 'OAS calculator', 'Calculateur de la SV'), inputs: [
    { id: 'y', label: T(l, 'Years in Canada after 18', 'Années au Canada après 18 ans'), def: 40, unit: T(l, 'years', 'ans'), max: 1000 },
    { id: 'b', label: T(l, 'Your age', 'Votre âge'), def: 0, options: [{ value: '0', label: '65-74' }, { value: '1', label: '75+' }] }], run: ({ y, b }) => {
    const r = oasPension({ yearsAt65: y, age75: b === 1 }); const next = PAYMENT_DATES_2026.slice(-3).map((d) => new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric' }));
    return { head: [T(l, 'OAS per month', 'SV par mois'), $(r.monthly)], rows: [[T(l, 'Per year', 'Par année'), $(r.annual)], [T(l, 'Residence fraction', 'Fraction de résidence'), r.eligible ? `${r.yearsUsed}/40` : T(l, 'under 10 years', 'moins de 10 ans')], [T(l, 'Paid on (Oct-Dec 2026)', 'Versée le'), next.join(', ')]] };
  } }; },
  gis: (l) => { const $ = (x: number) => formatCurrencyLang(x, l, true); return { title: T(l, 'Your Guaranteed Income Supplement', 'Votre Supplément de revenu garanti'), cta: T(l, 'Full GIS calculator', 'Calculateur du SRG'), inputs: [
    { id: 's', label: T(l, 'Situation', 'Situation'), def: 0, options: GIS_SITUATIONS.map((x, i) => ({ value: String(i), label: x.label })) },
    { id: 'i', label: T(l, 'Income without OAS or GIS (combined if a couple)', 'Revenu sans SV ni SRG'), def: 9600, unit: '$', max: 1000000 }], run: ({ s, i }) => {
    const r = gis(GIS_SITUATIONS[s]?.value ?? 'single', i); return { head: [T(l, 'GIS per month', 'SRG par mois'), $(r.monthly)], rows: [[T(l, 'Basic supplement', 'Supplément de base'), $(r.basic)], [T(l, 'Top-up', 'Complément'), $(r.topUp)], [T(l, 'With a full OAS pension', 'Avec une pleine SV'), $(r.monthly + OAS_FULL_MONTHLY)]] };
  } }; },
  deferral: (l) => { const $ = (x: number) => formatCurrencyLang(x, l, true); return { title: T(l, 'OAS at 65 or later: the break-even age', 'SV à 65 ans ou plus tard'), cta: T(l, 'OAS calculator', 'Calculateur de la SV'), inputs: [
    { id: 'y', label: T(l, 'Years in Canada after 18', 'Années au Canada après 18 ans'), def: 40, unit: T(l, 'years', 'ans'), max: 1000 },
    { id: 'a', label: T(l, 'Start age', 'Âge de début'), def: 70, options: [66, 67, 68, 69, 70].map((a) => ({ value: String(a), label: String(a) })) }], run: ({ y, a }) => {
    const m = (a - 65) * 12; const r65 = oasPension({ yearsAt65: y }); const rd = oasPension({ yearsAt65: y, deferralMonths: m });
    const gain = rd.monthly - r65.monthly; const be = gain > 0 ? (rd.monthly * m) / gain : 0; const beAge = 65 + be / 12;
    return { head: [T(l, 'OAS per month if started at ', 'SV par mois à ') + a, $(rd.monthly)], rows: [[T(l, 'If started at 65', 'À 65 ans'), $(r65.monthly)], [T(l, 'Extra per year', 'En plus par année'), $(gain * 12)], [T(l, 'Break-even age (before indexation and tax)', 'Âge du point mort'), gain > 0 ? beAge.toFixed(1) : '—']], note: T(l, 'No GIS is paid while OAS is deferred.', 'Aucun SRG pendant le report.') };
  } }; },
  clawback: (l) => { const $ = (x: number) => formatCurrencyLang(x, l); return { title: T(l, 'Your OAS recovery tax', 'Votre impôt de récupération de la SV'), cta: T(l, 'OAS clawback calculator', 'Calculateur'), inputs: [
    { id: 'n', label: T(l, 'Net income 2026, OAS included', 'Revenu net 2026'), def: 110000, unit: '$', max: 5000000 }], run: ({ n }) => {
    const r = recoveryTax(n, OAS_FULL_MONTHLY * 12, 2026); return { head: [T(l, 'Repayment for 2026', 'Remboursement 2026'), $(r.annual)], rows: [[T(l, 'Withheld per month', 'Retenu par mois'), $(r.monthly)], [T(l, 'Threshold', 'Seuil'), $(r.threshold)]] };
  } }; },
};

export function getSpec(kind: string, lang = 'en'): MiniSpec {
  const s = SPECS[kind]; if (!s) throw new Error(`Mini-simulateur inconnu : ${kind}`); return s(lang === 'fr' ? 'fr' : 'en');
}
