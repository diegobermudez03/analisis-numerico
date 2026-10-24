// Presentación de las Tareas 6–11: convierte la salida de cada algoritmo en el paso a paso.
import { sustitucionHaciaAtras, type ResultadoSustitucionAtras } from '../algorithms/sustitucion-atras';
import { sustitucionHaciaAdelante, type ResultadoSustitucionAdelante } from '../algorithms/sustitucion-adelante';
import { jacobi } from '../algorithms/jacobi';
import { factorizacionLU, type ResultadoLU } from '../algorithms/factorizacion-lu';
import { solucionLU } from '../algorithms/solucion-lu';
import { lup, type EstadoLUP } from '../algorithms/lup';
import { vecTex } from '../lib/format';
import { failure, openEnds, success } from '../lib/result';
import type { Cell, Fmt, MatrixSpec, Result, Step } from '../lib/types';

type Mat = number[][];

// Solo para mostrar la verificación A = LU / PA = LU en pantalla.
const matmul = (A: Mat, B: Mat): Mat => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
const maxDiff = (A: Mat, B: Mat) => Math.max(...A.flatMap((r, i) => r.map((a, j) => Math.abs(a - B[i][j]))));
const col = (v: (number | null)[]) => v.map((x) => [x]);

/** Ecuación de la fila en LaTeX: a_i1 x_1 + ... = b_i, con las columnas indicadas (sin ceros salvo la diagonal). */
function eqTex(row: number[], cols: number[], diag: number, v: string, rhs: number, F: Fmt): string {
  const terms = cols.filter((j) => row[j] !== 0 || j === diag);
  const parts = terms.map((j, k) => {
    const c = row[j];
    const mag = Math.abs(c) === 1 ? '' : F.t(Math.abs(c));
    const sign = c < 0 ? (k === 0 ? '-' : ' - ') : k === 0 ? '' : ' + ';
    return `${sign}${mag}${v}_{${j + 1}}`;
  });
  return `${parts.join('')} = ${F.t(rhs)}`;
}

interface Names { A: string; x: string; b: string }
const DEFAULT_NAMES: Names = { A: 'A', x: 'x', b: 'b' };

type SubResult = ResultadoSustitucionAtras | ResultadoSustitucionAdelante;

