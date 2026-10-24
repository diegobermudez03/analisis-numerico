/**
 * Tarea 6 — Solución de ecuaciones hacia atrás (sustitución regresiva).
 * Entrada: A n×n triangular superior y vector b.
 * Salida: vector x tal que Ax = b, y el despeje de cada fila (de la última a la primera).
 */

export interface FilaSustitucionAtras {
  i: number; // fila (índice desde 0)
  suma: number; // Σ_{j>i} a_ij x_j
  numerador: number; // b_i - suma
  x: number; // x_i = numerador / a_ii
}

export type ParadaSustitucionAtras = 'no-triangular' | 'diagonal-cero' | 'resuelto';

export interface ResultadoSustitucionAtras {
  parada: ParadaSustitucionAtras;
  x: number[] | null;
  filas: FilaSustitucionAtras[];
  entradasInvalidas: [number, number][]; // elementos no nulos debajo de la diagonal
  filaFallida?: number;
}

export function sustitucionHaciaAtras(A: number[][], b: number[]): ResultadoSustitucionAtras {
  const n = A.length;
  const resultado: ResultadoSustitucionAtras = { parada: 'resuelto', x: null, filas: [], entradasInvalidas: [] };

  // A debe ser triangular superior.
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) if (A[i][j] !== 0) resultado.entradasInvalidas.push([i, j]);
  if (resultado.entradasInvalidas.length) {
    resultado.parada = 'no-triangular';
    return resultado;
  }

  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (A[i][i] === 0) {
      resultado.parada = 'diagonal-cero';
      resultado.filaFallida = i;
      return resultado;
    }
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += A[i][j] * x[j];
    const numerador = b[i] - suma;
    x[i] = numerador / A[i][i];
    resultado.filas.push({ i, suma, numerador, x: x[i] });
  }
  resultado.x = x;
  return resultado;
}
