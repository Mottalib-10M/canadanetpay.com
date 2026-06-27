import { useState, useEffect, useMemo } from 'react';
import { calculateBonus } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency } from '../../lib/format';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';

export default function BonusCalculator() {
  const [salary, setSalary] = useState(75000);
  const [bonus, setBonus] = useState(10000);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ salary: 'number', bonus: 'number', prov: 'string' });
    if (p.salary) setSalary(p.salary);
    if (p.bonus) setBonus(p.bonus);
    if (p.prov) setProvinceCode(p.prov);
  }, []);

  const result = useMemo(() => calculateBonus(salary, bonus, provinceCode), [salary, bonus, provinceCode]);

  useEffect(() => {
    writeUrlParams({ salary, bonus, prov: provinceCode });
  }, [salary, bonus, provinceCode]);

  const barSegments = [
    { label: 'Federal Tax', value: result.bonusFederalTax, color: '#dc2626' },
    { label: 'CPP/QPP', value: result.bonusCPP, color: '#7c3aed' },
    { label: 'EI', value: result.bonusEI, color: '#db2777' },
    { label: 'Provincial Tax', value: result.bonusProvincialTax, color: '#ea580c' },
    { label: 'Net Bonus', value: result.bonusNet, color: '#16a34a' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bonus Details</h2>
          <InputField label="Annual Base Salary" value={salary} onChange={setSalary} prefix="$" suffix="/year" />
          <InputField label="Bonus Amount" value={bonus} onChange={setBonus} prefix="$" />
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Territory</label>
            <select id="province" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {ALL_PROVINCES.map((c) => <option key={c} value={c}>{PROVINCES[c].name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-6 py-8 text-center">
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Your Bonus After Tax</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(result.bonusNet)}</p>
            <p className="mt-1 text-brand-200 text-sm">out of {formatCurrency(bonus)} gross bonus</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Gross Bonus</span><span className="font-medium tabular-nums text-gray-900 dark:text-white">{formatCurrency(bonus)}</span></div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Federal Tax (marginal)</span><span className="tabular-nums text-red-600 dark:text-red-400">-{formatCurrency(result.bonusFederalTax)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{PROVINCES[provinceCode]?.isQuebec ? 'QPP' : 'CPP'}</span><span className="tabular-nums text-red-600 dark:text-red-400">-{formatCurrency(result.bonusCPP)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">EI{PROVINCES[provinceCode]?.isQuebec ? ' + QPIP' : ''}</span><span className="tabular-nums text-red-600 dark:text-red-400">-{formatCurrency(result.bonusEI)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{PROVINCES[provinceCode]?.name} Provincial Tax</span><span className="tabular-nums text-red-600 dark:text-red-400">-{formatCurrency(result.bonusProvincialTax)}</span></div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm font-semibold"><span className="text-brand-600 dark:text-brand-400">Net Bonus</span><span className="tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(result.bonusNet)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Bonus Breakdown</h3>
          <BreakdownBar segments={barSegments} total={bonus} />
        </div>
      </div>
    </div>
  );
}
