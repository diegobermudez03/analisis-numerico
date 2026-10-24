/**
 * Tarea 8 — Solución de ecuaciones hacia adelante (sustitución progresiva).
 * Entrada: A n×n triangular inferior y vector b.
 * Salida: vector x tal que Ax = b, y el despeje de cada fila (de la primera a la última).
 */

export interface FilaSustitucionAdelante {
  i: number; // fila (índice desde 0)
  suma: number; // Σ_{j<i} a_ij x_j
  numerador: number; // b_i - suma
  x: number; // x_i = numerador / a_ii
}

export type ParadaSustitucionAdelante = 'no-triangular' | 'diagonal-cero' | 'resuelto';

export interface ResultadoSustitucionAdelante {
  parada: ParadaSustitucionAdelante;
  x: number[] | null;
  filas: FilaSustitucionAdelante[];
  entradasInvalidas: [number, number][]; // elementos no nulos encima de la diagonal
  filaFallida?: number;
}

export function sustitucionHaciaAdelante(A: number[][], b: number[]): ResultadoSustitucionAdelante {
  const n = A.length;
  const resultado: ResultadoSustitucionAdelante = { parada: 'resuelto', x: null, filas: [], entradasInvalidas: [] };

  // A debe ser triangular inferior.
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (A[i][j] !== 0) resultado.entradasInvalidas.push([i, j]);
  if (resultado.entradasInvalidas.length) {
    resultado.parada = 'no-triangular';
    return resultado;
  }

  const x: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) {
      resultado.parada = 'diagonal-cero';
      resultado.filaFallida = i;
      return resultado;
    }
    let suma = 0;
    for (let j = 0; j < i; j++) suma += A[i][j] * x[j];
    const numerador = b[i] - suma;
    x[i] = numerador / A[i][i];
    resultado.filas.push({ i, suma, numerador, x: x[i] });
  }
  resultado.x = x;
  return resultado;
}
