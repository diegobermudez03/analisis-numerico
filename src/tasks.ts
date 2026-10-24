// Catálogo de las 14 tareas: entradas, ejemplo precargado y método que las resuelve.
import { compileFn, parseNumber } from './lib/expr';
import type { Fmt, Result } from './lib/types';
import { presentBisection, presentFalsePosition, presentFixedPoint, presentNewton, presentSecant } from './presentation/roots';
import { presentBackward, presentForward, presentJacobi, presentLU, presentLUP, presentLUSolve } from './presentation/linear';
import { presentLowerUpperSums, presentSimpson, presentTrapezoid } from './presentation/integration';

export type GroupKey = 'raices' | 'lineales' | 'integracion';

export const GROUPS: { key: GroupKey; name: string }[] = [
  { key: 'raices', name: 'Raíces de funciones' },
  { key: 'lineales', name: 'Sistemas lineales' },
  { key: 'integracion', name: 'Integración numérica' },
];

export interface Field {
  key: string;
  label: string; // admite $tex$
  kind: 'expr' | 'num' | 'tol' | 'int';
  fnName?: string;
  placeholder?: string;
}

export interface FormState {
  values: Record<string, string>;
  n: number;
  A: string[][];
  b: string[];
  x0: string[];
}

export interface TaskDef {
  id: number;
  name: string;
  group: GroupKey;
  formula: string; // LaTeX corto
  fields: Field[];
  matrix?: { b?: boolean; x0?: boolean; hint?: string };
  example: { values?: Record<string, string>; A?: (number | string)[][]; b?: (number | string)[]; x0?: (number | string)[] };
  solve: (v: any, F: Fmt) => Result;
}

const f: Field = { key: 'f', label: '$f(x)$', kind: 'expr', fnName: 'f', placeholder: 'x^3 + 4*x^2 - 10' };
const tol: Field = { key: 'tol', label: 'Tolerancia $\\varepsilon$', kind: 'tol', placeholder: '1e-6' };
const M: Field = { key: 'M', label: 'Máx. iteraciones $M$', kind: 'int', placeholder: '50' };
const a: Field = { key: 'a', label: '$a$', kind: 'num' };
const b: Field = { key: 'b', label: '$b$', kind: 'num' };

