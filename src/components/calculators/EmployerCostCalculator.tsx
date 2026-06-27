import { useState, useEffect, useMemo } from 'react';
import { calculateCPPContribution, calculateEIContribution } from '../../lib/tax-engine-ca';
import { PROVINCES, ALL_PROVINCES } from '../../data/provinces';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import { formatCurrency } from '../../lib/format';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';

export default function EmployerCostCalculator() {
  const [gross, setGross] = useState(75000);
  const [provinceCode, setProvinceCode] = useState('ON');

  useEffect(() => {
    const p = readUrlParams({ gross: 'number' as const, prov: 'string' as const });
    if (p.gross) setGross(p.gross);
    if (p.prov && PROVINCES[p.prov]) setProvinceCode(p.prov);
  }, []);

  const isQuebec = PROVINCES[provinceCode]?.isQuebec ?? false;

  const employerCosts = useMemo(() => {
    const cppResult = calculateCPPContribution(gross, isQuebec);
    const eiResult = calculateEIContribution(gross, isQuebec);
    const employerCPP = cppResult.total;
    const employerEI = eiResult.ei * 1.4;
    const employerQPIP = isQuebec ? eiResult.qpip * (0.00692 / 0.00494) : 0;
    const wcb = gross * 0.015; // Approximate WCB rate
    const totalCost = gross + employerCPP + employerEI + employerQPIP + wcb;

    return { employerCPP, employerEI, employerQPIP, wcb, totalCost };
  }, [gross, isQuebec]);

  useEffect(() => {
    writeUrlParams({ gross, prov: provinceCode });
  }, [gross, provinceCode]);

  const barSegments = [
    { label: 'Salary', value: gross, color: '#16a34a' },
    { label: isQuebec ? 'QPP' : 'CPP', value: employerCosts.employerCPP, color: '#7c3aed' },
    { label: 'EI', value: employerCosts.employerEI, color: '#db2777' },
    ...(employerCosts.employerQPIP > 0 ? [{ label: 'QPIP', value: employerCosts.employerQPIP, color: '#0891b2' }] : []),
    { label: 'WCB (est.)', value: employerCosts.wcb, color: '#ea580c' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Details</h2>
          <InputField label="Employee Gross Salary" value={gross} onChange={setGross} prefix="$" suffix="/year" />
          <div className="mb-4">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province / Territory</label>
            <select id="province" value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
              {ALL_PROVINCES.map((c) => <option key={c} value={c}>{PROVINCES[c].name}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">WCB rates are estimated at 1.5%. Actual rates vary by industry and province.</p>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">
          <div className="bg-brand-500 px-6 py-8 text-center">
            <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">Total Employer Cost</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{formatCurrency(employerCosts.totalCost)}</p>
            <p className="mt-1 text-brand-200 text-sm">{formatCurrency(employerCosts.totalCost - gross)} above salary ({((employerCosts.totalCost / gross - 1) * 100).toFixed(1)}% overhead)</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-700 dark:text-gray-300">Employee Gross Salary</span>
              <span className="tabular-nums text-gray-900 dark:text-white">{formatCurrency(gross)}</span>
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Employer {isQuebec ? 'QPP' : 'CPP'} (matched)</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">+{formatCurrency(employerCosts.employerCPP)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Employer EI (1.4x employee)</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">+{formatCurrency(employerCosts.employerEI)}</span>
            </div>
            {employerCosts.employerQPIP > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Employer QPIP</span>
                <span className="tabular-nums text-red-600 dark:text-red-400">+{formatCurrency(employerCosts.employerQPIP)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">WCB / Workers Comp (est.)</span>
              <span className="tabular-nums text-red-600 dark:text-red-400">+{formatCurrency(employerCosts.wcb)}</span>
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-brand-600 dark:text-brand-400">Total Employer Cost</span>
              <span className="tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(employerCosts.totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Cost per Month</span>
              <span className="tabular-nums text-gray-600 dark:text-gray-400">{formatCurrency(employerCosts.totalCost / 12)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Cost Breakdown</h3>
          <BreakdownBar segments={barSegments} total={employerCosts.totalCost} />
        </div>
      </div>
    </div>
  );
}
