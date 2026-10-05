import { useState, useEffect, useMemo } from 'react';
import { recoveryTax } from '../../lib/oas-engine';
import { OAS_FULL_MONTHLY, OAS_75_PUBLISHED, RECOVERY_YEARS, RECOVERY_RATE } from '../../data/oas-2026';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import InputField from '../ui/InputField';
import BreakdownBar from '../ui/BreakdownBar';
import { Select, FormCard, Headline, Line, ResultCard, Body, Rule, Note, money, dollars, AGE_BANDS } from './oas-ui';

const YEARS = RECOVERY_YEARS.map((y) => ({ value: y.incomeYear, label: `${y.incomeYear} income (withheld ${y.period})` }));

export default function ClawbackCalculator() {
  const [netIncome, setNetIncome] = useState(110000);
  const [year, setYear] = useState(2026);
  const [band, setBand] = useState('under75');
  const [oasYear, setOasYear] = useState(Math.round(OAS_FULL_MONTHLY * 12));

  useEffect(() => {
    const p = readUrlParams({ n: 'number', y: 'number', b: 'string', o: 'number' });
    if (p.n !== undefined) setNetIncome(p.n);
    if (p.y && RECOVERY_YEARS.some((r) => r.incomeYear === p.y)) setYear(p.y);
    if (p.b) setBand(p.b);
    if (p.o !== undefined) setOasYear(p.o);
  }, []);
  useEffect(() => { writeUrlParams({ n: netIncome, y: year, b: band, o: oasYear }); }, [netIncome, year, band, oasYear]);

  const row = RECOVERY_YEARS.find((r) => r.incomeYear === year)!;
  const r = useMemo(() => recoveryTax(netIncome, oasYear, year), [netIncome, oasYear, year]);
  const fullAt = band === '75plus' ? row.max75 : row.max6574;
  const kept = Math.max(0, oasYear - r.annual);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <FormCard title="Your income">
          <InputField label="Net world income (line 23400)" value={netIncome} onChange={setNetIncome} suffix="/year" help="Includes your OAS, CPP, pensions, RRIF, salary and the taxable part of capital gains and dividends." />
          <Select id="claw-year" label="Income year" value={year} onChange={setYear} options={YEARS} />
          <InputField label="OAS you receive in that year" value={oasYear} onChange={setOasYear} suffix="/year" help={`A full pension paid all year is about ${dollars(OAS_FULL_MONTHLY * 12)} at 65-74, ${dollars(OAS_75_PUBLISHED * 12)} at 75+ at the current rate.`} />
          <Select id="claw-band" label="Your age" value={band} onChange={setBand} options={AGE_BANDS} />
        </FormCard>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <ResultCard>
          <Headline label="OAS recovery tax for the year" value={money(r.annual)} sub={<>{money(r.monthly)} withheld each month, {row.period}</>} />
          <Body>
            <Line label={`Threshold for ${year} income`} value={dollars(row.threshold)} />
            <Line label="Income above the threshold" value={dollars(r.excess)} />
            <Line label={`× ${Math.round(RECOVERY_RATE * 100)} %`} value={money(r.excess * RECOVERY_RATE)} muted />
            <Line label="Capped at the OAS received" value={r.full ? 'yes, all of it is repaid' : 'no'} muted />
            <Line label="Whole pension recovered from (published)" value={dollars(fullAt)} muted />
            <Rule />
            <Line label="OAS you keep for the year" value={money(kept)} strong />
          </Body>
        </ResultCard>
        {oasYear > 0 && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Your OAS for the year</h3>
            <BreakdownBar segments={[
              { label: 'Kept', value: kept, color: '#15803d' },
              { label: 'Recovery tax', value: r.annual, color: '#a8041a' },
            ]} total={oasYear} />
          </div>
        )}
        <Note>
          The repayment is entered on line 23500 of the return for the income year; Service Canada then withholds it from each OAS payment over the following July to June. The &ldquo;whole pension recovered&rdquo; incomes are those Service Canada publishes for the recovery period; they move with the quarterly OAS amount. <a href="/methodology/#oas" className="underline">Method</a>.
        </Note>
      </div>
    </div>
  );
}
