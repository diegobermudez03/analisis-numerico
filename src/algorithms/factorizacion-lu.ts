/**
 * Tarea 7 — Factorización LU (sin intercambio de filas).
 * Entrada: matriz cuadrada A.
 * Salida: L triangular inferior con diagonal 1 y U triangular superior tales que A = LU,
 *         junto con cada operación de fila realizada.
 */

export interface OperacionLU {
  j: number; // columna / fila pivote
  i: number; // fila que se elimina
  pivote: number; // U_jj
  uij: number; // U_ij antes de eliminar
  m: number; // m_ij = U_ij / U_jj
  L: number[][]; // L después de guardar m_ij
  U: number[][]; // U después de F_i <- F_i - m_ij F_j
}

export type ParadaLU = 'pivote-cero' | 'completa';

export interface ResultadoLU {
  parada: ParadaLU;
  L: number[][];
  U: number[][];
  operaciones: OperacionLU[];
  columnaFallida?: number;
}

const copiar = (M: number[][]) => M.map((fila) => [...fila]);

export function factorizacionLU(A: number[][]): ResultadoLU {
  const n = A.length;
  // L = I, U = A
  const L: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const U = copiar(A);
  const resultado: ResultadoLU = { parada: 'completa', L, U, operaciones: [] };

  for (let j = 0; j < n - 1; j++) {
    const pivote = U[j][j];
    if (pivote === 0) {
      // Sin pivoteo no se puede continuar (usar LUP).
      resultado.parada = 'pivote-cero';
      resultado.columnaFallida = j;
      return resultado;
    }
    for (let i = j + 1; i < n; i++) {
      const uij = U[i][j];
      const m = uij / pivote;
      L[i][j] = m;
      for (let k = j; k < n; k++) U[i][k] = U[i][k] - m * U[j][k];
      U[i][j] = 0;
      resultado.operaciones.push({ j, i, pivote, uij, m, L: copiar(L), U: copiar(U) });
    }
  }
  return resultado;
}
