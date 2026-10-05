import { useState, useEffect, useMemo } from 'react';
import { retirementIncome, GIS_SITUATIONS, type GisSituation } from '../../lib/oas-engine';
import { OAS_QUARTER, CPP_MAX_RETIREMENT_65 } from '../../data/oas-2026';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';
import { Select, FormCard, Headline, Line, ResultCard, Body, Rule, Note, money, dollars, START_AGES, AGE_BANDS } from './oas-ui';

export default function RetirementIncomeCalculator() {
  const [situation, setSituation] = useState<GisSituation>('single');
  const [cpp, setCpp] = useState(900);
  const [other, setOther] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [spouse, setSpouse] = useState(9000);
  const [years, setYears] = useState(40);
  const [startAge, setStartAge] = useState(65);
  const [band, setBand] = useState('under75');

  useEffect(() => {
    const p = readUrlParams({ s: 'string', c: 'number', o: 'number', e: 'number', p: 'number', y: 'number', a: 'number', b: 'string' });
    if (p.s && GIS_SITUATIONS.some((x) => x.value === p.s)) setSituation(p.s);
    if (p.c !== undefined) setCpp(p.c);
    if (p.o !== undefined) setOther(p.o);
    if (p.e !== undefined) setEarnings(p.e);
    if (p.p !== undefined) setSpouse(p.p);
    if (p.y !== undefined) setYears(p.y);
    if (p.a) setStartAge(p.a);
    if (p.b) setBand(p.b);
  }, []);
  useEffect(() => { writeUrlParams({ s: situation, c: cpp, o: other, e: earnings, p: spouse, y: years, a: startAge, b: band }); }, [situation, cpp, other, earnings, spouse, years, startAge, band]);

  const couple = situation !== 'single';
  const r = useMemo(() => retirementIncome({
    situation, yearsAt65: years, deferralMonths: (startAge - 65) * 12, age75: band === '75plus',
    cppMonthly: cpp, otherAnnual: other, earningsAnnual: earnings, spouseAnnual: couple ? spouse : 0,
  }), [situation, years, startAge, band, cpp, other, earnings, spouse, couple]);
  const otherMonthly = (other + earnings) / 12;
  const total = r.monthlyTotal + otherMonthly;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <FormCard title="Your retirement income">
          <InputField label="Your CPP or QPP pension" value={cpp} onChange={setCpp} suffix="/month" help={`From your My Service Canada Account statement. The 2026 maximum at 65 is ${money(CPP_MAX_RETIREMENT_65)}.`} />
          <Select id="ret-situation" label="Marital situation" value={situation} onChange={setSituation} options={GIS_SITUATIONS} />
          {couple && <InputField label="Your spouse's income, without OAS, GIS or Allowance" value={spouse} onChange={setSpouse} suffix="/year" help="Their CPP and pensions included." />}
          <InputField label="Years in Canada after 18" value={years} onChange={setYears} prefix="" suffix="years" />
          <Select id="ret-start" label="Age you start OAS" value={startAge} onChange={setStartAge} options={START_AGES} help="No GIS is paid while OAS is deferred." />
          <Select id="ret-band" label="Your age now" value={band} onChange={setBand} options={AGE_BANDS} />
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">Other income</summary>
            <div className="mt-3">
              <InputField label="Workplace pension, RRIF, interest, rent" value={other} onChange={setOther} suffix="/year" />
              <InputField label="Employment or self-employment income" value={earnings} onChange={setEarnings} suffix="/year" help="The first $5,000 and half of the next $10,000 do not reduce GIS." />
            </div>
          </details>
        </FormCard>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <ResultCard>
          <Headline label="Monthly income before tax" value={money(total)} sub={<>{OAS_QUARTER} &middot; {dollars(total * 12)} a year</>} />
          <Body>
            <Line label={<a href="/cpp-calculator/" className="underline">CPP or QPP pension</a>} value={money(r.cpp)} />
            <Line label={<a href="/oas-calculator/" className="underline">Old Age Security</a>} value={money(r.oas.monthly)} />
            {r.recovery.monthly > 0 && <Line label="OAS recovery tax" value={`−${money(r.recovery.monthly)}`} />}
            <Line label={<a href="/gis-calculator/" className="underline">Guaranteed Income Supplement</a>} value={money(r.gis.monthly)} />
            {otherMonthly > 0 && <Line label="Other income" value={money(otherMonthly)} />}
            {r.spouseAllowance > 0 && <Line label="Your spouse's Allowance (paid to them)" value={money(r.spouseAllowance)} muted />}
            <Rule />
            <Line label="Total per month" value={money(total)} strong />
            <Line label="GIS lost for each extra $100 of CPP a month" value={money(r.gisLossPer100Cpp)} muted />
          </Body>
        </ResultCard>
        {total > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Where the money comes from</h3>
            <BreakdownBar segments={[
              { label: 'CPP', value: r.cpp, color: '#7c3aed' },
              { label: 'OAS', value: Math.max(0, r.oas.monthly - r.recovery.monthly), color: '#a8041a' },
              { label: 'GIS', value: r.gis.monthly, color: '#ea7c86' },
              { label: 'Other', value: otherMonthly, color: '#15803d' },
            ]} total={total} />
          </div>
        )}
        <Note>
          CPP and OAS are taxable; GIS and the Allowance are not. GIS is based on last year&rsquo;s income, so the result assumes your income is the same from one year to the next. CPP counts in full against GIS; OAS does not count at all. <a href="/methodology/#oas" className="underline">Method</a>.
        </Note>
      </div>
    </div>
  );
}
