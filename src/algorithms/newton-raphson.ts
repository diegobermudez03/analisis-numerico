/**
 * Tarea 4 — Método de Newton-Raphson.
 * Entrada: f, su derivada df, valor inicial x0, tolerancia tol y máximo M.
 * Salida: aproximación de la raíz, motivo de parada y tabla de iteraciones.
 */

export interface FilaNewton {
  n: number;
  x: number; // x_n
  fx: number;
  dfx: number;
  siguiente: number | null; // x_{n+1} = x_n - f(x_n) / f'(x_n)
  fSiguiente: number | null;
  error: number | null; // |x_{n+1} - x_n|
}

export type ParadaNewton = 'derivada-cero' | 'raiz-exacta' | 'tolerancia' | 'max-iteraciones' | 'error-evaluacion';

export interface ResultadoNewton {
  parada: ParadaNewton;
  raiz: number | null;
  filas: FilaNewton[];
  mensajeError?: string;
}

export function newtonRaphson(f: (x: number) => number, df: (x: number) => number, x0: number, tol: number, M: number): ResultadoNewton {
  const resultado: ResultadoNewton = { parada: 'max-iteraciones', raiz: null, filas: [] };
  try {
    let x = x0;
    for (let n = 0; n < M; n++) {
      const fx = f(x);
      const dfx = df(x);
      const fila: FilaNewton = { n, x, fx, dfx, siguiente: null, fSiguiente: null, error: null };
      resultado.filas.push(fila);
      if (dfx === 0) {
        resultado.parada = 'derivada-cero';
        return resultado;
      }
      const xNuevo = x - fx / dfx;
      fila.siguiente = xNuevo;
      fila.error = Math.abs(xNuevo - x);
      fila.fSiguiente = f(xNuevo);
      resultado.raiz = xNuevo;
      if (fila.fSiguiente === 0) {
        resultado.parada = 'raiz-exacta';
        return resultado;
      }
      if (fila.error < tol) {
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
