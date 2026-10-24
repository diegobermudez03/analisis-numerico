/**
 * Tarea 10 — LUP: eliminación gaussiana con pivoteo parcial.
 * Entrada: matriz A n×n y vector b.
 * Salida: P, L, U con PA = LU, el b transformado y la solución x (sustitución hacia atrás).
 *
 * En cada columna j SIEMPRE se pivotea: se busca la fila r (entre j..n) con el mayor |a_rj|
 * y se intercambia con la fila j (filas de A, entradas de b y del vector de permutación p).
 * Los multiplicadores se guardan en el lugar de a_ij y se mueven con la fila en los intercambios.
 */
import { sustitucionHaciaAtras, type ResultadoSustitucionAtras } from './sustitucion-atras';

export interface EstadoLUP {
  p: number[]; // vector de permutación (desde 1)
  a: number[][]; // matriz de trabajo (multiplicadores debajo de la diagonal)
  b: number[];
}

export interface EliminacionLUP {
  i: number; // fila eliminada
  aij: number; // a_ij antes de convertirlo en multiplicador
  m: number; // a_ij <- a_ij / a_jj
  bAnterior: number;
  bNuevo: number; // b_i <- b_i - a_ij b_j
  despues: EstadoLUP;
}

export interface ColumnaLUP {
  j: number;
  candidatos: number[]; // |a_ij| para i = j..n
  r: number; // fila del pivote máximo
  pivote: number; // a_rj
  antes: EstadoLUP; // antes del intercambio
  despues: EstadoLUP; // después del intercambio
  eliminaciones: EliminacionLUP[];
}

export type ParadaLUP = 'singular' | 'diagonal-cero' | 'resuelto';

export interface ResultadoLUP {
  parada: ParadaLUP;
  columnas: ColumnaLUP[];
  p: number[];
  P: number[][];
  L: number[][];
  U: number[][];
  bTransformado: number[]; // b después de la eliminación
  atras?: ResultadoSustitucionAtras;
  x: number[] | null;
  columnaFallida?: number;
}

const capturar = (p: number[], a: number[][], b: number[]): EstadoLUP => ({ p: [...p], a: a.map((fila) => [...fila]), b: [...b] });

export function lup(A: number[][], bEntrada: number[]): ResultadoLUP {
  const n = A.length;
  // 1. p_i = i; se trabaja con copias de A y b.
  const p = Array.from({ length: n }, (_, i) => i + 1);
  const a = A.map((fila) => [...fila]);
  const b = [...bEntrada];
  const columnas: ColumnaLUP[] = [];

  for (let j = 0; j < n; j++) {
    // 2. Pivote: fila r con el mayor |a_rj| en la columna j.
    const candidatos: number[] = [];
    let r = j;
    for (let i = j; i < n; i++) {
      candidatos.push(Math.abs(a[i][j]));
      if (Math.abs(a[i][j]) > Math.abs(a[r][j])) r = i;
    }
    // 3. Si el máximo es 0, la matriz es singular.
    if (a[r][j] === 0) {
      return { parada: 'singular', columnas, p, P: [], L: [], U: [], bTransformado: b, x: null, columnaFallida: j };
    }

    // 4. Intercambio F_j <-> F_r (también p y b). Si r = j la fila ya es la del máximo.
    const antes = capturar(p, a, b);
    [p[j], p[r]] = [p[r], p[j]];
    [b[j], b[r]] = [b[r], b[j]];
    [a[j], a[r]] = [a[r], a[j]];
    const columna: ColumnaLUP = { j, candidatos, r, pivote: a[j][j], antes, despues: capturar(p, a, b), eliminaciones: [] };
    columnas.push(columna);

    for (let i = j + 1; i < n; i++) {
      // 5. Multiplicador guardado en a_ij.
      const aij = a[i][j];
      a[i][j] = aij / a[j][j];
      // 6. Lado derecho.
      const bAnterior = b[i];
      b[i] = b[i] - a[i][j] * b[j];
      // 7. Resto de la fila.
      for (let k = j + 1; k < n; k++) a[i][k] = a[i][k] - a[i][j] * a[j][k];
      columna.eliminaciones.push({ i, aij, m: a[i][j], bAnterior, bNuevo: b[i], despues: capturar(p, a, b) });
    }
  }

  // 8. L (diagonal 1 + multiplicadores), U (diagonal y arriba), P (fila i = fila p_i de I).
  const L = a.map((fila, i) => fila.map((valor, k) => (k < i ? valor : k === i ? 1 : 0)));
  const U = a.map((fila, i) => fila.map((valor, k) => (k >= i ? valor : 0)));
  const P = p.map((pi) => Array.from({ length: n }, (_, k) => (k === pi - 1 ? 1 : 0)));

  // 9. Ux = b transformado.
  const atras = sustitucionHaciaAtras(U, b);
  if (atras.parada !== 'resuelto') return { parada: 'diagonal-cero', columnas, p, P, L, U, bTransformado: b, atras, x: null };
  return { parada: 'resuelto', columnas, p, P, L, U, bTransformado: b, atras, x: atras.x };
}