export const TASKS: TaskDef[] = [
  {
    id: 1, name: 'Bisección', group: 'raices',
    formula: 'p_n = \\dfrac{a_n + b_n}{2}',
    fields: [f, { key: 'a', label: '$a_0$', kind: 'num' }, { key: 'b', label: '$b_0$', kind: 'num' }, tol, M],
    example: { values: { f: 'x^3 + 4*x^2 - 10', a: '1', b: '2', tol: '1e-4', M: '50' } },
    solve: presentBisection,
  },
  {
    id: 2, name: 'Punto fijo', group: 'raices',
    formula: 'x_{n+1} = g(x_n)',
    fields: [{ key: 'g', label: '$g(x)$', kind: 'expr', fnName: 'g', placeholder: 'sqrt(10/(4+x))' }, { key: 'x0', label: '$x_0$', kind: 'num' }, tol, M],
    example: { values: { g: 'sqrt(10/(4+x))', x0: '1.5', tol: '1e-6', M: '50' } },
    solve: presentFixedPoint,
  },
  {
    id: 3, name: 'Posición falsa', group: 'raices',
    formula: 'x_n = \\dfrac{a_n f(b_n) - b_n f(a_n)}{f(b_n) - f(a_n)}',
    fields: [f, { key: 'a', label: '$a_0$', kind: 'num' }, { key: 'b', label: '$b_0$', kind: 'num' }, tol, M],
    example: { values: { f: 'cos(x) - x', a: '0.5', b: 'pi/4', tol: '1e-6', M: '50' } },
    solve: presentFalsePosition,
  },
  {
    id: 4, name: 'Newton-Raphson', group: 'raices',
    formula: "x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}",
    fields: [f, { key: 'df', label: "$f'(x)$", kind: 'expr', fnName: "f'", placeholder: '-sin(x) - 1' }, { key: 'x0', label: '$x_0$', kind: 'num' }, tol, M],
    example: { values: { f: 'cos(x) - x', df: '-sin(x) - 1', x0: 'pi/4', tol: '1e-6', M: '50' } },
    solve: presentNewton,
  },
  {
    id: 5, name: 'Secante', group: 'raices',
    formula: 'x_{n+1} = \\dfrac{x_{n-1} f(x_n) - x_n f(x_{n-1})}{f(x_n) - f(x_{n-1})}',
    fields: [f, { key: 'x0', label: '$x_0$', kind: 'num' }, { key: 'x1', label: '$x_1$', kind: 'num' }, tol, M],
    example: { values: { f: 'cos(x) - x', x0: '0.5', x1: 'pi/4', tol: '1e-6', M: '50' } },
    solve: presentSecant,
  },
  {
    id: 6, name: 'Solución hacia atrás', group: 'lineales',
    formula: 'x_i = \\dfrac{b_i - \\sum_{j=i+1}^{n} a_{ij}x_j}{a_{ii}}',
    fields: [], matrix: { b: true, hint: 'A triangular superior' },
    example: { A: [[2, -1, 3], [0, 4, -2], [0, 0, 5]], b: [9, 2, 10] },
    solve: presentBackward,
  },
  {
    id: 7, name: 'Factorización LU', group: 'lineales',
    formula: 'A = LU,\\quad m_{ij} = \\dfrac{U_{ij}}{U_{jj}}',
    fields: [], matrix: {},
    example: { A: [[2, 1, 1], [4, 3, 3], [8, 7, 9]] },
    solve: presentLU,
  },
  {
    id: 8, name: 'Solución hacia adelante', group: 'lineales',
    formula: 'x_i = \\dfrac{b_i - \\sum_{j=1}^{i-1} a_{ij}x_j}{a_{ii}}',
    fields: [], matrix: { b: true, hint: 'A triangular inferior' },
    example: { A: [[2, 0, 0], [3, 1, 0], [1, -2, 4]], b: [4, 7, 5] },
    solve: presentForward,
  },
  {
    id: 9, name: 'Solución Ax=b por LU', group: 'lineales',
    formula: 'A = LU,\\quad Ly = b,\\quad Ux = y',
    fields: [], matrix: { b: true },
    example: { A: [[2, 1, 1], [4, 3, 3], [8, 7, 9]], b: [4, 10, 24] },
    solve: presentLUSolve,
  },
  {
    id: 10, name: 'LUP (pivoteo parcial)', group: 'lineales',
    formula: 'PA = LU,\\quad |a_{rj}| = \\max_{i \\ge j} |a_{ij}|',
    fields: [], matrix: { b: true },
    example: { A: [[1, 1, 1], [2, 3, 5], [4, 0, 5]], b: [6, 23, 19] },
    solve: presentLUP,
  },
  {
    id: 11, name: 'Jacobi', group: 'lineales',
    formula: 'x_i^{(k+1)} = \\dfrac{b_i - \\sum_{j \\neq i} a_{ij}x_j^{(k)}}{a_{ii}}',
    fields: [tol, M], matrix: { b: true, x0: true },
    example: {
      values: { tol: '1e-3', M: '50' },
      A: [[10, -1, 2, 0], [-1, 11, -1, 3], [2, -1, 10, -1], [0, 3, -1, 8]],
      b: [6, 25, -11, 15],
      x0: [0, 0, 0, 0],
    },
    solve: presentJacobi,
  },
  {
    id: 12, name: 'Sumas inferiores y superiores', group: 'integracion',
    formula: 'L = h\\sum m_i \\le \\int_a^b f \\le U = h\\sum M_i',
    fields: [f, a, b, { key: 'n', label: 'Subintervalos $n$', kind: 'int' }],
    example: { values: { f: 'x^2', a: '0', b: '1', n: '4' } },
    solve: presentLowerUpperSums,
  },
  {
    id: 13, name: 'Trapecio compuesto', group: 'integracion',
    formula: 'T = \\dfrac{h}{2}\\left[f(x_0) + 2\\sum_{i=1}^{n-1} f(x_i) + f(x_n)\\right]',
    fields: [f, a, b, { key: 'n', label: 'Trapecios $n$', kind: 'int' }],
    example: { values: { f: 'exp(-x^2)', a: '0', b: '1', n: '4' } },
    solve: presentTrapezoid,
  },
  {
    id: 14, name: 'Simpson compuesto', group: 'integracion',
    formula: 'S = \\dfrac{h}{3}\\left(S_0 + 4S_1 + 2S_2\\right),\\quad n = 2m',
    fields: [f, a, b, { key: 'm', label: '$m$ (se usa $n = 2m$)', kind: 'int' }],
    example: { values: { f: 'sin(x)', a: '0', b: 'pi', m: '2' } },
    solve: presentSimpson,
  },
];

