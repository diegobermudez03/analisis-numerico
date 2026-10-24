// Presentación de las Tareas 1–5: convierte la salida de cada algoritmo en el paso a paso.
import { biseccion } from '../algorithms/biseccion';
import { puntoFijo } from '../algorithms/punto-fijo';
import { posicionFalsa } from '../algorithms/posicion-falsa';
import { newtonRaphson } from '../algorithms/newton-raphson';
import { secante } from '../algorithms/secante';
import { failure, openEnds, success } from '../lib/result';
import type { Cell, Fmt, Fn, Result, Step } from '../lib/types';

const fnHeader = (f: Fn): Step => ({ kind: 'formula', tex: `${f.label}(x) = ${f.tex}` });
const evalFailure = (error: string | undefined, summary: Result['summary'], steps: Step[]) =>
  failure(`la expresión dejó de ser evaluable. ${error ?? ''}`, summary, steps);
const maxIterFailure = (M: number, last: number | null, F: Fmt, steps: Step[]) =>
  failure(`se alcanzó el máximo de M = ${M} iteraciones sin cumplir la tolerancia.`, last === null ? [] : [{ label: 'Última aproximación', value: `$${F.t(last)}$` }], steps);

function iterationTable(steps: Step[], headers: string[]) {
  const rows: Cell[][] = [];
  steps.push({ kind: 'heading', text: 'Tabla de iteraciones' });
  steps.push({ kind: 'table', headers, rows });
  const details: Step[] = [];
  steps.push({ kind: 'heading', text: 'Detalle de cada iteración' });
  steps.push({ kind: 'group', title: 'Sustituciones paso a paso', steps: details, open: true });
  return { rows, details };
}

function signCheck(fa0: number, fb0: number, F: Fmt, steps: Step[]): boolean {
  const ok = Math.sign(fa0) * Math.sign(fb0) < 0;
  steps.push({
    kind: 'formula',
    tone: ok ? 'ok' : 'fail',
    tex: `f(a_0)\\cdot f(b_0) = ${F.p(fa0)}\\cdot ${F.p(fb0)} = ${F.t(fa0 * fb0)} ${ok ? '< 0 \\;\\checkmark' : '\\not< 0'}`,
  });
  return ok;
}

// ---------------------------------------------------------------- 1. Bisección

