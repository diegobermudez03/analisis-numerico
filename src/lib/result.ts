import type { Result, Step } from './types';

export function success(message: string, summary: Result['summary'], steps: Step[]): Result {
  steps.push({ kind: 'text', tone: 'ok', text: `**Fin:** ${message}` });
  return { status: 'success', message, summary, steps };
}

export function failure(message: string, summary: Result['summary'], steps: Step[]): Result {
  steps.push({ kind: 'text', tone: 'fail', text: `**Fracaso:** ${message}` });
  return { status: 'failure', message, summary, steps };
}

/** Abre los primeros y el último detalle de iteración para no saturar la vista. */
export function openEnds(groups: Step[], first = 2) {
  groups.forEach((g, i) => {
    if (g.kind === 'group') g.open = i < first || i === groups.length - 1;
  });
}
