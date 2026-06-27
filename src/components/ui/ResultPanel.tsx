import { formatCurrency, formatPercent } from '../../lib/format';
import type { CalculationResult } from '../../lib/tax-engine-ca';

interface Props {
  result: CalculationResult;
}

export default function ResultPanel({ result }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
      {/* Main net amount */}
      <div className="bg-brand-500 px-6 py-8 text-center">
        <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Your Take-Home Pay</p>
        <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums result-value">
          {formatCurrency(result.netAnnual)}
        </p>
        <p className="mt-1 text-brand-200 text-sm">
          per year &middot; {formatCurrency(result.netMonthly)}/mo &middot; {formatCurrency(result.netBiWeekly)}/bi-weekly
        </p>
      </div>

      {/* Breakdown */}
      <div className="px-6 py-5 space-y-3">
        <Row label="Gross Salary" value={result.grossAnnual} bold />
        <Divider />
        <Row label="Federal Income Tax" value={-result.federalIncomeTax} negative />
        <Row label={result.qpip > 0 ? 'QPP (Quebec Pension Plan)' : 'CPP (Canada Pension Plan)'} value={-result.cpp} negative />
        {result.cpp2 > 0 && (
          <Row label={result.qpip > 0 ? 'QPP2' : 'CPP2'} value={-result.cpp2} negative />
        )}
        <Row label="EI (Employment Insurance)" value={-result.ei} negative />
        {result.qpip > 0 && (
          <Row label="QPIP (Parental Insurance)" value={-result.qpip} negative />
        )}
        <Row label={`${result.provinceName} Provincial Tax`} value={-result.provincialTax} negative />
        {result.ontarioHealthPremium > 0 && (
          <Row label="Ontario Health Premium" value={-result.ontarioHealthPremium} negative />
        )}
        <Divider />
        <Row label="Total Deductions" value={-result.totalDeductions} negative bold />
        <Row label="Net Annual Salary" value={result.netAnnual} bold accent />
        <Divider />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Effective Tax Rate</span>
          <span className="tabular-nums font-medium">{formatPercent(result.effectiveTaxRate)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Marginal Tax Rate</span>
          <span className="tabular-nums font-medium">{formatPercent(result.marginalTaxRate)}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, negative, accent, note }: {
  label: string; value: number; bold?: boolean; negative?: boolean; accent?: boolean; note?: string;
}) {
  return (
    <div className={`flex justify-between items-center ${bold ? 'font-semibold' : ''} ${accent ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
      <span className="text-sm">{label}</span>
      <div className="text-right">
        <span className={`tabular-nums ${negative ? 'text-red-600 dark:text-red-400' : ''}`}>
          {formatCurrency(value)}
        </span>
        {note && <span className="block text-xs text-green-600 dark:text-green-400">{note}</span>}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-100 dark:border-gray-700" />;
}
