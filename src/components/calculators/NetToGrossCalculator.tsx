import { useState, useEffect, useMemo } from 'react';
import { calculateRequiredGross, calculateTakeHome } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency } from '../../lib/format';
import InputField from '../ui/InputField';
import ResultPanel from '../ui/ResultPanel';

export default function NetToGrossCalculator() {
  const [targetNet, setTargetNet] = useState(50000);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ net: 'number', prov: 'string' });
    if (p.net) setTargetNet(p.net);
    if (p.prov) setProvinceCode(p.prov);
  }, []);

  const requiredGross = useMemo(() =>
    calculateRequiredGross(targetNet, provinceCode),
    [targetNet, provinceCode]
  );

  const result = useMemo(() =>
    calculateTakeHome({ grossAnnual: requiredGross, provinceCode, payFrequency: 'annual' }),
    [requiredGross, provinceCode]
  );

  useEffect(() => {
    writeUrlParams({ net: targetNet, prov: provinceCode });
  }, [targetNet, provinceCode]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Take-Home Pay</h2>
          <InputField label="Desired Annual Net Salary" value={targetNet} onChange={setTargetNet} prefix="$" suffix="/year" help="Enter the after-tax amount you want to receive (CAD)" />
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Territory</label>
            <select id="province" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {ALL_PROVINCES.map((c) => <option key={c} value={c}>{PROVINCES[c].name}</option>)}
            </select>
          </div>
          <div className="mt-6 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4 border border-brand-200 dark:border-brand-800">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Required Gross Salary</p>
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 tabular-nums mt-1">{formatCurrency(requiredGross)}</p>
            <p className="text-xs text-brand-500 mt-1">You need to earn {formatCurrency(requiredGross)} gross to take home {formatCurrency(targetNet)}</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <ResultPanel result={result} />
      </div>
    </div>
  );
}
