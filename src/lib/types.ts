// Tipos compartidos entre los métodos y la interfaz.

export type Tone = 'info' | 'ok' | 'fail' | 'decision' | 'warn';

/** Celda de tabla: los números se formatean al mostrarse; los textos admiten $tex$ en línea. */
export type Cell = string | number | null;

export interface MatrixSpec {
  label: string; // admite $tex$
  M: (number | null)[][];
  aug?: (number | null)[]; // columna aumentada (vector b)
  highlightRows?: number[];
  pivot?: [number, number];
  highlightCells?: [number, number][];
  /** Celdas (i,k) con k < i y k < multCols se marcan como multiplicadores guardados. */
  multCols?: number;
}

export type Step =
  | { kind: 'heading'; text: string }
  | { kind: 'text'; text: string; tone?: Tone }
  | { kind: 'formula'; tex: string; tone?: Tone }
  | { kind: 'table'; headers: string[]; rows: Cell[][]; caption?: string; rowTones?: (Tone | undefined)[] }
  | { kind: 'matrices'; items: MatrixSpec[]; caption?: string }
  | { kind: 'group'; title: string; steps: Step[]; open?: boolean; tone?: Tone };

export interface Result {
  status: 'success' | 'failure';
  message: string;
  summary: { label: string; value: string }[];
  steps: Step[];
}

/** Función de una variable compilada a partir de la expresión del usuario. */
export type Fn = ((x: number) => number) & { tex: string; src: string; label: string };

export interface Fmt {
  /** Texto plano (tablas). */
  n: (x: number) => string;
  /** LaTeX. */
  t: (x: number) => string;
  /** LaTeX con paréntesis si es negativo (para sustituciones). */
  p: (x: number) => string;
}
