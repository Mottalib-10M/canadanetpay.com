import { useState, useEffect, useMemo } from 'react';
import { calculateFederalTax, calculateProvincialTax, calculateOntarioHealthPremium } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency, formatPercent } from '../../lib/format';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';

export default function IncomeTaxCalculator() {
  const [gross, setGross] = useState(75000);
  const [provinceCode, setProvinceCode] = useState('ON');
  const [rrsp, setRrsp] = useState(0);

  useEffect(() => {
    const p = readUrlParams({ gross: 'number' as const, prov: 'string' as const, rrsp: 'number' as const });
    if (p.gross) setGross(p.gross);
    if (p.prov && PROVINCES[p.prov]) setProvinceCode(p.prov);
    if (p.rrsp) setRrsp(p.rrsp);
  }, []);

  const federal = useMemo(() => calculateFederalTax(gross, provinceCode, rrsp), [gross, provinceCode, rrsp]);
  const provincial = useMemo(() => calculateProvincialTax(gross, provinceCode, rrsp), [gross, provinceCode, rrsp]);
  const ohp = useMemo(() => PROVINCES[provinceCode]?.healthPremium ? calculateOntarioHealthPremium(gross) : 0, [gross, provinceCode]);
  const totalIncomeTax = federal.total + provincial + ohp;
  const effectiveRate = gross > 0 ? (totalIncomeTax / gross) * 100 : 0;

  useEffect(() => {
    writeUrlParams({ gross, prov: provinceCode, rrsp: rrsp || undefined });
  }, [gross, provinceCode, rrsp]);

  const barSegments = [
    { label: 'Federal Tax', value: federal.total, color: '#dc2626' },
    { label: `${PROVINCES[provinceCode]?.name ?? ''} Tax`, value: provincial, color: '#ea580c' },
    ...(ohp > 0 ? [{ label: 'ON Health Premium', value: ohp, color: '#ca8a04' }] : []),
    { label: 'After Tax', value: gross - totalIncomeTax, color: '#16a34a' },
  ];

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
          </div>
          <InputField label="RRSP Deduction" value={rrsp} onChange={setRrsp} prefix="$" suffix="/year" help="Reduces your taxable income" />
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-6 py-8 text-center">
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Total Income Tax</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(totalIncomeTax)}</p>
            <p className="mt-1 text-brand-200 text-sm">effective rate: {formatPercent(effectiveRate)}</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross Income</span>
              <span className="font-medium tabular-nums text-gray-900 dark:text-white">{formatCurrency(gross)}</span>
            </div>
            {rrsp > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">RRSP Deduction</span>
                <span className="tabular-nums text-green-600 dark:text-green-400">-{formatCurrency(rrsp)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Taxable Income</span>
              <span className="tabular-nums text-gray-900 dark:text-white">{formatCurrency(federal.taxableIncome)}</span>
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Federal Income Tax</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">{formatCurrency(federal.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{PROVINCES[provinceCode]?.name} Provincial Tax</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">{formatCurrency(provincial)}</span>
            </div>
            {ohp > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Ontario Health Premium</span>
                <span className="tabular-nums text-red-600 dark:text-red-400">{formatCurrency(ohp)}</span>
              </div>
            )}
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-brand-600 dark:text-brand-400">Total Income Tax</span>
              <span className="tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(totalIncomeTax)}</span>
            </div>
          </div>
        </div>

        {federal.bands.length > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
            <div className="bg-brand-500 px-5 py-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Federal Tax Brackets</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="px-5 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">Bracket</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Taxable</th>
                  <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Tax</th>
                </tr>
              </thead>
              <tbody>
                {federal.bands.map((band, i) => (
                  <tr key={i} className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                    <td className="px-5 py-2 text-gray-700 dark:text-gray-300">{band.name}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrency(band.taxableAmount)}</td>
                    <td className="px-5 py-2 text-right tabular-nums font-medium text-gray-900 dark:text-white">{formatCurrency(band.tax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                  <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white" colSpan={2}>Total Federal Tax</td>
                  <td className="px-5 py-3 text-right tabular-nums font-bold text-brand-600 dark:text-brand-400">{formatCurrency(federal.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Tax Breakdown</h3>
          <BreakdownBar segments={barSegments} total={gross} />
        </div>
      </div>
    </div>
  );
}