export function presentBisection(v: { f: Fn; a: number; b: number; tol: number; M: number }, F: Fmt): Result {
  const { f, a: a0, b: b0, tol, M } = v;
  const r = biseccion(f, a0, b0, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Datos y fórmulas' });
  steps.push(fnHeader(f));
  steps.push({ kind: 'formula', tex: 'p_n = \\dfrac{a_n + b_n}{2}' });
  steps.push({ kind: 'formula', tex: '|p_n - p| \\le \\dfrac{b_0 - a_0}{2^{n+1}}' });
  steps.push({ kind: 'text', text: `Parada: $f(p_n) = 0$ (raíz exacta) o cota $< \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$ iteraciones.` });

  steps.push({ kind: 'heading', text: 'Validaciones' });
  if (r.parada === 'intervalo-invalido') return failure(`se requiere a₀ < b₀ (a₀ = ${F.n(a0)}, b₀ = ${F.n(b0)}).`, [], steps);
  steps.push({ kind: 'text', tone: 'ok', text: `$a_0 = ${F.t(a0)} < b_0 = ${F.t(b0)}$ ✓` });
  if (r.parada === 'error-evaluacion' && Number.isNaN(r.fb0)) return evalFailure(r.mensajeError, [], steps);
  if (!signCheck(r.fa0, r.fb0, F, steps)) {
    const extra = r.fa0 === 0 ? ' (a₀ ya es una raíz exacta)' : r.fb0 === 0 ? ' (b₀ ya es una raíz exacta)' : '';
    return failure(`f(a₀)·f(b₀) no es negativo: el intervalo no garantiza una raíz por cambio de signo${extra}.`, [], steps);
  }

  steps.push({ kind: 'heading', text: 'Número mínimo teórico de iteraciones' });
  steps.push({
    kind: 'formula',
    tex: `n_{\\min} = \\left\\lceil \\log_2\\!\\left(\\dfrac{b_0-a_0}{\\varepsilon}\\right) - 1 \\right\\rceil = \\left\\lceil \\log_2\\!\\left(\\dfrac{${F.t(b0)} - ${F.p(a0)}}{${F.t(tol)}}\\right) - 1 \\right\\rceil = \\lceil ${F.t(r.nMinExacto)} \\rceil = ${r.nMin}`,
  });

  const { rows, details } = iterationTable(steps, ['$n$', '$a_n$', '$b_n$', '$p_n$', '$f(a_n)$', '$f(p_n)$', '$f(b_n)$', 'cota', 'Decisión']);
  for (const it of r.filas) {
    const { n, a, b, p, fa, fp, fb, cota: bound } = it;
    const d: Step[] = [
      { kind: 'formula', tex: `p_{${n}} = \\dfrac{${F.t(a)} + ${F.p(b)}}{2} = ${F.t(p)}` },
      { kind: 'formula', tex: `f(a_{${n}}) = ${F.t(fa)},\\quad f(p_{${n}}) = ${F.t(fp)},\\quad f(b_{${n}}) = ${F.t(fb)}` },
      { kind: 'formula', tex: `\\text{cota} = \\dfrac{b_0-a_0}{2^{${n + 1}}} = \\dfrac{${F.t(b0 - a0)}}{${2 ** (n + 1)}} = ${F.t(bound)}` },
    ];
    details.push({ kind: 'group', title: `Iteración n = ${n}`, steps: d });
    let decision = '';
    if (it.conserva === 'izquierdo') {
      decision = 'se conserva $[a,p]$';
      d.push({ kind: 'text', tone: 'decision', text: `$f(a_{${n}})\\cdot f(p_{${n}}) = ${F.t(fa * fp)} < 0$ → hay cambio de signo en $[a,p]$: se conserva $[a,p]$, es decir $b_{${n + 1}} = p_{${n}} = ${F.t(p)}$.` });
    } else if (it.conserva === 'derecho') {
      decision = 'se conserva $[p,b]$';
      d.push({ kind: 'text', tone: 'decision', text: `$f(a_{${n}})\\cdot f(p_{${n}}) = ${F.t(fa * fp)} > 0$ → no hay cambio de signo en $[a,p]$: se conserva $[p,b]$, es decir $a_{${n + 1}} = p_{${n}} = ${F.t(p)}$.` });
    } else if (r.parada === 'raiz-exacta') {
      decision = '$f(p_n)=0$ → raíz exacta';
      d.push({ kind: 'text', tone: 'ok', text: `$f(p_{${n}}) = 0$: se encontró una raíz exacta.` });
    } else if (r.parada === 'tolerancia') {
      decision = 'cota $< \\varepsilon$ → parar';
      d.push({ kind: 'text', tone: 'ok', text: `$${F.t(bound)} < \\varepsilon = ${F.t(tol)}$: se alcanzó la tolerancia.` });
    }
    rows.push([n, a, b, p, fa, fp, fb, bound, decision]);
  }
  openEnds(details);

  const last = r.filas[r.filas.length - 1];
  if (r.parada === 'raiz-exacta')
    return success(`raíz exacta f(p) = 0 en la iteración n = ${last.n}.`, [
      { label: 'Raíz $p$', value: `$${F.t(last.p)}$` },
      { label: 'Iteraciones', value: `${r.filas.length}` },
    ], steps);
  if (r.parada === 'tolerancia')
    return success(`la cota de error ${F.n(last.cota)} es menor que ε = ${F.n(tol)} (n = ${last.n}).`, [
      { label: 'Aproximación $p$', value: `$${F.t(last.p)}$` },
      { label: 'Cota de error', value: `$${F.t(last.cota)}$` },
      { label: 'Iteraciones', value: `${r.filas.length}` },
    ], steps);
  if (r.parada === 'error-evaluacion') return evalFailure(r.mensajeError, [], steps);
  return maxIterFailure(M, r.raiz, F, steps);
}

// ---------------------------------------------------------------- 2. Punto fijo

export function presentFixedPoint(v: { g: Fn; x0: number; tol: number; M: number }, F: Fmt): Result {
  const { g, x0, tol, M } = v;
  const r = puntoFijo(g, x0, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Datos y fórmulas' });
  steps.push(fnHeader(g));
  steps.push({ kind: 'formula', tex: 'x_{n+1} = g(x_n)' });
  steps.push({ kind: 'formula', tex: '\\text{error}_{n+1} = |x_{n+1} - x_n|' });
  steps.push({ kind: 'text', text: `Parada: error $< \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$ iteraciones. Valor inicial $x_0 = ${F.t(x0)}$.` });
  steps.push({ kind: 'text', tone: 'info', text: "Recordatorio de convergencia: si $|g'(x)| < 1$ cerca del punto fijo, la iteración converge. No se exige para ejecutar." });

  const { rows, details } = iterationTable(steps, ['$n$', '$x_n$', '$g(x_n)$', '$x_{n+1}$', 'error', 'Decisión']);
  for (const { n, x, gx, error: err } of r.filas) {
    const d: Step[] = [
      { kind: 'formula', tex: `x_{${n + 1}} = g(x_{${n}}) = g(${F.t(x)}) = ${F.t(gx)}` },
      { kind: 'formula', tex: `\\text{error}_{${n + 1}} = |${F.t(gx)} - ${F.p(x)}| = ${F.t(err)}` },
    ];
    details.push({ kind: 'group', title: `Iteración n = ${n}`, steps: d });
    if (err < tol) {
      rows.push([n, x, gx, gx, err, 'error $< \\varepsilon$ → parar']);
      d.push({ kind: 'text', tone: 'ok', text: `$${F.t(err)} < \\varepsilon = ${F.t(tol)}$: dos aproximaciones consecutivas difieren menos que la tolerancia.` });
    } else {
      rows.push([n, x, gx, gx, err, `se actualiza $x = ${F.t(gx)}$`]);
      d.push({ kind: 'text', tone: 'decision', text: `$${F.t(err)} \\ge \\varepsilon$ → se reemplaza $x_{${n + 1}} = ${F.t(gx)}$ y se repite.` });
    }
  }
  openEnds(details);

  const last = r.filas[r.filas.length - 1];
  if (r.parada === 'tolerancia')
    return success(`|x${last.n + 1} − x${last.n}| = ${F.n(last.error)} < ε (n = ${last.n}).`, [
      { label: 'Punto fijo $p$', value: `$${F.t(last.gx)}$` },
      { label: 'Error final', value: `$${F.t(last.error)}$` },
      { label: 'Iteraciones', value: `${r.filas.length}` },
    ], steps);
  if (r.parada === 'error-evaluacion') return evalFailure(r.mensajeError, [], steps);
  return maxIterFailure(M, r.raiz, F, steps);
}

// ---------------------------------------------------------------- 3. Posición falsa

export function presentFalsePosition(v: { f: Fn; a: number; b: number; tol: number; M: number }, F: Fmt): Result {
  const { f, a: a0, b: b0, tol, M } = v;
  const r = posicionFalsa(f, a0, b0, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Datos y fórmulas' });
  steps.push(fnHeader(f));
  steps.push({ kind: 'formula', tex: 'x_n = \\dfrac{a_n f(b_n) - b_n f(a_n)}{f(b_n) - f(a_n)}' });
  steps.push({ kind: 'formula', tex: 'e_n = \\left|\\dfrac{x_n - x_{n-1}}{x_n}\\right|' });
  steps.push({ kind: 'text', text: `Parada: $f(x_n) = 0$ o $e_n < \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$ iteraciones.` });

  steps.push({ kind: 'heading', text: 'Validaciones' });
  if (r.parada === 'error-evaluacion' && Number.isNaN(r.fb0)) return evalFailure(r.mensajeError, [], steps);
  if (!signCheck(r.fa0, r.fb0, F, steps)) return failure('no hay cambio de signo inicial: f(a₀)·f(b₀) no es negativo.', [], steps);

  const { rows, details } = iterationTable(steps, ['$n$', '$a_n$', '$b_n$', '$f(a_n)$', '$f(b_n)$', '$x_n$', '$f(x_n)$', '$e_n$', 'Decisión']);
  let prev = NaN;
  for (const it of r.filas) {
    const { n, a, b, fa, fb, x, fx, e } = it;
    const d: Step[] = [];
    details.push({ kind: 'group', title: `Iteración n = ${n}`, steps: d });
    if (x === null || fx === null) {
      d.push({ kind: 'text', tone: 'fail', text: `$f(b_{${n}}) - f(a_{${n}}) = 0$: no se puede dividir.` });
      rows.push([n, a, b, fa, fb, null, null, null, 'denominador 0']);
      continue;
    }
    d.push({
      kind: 'formula',
      tex: `x_{${n}} = \\dfrac{${F.p(a)}\\cdot ${F.p(fb)} - ${F.p(b)}\\cdot ${F.p(fa)}}{${F.p(fb)} - ${F.p(fa)}} = \\dfrac{${F.t(a * fb - b * fa)}}{${F.t(fb - fa)}} = ${F.t(x)}`,
    });
    d.push({ kind: 'formula', tex: `f(x_{${n}}) = ${F.t(fx)}` });
    if (n === 0) d.push({ kind: 'text', text: 'En $n = 0$ no existe $x_{n-1}$: el error se muestra como —.' });
    else if (e !== null) d.push({ kind: 'formula', tex: `e_{${n}} = \\left|\\dfrac{${F.t(x)} - ${F.p(prev)}}{${F.t(x)}}\\right| = ${F.t(e)}` });

    let decision = '';
    if (it.conserva === 'izquierdo') {
      decision = `$f(a)f(x)<0$ → $b = x_{${n}}$`;
      d.push({ kind: 'text', tone: 'decision', text: `$f(a_{${n}})\\cdot f(x_{${n}}) = ${F.t(fa * fx)} < 0$ → se conserva $[a, x_{${n}}]$: $b_{${n + 1}} = ${F.t(x)}$.` });
    } else if (it.conserva === 'derecho') {
      decision = `$f(a)f(x)>0$ → $a = x_{${n}}$`;
      d.push({ kind: 'text', tone: 'decision', text: `$f(a_{${n}})\\cdot f(x_{${n}}) = ${F.t(fa * fx)} > 0$ → se conserva $[x_{${n}}, b]$: $a_{${n + 1}} = ${F.t(x)}$.` });
    } else if (r.parada === 'raiz-exacta') {
      decision = '$f(x_n)=0$ → raíz exacta';
      d.push({ kind: 'text', tone: 'ok', text: `$f(x_{${n}}) = 0$: raíz exacta.` });
    } else if (r.parada === 'tolerancia' && e !== null) {
      decision = '$e_n < \\varepsilon$ → parar';
      d.push({ kind: 'text', tone: 'ok', text: `$e_{${n}} = ${F.t(e)} < \\varepsilon = ${F.t(tol)}$.` });
    } else if (r.parada === 'x-cero') {
      decision = '$x_n = 0$';
    }
    rows.push([n, a, b, fa, fb, x, fx, e === null ? '—' : e, decision]);
    prev = x;
  }
  openEnds(details);

  const last = r.filas[r.filas.length - 1];
  switch (r.parada) {
    case 'raiz-exacta':
      return success(`raíz exacta f(x) = 0 en la iteración n = ${last.n}.`, [
        { label: 'Raíz', value: `$${F.t(last.x!)}$` },
        { label: 'Iteraciones', value: `${r.filas.length}` },
      ], steps);
    case 'tolerancia':
      return success(`error relativo ${F.n(last.e!)} < ε (n = ${last.n}).`, [
        { label: 'Aproximación', value: `$${F.t(last.x!)}$` },
        { label: 'Error relativo final', value: `$${F.t(last.e!)}$` },
        { label: 'Iteraciones', value: `${r.filas.length}` },
      ], steps);
    case 'denominador-cero':
      return failure(`denominador f(b) − f(a) = 0 en la iteración n = ${last.n}.`, [], steps);
    case 'x-cero':
      return failure(`el error relativo no está definido porque x${last.n} = 0.`, [], steps);
    case 'error-evaluacion':
      return evalFailure(r.mensajeError, [], steps);
    default:
      return failure(`se alcanzó el máximo de M = ${M} iteraciones sin converger.`, r.raiz === null ? [] : [{ label: 'Última aproximación', value: `$${F.t(r.raiz)}$` }], steps);
  }
}

// ---------------------------------------------------------------- 4. Newton-Raphson

export function presentNewton(v: { f: Fn; df: Fn; x0: number; tol: number; M: number }, F: Fmt): Result {
  const { f, df, x0, tol, M } = v;
  const r = newtonRaphson(f, df, x0, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Datos y fórmulas' });
  steps.push(fnHeader(f));
  steps.push({ kind: 'formula', tex: `f'(x) = ${df.tex}` });
  steps.push({ kind: 'formula', tex: "x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}" });
  steps.push({ kind: 'formula', tex: '\\text{error}_{n+1} = |x_{n+1} - x_n|' });
  steps.push({ kind: 'text', text: `Parada: $f(x_{n+1}) = 0$ o error $< \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$. Valor inicial $x_0 = ${F.t(x0)}$.` });

  const { rows, details } = iterationTable(steps, ['$n$', '$x_n$', '$f(x_n)$', "$f'(x_n)$", '$x_{n+1}$', 'error', 'Decisión']);
  for (const { n, x, fx, dfx, siguiente: next, fSiguiente: fNext, error: err } of r.filas) {
    const d: Step[] = [{ kind: 'formula', tex: `f(x_{${n}}) = ${F.t(fx)},\\quad f'(x_{${n}}) = ${F.t(dfx)}` }];
    details.push({ kind: 'group', title: `Iteración n = ${n}`, steps: d });
    if (next === null || err === null || fNext === null) {
      if (dfx === 0) d.push({ kind: 'text', tone: 'fail', text: `$f'(x_{${n}}) = 0$: no se puede aplicar la fórmula de Newton.` });
      rows.push([n, x, fx, dfx, null, null, dfx === 0 ? "$f'(x_n)=0$" : '']);
      continue;
    }
    d.push({ kind: 'formula', tex: `x_{${n + 1}} = ${F.t(x)} - \\dfrac{${F.t(fx)}}{${F.t(dfx)}} = ${F.t(x)} - ${F.p(fx / dfx)} = ${F.t(next)}` });
    d.push({ kind: 'formula', tex: `\\text{error}_{${n + 1}} = |${F.t(next)} - ${F.p(x)}| = ${F.t(err)},\\quad f(x_{${n + 1}}) = ${F.t(fNext)}` });
    let decision: string;
    if (fNext === 0) {
      decision = '$f(x_{n+1})=0$ → raíz exacta';
      d.push({ kind: 'text', tone: 'ok', text: `$f(x_{${n + 1}}) = 0$: raíz exacta.` });
    } else if (err < tol) {
      decision = 'error $< \\varepsilon$ → parar';
      d.push({ kind: 'text', tone: 'ok', text: `$${F.t(err)} < \\varepsilon = ${F.t(tol)}$.` });
    } else {
      decision = `se actualiza $x = ${F.t(next)}$`;
      d.push({ kind: 'text', tone: 'decision', text: `$${F.t(err)} \\ge \\varepsilon$ → se reemplaza $x = ${F.t(next)}$ y se repite.` });
    }
    rows.push([n, x, fx, dfx, next, err, decision]);
  }
  openEnds(details);

  const last = r.filas[r.filas.length - 1];
  switch (r.parada) {
    case 'raiz-exacta':
    case 'tolerancia':
      return success(`${r.parada === 'raiz-exacta' ? `f(x${last.n + 1}) = 0 (raíz exacta)` : `error ${F.n(last.error!)} < ε`} (n = ${last.n}).`, [
        { label: 'Aproximación', value: `$${F.t(last.siguiente!)}$` },
        { label: 'Error final', value: `$${F.t(last.error!)}$` },
        { label: 'Iteraciones', value: `${r.filas.length}` },
      ], steps);
    case 'derivada-cero':
      return failure(`la derivada es 0 en la iteración n = ${last.n} (x${last.n} = ${F.n(last.x)}).`, [], steps);
    case 'error-evaluacion':
      return evalFailure(r.mensajeError, [], steps);
    default:
      return maxIterFailure(M, r.raiz, F, steps);
  }
}

// ---------------------------------------------------------------- 5. Secante

export function presentSecant(v: { f: Fn; x0: number; x1: number; tol: number; M: number }, F: Fmt): Result {
  const { f, tol, M } = v;
  const r = secante(f, v.x0, v.x1, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Datos y fórmulas' });
  steps.push(fnHeader(f));
  steps.push({ kind: 'formula', tex: 'x_{n+1} = \\dfrac{x_{n-1} f(x_n) - x_n f(x_{n-1})}{f(x_n) - f(x_{n-1})}' });
  steps.push({ kind: 'formula', tex: '\\text{error}_{n+1} = |x_{n+1} - x_n|' });
  steps.push({ kind: 'text', text: `Parada: $f(x_{n+1}) = 0$ o error $< \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$. Puntos iniciales $x_0 = ${F.t(v.x0)}$, $x_1 = ${F.t(v.x1)}$.` });

  const { rows, details } = iterationTable(steps, ['$n$', '$x_{n-1}$', '$x_n$', '$f(x_{n-1})$', '$f(x_n)$', '$x_{n+1}$', 'error', 'Decisión']);
  for (const { n, xAnterior: xPrev, x, fAnterior: fPrev, fx, siguiente: next, fSiguiente: fNext, error: err } of r.filas) {
    const d: Step[] = [{ kind: 'formula', tex: `f(x_{${n - 1}}) = ${F.t(fPrev)},\\quad f(x_{${n}}) = ${F.t(fx)}` }];
    details.push({ kind: 'group', title: `Iteración n = ${n}`, steps: d });
    if (next === null || err === null || fNext === null) {
      if (fx - fPrev === 0) d.push({ kind: 'text', tone: 'fail', text: `$f(x_{${n}}) - f(x_{${n - 1}}) = 0$: no se puede dividir.` });
      rows.push([n, xPrev, x, fPrev, fx, null, null, fx - fPrev === 0 ? 'denominador 0' : '']);
      continue;
    }
    d.push({
      kind: 'formula',
      tex: `x_{${n + 1}} = \\dfrac{${F.p(xPrev)}\\cdot ${F.p(fx)} - ${F.p(x)}\\cdot ${F.p(fPrev)}}{${F.p(fx)} - ${F.p(fPrev)}} = \\dfrac{${F.t(xPrev * fx - x * fPrev)}}{${F.t(fx - fPrev)}} = ${F.t(next)}`,
    });
    d.push({ kind: 'formula', tex: `\\text{error}_{${n + 1}} = |${F.t(next)} - ${F.p(x)}| = ${F.t(err)},\\quad f(x_{${n + 1}}) = ${F.t(fNext)}` });
    let decision: string;
    if (fNext === 0) {
      decision = '$f(x_{n+1})=0$ → raíz exacta';
      d.push({ kind: 'text', tone: 'ok', text: `$f(x_{${n + 1}}) = 0$: raíz exacta.` });
    } else if (err < tol) {
      decision = 'error $< \\varepsilon$ → parar';
      d.push({ kind: 'text', tone: 'ok', text: `$${F.t(err)} < \\varepsilon = ${F.t(tol)}$.` });
    } else {
      decision = `$(x_{n-1}, x_n) \\leftarrow (${F.t(x)}, ${F.t(next)})$`;
      d.push({ kind: 'text', tone: 'decision', text: `$${F.t(err)} \\ge \\varepsilon$ → se actualiza el par: $(x_{${n}}, x_{${n + 1}}) = (${F.t(x)}, ${F.t(next)})$.` });
    }
    rows.push([n, xPrev, x, fPrev, fx, next, err, decision]);
  }
  openEnds(details);

  const last = r.filas[r.filas.length - 1];
  switch (r.parada) {
    case 'raiz-exacta':
    case 'tolerancia':
      return success(`${r.parada === 'raiz-exacta' ? 'raíz exacta' : `error ${F.n(last.error!)} < ε`} (n = ${last.n}).`, [
        { label: 'Aproximación', value: `$${F.t(last.siguiente!)}$` },
        { label: 'Error final', value: `$${F.t(last.error!)}$` },
        { label: 'Iteraciones', value: `${r.filas.length}` },
      ], steps);
    case 'denominador-cero':
      return failure(`denominador f(xₙ) − f(xₙ₋₁) = 0 en la iteración n = ${last.n}.`, [], steps);
    case 'error-evaluacion':
      return evalFailure(r.mensajeError, [], steps);
    default:
      return maxIterFailure(M, r.raiz, F, steps);
  }
}
