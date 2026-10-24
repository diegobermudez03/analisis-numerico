// Presentación de las Tareas 12–14: convierte la salida de cada algoritmo en el paso a paso.
import { sumasInferioresSuperiores } from '../algorithms/sumas-inferiores-superiores';
import { simpsonCompuesto } from '../algorithms/simpson';
import { trapecioCompuesto } from '../algorithms/trapecio';
import { sumTex } from '../lib/format';
import { failure, success } from '../lib/result';
import type { Cell, Fmt, Fn, Result, Step } from '../lib/types';

/** Mensajes de las validaciones comunes; null si las entradas son válidas. */
function inputError(stop: string, a: number, b: number, nName: string, F: Fmt, error?: string): string | null {
  if (stop === 'intervalo-invalido') return `se requiere b > a (a = ${F.n(a)}, b = ${F.n(b)}).`;
  if (stop === 'n-invalido' || stop === 'm-invalido') return `${nName} debe ser un entero positivo.`;
  if (stop === 'error-evaluacion') return `la expresión no se pudo evaluar en todos los puntos. ${error ?? ''}`;
  return null;
}

function nodeSteps(a: number, b: number, n: number, h: number, F: Fmt, steps: Step[]) {
  steps.push({ kind: 'formula', tex: `h = \\dfrac{b-a}{n} = \\dfrac{${F.t(b)} - ${F.p(a)}}{${n}} = ${F.t(h)}` });
  steps.push({ kind: 'formula', tex: `x_i = a + i\\,h = ${F.t(a)} + i\\cdot ${F.p(h)},\\quad i = 0, \\dots, ${n}` });
}

// ---------------------------------------------------------------- 12. Sumas inferiores y superiores

export function presentLowerUpperSums(v: { f: Fn; a: number; b: number; n: number }, F: Fmt): Result {
  const { f, a, b, n } = v;
  const r = sumasInferioresSuperiores(f, a, b, n);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Fórmulas' });
  steps.push({ kind: 'formula', tex: `f(x) = ${f.tex}` });
  steps.push({ kind: 'formula', tex: 'h = \\dfrac{b-a}{n},\\quad x_i = a + i\\,h,\\quad L = h\\sum m_i,\\quad U = h\\sum M_i' });
  steps.push({ kind: 'text', tone: 'info', text: 'En cada subintervalo se comparan los valores de los extremos: $m_i = \\min\\{f(x_i), f(x_{i+1})\\}$ y $M_i = \\max\\{f(x_i), f(x_{i+1})\\}$.' });
  steps.push({ kind: 'heading', text: 'Validaciones' });
  const err = inputError(r.parada, a, b, 'n', F, r.mensajeError);
  if (err) return failure(err, [], steps);
  steps.push({ kind: 'text', tone: 'ok', text: `$b = ${F.t(b)} > a = ${F.t(a)}$ ✓, $n = ${n}$ entero positivo ✓` });

  steps.push({ kind: 'heading', text: 'Paso y puntos' });
  nodeSteps(a, b, n, r.h, F, steps);
  steps.push({ kind: 'table', headers: ['$i$', '$x_i$', '$f(x_i)$'], rows: r.xs.map((x, i) => [i, x, r.fs[i]]) });

  steps.push({ kind: 'heading', text: 'Mínimo y máximo por subintervalo' });
  const rows: Cell[][] = r.minimos.map((m, i) => [i + 1, `$[${F.t(r.xs[i])},\\ ${F.t(r.xs[i + 1])}]$`, r.fs[i], r.fs[i + 1], m, r.maximos[i]]);
  steps.push({ kind: 'table', headers: ['Intervalo', '$[x_{i}, x_{i+1}]$', '$f(x_i)$', '$f(x_{i+1})$', '$m_i$', '$M_i$'], rows });

  steps.push({ kind: 'heading', text: 'Suma inferior' });
  steps.push({ kind: 'formula', tex: `\\sum m_i = ${sumTex(r.minimos.map(F.p))} = ${F.t(r.sumaMinimos)}` });
  steps.push({ kind: 'formula', tex: `L = h\\sum m_i = ${F.t(r.h)}\\cdot ${F.p(r.sumaMinimos)} = ${F.t(r.L)}` });
  steps.push({ kind: 'heading', text: 'Suma superior' });
  steps.push({ kind: 'formula', tex: `\\sum M_i = ${sumTex(r.maximos.map(F.p))} = ${F.t(r.sumaMaximos)}` });
  steps.push({ kind: 'formula', tex: `U = h\\sum M_i = ${F.t(r.h)}\\cdot ${F.p(r.sumaMaximos)} = ${F.t(r.U)}` });
  steps.push({ kind: 'heading', text: 'Rango de la integral' });
  steps.push({ kind: 'formula', tone: 'ok', tex: `${F.t(r.L)} \\le \\int_{${F.t(a)}}^{${F.t(b)}} f(x)\\,dx \\le ${F.t(r.U)}` });
  return success('se calcularon L y U para todos los subintervalos.', [
    { label: 'Suma inferior $L$', value: `$${F.t(r.L)}$` },
    { label: 'Suma superior $U$', value: `$${F.t(r.U)}$` },
    { label: 'Rango', value: `$[${F.t(r.L)},\\ ${F.t(r.U)}]$` },
  ], steps);
}

