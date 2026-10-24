import type { Fmt, Step } from '../lib/types';
import { MatrixView } from './MatrixView';
import { Rich, Tex } from './Tex';

export function Steps({ steps, F }: { steps: Step[]; F: Fmt }) {
  return (
    <>
      {steps.map((s, i) => (
        <StepView key={i} step={s} F={F} />
      ))}
    </>
  );
}

function StepView({ step, F }: { step: Step; F: Fmt }) {
  switch (step.kind) {
    case 'heading':
      return <h3 className="step-heading"><Rich text={step.text} /></h3>;
    case 'text':
      return <p className={`step-text tone-${step.tone ?? 'none'}`}><Rich text={step.text} /></p>;
    case 'formula':
      return <div className={`step-formula tone-${step.tone ?? 'none'}`}><Tex tex={step.tex} block /></div>;
    case 'table':
      return (
        <div className="table-wrap">
          {step.caption && <div className="caption"><Rich text={step.caption} /></div>}
          <table className="steps-table">
            <thead>
              <tr>{step.headers.map((h, i) => <th key={i}><Rich text={h} /></th>)}</tr>
            </thead>
            <tbody>
              {step.rows.map((r, i) => (
                <tr key={i} className={step.rowTones?.[i] ? `tone-${step.rowTones[i]}` : undefined}>
                  {r.map((c, j) => (
                    <td key={j} className={typeof c === 'number' ? 'num' : undefined}>
                      {c === null ? '—' : typeof c === 'number' ? F.n(c) : <Rich text={c} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'matrices':
      return (
        <div className="matrices">
          {step.caption && <div className="caption"><Rich text={step.caption} /></div>}
          <div className="matrices-row">
            {step.items.map((m, i) => <MatrixView key={i} spec={m} F={F} />)}
          </div>
        </div>
      );
    case 'group':
      return (
        <details className={`step-group tone-${step.tone ?? 'none'}`} open={step.open}>
          <summary>{step.title}</summary>
          <div className="group-body"><Steps steps={step.steps} F={F} /></div>
        </details>
      );
  }
}
