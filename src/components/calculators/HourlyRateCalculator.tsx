import { useState, useEffect, useMemo } from 'react';
import { hourlyToAnnual, calculateTakeHome } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency } from '../../lib/format';
import InputField from '../ui/InputField';
import ResultPanel from '../ui/ResultPanel';

interface Props {
  lang?: 'en' | 'fr';
}

export default function HourlyRateCalculator({ lang = 'en' }: Props) {
  const [hourly, setHourly] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ hourly: 'number', hours: 'number', prov: 'string' });
    if (p.hourly) setHourly(p.hourly);
    if (p.hours) setHoursPerWeek(p.hours);
    if (p.prov) setProvinceCode(p.prov);
  }, []);

  const annual = useMemo(() => hourlyToAnnual(hourly, hoursPerWeek), [hourly, hoursPerWeek]);
  const result = useMemo(() => calculateTakeHome({ grossAnnual: annual, provinceCode, payFrequency: 'annual' }), [annual, provinceCode]);

  useEffect(() => {
    writeUrlParams({ hourly, hours: hoursPerWeek, prov: provinceCode });
  }, [hourly, hoursPerWeek, provinceCode]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hourly Wage Details</h2>
          <InputField label="Hourly Rate" value={hourly} onChange={setHourly} prefix="$" suffix="/hour" min={1} step={1} />
          <InputField label="Hours Per Week" value={hoursPerWeek} onChange={setHoursPerWeek} prefix="" suffix="hrs" min={1} max={80} step={1} />
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Territory</label>
            <select id="province" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {ALL_PROVINCES.map((c) => <option key={c} value={c}>{PROVINCES[c].name}</option>)}
            </select>
          </div>
          <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-4 border border-brand-200 dark:border-brand-800">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Equivalent Annual Salary</p>
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 tabular-nums mt-1">{formatCurrency(annual)}</p>
            <p className="text-xs text-brand-500 mt-1">${hourly}/hr x {hoursPerWeek}hrs x 52 weeks</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <ResultPanel result={result} lang={lang} />
      </div>
    </div>
  );
}
