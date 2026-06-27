import { useState, useEffect, useMemo } from 'react';
import { hourlyToAnnual, annualToHourly, calculateTakeHome } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency, formatPercent } from '../../lib/format';
import InputField from '../ui/InputField';

export default function HourlyToSalaryCalculator() {
  const [hourly, setHourly] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ hourly: 'number' as const, hours: 'number' as const, prov: 'string' as const });
    if (p.hourly) setHourly(p.hourly);
    if (p.hours) setHoursPerWeek(p.hours);
    if (p.prov && PROVINCES[p.prov]) setProvinceCode(p.prov);
  }, []);

  const annual = useMemo(() => hourlyToAnnual(hourly, hoursPerWeek), [hourly, hoursPerWeek]);
  const result = useMemo(
    () => calculateTakeHome({ grossAnnual: annual, provinceCode, payFrequency: 'bi_weekly' }),
    [annual, provinceCode],
  );
  const netHourly = annualToHourly(result.netAnnual, hoursPerWeek);

  useEffect(() => {
    writeUrlParams({ hourly, hours: hoursPerWeek, prov: provinceCode });
  }, [hourly, hoursPerWeek, provinceCode]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hourly Wage Details</h2>
          <InputField label="Hourly Rate" value={hourly} onChange={setHourly} prefix="$" suffix="/hr" step={1} />
          <InputField label="Hours per Week" value={hoursPerWeek} onChange={setHoursPerWeek} prefix="" suffix="hrs" step={1} min={1} max={80} />
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
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Annual Salary Equivalent</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(annual)}</p>
            <p className="mt-1 text-brand-200 text-sm">${hourly}/hr &times; {hoursPerWeek} hrs/wk &times; 52 weeks</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross Hourly</span>
              <span className="font-medium tabular-nums text-gray-900 dark:text-white">${hourly.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross Annual</span>
              <span className="font-medium tabular-nums text-gray-900 dark:text-white">{formatCurrency(annual)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross Monthly</span>
              <span className="tabular-nums text-gray-900 dark:text-white">{formatCurrency(annual / 12)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gross Bi-Weekly</span>
              <span className="tabular-nums text-gray-900 dark:text-white">{formatCurrency(annual / 26)}</span>
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Net Annual ({PROVINCES[provinceCode]?.name})</span>
              <span className="tabular-nums font-medium text-green-600 dark:text-green-400">{formatCurrency(result.netAnnual)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Net Monthly</span>
              <span className="tabular-nums text-green-600 dark:text-green-400">{formatCurrency(result.netMonthly)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Net Bi-Weekly</span>
              <span className="tabular-nums text-green-600 dark:text-green-400">{formatCurrency(result.netBiWeekly)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Net Hourly</span>
              <span className="tabular-nums font-medium text-green-600 dark:text-green-400">${netHourly.toFixed(2)}/hr</span>
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Effective Tax Rate</span>
              <span className="tabular-nums font-medium">{formatPercent(result.effectiveTaxRate)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-5 py-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Conversion Table</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-5 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">Hourly Rate</th>
                <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Annual Salary</th>
                <th className="px-5 py-2.5 text-right text-gray-500 dark:text-gray-400 font-medium">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {[15, 20, 25, 30, 35, 40, 50, 60, 75, 100].map((h, i) => {
                const a = hourlyToAnnual(h, hoursPerWeek);
                return (
                  <tr key={h} className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-800/30'}`}>
                    <td className="px-5 py-2 text-gray-700 dark:text-gray-300">${h}/hr</td>
                    <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrency(a)}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-gray-600 dark:text-gray-400">{formatCurrency(a / 12)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
