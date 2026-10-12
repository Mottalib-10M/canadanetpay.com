/**
 * Chiffre clé d'un calculateur, marqué `data-resultat` (RECETTE §5, règle du 2026-10-11 :
 * le simulateur et son résultat se voient sans défiler).
 * Sur téléphone, tant que ce bloc est sous l'écran, une barre collée en bas rappelle le
 * libellé et le chiffre ; elle n'existe que côté client (rien de dupliqué dans le HTML).
 */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/** Vrai tant que l'élément est sous le bas de l'écran. */
export function useBelow(ref: RefObject<HTMLElement | null>) {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setBelow(!e.isIntersecting && e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return below;
}

export function PhoneBar({ show, label, value, target }: { show: boolean; label: ReactNode; value: ReactNode; target: RefObject<HTMLElement | null> }) {
  if (!show) return null;
  return (
    <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      className="fixed inset-x-0 bottom-0 z-40 flex items-baseline justify-between gap-3 border-t border-brand-600 bg-brand-500 px-4 py-3 text-left shadow-lg lg:hidden">
      <span className="text-sm font-medium text-brand-100">{label}</span>
      <span className="tabular-nums text-xl font-bold text-white">{value}</span>
    </button>
  );
}

export function Headline({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const below = useBelow(ref);
  return (
    <div ref={ref} data-resultat className="bg-brand-500 px-6 py-8 text-center">
      <p className="text-sm font-medium text-brand-100 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-4xl sm:text-5xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-brand-200 text-sm">{sub}</p>}
      <PhoneBar show={below} label={label} value={value} target={ref} />
    </div>
  );
}