/** Pasos de una sustitución (hacia atrás o hacia adelante) a partir de la salida del algoritmo. */
function substitutionSteps(dir: 'back' | 'forward', A: Mat, b: number[], r: SubResult, F: Fmt, o: Names, checkShape: boolean): { steps: Step[]; error?: string } {
  const n = A.length;
  const a = o.A.toLowerCase();
  const steps: Step[] = [];
  if (dir === 'back') {
    steps.push({ kind: 'formula', tex: `${o.x}_i = \\dfrac{${o.b}_i - \\sum_{j=i+1}^{n} ${a}_{ij}${o.x}_j}{${a}_{ii}},\\quad i = n, n-1, \\dots, 1` });
  } else {
    steps.push({ kind: 'formula', tex: `${o.x}_1 = \\dfrac{${o.b}_1}{${a}_{11}},\\qquad ${o.x}_i = \\dfrac{${o.b}_i - \\sum_{j=1}^{i-1} ${a}_{ij}${o.x}_j}{${a}_{ii}},\\quad i = 2, \\dots, n` });
  }
  steps.push({ kind: 'matrices', caption: 'Sistema inicial', items: [{ label: `$[${o.A} \\mid ${o.b}]$`, M: A, aug: b }] });
  const shape = dir === 'back' ? 'superior' : 'inferior';
  if (r.parada === 'no-triangular') {
    const where = dir === 'back' ? 'debajo' : 'encima';
    const error = `la matriz no es triangular ${shape}: hay elementos no nulos ${where} de la diagonal (${r.entradasInvalidas.map(([i, j]) => `a${i + 1}${j + 1}`).join(', ')}).`;
    steps.push({ kind: 'text', tone: 'fail', text: error });
    return { steps, error };
  }
  if (checkShape) steps.push({ kind: 'text', tone: 'ok', text: `$${o.A}$ es cuadrada (${n}×${n}) y triangular ${shape} ✓` });

  const x: (number | null)[] = Array(n).fill(null);
  for (const row of r.filas) {
    const { i, suma: sum, numerador: num } = row;
    const d: Step[] = [];
    steps.push({ kind: 'group', title: `Fila ${i + 1}: despejar ${o.x}${i + 1}`, steps: d, open: true });
    const cols = dir === 'back' ? Array.from({ length: n - i }, (_, k) => i + k) : Array.from({ length: i + 1 }, (_, k) => k);
    const known = cols.filter((j) => j !== i);
    d.push({ kind: 'text', text: `Ecuación: $${eqTex(A[i], cols, i, o.x, b[i], F)}$` });
    if (known.length) {
      if (dir === 'forward') d.push({ kind: 'text', text: `Valores conocidos que se sustituyen: ${known.map((j) => `$${o.x}_{${j + 1}} = ${F.t(x[j]!)}$`).join(', ')}` });
      const subst = known.map((j) => `${F.p(A[i][j])}\\cdot ${F.p(x[j]!)}`).join(' + ');
      const range = dir === 'back' ? `j=${i + 2}}^{${n}` : `j=1}^{${i}`;
      d.push({ kind: 'formula', tex: `\\sum_{${range}} ${a}_{${i + 1}j}${o.x}_j = ${subst} = ${F.t(sum)}` });
    } else {
      d.push({ kind: 'text', text: 'No hay términos conocidos todavía (suma = 0).' });
    }
    d.push({ kind: 'formula', tex: `${o.x}_{${i + 1}} = \\dfrac{${F.t(b[i])} - ${F.p(sum)}}{${F.t(A[i][i])}} = \\dfrac{${F.t(num)}}{${F.t(A[i][i])}} = ${F.t(row.x)}` });
    x[i] = row.x;
    d.push({ kind: 'matrices', items: [{ label: `$${o.x}$`, M: col(x), highlightRows: [i] }] });
  }
  if (r.parada === 'diagonal-cero') {
    const i = r.filaFallida!;
    const d: Step[] = [{ kind: 'text', text: `Ecuación: $${eqTex(A[i], dir === 'back' ? Array.from({ length: n - i }, (_, k) => i + k) : Array.from({ length: i + 1 }, (_, k) => k), i, o.x, b[i], F)}$` }];
    d.push({ kind: 'text', tone: 'fail', text: `$${a}_{${i + 1}${i + 1}} = 0$: no se puede dividir.` });
    steps.push({ kind: 'group', title: `Fila ${i + 1}: despejar ${o.x}${i + 1}`, steps: d, open: true });
    return { steps, error: `${a}${i + 1}${i + 1} = 0: no se puede despejar ${o.x}${i + 1} (no hay solución única por este algoritmo).` };
  }
  return { steps };
}

