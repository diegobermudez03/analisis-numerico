/**
 * Tarea 14 — Regla de Simpson compuesto.
 * Entrada: f, extremos a < b y m entero positivo; se usa n = 2m subintervalos.
 * Salida: S = (h/3)(S0 + 4 S1 + 2 S2), con la acumulación de S1 (impares) y S2 (pares).
 */

export interface FilaSimpson {
  i: number;
  x: number;
  fx: number;
  coeficiente: 4 | 2; // 4 si i es impar, 2 si es par
  S1: number; // S1 acumulado tras este punto
  S2: number; // S2 acumulado tras este punto
}

export type ParadaSimpson = 'intervalo-invalido' | 'm-invalido' | 'error-evaluacion' | 'completo';

export interface ResultadoSimpson {
  parada: ParadaSimpson;
  n: number;
  h: number;
  fa: number;
  fb: number;
  S0: number;
  S1: number;
  S2: number;
  filas: FilaSimpson[];
  S: number;
  mensajeError?: string;
}

export function simpsonCompuesto(f: (x: number) => number, a: number, b: number, m: number): ResultadoSimpson {
  const resultado: ResultadoSimpson = { parada: 'completo', n: NaN, h: NaN, fa: NaN, fb: NaN, S0: NaN, S1: 0, S2: 0, filas: [], S: NaN };
  if (!(b > a)) return { ...resultado, parada: 'intervalo-invalido' };
  if (!Number.isInteger(m) || m < 1) return { ...resultado, parada: 'm-invalido' };
  try {
    resultado.n = 2 * m;
    resultado.h = (b - a) / resultado.n;
    resultado.fa = f(a);
    resultado.fb = f(b);
    resultado.S0 = resultado.fa + resultado.fb;
    for (let i = 1; i < resultado.n; i++) {
      const x = a + i * resultado.h;
      const fx = f(x);
      if (i % 2 === 1) resultado.S1 += fx;
      else resultado.S2 += fx;
      resultado.filas.push({ i, x, fx, coeficiente: i % 2 === 1 ? 4 : 2, S1: resultado.S1, S2: resultado.S2 });
    }
    resultado.S = (resultado.h / 3) * (resultado.S0 + 4 * resultado.S1 + 2 * resultado.S2);
    return resultado;
  } catch (e) {
    return { ...resultado, parada: 'error-evaluacion', mensajeError: (e as Error).message };
  }
}
