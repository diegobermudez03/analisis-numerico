import type { Fmt, MatrixSpec } from '../lib/types';
import { Rich } from './Tex';

export function MatrixView({ spec, F }: { spec: MatrixSpec; F: Fmt }) {
  const { M, aug, highlightRows = [], pivot, highlightCells = [], multCols = 0 } = spec;
  const show = (x: number | null) => (x === null ? '?' : F.n(x));
  return (
    <div className="matrix-wrap">
      <div className="matrix-label">
        <Rich text={spec.label} />
      </div>
      <table className="matrix">
        <tbody>
          {M.map((row, i) => (
            <tr key={i} className={highlightRows.includes(i) ? 'hl-row' : undefined}>
              {row.map((x, j) => {
                const cls = [
                  pivot && pivot[0] === i && pivot[1] === j ? 'pivot' : '',
                  highlightCells.some(([r, c]) => r === i && c === j) ? 'hl-cell' : '',
                  j < i && j < multCols ? 'mult' : '',
                ].join(' ').trim();
                return (
                  <td key={j} className={cls || undefined}>
                    {show(x)}
                  </td>
                );
              })}
              {aug && <td className="aug">{show(aug[i])}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
