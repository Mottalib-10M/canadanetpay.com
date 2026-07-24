import { useId, useState, useEffect, useRef } from 'react';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

/** Format integer with space as thousands separator: 75000 → "75 000" */
function fmtNum(n: number): string {
  if (!n) return '';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default function InputField({ label, value, onChange, prefix = '$', suffix, min = 0, max, step = 1000, help }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState(fmtNum(value));

  // Sync display when value changes externally (not while user is typing)
  useEffect(() => {
    if (inputRef.current && inputRef.current === document.activeElement) return;
    setDisplay(fmtNum(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const pos = el.selectionStart ?? 0;
    const oldVal = el.value;

    // Strip all whitespace to get raw digits
    const raw = oldVal.replace(/\s/g, '');
    if (raw === '') { setDisplay(''); onChange(0); return; }

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    onChange(num);
    const formatted = fmtNum(num);
    setDisplay(formatted);

    // Restore cursor: count digits before old cursor, find same position in formatted string
    const digitsBeforeCursor = oldVal.slice(0, pos).replace(/\s/g, '').length;
    let newPos = 0, counted = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (counted >= digitsBeforeCursor) break;
      if (formatted[i] !== ' ') counted++;
      newPos = i + 1;
    }
    requestAnimationFrame(() => { el.setSelectionRange(newPos, newPos); });
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 dark:text-gray-400 pointer-events-none font-medium">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={() => setDisplay(fmtNum(value))}
          className={`w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface py-3 text-lg font-medium tabular-nums text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors ${prefix ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-16' : 'pr-4'}`}
          aria-describedby={help ? `${id}-help` : undefined}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 dark:text-gray-400 pointer-events-none text-sm">
            {suffix}
          </span>
        )}
      </div>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{help}</p>
      )}
    </div>
  );
}