// ---------------------------------------------------------------- 13. Trapecio compuesto

export function presentTrapezoid(v: { f: Fn; a: number; b: number; n: number }, F: Fmt): Result {
  const { f, a, b, n } = v;
  const r = trapecioCompuesto(f, a, b, n);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Fórmulas' });
  steps.push({ kind: 'formula', tex: `f(x) = ${f.tex}` });
  steps.push({ kind: 'formula', tex: 'T = \\dfrac{h}{2}\\left[f(x_0) + 2\\sum_{i=1}^{n-1} f(x_i) + f(x_n)\\right]' });
  steps.push({ kind: 'heading', text: 'Validaciones' });
  const err = inputError(r.parada, a, b, 'n', F, r.mensajeError);
  if (err) return failure(err, [], steps);
  steps.push({ kind: 'text', tone: 'ok', text: `$b = ${F.t(b)} > a = ${F.t(a)}$ ✓, $n = ${n}$ entero positivo ✓` });

  steps.push({ kind: 'heading', text: 'Paso y puntos' });
  nodeSteps(a, b, n, r.h, F, steps);
  steps.push({ kind: 'heading', text: 'Tabla de puntos, coeficientes y contribuciones' });
  steps.push({
    kind: 'table',
    headers: ['$i$', '$x_i$', '$f(x_i)$', 'Coeficiente', 'Contribución'],
    rows: r.xs.map((x, i) => [i, x, r.fs[i], r.coeficientes[i], r.contribuciones[i]]),
  });
  steps.push({
    kind: 'group',
    title: 'Trapecios individuales',
    steps: [
      { kind: 'text', text: 'Cada punto interior es lado de dos trapecios, por eso aparece con coeficiente 2.' },
      {
        kind: 'table',
        headers: ['$i$', '$[x_i, x_{i+1}]$', '$T_i = \\frac{h}{2}[f(x_i) + f(x_{i+1})]$'],
        rows: Array.from({ length: n }, (_, i) => [i, `$[${F.t(r.xs[i])},\\ ${F.t(r.xs[i + 1])}]$`, (r.h / 2) * (r.fs[i] + r.fs[i + 1])]),
      },
    ],
  });

  steps.push({ kind: 'heading', text: 'Suma y resultado' });
  const terms = r.fs.map((y, i) => (r.coeficientes[i] === 2 ? `2${F.p(y)}` : F.p(y)));
  steps.push({ kind: 'formula', tex: `[\\,\\cdot\\,] = ${sumTex(terms)} = ${F.t(r.corchete)}` });
  steps.push({ kind: 'formula', tone: 'ok', tex: `T = \\dfrac{${F.t(r.h)}}{2}\\cdot ${F.p(r.corchete)} = ${F.t(r.T)}` });
  return success(`se evaluó f en los ${n + 1} puntos y se calculó la suma.`, [
    { label: 'Aproximación $T$', value: `$${F.t(r.T)}$` },
    { label: '$h$', value: `$${F.t(r.h)}$` },
  ], steps);
}

