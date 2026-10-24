import { useMemo, useState } from 'react';
import { ExpressionHelp } from './components/ExpressionHelp';
import { InputForm } from './components/InputForm';
import { Steps } from './components/StepView';
import { Rich, Tex } from './components/Tex';
import { makeFmt } from './lib/format';
import type { Result } from './lib/types';
import { GROUPS, TASKS, emptyState, exampleState, parseForm, type FormState } from './tasks';

interface Run {
  taskId: number;
  vals: Record<string, unknown>;
}

export default function App() {
  const [taskId, setTaskId] = useState(1);
  const [forms, setForms] = useState<Record<number, FormState>>(() => Object.fromEntries(TASKS.map((t) => [t.id, exampleState(t)])));
  const [errors, setErrors] = useState<string[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [decimals, setDecimals] = useState(6);

  const task = TASKS.find((t) => t.id === taskId)!;
  const form = forms[taskId];
  const F = useMemo(() => makeFmt(decimals), [decimals]);

  // El método se vuelve a ejecutar si cambia la cantidad de decimales a mostrar.
  const result: Result | null = useMemo(() => {
    if (!run) return null;
    const t = TASKS.find((x) => x.id === run.taskId)!;
    try {
      return t.solve(run.vals, F);
    } catch (e) {
      return { status: 'failure', message: `error inesperado: ${(e as Error).message}`, summary: [], steps: [] };
    }
  }, [run, F]);

  const selectTask = (id: number) => {
    setTaskId(id);
    setErrors([]);
    setRun(null);
  };
  const setForm = (s: FormState) => setForms((f) => ({ ...f, [taskId]: s }));
  const solve = () => {
    const parsed = parseForm(task, form);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      setRun(null);
      return;
    }
    setErrors([]);
    setRun({ taskId, vals: parsed.vals });
  };
  const clear = () => {
    setForm(emptyState(task, form.n));
    setErrors([]);
    setRun(null);
  };
  const loadExample = () => {
    setForm(exampleState(task));
    setErrors([]);
    setRun(null);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Análisis Numérico</div>
        {GROUPS.map((g) => (
          <nav key={g.key} className="nav-group">
            <div className="nav-title">{g.name}</div>
            {TASKS.filter((t) => t.group === g.key).map((t) => (
              <button key={t.id} className={t.id === taskId ? 'nav-item active' : 'nav-item'} onClick={() => selectTask(t.id)}>
                <span className="nav-num">{t.id}</span> {t.name}
              </button>
            ))}
          </nav>
        ))}
        <label className="decimals">
          Decimales a mostrar
          <select value={decimals} onChange={(e) => setDecimals(Number(e.target.value))}>
            {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </aside>

      <main className="main">
        <header className="task-header">
          <h1>
            {task.id}. {task.name}
          </h1>
          <div className="task-formula">
            <Tex tex={task.formula} block />
          </div>
        </header>

        <section className="card">
          <InputForm task={task} state={form} onChange={setForm} onSubmit={solve} />
          <div className="actions">
            <button className="btn primary" onClick={solve}>Resolver</button>
            <button className="btn" onClick={clear}>Limpiar</button>
            <button className="btn ghost" onClick={loadExample}>Cargar ejemplo</button>
          </div>
          {errors.length > 0 && (
            <div className="input-errors">
              <strong>No se ejecutó el método. Revisa las entradas:</strong>
              <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
        </section>

        {result && (
          <>
            <section className={`result-card ${result.status}`}>
              <div className="result-status">{result.status === 'success' ? 'Éxito' : 'Fracaso'}</div>
              <div className="result-message">{result.message.charAt(0).toUpperCase() + result.message.slice(1)}</div>
              {result.summary.length > 0 && (
                <dl className="summary">
                  {result.summary.map((s, i) => (
                    <div key={i}>
                      <dt><Rich text={s.label} /></dt>
                      <dd><Rich text={s.value} /></dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
            <section className="card steps">
              <h2>Paso a paso</h2>
              <Steps steps={result.steps} F={F} />
            </section>
          </>
        )}
      </main>

      <ExpressionHelp />
    </div>
  );
}