/** Pasos de la factorización LU a partir de la salida del algoritmo. */
function luSteps(A: Mat, r: ResultadoLU, F: Fmt): { steps: Step[]; error?: string } {
  const n = A.length;
  const steps: Step[] = [];
  steps.push({ kind: 'formula', tex: 'm_{ij} = \\dfrac{U_{ij}}{U_{jj}},\\qquad F_i \\leftarrow F_i - m_{ij}F_j,\\qquad A = LU' });
  const I = A.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));
  steps.push({ kind: 'matrices', caption: 'Inicio: $L = I$, $U = A$', items: [{ label: '$L$', M: I }, { label: '$U$', M: A }] });

  const lastCol = r.parada === 'pivote-cero' ? r.columnaFallida! : n - 2;
  for (let j = 0; j <= lastCol; j++) {
    const d: Step[] = [];
    steps.push({ kind: 'group', title: `Columna ${j + 1} (pivote U${j + 1}${j + 1})`, steps: d, open: true });
    if (r.parada === 'pivote-cero' && j === r.columnaFallida) {
      d.push({ kind: 'text', tone: 'fail', text: `Pivote $U_{${j + 1}${j + 1}} = 0$: no se puede dividir. Se sugiere usar LUP (Tarea 10).` });
      return { steps, error: `el pivote U${j + 1}${j + 1} = 0: esta versión sin pivoteo no puede continuar. Use LUP (Tarea 10).` };
    }
    const ops = r.operaciones.filter((op) => op.j === j);
    d.push({ kind: 'text', tone: 'decision', text: `Pivote: $U_{${j + 1}${j + 1}} = ${F.t(ops[0].pivote)} \\neq 0$ ✓` });
    for (const op of ops) {
      const { i, m } = op;
      d.push({ kind: 'formula', tex: `m_{${i + 1}${j + 1}} = \\dfrac{U_{${i + 1}${j + 1}}}{U_{${j + 1}${j + 1}}} = \\dfrac{${F.t(op.uij)}}{${F.t(op.pivote)}} = ${F.t(m)}` });
      d.push({ kind: 'formula', tone: 'decision', tex: `F_{${i + 1}} \\leftarrow F_{${i + 1}} - ${F.p(m)}F_{${j + 1}}` });
      d.push({
        kind: 'matrices',
        items: [
          { label: '$L$', M: op.L, highlightCells: [[i, j]] },
          { label: '$U$', M: op.U, highlightRows: [i], pivot: [j, j] },
        ],
      });
    }
  }
  if (r.U[n - 1][n - 1] === 0) steps.push({ kind: 'text', tone: 'warn', text: `Nota: $U_{${n}${n}} = 0$; la factorización existe pero $U$ es singular.` });
  const LU = matmul(r.L, r.U);
  steps.push({ kind: 'matrices', caption: 'Resultado', items: [{ label: '$L$', M: r.L }, { label: '$U$', M: r.U }] });
  steps.push({ kind: 'matrices', caption: `Verificación $A = LU$ (diferencia máxima: ${F.n(maxDiff(A, LU))})`, items: [{ label: '$A$', M: A }, { label: '$LU$', M: LU }] });
  return { steps };
}

// ---------------------------------------------------------------- 6. Hacia atrás

export function presentBackward(v: { A: Mat; b: number[] }, F: Fmt): Result {
  const r = sustitucionHaciaAtras(v.A, v.b);
  const { steps, error } = substitutionSteps('back', v.A, v.b, r, F, DEFAULT_NAMES, true);
  if (error) return failure(error, [], steps);
  return success('se calcularon todas las componentes, desde la última hasta la primera.', [{ label: 'Solución $x$', value: `$${vecTex(r.x!, F)}$` }], steps);
}

// ---------------------------------------------------------------- 7. LU

export function presentLU(v: { A: Mat }, F: Fmt): Result {
  const r = factorizacionLU(v.A);
  const { steps, error } = luSteps(v.A, r, F);
  if (error) return failure(error, [], steps);
  return success('se obtuvieron L (diagonal 1) y U triangular superior con A = LU.', [{ label: 'Factorización', value: '$A = LU$ (ver matrices abajo)' }], steps);
}

// ---------------------------------------------------------------- 8. Hacia adelante

export function presentForward(v: { A: Mat; b: number[] }, F: Fmt): Result {
  const r = sustitucionHaciaAdelante(v.A, v.b);
  const { steps, error } = substitutionSteps('forward', v.A, v.b, r, F, DEFAULT_NAMES, true);
  if (error) return failure(error, [], steps);
  return success('se encontró el vector solución completo.', [{ label: 'Solución $x$', value: `$${vecTex(r.x!, F)}$` }], steps);
}

// ---------------------------------------------------------------- 9. Ax = b por LU