const str = (x: number | string) => String(x);

export function exampleState(t: TaskDef): FormState {
  const A = t.example.A?.map((r) => r.map(str)) ?? emptyMatrix(3);
  const n = A.length;
  return {
    values: Object.fromEntries(t.fields.map((fd) => [fd.key, t.example.values?.[fd.key] ?? ''])),
    n,
    A,
    b: t.example.b?.map(str) ?? Array(n).fill(''),
    x0: t.example.x0?.map(str) ?? Array(n).fill('0'),
  };
}

export function emptyState(t: TaskDef, n: number): FormState {
  return { values: Object.fromEntries(t.fields.map((fd) => [fd.key, ''])), n, A: emptyMatrix(n), b: Array(n).fill(''), x0: Array(n).fill('0') };
}

function emptyMatrix(n: number): string[][] {
  return Array.from({ length: n }, () => Array(n).fill(''));
}

export function resize(s: FormState, n: number): FormState {
  const fit = (v: string[], fill: string) => Array.from({ length: n }, (_, i) => v[i] ?? fill);
  return { ...s, n, A: Array.from({ length: n }, (_, i) => fit(s.A[i] ?? [], '')), b: fit(s.b, ''), x0: fit(s.x0, '0') };
}

/** Valida y convierte las entradas; si algo no se puede interpretar no se ejecuta el algoritmo. */
export function parseForm(t: TaskDef, s: FormState): { ok: true; vals: Record<string, unknown> } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const vals: Record<string, unknown> = {};
  const plain = (label: string) => label.replace(/\$/g, '').replace(/\\varepsilon/g, 'ε').replace(/\\/g, '');
  for (const fd of t.fields) {
    const src = s.values[fd.key] ?? '';
    try {
      if (fd.kind === 'expr') vals[fd.key] = compileFn(src, fd.fnName);
      else {
        const x = parseNumber(src, plain(fd.label));
        if (fd.kind === 'tol' && !(x > 0)) throw new Error('La tolerancia ε debe ser mayor que 0.');
        if (fd.kind === 'int' && (!Number.isInteger(x) || x < 1)) throw new Error(`${plain(fd.label)} debe ser un entero positivo.`);
        vals[fd.key] = x;
      }
    } catch (e) {
      errors.push((e as Error).message);
    }
  }
  if (t.matrix) {
    // Las celdas vacías se toman como 0 (cómodo para matrices triangulares).
    const cell = (src: string, label: string) => {
      if (!src.trim()) return 0;
      try {
        return parseNumber(src, label);
      } catch (e) {
        errors.push((e as Error).message);
        return NaN;
      }
    };
    vals.A = s.A.map((r, i) => r.map((c, j) => cell(c, `a${i + 1}${j + 1}`)));
    if (t.matrix.b) vals.b = s.b.map((c, i) => cell(c, `b${i + 1}`));
    if (t.matrix.x0) vals.x0 = s.x0.map((c, i) => cell(c, `x${i + 1}⁽⁰⁾`));
  }
  return errors.length ? { ok: false, errors } : { ok: true, vals };
}
