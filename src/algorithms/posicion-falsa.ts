/**
 * Tarea 3 — Método de la posición falsa (regla falsa).
 * Entrada: f, intervalo inicial [a0, b0], tolerancia tol y máximo M.
 * Salida: aproximación de la raíz, motivo de parada y secuencia de intervalos.
 */

export interface FilaPosicionFalsa {
  n: number;
  a: number;
  b: number;
  fa: number;
  fb: number;
  x: number | null; // x_n = [a f(b) - b f(a)] / [f(b) - f(a)]
  fx: number | null;
  e: number | null; // |(x_n - x_{n-1}) / x_n|, no existe en n = 0
  conserva?: 'izquierdo' | 'derecho'; // se conserva [a, x] o [x, b]
}

export type ParadaPosicionFalsa = 'sin-cambio-signo' | 'denominador-cero' | 'x-cero' | 'raiz-exacta' | 'tolerancia' | 'max-iteraciones' | 'error-evaluacion';

export interface ResultadoPosicionFalsa {
  parada: ParadaPosicionFalsa;
  raiz: number | null;
  fa0: number;
  fb0: number;
  filas: FilaPosicionFalsa[];
  mensajeError?: string;
}

export function posicionFalsa(f: (x: number) => number, a0: number, b0: number, tol: number, M: number): ResultadoPosicionFalsa {
  const resultado: ResultadoPosicionFalsa = { parada: 'max-iteraciones', raiz: null, fa0: NaN, fb0: NaN, filas: [] };
  try {
    resultado.fa0 = f(a0);
    resultado.fb0 = f(b0);
    if (Math.sign(resultado.fa0) * Math.sign(resultado.fb0) >= 0) {
      resultado.parada = 'sin-cambio-signo';
      return resultado;
    }

    let a = a0;
    let b = b0;
    let anterior = NaN;
    for (let n = 0; n < M; n++) {
      const fa = f(a);
      const fb = f(b);
      const fila: FilaPosicionFalsa = { n, a, b, fa, fb, x: null, fx: null, e: null };
      resultado.filas.push(fila);
      if (fb - fa === 0) {
        resultado.parada = 'denominador-cero';
        return resultado;
      }
      const x = (a * fb - b * fa) / (fb - fa);
      const fx = f(x);
      fila.x = x;
      fila.fx = fx;
      resultado.raiz = x;

      if (fx === 0) {
        resultado.parada = 'raiz-exacta';
        return resultado;
      }
      // Error relativo, desde la segunda aproximación.
      if (n > 0) {
        if (x === 0) {
          resultado.parada = 'x-cero';
          return resultado;
        }
        fila.e = Math.abs((x - anterior) / x);
        if (fila.e < tol) {
          resultado.parada = 'tolerancia';
          return resultado;
        }
      }
      // Se conserva el subintervalo con cambio de signo.
      if (Math.sign(fa) * Math.sign(fx) < 0) {
        fila.conserva = 'izquierdo';
        b = x;
      } else {
        fila.conserva = 'derecho';
        a = x;
      }
      anterior = x;
    }
    resultado.parada = 'max-iteraciones';
    return resultado;
  } catch (e) {
    resultado.parada = 'error-evaluacion';
    resultado.mensajeError = (e as Error).message;
    return resultado;
  }
}