export function presentLUSolve(v: { A: Mat; b: number[] }, F: Fmt): Result {
  const { A, b } = v;
  const r = solucionLU(A, b);
  const steps: Step[] = [];
  steps.push({ kind: 'formula', tex: 'Ax = b \\;\\Rightarrow\\; A = LU \\;\\Rightarrow\\; Ly = b,\\; Ux = y' });
  steps.push({ kind: 'matrices', caption: 'Datos', items: [{ label: '$A$', M: A }, { label: '$b$', M: col(b) }] });

  const lu = luSteps(A, r.lu, F);
  steps.push({ kind: 'group', title: 'Sección 1: Factorización LU', steps: lu.steps, open: true });
  if (r.parada === 'fallo-lu') return failure(`falló la etapa 1 (factorización LU): ${lu.error}`, [], steps);

  const fw = substitutionSteps('forward', r.lu.L, b, r.adelante!, F, { A: 'L', x: 'y', b: 'b' }, false);
  steps.push({ kind: 'group', title: 'Sección 2: Resolver Ly = b', steps: fw.steps, open: true });
  if (r.parada === 'fallo-adelante') return failure(`falló la etapa 2 (sustitución hacia adelante Ly = b): ${fw.error}`, [], steps);
  fw.steps.push({ kind: 'text', tone: 'ok', text: `$y = ${vecTex(r.y!, F)}$` });

  const bw = substitutionSteps('back', r.lu.U, r.y!, r.atras!, F, { A: 'U', x: 'x', b: 'y' }, false);
  steps.push({ kind: 'group', title: 'Sección 3: Resolver Ux = y', steps: bw.steps, open: true });
  if (r.parada === 'fallo-atras') return failure(`falló la etapa 3 (sustitución hacia atrás Ux = y): ${bw.error}`, [], steps);
  bw.steps.push({ kind: 'text', tone: 'ok', text: `$x = ${vecTex(r.x!, F)}$` });

  steps.push({ kind: 'heading', text: 'Resumen final' });
  steps.push({
    kind: 'matrices',
    items: [
      { label: '$A$', M: A }, { label: '$b$', M: col(b) }, { label: '$L$', M: r.lu.L },
      { label: '$U$', M: r.lu.U }, { label: '$y$', M: col(r.y!) }, { label: '$x$', M: col(r.x!) },
    ],
  });
  return success('las tres etapas terminaron correctamente.', [
    { label: 'Solución $x$', value: `$${vecTex(r.x!, F)}$` },
    { label: 'Vector intermedio $y$', value: `$${vecTex(r.y!, F)}$` },
  ], steps);
}

// ---------------------------------------------------------------- 10. LUP

