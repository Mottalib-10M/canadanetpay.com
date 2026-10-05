import { useState, useEffect, useMemo } from 'react';
import { gis, gisIncome, oasPension, allowance, GIS_SITUATIONS, type GisSituation } from '../../lib/oas-engine';
import { OAS_QUARTER, PUBLISHED_CUTOFFS } from '../../data/oas-2026';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';
import { Select, FormCard, Headline, Line, ResultCard, Body, Rule, Note, money, dollars } from './oas-ui';

const CUTOFF: Record<GisSituation, number> = {
  single: PUBLISHED_CUTOFFS.gisSingle,
  'spouse-oas': PUBLISHED_CUTOFFS.gisSpouseOas,
  // Above the $42,768 at which the Allowance stops, the pensioner moves to the
  // « spouse receives neither » scale (OASA s. 22(6)), so GIS itself goes on.
  'spouse-allowance': PUBLISHED_CUTOFFS.gisSpouseNoOas,
  'spouse-none': PUBLISHED_CUTOFFS.gisSpouseNoOas,
};

export default function GISCalculator() {
  const [situation, setSituation] = useState<GisSituation>('single');
  const [other, setOther] = useState(9600);
  const [earnings, setEarnings] = useState(0);
  const [spouse, setSpouse] = useState(6000);
  const [years, setYears] = useState(40);

  useEffect(() => {
    const p = readUrlParams({ s: 'string', o: 'number', e: 'number', p: 'number', y: 'number' });
    if (p.s && GIS_SITUATIONS.some((x) => x.value === p.s)) setSituation(p.s);
    if (p.o !== undefined) setOther(p.o);
    if (p.e !== undefined) setEarnings(p.e);
    if (p.p !== undefined) setSpouse(p.p);
    if (p.y !== undefined) setYears(p.y);
  }, []);
  useEffect(() => { writeUrlParams({ s: situation, o: other, e: earnings, p: spouse, y: years }); }, [situation, other, earnings, spouse, years]);

  const couple = situation !== 'single';
  const own = gisIncome(other, earnings);
  const income = couple ? own + spouse : own;
  const oas = useMemo(() => oasPension({ yearsAt65: years }), [years]);
  const r = useMemo(() => gis(situation, income, oas.basePension), [situation, income, oas.basePension]);
  const alw = situation === 'spouse-allowance' ? allowance(income).monthly : 0;
  const exempt = other + earnings - own;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <FormCard title="Your household">
          <Select id="gis-situation" label="Marital situation" value={situation} onChange={setSituation} options={GIS_SITUATIONS} help="A common-law partner counts after one year of living together." />
          <InputField label="Your income, without OAS or GIS" value={other} onChange={setOther} suffix="/year" help="CPP or QPP, workplace pension, RRIF, interest, rent, foreign pensions. Last year's figures." />
          <InputField label="Your employment or self-employment income" value={earnings} onChange={setEarnings} suffix="/year" help="The first $5,000 and half of the next $10,000 are not counted." />
          {couple && <InputField label="Your spouse's income, without OAS, GIS or Allowance" value={spouse} onChange={setSpouse} suffix="/year" help="Enter it after the same earnings exemption." />}
          <InputField label="Your years in Canada after 18" value={years} onChange={setYears} prefix="" suffix="years" help="A partial OAS pension raises GIS by the missing part of the pension." />
        </FormCard>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <ResultCard>
          <Headline label="Your GIS per month" value={money(oas.eligible ? r.monthly : 0)} sub={<>{OAS_QUARTER} &middot; tax-free &middot; {money(oas.eligible ? r.annual : 0)} a year</>} />
          <Body>
            <Line label={couple ? 'Combined income counted' : 'Income counted'} value={dollars(income)} />
            {exempt > 0 && <Line label="Earnings exemption applied" value={`−${dollars(exempt)}`} muted />}
            <Line label="Basic supplement" value={money(oas.eligible ? r.basic : 0)} />
            <Line label="Top-up" value={money(oas.eligible ? r.topUp : 0)} />
            <Line label="Maximum for your situation" value={money(r.max)} muted />
            <Line label={couple ? 'GIS stops at a combined income of' : 'GIS stops at an income of'} value={dollars(CUTOFF[situation])} muted />
            <Rule />
            <Line label="Your OAS pension" value={money(oas.monthly)} />
            {situation === 'spouse-allowance' && <Line label="Your spouse's Allowance" value={money(alw)} />}
            <Line label="OAS + GIS per month" value={money(oas.monthly + (oas.eligible ? r.monthly : 0))} strong />
          </Body>
        </ResultCard>
        {oas.eligible && r.max > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">GIS kept against the maximum</h3>
            <BreakdownBar segments={[
              { label: 'Basic supplement', value: r.basic, color: '#a8041a' },
              { label: 'Top-up', value: r.topUp, color: '#ea7c86' },
              { label: 'Reduced by income', value: Math.max(0, r.max - r.monthly), color: '#d1d5db' },
            ]} total={r.max} />
          </div>
        )}
        <Note>
          {oas.eligible ? 'GIS is reduced by $1 for every $2 of income for a single person ($1 for every $4 of combined income for each spouse), and the top-up by $1 for every $4 above the first $2,000 ($4,000 for a couple), with the roundings of the Old Age Security Act.' : 'GIS is paid only to people who receive an OAS pension: at least 10 years in Canada after 18.'}
          {' '}<a href="/methodology/#oas" className="underline">Method</a>.
        </Note>
      </div>
    </div>
  );
}
