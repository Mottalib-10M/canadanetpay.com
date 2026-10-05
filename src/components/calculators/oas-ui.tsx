/**
 * Building blocks shared by the Old Age Security calculators. They follow the
 * look of the existing calculators (CPPCalculator): a form card on the left,
 * a red headline card and a line-by-line breakdown on the right. Benefit
 * amounts are shown to the cent, because Service Canada pays and publishes
 * them to the cent.
 */
import type { ReactNode } from 'react';
import { formatCurrencyLang } from '../../lib/format';

export const money = (x: number) => formatCurrencyLang(x, 'en', true);
export const dollars = (x: number) => formatCurrencyLang(x, 'en');

const selectClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500';

export function Select<T extends string | number>({ id, label, value, onChange, options, help }: {
  id: string; label: string; value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string }>; help?: string;
}) {
  const numeric = typeof value === 'number';
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select id={id} value={String(value)} onChange={(e) => onChange((numeric ? Number(e.target.value) : e.target.value) as T)} className={selectClass} aria-describedby={help ? `${id}-help` : undefined}>
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
      {help && <p id={`${id}-help`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{help}</p>}
    </div>
  );
}

export function FormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-6 space-y-1">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function Headline({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div className="bg-brand-500 px-6 py-8 text-center">
      <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-brand-200 text-sm">{sub}</p>}
    </div>
  );
}

export function Line({ label, value, strong, muted }: { label: ReactNode; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? 'font-semibold' : ''}`}>
      <span className={strong ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}>{label}</span>
      <span className={`tabular-nums text-right ${strong ? 'text-brand-600 dark:text-brand-400' : muted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{value}</span>
    </div>
  );
}

export function ResultCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface overflow-hidden">{children}</div>;
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="px-6 py-5 space-y-3">{children}</div>;
}

export const Rule = () => <hr className="border-gray-100 dark:border-gray-700" />;

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{children}</p>;
}

export const START_AGES = [65, 66, 67, 68, 69, 70].map((a) => ({ value: a, label: a === 65 ? '65 (no deferral)' : `${a}` }));
export const EXTRA_MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i, label: i === 0 ? '0 months' : `${i} month${i > 1 ? 's' : ''}` }));
export const AGE_BANDS = [{ value: 'under75', label: '65 to 74' }, { value: '75plus', label: '75 or older' }];
