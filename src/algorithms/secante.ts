/**
 * Tarea 5 — Método de la secante.
 * Entrada: f, dos aproximaciones iniciales x0 y x1, tolerancia tol y máximo M.
 * Salida: aproximación de la raíz, motivo de parada y tabla de secantes.
 */

export interface FilaSecante {
  n: number;
  xAnterior: number; // x_{n-1}
  x: number; // x_n
  fAnterior: number;
  fx: number;
  siguiente: number | null; // x_{n+1}
  fSiguiente: number | null;
  error: number | null; // |x_{n+1} - x_n|
}

export type ParadaSecante = 'denominador-cero' | 'raiz-exacta' | 'tolerancia' | 'max-iteraciones' | 'error-evaluacion';

export interface ResultadoSecante {
  parada: ParadaSecante;
  raiz: number | null;
  filas: FilaSecante[];
  mensajeError?: string;
}

export function secante(f: (x: number) => number, x0: number, x1: number, tol: number, M: number): ResultadoSecante {
  const resultado: ResultadoSecante = { parada: 'max-iteraciones', raiz: null, filas: [] };
  try {
    let xAnterior = x0;
    let x = x1;
    for (let n = 1; n <= M; n++) {
      const fAnterior = f(xAnterior);
      const fx = f(x);
      const fila: FilaSecante = { n, xAnterior, x, fAnterior, fx, siguiente: null, fSiguiente: null, error: null };
      resultado.filas.push(fila);
      if (fx - fAnterior === 0) {
        resultado.parada = 'denominador-cero';
        return resultado;
      }
      const xNuevo = (xAnterior * fx - x * fAnterior) / (fx - fAnterior);
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
      // (x_{n-1}, x_n) <- (x_n, x_{n+1})
      xAnterior = x;
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
