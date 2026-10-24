/**
 * Tarea 9 — Solución de Ax = b por LU.
 * Entrada: matriz cuadrada A y vector b.
 * Salida: x, reutilizando las Tareas 7 (A = LU), 8 (Ly = b) y 6 (Ux = y).
 */
import { sustitucionHaciaAtras, type ResultadoSustitucionAtras } from './sustitucion-atras';
import { sustitucionHaciaAdelante, type ResultadoSustitucionAdelante } from './sustitucion-adelante';
import { factorizacionLU, type ResultadoLU } from './factorizacion-lu';

export type ParadaSolucionLU = 'fallo-lu' | 'fallo-adelante' | 'fallo-atras' | 'resuelto';

export interface ResultadoSolucionLU {
  parada: ParadaSolucionLU;
  lu: ResultadoLU;
  adelante?: ResultadoSustitucionAdelante; // Ly = b
  atras?: ResultadoSustitucionAtras; // Ux = y
  y: number[] | null;
  x: number[] | null;
}

export function solucionLU(A: number[][], b: number[]): ResultadoSolucionLU {
  // 1. A = LU
  const lu = factorizacionLU(A);
  if (lu.parada !== 'completa') return { parada: 'fallo-lu', lu, y: null, x: null };

  // 2. Ly = b (hacia adelante)
  const adelante = sustitucionHaciaAdelante(lu.L, b);
  if (adelante.parada !== 'resuelto') return { parada: 'fallo-adelante', lu, adelante, y: null, x: null };

  // 3. Ux = y (hacia atrás)
  const y = adelante.x!;
  const atras = sustitucionHaciaAtras(lu.U, y);
  if (atras.parada !== 'resuelto') return { parada: 'fallo-atras', lu, adelante, atras, y, x: null };

  return { parada: 'resuelto', lu, adelante, atras, y, x: atras.x };
}