export function presentLUP(v: { A: Mat; b: number[] }, F: Fmt): Result {
  const n = v.A.length;
  const r = lup(v.A, v.b);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Fórmulas' });
  steps.push({ kind: 'formula', tex: '|a_{rj}| = \\max_{i=j..n} |a_{ij}|' });
  steps.push({ kind: 'formula', tex: 'a_{ij} \\leftarrow \\dfrac{a_{ij}}{a_{jj}},\\qquad b_i \\leftarrow b_i - a_{ij}b_j,\\qquad a_{ik} \\leftarrow a_{ik} - a_{ij}a_{jk}' });
  steps.push({ kind: 'formula', tex: 'PA = LU' });
  steps.push({ kind: 'text', tone: 'info', text: 'Pivoteo parcial en **todas** las columnas: se toma como pivote el mayor $|a_{ij}|$ de la columna y esa fila se lleva a la posición $j$. Los multiplicadores se guardan en el lugar de $a_{ij}$ (en cursiva y color) y se mueven con la fila en cada intercambio.' });
  const snap = (s: EstadoLUP, j: number, rows?: number[], pivot?: [number, number]): MatrixSpec[] => [
    { label: '$p$', M: col(s.p) },
    { label: '$[A \\mid b]$ (trabajo)', M: s.a, aug: s.b, multCols: j, highlightRows: rows, pivot },
  ];
  const initial: EstadoLUP = { p: Array.from({ length: n }, (_, i) => i + 1), a: v.A, b: v.b };
  steps.push({ kind: 'heading', text: 'Inicio' });
  steps.push({ kind: 'matrices', caption: '$p_i = i$; se trabaja con copias de $A$ y $b$', items: snap(initial, 0) });

  steps.push({ kind: 'heading', text: 'Eliminación con pivoteo parcial' });
  for (const c of r.columnas) {
    const { j } = c;
    const d: Step[] = [];
    steps.push({ kind: 'group', title: `Columna ${j + 1}`, steps: d, open: true });
    d.push({
      kind: 'table',
      caption: 'Candidatos a pivote',
      headers: ['Fila $i$', `$|a_{i${j + 1}}|$`, ''],
      rows: c.candidatos.map((val, k) => [j + k + 1, val, j + k === c.r ? '← máximo' : '']),
      rowTones: c.candidatos.map((_, k) => (j + k === c.r ? 'decision' : undefined)),
    });
    d.push({ kind: 'text', tone: 'decision', text: `Pivote: $r = ${c.r + 1}$, $a_{${c.r + 1}${j + 1}} = ${F.t(c.pivote)}$.` });
    if (c.r !== j) {
      d.push({ kind: 'matrices', caption: 'Antes del intercambio', items: snap(c.antes, j, [j, c.r]) });
      d.push({ kind: 'text', tone: 'decision', text: `Intercambio $F_{${j + 1}} \\leftrightarrow F_{${c.r + 1}}$: también $p_{${j + 1}} \\leftrightarrow p_{${c.r + 1}}$ y $b_{${j + 1}} \\leftrightarrow b_{${c.r + 1}}$.` });
      d.push({ kind: 'matrices', caption: 'Después del intercambio', items: snap(c.despues, j, [j, c.r]) });
    } else {
      d.push({ kind: 'text', tone: 'decision', text: `El mayor valor ya está en la fila ${j + 1}: el intercambio $F_{${j + 1}} \\leftrightarrow F_{${j + 1}}$ no cambia nada.` });
    }
    for (const e of c.eliminaciones) {
      const { i } = e;
      d.push({ kind: 'formula', tex: `a_{${i + 1}${j + 1}} \\leftarrow \\dfrac{${F.t(e.aij)}}{${F.t(c.pivote)}} = ${F.t(e.m)}` });
      d.push({ kind: 'formula', tex: `b_{${i + 1}} \\leftarrow ${F.t(e.bAnterior)} - ${F.p(e.m)}\\cdot ${F.p(e.despues.b[j])} = ${F.t(e.bNuevo)}` });
      d.push({ kind: 'formula', tone: 'decision', tex: `F_{${i + 1}} \\leftarrow F_{${i + 1}} - ${F.p(e.m)}F_{${j + 1}}\\quad (k = ${j + 2}, \\dots, ${n})` });
      d.push({ kind: 'matrices', items: snap(e.despues, j + 1, [i], [j, j]) });
    }
  }
  if (r.parada === 'singular') {
    const j = r.columnaFallida!;
    const s: Step[] = [{ kind: 'text', tone: 'fail', text: `El máximo $|a_{r${j + 1}}| = 0$: la matriz es singular.` }];
    steps.push({ kind: 'group', title: `Columna ${j + 1}`, steps: s, open: true });
    return failure(`pivote máximo 0 en la columna ${j + 1}: A es singular, no hay solución única.`, [], steps);
  }

  const PA = matmul(r.P, v.A);
  const LU = matmul(r.L, r.U);
  steps.push({ kind: 'heading', text: 'Construcción de L, U y P' });
  steps.push({ kind: 'text', text: '$L$: diagonal 1 y multiplicadores debajo; $U$: parte diagonal y superior; $P$: fila $i$ de $P$ es la fila $p_i$ de la identidad.' });
  steps.push({ kind: 'matrices', items: [{ label: '$p$', M: col(r.p) }, { label: '$P$', M: r.P }, { label: '$L$', M: r.L }, { label: '$U$', M: r.U }] });
  steps.push({ kind: 'matrices', caption: `Verificación $PA = LU$ (diferencia máxima: ${F.n(maxDiff(PA, LU))})`, items: [{ label: '$PA$', M: PA }, { label: '$LU$', M: LU }] });

  steps.push({ kind: 'heading', text: 'Sustitución hacia atrás: $Ux = b$ transformado' });
  steps.push({ kind: 'text', tone: 'info', text: 'El $b$ ya fue transformado durante la eliminación, así que solo falta resolver $Ux = b_{\\text{transformado}}$ (no se aplica dos veces la eliminación).' });
  const bw = substitutionSteps('back', r.U, r.bTransformado, r.atras!, F, { A: 'U', x: 'x', b: 'b' }, false);
  steps.push(...bw.steps);
  if (r.parada === 'diagonal-cero') return failure(`diagonal final 0: ${bw.error}`, [], steps);

  const Pb = matmul(r.P, col(v.b) as Mat).map((row) => row[0]);
  steps.push({ kind: 'heading', text: 'Interpretación equivalente' });
  steps.push({ kind: 'formula', tex: 'PAx = Pb,\\quad PA = LU \\;\\Rightarrow\\; Ly = Pb,\\quad Ux = y' });
  steps.push({ kind: 'text', text: `$Pb = ${vecTex(Pb, F)}$; resolviendo $Ly = Pb$ se obtiene $y = b_{\\text{transformado}} = ${vecTex(r.bTransformado, F)}$, que es exactamente el lado derecho usado arriba.` });

  return success('se obtuvo x y una factorización consistente PA = LU.', [
    { label: 'Solución $x$', value: `$${vecTex(r.x!, F)}$` },
    { label: 'Permutación $p$', value: `$(${r.p.join(', ')})$` },
  ], steps);
}

