import { formatCurrencyLang, formatPercentLang } from '../../lib/format';
import type { CalculationResult } from '../../lib/tax-engine-ca';


// Le panneau de résultats s'affichait en anglais sur les pages françaises :
// les libellés sont désormais choisis selon la langue de la page (2026-09-21).
const T = {
  en: {
    takeHome: 'Your Take-Home Pay', perYear: 'per year', mo: '/mo', biWeekly: '/bi-weekly',
    gross: 'Gross Salary', federal: 'Federal Income Tax', qpp: 'QPP (Quebec Pension Plan)',
    cpp: 'CPP (Canada Pension Plan)', ei: 'EI (Employment Insurance)',
    qpip: 'QPIP (Parental Insurance)', provincial: (p: string) => `${p} Provincial Tax`,
    ohp: 'Ontario Health Premium', total: 'Total Deductions', net: 'Net Annual Salary',
    effective: 'Effective Tax Rate', marginal: 'Marginal Tax Rate',
  },
  fr: {
    takeHome: 'Votre salaire net', perYear: 'par an', mo: '/mois', biWeekly: '/quinzaine',
    gross: 'Salaire brut', federal: 'Impôt fédéral', qpp: 'RRQ (Régime de rentes du Québec)',
    cpp: 'RPC (Régime de pensions du Canada)', ei: 'AE (assurance-emploi)',
    qpip: 'RQAP (assurance parentale)', provincial: (p: string) => `Impôt provincial, ${p}`,
    ohp: 'Contribution-santé de l\'Ontario', total: 'Total des retenues', net: 'Salaire net annuel',
    effective: "Taux d'imposition effectif", marginal: "Taux d'imposition marginal",
  },
} as const;

interface Props {
  result: CalculationResult;
  lang?: 'en' | 'fr';
}

export default function ResultPanel({ result, lang = 'en' }: Props) {
  const t = T[lang];
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
      {/* Main net amount */}
      <div className="bg-brand-500 px-6 py-8 text-center">
        <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">{t.takeHome}</p>
        <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums result-value">
          {formatCurrencyLang(result.netAnnual, lang)}
        </p>
        <p className="mt-1 text-brand-200 text-sm">
          {t.perYear} &middot; {formatCurrencyLang(result.netMonthly, lang)}{t.mo} &middot; {formatCurrencyLang(result.netBiWeekly, lang)}{t.biWeekly}
        </p>
      </div>

      {/* Breakdown */}
      <div className="px-6 py-5 space-y-3">
        <Row label={t.gross} value={result.grossAnnual} bold lang={lang} />
        <Divider />
        <Row label={t.federal} value={-result.federalIncomeTax} negative lang={lang} />
        <Row label={result.qpip > 0 ? t.qpp : t.cpp} value={-result.cpp} negative />
        {result.cpp2 > 0 && (
          <Row label={result.qpip > 0 ? 'QPP2' : 'CPP2'} value={-result.cpp2} negative />
        )}
        <Row label={t.ei} value={-result.ei} negative lang={lang} />
        {result.qpip > 0 && (
          <Row label={t.qpip} value={-result.qpip} negative lang={lang} />
        )}
        <Row label={t.provincial(result.provinceName)} value={-result.provincialTax} negative lang={lang} />
        {result.ontarioHealthPremium > 0 && (
          <Row label={t.ohp} value={-result.ontarioHealthPremium} negative lang={lang} />
        )}
        <Divider />
        <Row label={t.total} value={-result.totalDeductions} negative bold lang={lang} />
        <Row label={t.net} value={result.netAnnual} bold accent lang={lang} />
        <Divider />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t.effective}</span>
          <span className="tabular-nums font-medium">{formatPercentLang(result.effectiveTaxRate, lang)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t.marginal}</span>
          <span className="tabular-nums font-medium">{formatPercentLang(result.marginalTaxRate, lang)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, negative, accent, note, lang = 'en' }: {
  label: string; value: number; bold?: boolean; negative?: boolean; accent?: boolean; note?: string; lang?: 'en' | 'fr';
}) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-semibold' : ''} ${accent ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
      <span className="text-sm">{label}</span>
      <div className="text-right">
        <span className={`tabular-nums ${negative ? 'text-red-600 dark:text-red-400' : ''}`}>
          {formatCurrencyLang(value, lang)}
        </span>
        {note && <span className="block text-xs text-green-600 dark:text-green-400">{note}</span>}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-100 dark:border-gray-700" />;
}
