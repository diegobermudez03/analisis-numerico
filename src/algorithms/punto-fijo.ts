/**
 * Tarea 2 — Método de punto fijo.
 * Entrada: g (ya en la forma x = g(x)), valor inicial x0, tolerancia tol y máximo M.
 * Salida: aproximación del punto fijo, motivo de parada y tabla de iteraciones.
 */

export interface FilaPuntoFijo {
  n: number;
  x: number; // x_n
  gx: number; // g(x_n) = x_{n+1}
  error: number; // |x_{n+1} - x_n|
}

export type ParadaPuntoFijo = 'tolerancia' | 'max-iteraciones' | 'error-evaluacion';

export interface ResultadoPuntoFijo {
  parada: ParadaPuntoFijo;
  raiz: number | null;
  filas: FilaPuntoFijo[];
  mensajeError?: string;
}

export function puntoFijo(g: (x: number) => number, x0: number, tol: number, M: number): ResultadoPuntoFijo {
  const resultado: ResultadoPuntoFijo = { parada: 'max-iteraciones', raiz: null, filas: [] };
  try {
    let x = x0;
    for (let n = 0; n < M; n++) {
      const xNuevo = g(x);
      const error = Math.abs(xNuevo - x);
      resultado.filas.push({ n, x, gx: xNuevo, error });
      resultado.raiz = xNuevo;
      if (error < tol) {
        resultado.parada = 'tolerancia';
        return resultado;
      }
      x = xNuevo;
    }
    resultado.parada = 'max-iteraciones';
    return resultado;
  } catch (e) {
    resultado.parada = 'error-evaluacion';
    resultado.mensajeError = (e as Error).message;
    return resultado;
  }
}
