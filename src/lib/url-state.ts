/**
 * URL state management, encode/decode calculator parameters in the URL hash
 */

export interface UrlConfig {
  [key: string]: 'number' | 'string';
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function readUrlParams(config: UrlConfig): Record<string, any> {
  if (typeof window === 'undefined') return {};

  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const result: Record<string, any> = {};

  for (const [key, type] of Object.entries(config)) {
    const value = params.get(key);
    if (value !== null) {
      result[key] = type === 'number' ? parseFloat(value) : value;
    }
  }

  return result;
}

// The address bar stays exactly the page URL (sitemap, canonical, trailing slash) until the
// visitor does something: calculators call writeUrlParams from effects that also run on mount.
// RECETTE-SITE.md §18.1, check-url-propre.mjs.
let interacted = false;
if (typeof window !== 'undefined') {
  const mark = () => { interacted = true; };
  for (const t of ['input', 'change', 'click', 'keydown']) document.addEventListener(t, mark, { once: true, capture: true });
}

export function writeUrlParams(values: Record<string, any>): void {
  if (typeof window === 'undefined' || !interacted) return;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
    const hash = params.toString();
    if (hash) {
      // Appel sur le prototype : un outil de mesure (Clarity) qui surveille history.replaceState
      // ne voit pas ce changement, et les valeurs saisies ne quittent donc pas le navigateur.
      History.prototype.replaceState.call(window.history, null, '', `#${hash}`);
    }
  }, 300);
}
