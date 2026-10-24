/**
 * Tarea 1 — Método de la bisección.
 * Entrada: f, intervalo inicial [a0, b0], tolerancia tol y máximo de iteraciones M.
 * Salida: aproximación de la raíz, motivo de parada y tabla de iteraciones.
 */

export interface FilaBiseccion {
  n: number;
  a: number;
  b: number;
  p: number;
  fa: number;
  fp: number;
  fb: number;
  cota: number; // (b0 - a0) / 2^(n+1)
  conserva?: 'izquierdo' | 'derecho'; // se conserva [a, p] o [p, b]
}

export type ParadaBiseccion = 'intervalo-invalido' | 'sin-cambio-signo' | 'raiz-exacta' | 'tolerancia' | 'max-iteraciones' | 'error-evaluacion';

export interface ResultadoBiseccion {
  parada: ParadaBiseccion;
  raiz: number | null;
  fa0: number;
  fb0: number;
  nMinExacto: number; // log2((b0 - a0) / tol) - 1
  nMin: number; // techo de nMinExacto
  filas: FilaBiseccion[];
  mensajeError?: string;
}

export function biseccion(f: (x: number) => number, a0: number, b0: number, tol: number, M: number): ResultadoBiseccion {
  const resultado: ResultadoBiseccion = { parada: 'max-iteraciones', raiz: null, fa0: NaN, fb0: NaN, nMinExacto: NaN, nMin: NaN, filas: [] };
  try {
    if (!(a0 < b0)) {
      resultado.parada = 'intervalo-invalido';
      return resultado;
    }
    resultado.fa0 = f(a0);
    resultado.fb0 = f(b0);
    if (Math.sign(resultado.fa0) * Math.sign(resultado.fb0) >= 0) {
      resultado.parada = 'sin-cambio-signo';
      return resultado;
    }

    // Número mínimo teórico de iteraciones.
    resultado.nMinExacto = Math.log2((b0 - a0) / tol) - 1;
    resultado.nMin = Math.ceil(resultado.nMinExacto);

    let a = a0;
    let b = b0;
    for (let n = 0; n < M; n++) {
      const fa = f(a);
      const fb = f(b);
      const p = (a + b) / 2;
      const fp = f(p);
      const cota = (b0 - a0) / 2 ** (n + 1);
      const fila: FilaBiseccion = { n, a, b, p, fa, fp, fb, cota };
      resultado.filas.push(fila);
      resultado.raiz = p;

      if (fp === 0) {
        resultado.parada = 'raiz-exacta';
        return resultado;
      }
      if (cota < tol) {
        resultado.parada = 'tolerancia';
        return resultado;
      }
      // Se conserva el subintervalo donde hay cambio de signo.
      if (Math.sign(fa) * Math.sign(fp) < 0) {
        fila.conserva = 'izquierdo';
        b = p;
      } else {
        fila.conserva = 'derecho';
        a = p;
      }
    }
    resultado.parada = 'max-iteraciones';
    return resultado;
  } catch (e) {
    resultado.parada = 'error-evaluacion';
    resultado.mensajeError = (e as Error).message;
    return resultado;
  }
}
