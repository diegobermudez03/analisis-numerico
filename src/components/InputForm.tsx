import { resize, type FormState, type TaskDef } from '../tasks';
import { Rich } from './Tex';

interface Props {
  task: TaskDef;
  state: FormState;
  onChange: (s: FormState) => void;
  onSubmit: () => void;
}

export function InputForm({ task, state, onChange, onSubmit }: Props) {
  const setValue = (k: string, v: string) => onChange({ ...state, values: { ...state.values, [k]: v } });
  const setA = (i: number, j: number, v: string) => onChange({ ...state, A: state.A.map((r, ri) => (ri === i ? r.map((c, cj) => (cj === j ? v : c)) : r)) });
  const setVec = (key: 'b' | 'x0', i: number, v: string) => onChange({ ...state, [key]: state[key].map((c, ci) => (ci === i ? v : c)) });

  return (
    <form
      className="input-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {task.fields.length > 0 && (
        <div className="fields">
          {task.fields.map((fd) => (
            <label key={fd.key} className={fd.kind === 'expr' ? 'field field-wide' : 'field'}>
              <span className="field-label"><Rich text={fd.label} /></span>
              <input
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={state.values[fd.key] ?? ''}
                placeholder={fd.placeholder}
                onChange={(e) => setValue(fd.key, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}
      {task.fields.some((fd) => fd.kind === 'expr') && (
        <p className="hint">
          Usa <code>x</code> como variable: <code>x^2 - 4</code>, <code>cos(x) - x</code>, <code>exp(-x^2)</code>, <code>sqrt(x)</code>, <code>ln(x)</code>, <code>pi</code>, <code>e</code>. Los números admiten
          expresiones como <code>pi/4</code> o <code>1e-6</code>.
        </p>
      )}

      {task.matrix && (
        <div className="matrix-input">
          <label className="field field-n">
            <span className="field-label">Tamaño n</span>
            <select value={state.n} onChange={(e) => onChange(resize(state, Number(e.target.value)))}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((k) => (
                <option key={k} value={k}>{k} × {k}</option>
              ))}
            </select>
          </label>
          {task.matrix.hint && <span className="hint">{task.matrix.hint}. Las celdas vacías cuentan como 0.</span>}
          {!task.matrix.hint && <span className="hint">Las celdas vacías cuentan como 0.</span>}
          <div className="grid-row">
            <div className="grid-block">
              <div className="grid-title">A</div>
              <table className="grid">
                <tbody>
                  {state.A.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                        <td key={j}>
                          <input value={c} placeholder="0" onChange={(e) => setA(i, j, e.target.value)} aria-label={`a${i + 1}${j + 1}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {task.matrix.b && <VectorInput title="b" values={state.b} onChange={(i, v) => setVec('b', i, v)} />}
            {task.matrix.x0 && <VectorInput title="x⁽⁰⁾" values={state.x0} onChange={(i, v) => setVec('x0', i, v)} />}
          </div>
        </div>
      )}
      <button type="submit" hidden />
    </form>
  );
}

function VectorInput({ title, values, onChange }: { title: string; values: string[]; onChange: (i: number, v: string) => void }) {
  return (
    <div className="grid-block">
      <div className="grid-title">{title}</div>
      <table className="grid">
        <tbody>
          {values.map((c, i) => (
            <tr key={i}>
              <td>
                <input value={c} placeholder="0" onChange={(e) => onChange(i, e.target.value)} aria-label={`${title}${i + 1}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