// ---------------------------------------------------------------- 14. Simpson compuesto

export function presentSimpson(v: { f: Fn; a: number; b: number; m: number }, F: Fmt): Result {
  const { f, a, b, m } = v;
  const r = simpsonCompuesto(f, a, b, m);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Fórmulas' });
  steps.push({ kind: 'formula', tex: `f(x) = ${f.tex}` });
  steps.push({ kind: 'formula', tex: 'n = 2m,\\quad h = \\dfrac{b-a}{n},\\quad S = \\dfrac{h}{3}\\left(S_0 + 4S_1 + 2S_2\\right)' });
  steps.push({ kind: 'heading', text: 'Validaciones' });
  const err = inputError(r.parada, a, b, 'm', F, r.mensajeError);
  if (err) return failure(err, [], steps);
  const { n } = r;
  steps.push({ kind: 'text', tone: 'ok', text: `$b > a$ ✓, $m = ${m}$ entero positivo ✓ → $n = 2m = ${n}$ (par por construcción).` });

  steps.push({ kind: 'heading', text: 'Paso' });
  steps.push({ kind: 'formula', tex: `h = \\dfrac{${F.t(b)} - ${F.p(a)}}{${n}} = ${F.t(r.h)}` });
  steps.push({ kind: 'heading', text: 'Extremos' });
  steps.push({ kind: 'formula', tex: `S_0 = f(a) + f(b) = ${F.t(r.fa)} + ${F.p(r.fb)} = ${F.t(r.S0)}` });

  steps.push({ kind: 'heading', text: 'Puntos interiores' });
  const rows: Cell[][] = [
    [0, a, r.fa, 'extremo', 1, r.fa, '—', '—'],
    ...r.filas.map((row): Cell[] => [row.i, row.x, row.fx, row.coeficiente === 4 ? 'impar' : 'par', row.coeficiente, row.coeficiente * row.fx, row.S1, row.S2]),
    [n, b, r.fb, 'extremo', 1, r.fb, '—', '—'],
  ];
  steps.push({ kind: 'table', headers: ['$i$', '$x_i$', '$f(x_i)$', 'Paridad', 'Coef.', 'Contribución', '$S_1$ acumulado', '$S_2$ acumulado'], rows });
  const pattern = [1, ...r.filas.map((row) => row.coeficiente), 1];
  steps.push({ kind: 'text', text: `Patrón de coeficientes: ${pattern.join(', ')}` });
  steps.push({ kind: 'formula', tex: `S_1 = ${F.t(r.S1)},\\qquad S_2 = ${F.t(r.S2)}` });

  steps.push({ kind: 'heading', text: 'Resultado' });
  const inner = r.S0 + 4 * r.S1 + 2 * r.S2;
  steps.push({
    kind: 'formula',
    tone: 'ok',
    tex: `S = \\dfrac{${F.t(r.h)}}{3}\\left(${F.t(r.S0)} + 4\\cdot ${F.p(r.S1)} + 2\\cdot ${F.p(r.S2)}\\right) = \\dfrac{${F.t(r.h)}}{3}\\cdot ${F.p(inner)} = ${F.t(r.S)}`,
  });
  return success(`se completó la suma con n = 2m = ${n} subintervalos.`, [
    { label: 'Aproximación $S$', value: `$${F.t(r.S)}$` },
    { label: '$n$, $h$', value: `$n = ${n},\\ h = ${F.t(r.h)}$` },
  ], steps);
}
