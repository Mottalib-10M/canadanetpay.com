import { useState, useEffect, useMemo } from 'react';
import { oasPension, recoveryTax } from '../../lib/oas-engine';
import { OAS_FULL_MONTHLY, OAS_75_PUBLISHED, OAS_QUARTER, OAS_MIN_YEARS, OAS_FULL_YEARS, RECOVERY_YEARS } from '../../data/oas-2026';

const REC2026 = RECOVERY_YEARS.find((y) => y.incomeYear === 2026)!;
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import InputField from '../ui/InputField';
import { Select, FormCard, Headline, Line, ResultCard, Body, Rule, Note, money, dollars, START_AGES, EXTRA_MONTHS, AGE_BANDS } from './oas-ui';

const RULES: Record<string, string> = {
  'no-deferral': 'pension from 65',
  'partial-deferred': 'residence at 65, raised 0.6 % per month deferred',
  'partial-at-approval': 'more years of residence at the later start, no deferral increase',
  'full-deferred': 'full pension, raised 0.6 % per month after reaching 40 years',
  none: 'fewer than 10 years in Canada after 18',
};

export default function OASCalculator() {
  const [years, setYears] = useState(40);
  const [startAge, setStartAge] = useState(65);
  const [extra, setExtra] = useState(0);
  const [band, setBand] = useState('under75');
  const [income, setIncome] = useState(60000);

  useEffect(() => {
    const p = readUrlParams({ y: 'number', a: 'number', m: 'number', b: 'string', i: 'number' });
    if (p.y !== undefined) setYears(p.y);
    if (p.a) setStartAge(p.a);
    if (p.m !== undefined) setExtra(p.m);
    if (p.b) setBand(p.b);
    if (p.i !== undefined) setIncome(p.i);
  }, []);
  useEffect(() => { writeUrlParams({ y: years, a: startAge, m: extra, b: band, i: income }); }, [years, startAge, extra, band, income]);

  const months = Math.min(60, (startAge - 65) * 12 + (startAge === 70 ? 0 : extra));
  const r = useMemo(() => oasPension({ yearsAt65: years, deferralMonths: months, age75: band === '75plus' }), [years, months, band]);
  const at65 = useMemo(() => oasPension({ yearsAt65: years, age75: band === '75plus' }), [years, band]);
  const rec = useMemo(() => recoveryTax(income + r.annual, r.annual, 2026), [income, r.annual]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <FormCard title="Your situation">
          <InputField label="Years lived in Canada after age 18" value={years} onChange={setYears} prefix="" suffix="years" help={`Count at 65. ${OAS_MIN_YEARS} years opens a partial pension, ${OAS_FULL_YEARS} gives the full one; more than 40 still counts as 40.`} />
          <Select id="oas-start" label="Age you start OAS" value={startAge} onChange={setStartAge} options={START_AGES} help="Each month of delay after 65 adds 0.6 %, up to 36 % at 70." />
          {startAge > 65 && startAge < 70 && (
            <Select id="oas-extra" label="Plus extra months" value={extra} onChange={setExtra} options={EXTRA_MONTHS} />
          )}
          <Select id="oas-band" label="Your age now" value={band} onChange={setBand} options={AGE_BANDS} help="The pension rises 10 % from the month after your 75th birthday." />
          <InputField label="Other net income for the year" value={income} onChange={setIncome} suffix="/year" help="CPP, pensions, RRIF, work, investments: line 23400 without OAS. Used only for the recovery tax." />
        </FormCard>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <ResultCard>
          <Headline label="Your OAS pension per month" value={money(r.monthly)} sub={<>{OAS_QUARTER} &middot; {money(r.annual)} a year</>} />
          <Body>
            <Line label="Full pension this quarter" value={money(band === '75plus' ? OAS_75_PUBLISHED : OAS_FULL_MONTHLY)} muted />
            <Line label={`Residence fraction (${r.yearsUsed}/40)`} value={r.eligible ? `${(r.fraction * 100).toFixed(1)} %` : 'not eligible'} />
            <Line label="Deferral increase" value={r.deferralFactor > 1 ? `+${((r.deferralFactor - 1) * 100).toFixed(1)} %` : 'none'} />
            <Line label="Rule applied" value={RULES[r.eligible ? r.rule : 'none']} muted />
            <Rule />
            <Line label="If you started at 65 instead" value={money(at65.monthly)} />
            <Line label={`Recovery tax withheld (income year 2026)`} value={rec.monthly > 0 ? `−${money(rec.monthly)}` : money(0)} />
            <Line label="OAS kept per month after recovery tax" value={money(Math.max(0, r.monthly - rec.monthly))} strong />
          </Body>
        </ResultCard>
        <Note>
          Amounts for {OAS_QUARTER}, indexed every quarter. The calculator assumes you keep living in Canada while you defer, so each extra year of residence counts, and it keeps the highest of the three amounts the Old Age Security Act allows (s. 7.1(3)). Recovery tax: 15 % of net income above {dollars(REC2026.threshold)} for 2026, withheld from {REC2026.period}.
          {' '}<a href="/methodology/#oas" className="underline">How this is calculated</a>.
        </Note>
      </div>
    </div>
  );
}
