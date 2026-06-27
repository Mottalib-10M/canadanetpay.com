import { useState, useEffect, useMemo } from 'react';
import { calculateEIContribution } from '../../lib/tax-engine-ca';
import { EI_RATE, EI_MAX_INSURABLE_EARNINGS, EI_MAX_CONTRIBUTION, EI_RATE_QUEBEC, EI_MAX_CONTRIBUTION_QUEBEC, QPIP_RATE, QPIP_MAX_INSURABLE_EARNINGS, QPIP_MAX_CONTRIBUTION } from '../../data/federal-tax-2025';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency } from '../../lib/format';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';

export default function EICalculator() {
  const [gross, setGross] = useState(75000);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ gross: 'number', prov: 'string' });
    if (p.gross) setGross(p.gross);
    if (p.prov) setProvinceCode(p.prov);
  }, []);

  const isQuebec = PROVINCES[provinceCode]?.isQuebec ?? false;
  const result = useMemo(() => calculateEIContribution(gross, isQuebec), [gross, isQuebec]);

  useEffect(() => {
    writeUrlParams({ gross, prov: provinceCode });
  }, [gross, provinceCode]);

  const eiRate = isQuebec ? EI_RATE_QUEBEC : EI_RATE;
  const eiMax = isQuebec ? EI_MAX_CONTRIBUTION_QUEBEC : EI_MAX_CONTRIBUTION;

  const barSegments = [
    { label: 'EI', value: result.ei, color: '#db2777' },
    ...(result.qpip > 0 ? [{ label: 'QPIP', value: result.qpip, color: '#0891b2' }] : []),
    { label: 'Remaining', value: gross - result.total, color: '#16a34a' },
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
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>EI Rate:</strong> {(eiRate * 100).toFixed(3)}%</p>
            <p><strong>Max Insurable Earnings:</strong> {formatCurrency(EI_MAX_INSURABLE_EARNINGS)}</p>
            <p><strong>Max EI Premium:</strong> {formatCurrency(eiMax)}</p>
            {isQuebec && (
              <>
                <hr className="border-gray-200 dark:border-gray-600 my-2" />
                <p><strong>QPIP Rate:</strong> {(QPIP_RATE * 100).toFixed(3)}%</p>
                <p><strong>Max QPIP Earnings:</strong> {formatCurrency(QPIP_MAX_INSURABLE_EARNINGS)}</p>
                <p><strong>Max QPIP Premium:</strong> {formatCurrency(QPIP_MAX_CONTRIBUTION)}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-6 py-8 text-center">
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Your EI{isQuebec ? ' + QPIP' : ''} Premiums</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(result.total)}</p>
            <p className="mt-1 text-brand-200 text-sm">EI: {formatCurrency(result.ei)}{isQuebec ? ` + QPIP: ${formatCurrency(result.qpip)}` : ''}</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Gross Income</span><span className="font-medium tabular-nums text-gray-900 dark:text-white">{formatCurrency(gross)}</span></div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">EI Premium</span><span className="tabular-nums text-red-600 dark:text-red-400">{formatCurrency(result.ei)}</span></div>
            {isQuebec && (
              <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">QPIP Premium</span><span className="tabular-nums text-red-600 dark:text-red-400">{formatCurrency(result.qpip)}</span></div>
            )}
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm font-semibold"><span className="text-brand-600 dark:text-brand-400">Total Premiums</span><span className="tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(result.total)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Premiums vs Remaining Income</h3>
          <BreakdownBar segments={barSegments} total={gross} />
        </div>
      </div>
    </div>
  );
}
