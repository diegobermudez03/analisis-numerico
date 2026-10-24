/**
 * Tarea 11 — Método de Jacobi.
 * Entrada: A n×n, b, vector inicial x0, tolerancia tol y máximo M.
 * Salida: vector aproximado x, motivo de parada y cada iteración (vector viejo, nuevo y norma infinito).
 */

export interface IteracionJacobi {
  k: number;
  viejo: number[]; // x^(k)
  nuevo: number[]; // x^(k+1)
  sumas: number[]; // Σ_{j≠i} a_ij x_j^(k)
  diferencias: number[]; // |x_i^(k+1) - x_i^(k)|
  norma: number; // ||x^(k+1) - x^(k)||∞
  iMax: number; // componente donde se alcanza la norma
}

export type ParadaJacobi = 'diagonal-cero' | 'tolerancia' | 'max-iteraciones';

export interface ResultadoJacobi {
  parada: ParadaJacobi;
  x: number[] | null;
  iteraciones: IteracionJacobi[];
  filaCero?: number;
}

export function jacobi(A: number[][], b: number[], x0: number[], tol: number, M: number): ResultadoJacobi {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) return { parada: 'diagonal-cero', x: null, iteraciones: [], filaCero: i };
  }

  const iteraciones: IteracionJacobi[] = [];
  let viejo = [...x0];
  for (let k = 0; k < M; k++) {
    // Todos los componentes nuevos usan únicamente los valores viejos.
    const sumas: number[] = [];
    const nuevo: number[] = [];
    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) if (j !== i) suma += A[i][j] * viejo[j];
      sumas.push(suma);
      nuevo.push((b[i] - suma) / A[i][i]);
    }
    const diferencias = nuevo.map((valor, i) => Math.abs(valor - viejo[i]));
    const norma = Math.max(...diferencias);
    iteraciones.push({ k, viejo, nuevo, sumas, diferencias, norma, iMax: diferencias.indexOf(norma) });
    if (norma < tol) return { parada: 'tolerancia', x: nuevo, iteraciones };
    viejo = nuevo;
  }
  return { parada: 'max-iteraciones', x: viejo, iteraciones };
}
