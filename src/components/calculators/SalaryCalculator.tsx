import { useState, useEffect, useMemo } from 'react';
import { calculateTakeHome, type CalculatorInput } from '../../lib/tax-engine-ca';
import type { PayFrequency } from '../../data/federal-tax-2025';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { PAY_PERIODS } from '../../data/federal-tax-2025';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency, formatCurrencyLang, formatPercent, formatPercentLang } from '../../lib/format';
import InputField from '../ui/InputField';
import ResultPanel, { PROVINCE_FR } from '../ui/ResultPanel';
import BreakdownBar from '../ui/BreakdownBar';

const URL_CONFIG = {
  gross: 'number' as const,
  prov: 'string' as const,
  freq: 'string' as const,
  rrsp: 'number' as const,
};

interface Props {
  lang?: 'en' | 'fr';
  defaultProvince?: string;
}

export default function SalaryCalculator({ defaultProvince = 'ON', lang = 'en'}: Props) {
  const [gross, setGross] = useState(75000);
  const [provinceCode, setProvinceCode] = useState(defaultProvince);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>('bi_weekly');
  const [rrsp, setRrsp] = useState(0);

  useEffect(() => {
    const params = readUrlParams(URL_CONFIG);
    if (params.gross) setGross(params.gross);
    if (params.prov && PROVINCES[params.prov]) setProvinceCode(params.prov);
    if (params.freq) setPayFrequency(params.freq as PayFrequency);
    if (params.rrsp) setRrsp(params.rrsp);
  }, []);

  const result = useMemo(() => calculateTakeHome({
    grossAnnual: gross,
    provinceCode,
    payFrequency,
    rrspContribution: rrsp,
  }), [gross, provinceCode, payFrequency, rrsp]);

  useEffect(() => {
    writeUrlParams({ gross, prov: provinceCode, freq: payFrequency, rrsp: rrsp || undefined });
  }, [gross, provinceCode, payFrequency, rrsp]);

  const isQuebec = PROVINCES[provinceCode]?.isQuebec;

  const fr = lang === 'fr';
  const barSegments = [
    { label: fr ? 'Impôt fédéral' : 'Federal Tax', value: result.federalIncomeTax, color: '#dc2626' },
    { label: isQuebec ? (fr ? 'RRQ' : 'QPP') : (fr ? 'RPC' : 'CPP'), value: result.cpp + result.cpp2, color: '#7c3aed' },
    { label: fr ? 'AE' : 'EI', value: result.ei, color: '#db2777' },
    ...(result.qpip > 0 ? [{ label: fr ? 'RQAP' : 'QPIP', value: result.qpip, color: '#0891b2' }] : []),
    { label: fr ? 'Impôt provincial' : 'Provincial Tax', value: result.provincialTax, color: '#ea580c' },
    ...(result.ontarioHealthPremium > 0 ? [{ label: fr ? 'Contribution-santé (Ont.)' : 'ON Health Premium', value: result.ontarioHealthPremium, color: '#ca8a04' }] : []),
    { label: fr ? 'Salaire net' : 'Take-Home Pay', value: result.netAnnual, color: '#16a34a' },
  ];
  // Libellés du formulaire en français sur la page française (audit du 2026-10-28)
  const FREQ_FR: Record<string, string> = { annual: 'Annuelle', monthly: 'Mensuelle', semi_monthly: 'Bimensuelle (24 fois)', bi_weekly: 'Aux deux semaines (26 fois)', weekly: 'Hebdomadaire (52 fois)' };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input Panel */}
      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{fr ? 'Votre situation' : 'Your Details'}</h2>

          <InputField
            label={fr ? 'Salaire brut annuel' : 'Annual Gross Salary'}
            value={gross}
            onChange={setGross}
            prefix="$"
            suffix={fr ? '/an' : '/year'}
            help={fr ? 'Salaire annuel total avant impôts (en dollars canadiens)' : 'Enter your total annual salary before taxes (CAD)'}
          />

          {/* Province selector */}
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {fr ? 'Province ou territoire' : 'Province / Territory'}
            </label>
            <select
              id="province"
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {ALL_PROVINCES.map((code) => (
                <option key={code} value={code}>
                  {fr ? (PROVINCE_FR[PROVINCES[code].name] ?? PROVINCES[code].name) : PROVINCES[code].name}
                </option>
              ))}
            </select>
          </div>

          {/* Pay frequency */}
          <div className="mb-4">
            <label htmlFor="freq" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {fr ? 'Fréquence de paie' : 'Pay Frequency'}
            </label>
            <select
              id="freq"
              value={payFrequency}
              onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {Object.entries(PAY_PERIODS).map(([key, val]) => (
                <option key={key} value={key}>{fr ? FREQ_FR[key] : val.label}</option>
              ))}
            </select>
          </div>

          {/* RRSP */}
          <InputField
            label={fr ? 'Cotisation au REER' : 'RRSP Contribution'}
            value={rrsp}
            onChange={setRrsp}
            prefix="$"
            suffix={fr ? '/an' : '/year'}
            help={fr ? 'Cotisation annuelle au REER (réduit le revenu imposable)' : 'Annual RRSP contribution (reduces taxable income)'}
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-3 space-y-6">
        <ResultPanel result={result} lang={lang} />

        {/* Breakdown Bar */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            {lang === 'fr' ? 'Répartition du salaire' : 'Salary Breakdown'}
          </h3>
          <BreakdownBar segments={barSegments} total={gross} lang={lang} />
        </div>

        {/* Federal bracket breakdown */}
        {result.federalBands.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
            <div className="bg-brand-500 px-5 py-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{fr ? 'Tranches d’imposition fédérales' : 'Federal Tax Brackets'}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Tranche' : 'Bracket'}</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Imposable' : 'Taxable'}</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Impôt' : 'Tax'}</th>
                </tr>
              </thead>
              <tbody>
                {result.federalBands.map((band, i) => (
                  <tr key={i} className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                    <td className="px-5 py-2 text-gray-700 dark:text-gray-300">{`${formatPercentLang(band.rate * 100, lang)}${lang === 'fr' ? ', tranche' : ' bracket'}`}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrencyLang(band.taxableAmount, lang)}</td>
                    <td className="px-5 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-white">{formatCurrencyLang(band.tax, lang)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{fr ? 'Impôt fédéral total' : 'Total Federal Tax'}</td>
                  <td />
                  <td className="px-5 py-3 text-right tabular-nums font-bold text-brand-600 dark:text-brand-400">{formatCurrencyLang(result.federalIncomeTax, lang)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Per-period breakdown */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-5 py-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{fr ? 'Par période de paie' : 'Pay Period Breakdown'}</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Période' : 'Period'}</th>
                <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Brut' : 'Gross'}</th>
                <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">{fr ? 'Net' : 'Net'}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: fr ? 'Annuel' : 'Annual', gross: gross, net: result.netAnnual },
                { label: fr ? 'Mensuel' : 'Monthly', gross: gross / 12, net: result.netMonthly },
                { label: fr ? 'Aux deux semaines' : 'Bi-Weekly', gross: gross / 26, net: result.netBiWeekly },
                { label: fr ? 'Hebdomadaire' : 'Weekly', gross: gross / 52, net: result.netWeekly },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                  <td className="px-5 py-2 text-gray-700 dark:text-gray-300">{row.label}</td>
                  <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrencyLang(row.gross, lang)}</td>
                  <td className="px-5 py-2 text-right tabular-nums font-medium text-green-600 dark:text-green-400">{formatCurrencyLang(row.net, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