// ---------------------------------------------------------------- 11. Jacobi

export function presentJacobi(v: { A: Mat; b: number[]; x0: number[]; tol: number; M: number }, F: Fmt): Result {
  const { A, b, tol, M } = v;
  const r = jacobi(A, b, v.x0, tol, M);
  const steps: Step[] = [];
  steps.push({ kind: 'heading', text: 'Fórmulas' });
  steps.push({ kind: 'formula', tex: 'x_i^{(k+1)} = \\dfrac{b_i - \\sum_{j \\neq i} a_{ij}x_j^{(k)}}{a_{ii}}' });
  steps.push({ kind: 'formula', tex: '\\|x^{(k+1)} - x^{(k)}\\|_\\infty = \\max_i |x_i^{(k+1)} - x_i^{(k)}|' });
  steps.push({ kind: 'text', text: `Parada: norma $< \\varepsilon = ${F.t(tol)}$; máximo $M = ${M}$ iteraciones.` });
  steps.push({ kind: 'matrices', caption: 'Datos', items: [{ label: '$[A \\mid b]$', M: A, aug: b }, { label: '$x^{(0)}$', M: col(v.x0) }] });

  steps.push({ kind: 'heading', text: 'Validaciones' });
  if (r.parada === 'diagonal-cero') {
    const z = r.filaCero!;
    steps.push({ kind: 'text', tone: 'fail', text: `$a_{${z + 1}${z + 1}} = 0$.` });
    return failure(`la diagonal tiene un 0 en a${z + 1}${z + 1}: no se puede despejar x${z + 1}.`, [], steps);
  }
  steps.push({ kind: 'text', tone: 'ok', text: '$a_{ii} \\neq 0$ para todas las filas ✓' });
  // Dominancia diagonal: solo se informa, no bloquea la ejecución.
  const dom = A.map((row, i) => {
    const off = row.reduce((s, x, j) => (j === i ? s : s + Math.abs(x)), 0);
    return [i + 1, Math.abs(row[i]), off, Math.abs(row[i]) > off ? 'sí' : 'no'] as Cell[];
  });
  const allDom = dom.every((row) => row[3] === 'sí');
  steps.push({ kind: 'table', caption: 'Convergencia: dominancia diagonal estricta por filas', headers: ['Fila', '$|a_{ii}|$', '$\\sum_{j\\neq i}|a_{ij}|$', '¿Domina?'], rows: dom });
  steps.push({ kind: 'text', tone: allDom ? 'ok' : 'warn', text: allDom ? 'A es estrictamente diagonal dominante: Jacobi converge.' : 'A no es estrictamente diagonal dominante: la convergencia no está garantizada (se ejecuta de todas formas).' });

  const rows: Cell[][] = [];
  steps.push({ kind: 'heading', text: 'Tabla de iteraciones' });
  steps.push({ kind: 'table', headers: ['$k$', ...A.map((_, i) => `$x_${i + 1}^{(k+1)}$`), '$\\|\\cdot\\|_\\infty$', 'Decisión'], rows });
  const details: Step[] = [];
  steps.push({ kind: 'heading', text: 'Detalle de cada iteración' });
  steps.push({ kind: 'group', title: 'Cálculos paso a paso', steps: details, open: true });

  for (const it of r.iteraciones) {
    const { k, viejo: old, nuevo: next, sumas: sums, diferencias: diffs, norma: norm, iMax: imax } = it;
    const d: Step[] = [];
    details.push({ kind: 'group', title: `Iteración k = ${k}`, steps: d });
    d.push({ kind: 'text', text: `Vector viejo: $x^{(${k})} = ${vecTex(old, F)}$. **Todos los componentes nuevos usan únicamente estos valores viejos.**` });
    A.forEach((row, i) => {
      const terms = row.map((a, j) => (j === i ? null : `${F.p(a)}\\cdot ${F.p(old[j])}`)).filter(Boolean).join(' + ');
      d.push({ kind: 'formula', tex: `x_{${i + 1}}^{(${k + 1})} = \\dfrac{${F.t(b[i])} - (${terms || '0'})}{${F.t(row[i])}} = \\dfrac{${F.t(b[i])} - ${F.p(sums[i])}}{${F.t(row[i])}} = ${F.t(next[i])}` });
    });
    d.push({ kind: 'text', text: `Vector nuevo: $x^{(${k + 1})} = ${vecTex(next, F)}$` });
    d.push({
      kind: 'table',
      caption: 'Diferencias por componente',
      headers: ['$i$', '$x_i^{(k)}$', '$x_i^{(k+1)}$', '$|x_i^{(k+1)} - x_i^{(k)}|$'],
      rows: diffs.map((df, i) => [i + 1, old[i], next[i], df]),
      rowTones: diffs.map((_, i) => (i === imax ? 'decision' : undefined)),
    });
    d.push({ kind: 'formula', tex: `\\|x^{(${k + 1})} - x^{(${k})}\\|_\\infty = \\max(${diffs.map(F.t).join(',\\ ')}) = ${F.t(norm)}\\quad (i = ${imax + 1})` });
    if (norm < tol) {
      rows.push([k, ...next, norm, 'norma $< \\varepsilon$ → parar']);
      d.push({ kind: 'text', tone: 'ok', text: `$${F.t(norm)} < \\varepsilon = ${F.t(tol)}$: se alcanzó la tolerancia.` });
    } else {
      rows.push([k, ...next, norm, 'norma $\\ge \\varepsilon$ → old ← new']);
      d.push({ kind: 'text', tone: 'decision', text: `$${F.t(norm)} \\ge \\varepsilon$ → $x^{(${k})} \\leftarrow x^{(${k + 1})}$ y se repite.` });
    }
  }
  openEnds(details);

  if (r.parada === 'tolerancia') {
    const last = r.iteraciones[r.iteraciones.length - 1];
    return success(`‖x⁽ᵏ⁺¹⁾ − x⁽ᵏ⁾‖∞ = ${F.n(last.norma)} < ε tras ${r.iteraciones.length} iteraciones.`, [
      { label: 'Solución aproximada $x$', value: `$${vecTex(r.x!, F)}$` },
      { label: 'Iteraciones', value: `${r.iteraciones.length}` },
      { label: 'Norma final', value: `$${F.t(last.norma)}$` },
    ], steps);
  }
  return failure(`se alcanzó el máximo de M = ${M} iteraciones sin cumplir la tolerancia.`, [
    { label: 'Última aproximación', value: `$${vecTex(r.x!, F)}$` },
  ], steps);
}
