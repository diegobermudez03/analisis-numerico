import type { Fmt } from './types';

const SUP: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

/** Formatea con `d` decimales sin redondear internamente los cálculos (solo la vista). */
function raw(x: number, d: number): string {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '-∞';
  if (x === 0) return '0';
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return String(x);
  const ax = Math.abs(x);
  // Valores muy pequeños o muy grandes en notación científica para no mostrar 0.000000.
  if (ax < 1e-4 || ax >= 1e10) return x.toExponential(Math.max(2, Math.min(d, 8) - 2));
  return x.toFixed(d);
}

export function makeFmt(d: number): Fmt {
  const n = (x: number) => {
    const s = raw(x, d);
    const m = s.match(/^(-?[\d.]+)e([+-]\d+)$/);
    if (!m) return s;
    const exp = String(Number(m[2])).split('').map((c) => SUP[c]).join('');
    return `${m[1]}×10${exp}`;
  };
  const t = (x: number) => {
    const s = raw(x, d);
    if (s === '∞') return '\\infty';
    if (s === '-∞') return '-\\infty';
    const m = s.match(/^(-?[\d.]+)e([+-]\d+)$/);
    return m ? `${m[1]}\\times 10^{${Number(m[2])}}` : s;
  };
  const p = (x: number) => (x < 0 ? `(${t(x)})` : t(x));
  return { n, t, p };
}

/** Suma en LaTeX; si hay muchos términos se abrevia con puntos suspensivos. */
export function sumTex(terms: string[], max = 10): string {
  if (terms.length === 0) return '0';
  if (terms.length <= max) return terms.join(' + ');
  return [...terms.slice(0, 5), '\\cdots', ...terms.slice(-3)].join(' + ');
}

/** Vector en LaTeX como tupla. */
export function vecTex(v: number[], F: Fmt): string {
  return `\\left(${v.map(F.t).join(',\\ ')}\\right)`;
}
