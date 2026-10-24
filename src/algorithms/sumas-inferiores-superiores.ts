/**
 * Tarea 12 — Integración por sumas inferiores y superiores.
 * Entrada: f, extremos a < b y número de subintervalos n.
 * Salida: suma inferior L y superior U (L ≤ ∫f ≤ U), con los valores por subintervalo.
 *
 * En cada subintervalo [x_i, x_{i+1}] se comparan los valores de los extremos:
 * m_i = min{f(x_i), f(x_{i+1})}, M_i = max{f(x_i), f(x_{i+1})}.
 */

export type ParadaSumas = 'intervalo-invalido' | 'n-invalido' | 'error-evaluacion' | 'completo';

export interface ResultadoSumas {
  parada: ParadaSumas;
  h: number;
  xs: number[];
  fs: number[];
  minimos: number[]; // m_i
  maximos: number[]; // M_i
  sumaMinimos: number;
  sumaMaximos: number;
  L: number;
  U: number;
  mensajeError?: string;
}

export function sumasInferioresSuperiores(f: (x: number) => number, a: number, b: number, n: number): ResultadoSumas {
  const resultado: ResultadoSumas = { parada: 'completo', h: NaN, xs: [], fs: [], minimos: [], maximos: [], sumaMinimos: NaN, sumaMaximos: NaN, L: NaN, U: NaN };
  if (!(b > a)) return { ...resultado, parada: 'intervalo-invalido' };
  if (!Number.isInteger(n) || n < 1) return { ...resultado, parada: 'n-invalido' };
  try {
    resultado.h = (b - a) / n;
    for (let i = 0; i <= n; i++) {
      resultado.xs.push(a + i * resultado.h);
      resultado.fs.push(f(resultado.xs[i]));
    }
    for (let i = 0; i < n; i++) {
      resultado.minimos.push(Math.min(resultado.fs[i], resultado.fs[i + 1]));
      resultado.maximos.push(Math.max(resultado.fs[i], resultado.fs[i + 1]));
    }
    resultado.sumaMinimos = resultado.minimos.reduce((s, v) => s + v, 0);
    resultado.sumaMaximos = resultado.maximos.reduce((s, v) => s + v, 0);
    resultado.L = resultado.h * resultado.sumaMinimos;
    resultado.U = resultado.h * resultado.sumaMaximos;
    return resultado;
  } catch (e) {
    return { ...resultado, parada: 'error-evaluacion', mensajeError: (e as Error).message };
  }
}
