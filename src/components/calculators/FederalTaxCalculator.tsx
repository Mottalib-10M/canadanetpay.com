import { useState, useEffect, useMemo } from 'react';
import { calculateFederalTax } from '../../lib/tax-engine-ca';
import { FEDERAL_BRACKETS, BASIC_PERSONAL_AMOUNT } from '../../data/federal-tax-2025';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency, formatPercent } from '../../lib/format';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';

export default function FederalTaxCalculator() {
  const [gross, setGross] = useState(75000);
  const [provinceCode, setProvinceCode] = useState('ON');
  const [rrsp, setRrsp] = useState(0);

  useEffect(() => {
    const p = readUrlParams({ gross: 'number', prov: 'string', rrsp: 'number' });
    if (p.gross) setGross(p.gross);
    if (p.prov) setProvinceCode(p.prov);
    if (p.rrsp) setRrsp(p.rrsp);
  }, []);

  const result = useMemo(() => calculateFederalTax(gross, provinceCode, rrsp), [gross, provinceCode, rrsp]);

  useEffect(() => {
    writeUrlParams({ gross, prov: provinceCode, rrsp: rrsp || undefined });
  }, [gross, provinceCode, rrsp]);

  const effectiveRate = gross > 0 ? (result.total / gross) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income Details</h2>
          <InputField label="Annual Gross Income" value={gross} onChange={setGross} prefix="$" suffix="/year" />
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Territory</label>
            <select id="province" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {ALL_PROVINCES.map((c) => <option key={c} value={c}>{PROVINCES[c].name}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Province affects Quebec abatement and CPP/QPP credits</p>
          </div>
          <InputField label="RRSP Contribution" value={rrsp} onChange={setRrsp} prefix="$" suffix="/year" />
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <p><strong>Basic Personal Amount:</strong> {formatCurrency(BASIC_PERSONAL_AMOUNT)}</p>
            <p className="mt-1"><strong>Taxable Income:</strong> {formatCurrency(result.taxableIncome)}</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-6 py-8 text-center">
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Federal Income Tax</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(result.total)}</p>
            <p className="mt-1 text-brand-200 text-sm">Effective rate: {formatPercent(effectiveRate)}</p>
          </div>
        </div>

        {result.bands.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
            <div className="bg-brand-500 px-5 py-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Tax Bracket Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">Bracket</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Taxable Amount</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Tax</th>
                </tr>
              </thead>
              <tbody>
                {result.bands.map((band, i) => (
                  <tr key={i} className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}>
                    <td className="px-5 py-2 text-gray-700 dark:text-gray-300">{band.name}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrency(band.taxableAmount)}</td>
                    <td className="px-5 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-white">{formatCurrency(band.tax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">Total Federal Tax</td>
                  <td />
                  <td className="px-5 py-3 text-right tabular-nums font-bold text-brand-600 dark:text-brand-400">{formatCurrency(result.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Tax vs Remaining Income</h3>
          <BreakdownBar
            segments={[
              { label: 'Federal Tax', value: result.total, color: '#dc2626' },
              { label: 'After Federal Tax', value: gross - result.total, color: '#16a34a' },
            ]}
            total={gross}
          />
        </div>
      </div>
    </div>
  );
}
