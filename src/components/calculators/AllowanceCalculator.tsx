import { useState, useEffect, useMemo } from 'react';
import { allowance, allowanceSurvivor, gis, gisIncome } from '../../lib/oas-engine';
import { OAS_QUARTER, PUBLISHED_CUTOFFS } from '../../data/oas-2026';
import { readUrlParams, writeUrlParams } from '../../lib/url-state';
import InputField from '../ui/InputField';
import { Select, FormCard, Headline, Line, ResultCard, Body, Rule, Note, money, dollars } from './oas-ui';

const KINDS = [
  { value: 'allowance', label: 'Allowance: my spouse or partner receives OAS and GIS' },
  { value: 'survivor', label: 'Allowance for the Survivor: my spouse or partner has died' },
];

export default function AllowanceCalculator() {
  const [kind, setKind] = useState('allowance');
  const [own, setOwn] = useState(4000);
  const [earnings, setEarnings] = useState(0);
  const [partner, setPartner] = useState(9600);

  useEffect(() => {
    const p = readUrlParams({ k: 'string', o: 'number', e: 'number', p: 'number' });
    if (p.k === 'allowance' || p.k === 'survivor') setKind(p.k);
    if (p.o !== undefined) setOwn(p.o);
    if (p.e !== undefined) setEarnings(p.e);
    if (p.p !== undefined) setPartner(p.p);
  }, []);
  useEffect(() => { writeUrlParams({ k: kind, o: own, e: earnings, p: partner }); }, [kind, own, earnings, partner]);

  const survivor = kind === 'survivor';
  const mine = gisIncome(own, earnings);
  const income = survivor ? mine : mine + partner;
  const r = useMemo(() => (survivor ? allowanceSurvivor(income) : allowance(income)), [survivor, income]);
  const partnerGis = survivor ? 0 : gis('spouse-allowance', income).monthly;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <FormCard title="You are 60 to 64">
          <Select id="alw-kind" label="Which benefit" value={kind} onChange={setKind} options={KINDS} help="Both require 10 years in Canada after 18 and living in Canada." />
          <InputField label="Your income, without OAS benefits" value={own} onChange={setOwn} suffix="/year" help="CPP or QPP (including a survivor's pension), pensions, RRSP withdrawals, interest. Last year's figures." />
          <InputField label="Your employment or self-employment income" value={earnings} onChange={setEarnings} suffix="/year" help="The first $5,000 and half of the next $10,000 are not counted." />
          {!survivor && <InputField label="Your spouse's income, without OAS or GIS" value={partner} onChange={setPartner} suffix="/year" help="Their CPP, pensions and other income, after their own earnings exemption." />}
        </FormCard>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <ResultCard>
          <Headline label={survivor ? 'Allowance for the Survivor per month' : 'Your Allowance per month'} value={money(r.monthly)} sub={<>{OAS_QUARTER} &middot; tax-free &middot; {money(r.annual)} a year</>} />
          <Body>
            <Line label={survivor ? 'Income counted' : 'Combined income counted'} value={dollars(income)} />
            <Line label="Basic amount" value={money(r.basic)} />
            <Line label="Top-up" value={money(r.topUp)} />
            <Line label="Maximum" value={money(r.max)} muted />
            <Line label="Paid until an income of" value={dollars(survivor ? PUBLISHED_CUTOFFS.afs : PUBLISHED_CUTOFFS.allowance)} muted />
            {!survivor && (<><Rule /><Line label="Your spouse's GIS at this income" value={money(partnerGis)} /><Line label="Allowance + spouse's GIS" value={money(r.monthly + partnerGis)} strong /></>)}
          </Body>
        </ResultCard>
        <Note>
          The first part of the benefit replaces an OAS pension and falls by $3 for every $4 of monthly income; once it is gone, the supplement part falls by $1 for every $4 of combined income (Allowance) or $1 for every $2 (survivor). The benefit stops at 65, when OAS and GIS take over. <a href="/methodology/#oas" className="underline">Method</a>.
        </Note>
      </div>
    </div>
  );
}
