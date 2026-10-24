// Evaluador de expresiones: el usuario escribe x^2 - 3*x + sin(x), exp(-x^2), etc.
import { create, all, type MathNode, type SymbolNode } from 'mathjs';
import type { Fn } from './types';

const math = create(all);
// Alias: ln(x) = logaritmo natural.
math.import({ ln: (x: number) => Math.log(x) }, { override: true });

/** Error al evaluar durante la ejecución del método (se reporta como Fracaso). */
export class EvalError extends Error {}

export function compileFn(src: string, name = 'f'): Fn {
  const text = src.trim();
  if (!text) throw new Error(`La expresión de ${name}(x) está vacía.`);
  let node: MathNode;
  try {
    node = math.parse(text);
  } catch (e) {
    throw new Error(`No se pudo interpretar ${name}(x) = "${text}": ${(e as Error).message}`);
  }
  const unknown = node
    .filter((n) => (n as SymbolNode).isSymbolNode)
    .map((n) => (n as SymbolNode).name)
    .filter((s) => s !== 'x' && !(s in math));
  if (unknown.length) {
    throw new Error(`En ${name}(x) aparece "${unknown[0]}", que no es una función ni constante conocida. Usa solo la variable x.`);
  }
  const code = node.compile();
  const fn = ((x: number) => {
    let r: unknown;
    try {
      r = code.evaluate({ x });
    } catch (e) {
      throw new EvalError(`No se pudo evaluar ${name}(${x}): ${(e as Error).message}`);
    }
    if (typeof r !== 'number') throw new EvalError(`${name}(${x}) no da un número real.`);
    if (!Number.isFinite(r)) throw new EvalError(`${name}(${x}) no es un número finito (resultado: ${r}).`);
    return r;
  }) as Fn;
  let tex: string;
  try {
    tex = node.toTex({ parenthesis: 'keep', implicit: 'hide' });
  } catch {
    tex = text;
  }
  fn.tex = tex;
  fn.src = text;
  fn.label = name;
  return fn;
}

/** Interpreta un número; admite expresiones constantes como pi/4, 1e-6, 10^-4, 1/3. */
export function parseNumber(src: string, label: string): number {
  const text = src.trim();
  if (!text) throw new Error(`Falta el valor de ${label}.`);
  let r: unknown;
  try {
    r = math.evaluate(text);
  } catch {
    throw new Error(`El valor de ${label} ("${text}") no es un número válido.`);
  }
  if (typeof r !== 'number' || !Number.isFinite(r)) throw new Error(`El valor de ${label} ("${text}") no es un número real finito.`);
  return r;
}
