/**
 * Tarea 13 — Regla del trapecio compuesto.
 * Entrada: f, extremos a < b y número de trapecios n.
 * Salida: T = (h/2)[f(x_0) + 2 Σ f(x_i) + f(x_n)], con coeficiente y contribución de cada punto.
 */

export type ParadaTrapecio = 'intervalo-invalido' | 'n-invalido' | 'error-evaluacion' | 'completo';

export interface ResultadoTrapecio {
  parada: ParadaTrapecio;
  h: number;
  xs: number[];
  fs: number[];
  coeficientes: number[]; // 1 en los extremos, 2 en los interiores
  contribuciones: number[]; // coeficiente_i · f(x_i)
  corchete: number; // suma dentro del corchete
  T: number;
  mensajeError?: string;
}

export function trapecioCompuesto(f: (x: number) => number, a: number, b: number, n: number): ResultadoTrapecio {
  const resultado: ResultadoTrapecio = { parada: 'completo', h: NaN, xs: [], fs: [], coeficientes: [], contribuciones: [], corchete: NaN, T: NaN };
  if (!(b > a)) return { ...resultado, parada: 'intervalo-invalido' };
  if (!Number.isInteger(n) || n < 1) return { ...resultado, parada: 'n-invalido' };
  try {
    resultado.h = (b - a) / n;
    for (let i = 0; i <= n; i++) {
      const x = a + i * resultado.h;
      const coeficiente = i === 0 || i === n ? 1 : 2;
      resultado.xs.push(x);
      resultado.fs.push(f(x));
      resultado.coeficientes.push(coeficiente);
      resultado.contribuciones.push(coeficiente * resultado.fs[i]);
    }
    resultado.corchete = resultado.contribuciones.reduce((s, v) => s + v, 0);
    resultado.T = (resultado.h / 2) * resultado.corchete;
    return resultado;
  } catch (e) {
    return { ...resultado, parada: 'error-evaluacion', mensajeError: (e as Error).message };
  }
}
